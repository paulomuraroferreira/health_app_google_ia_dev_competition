from dotenv import load_dotenv
from geometry_calculations import Neighborhoods, GeoLocator
from utils import PathInfo
from collections import Counter
load_dotenv()
from logger_setup import logger
from firestore_handler import FirestoreHandler

class DiseaseProbabilityUpdater:
    def __init__(self, specific_user_data, firestore_handler, users_data):

        self.symptoms = specific_user_data['symptoms']
        self.firestore_handler = firestore_handler
        self.prob_diseases_dict = None
        self.prob_risk_factors_dict = None
        self.geolocator = GeoLocator()
        self.neighborhood_handler = Neighborhoods(PathInfo.NEIGHBORHOOD_SHP_FILE_PATH)
        self.user_id = specific_user_data['user_id']
        self.user_health_profile = users_data[self.user_id]['health_profile']
        self.users_data = users_data
        self.add_age_to_heatlh_profile()


    def add_age_to_heatlh_profile(self):
        from datetime import datetime

        date_of_birth = datetime.strptime(self.users_data[self.user_id]['date_of_birth'], '%Y-%m-%d')

        today = datetime.today()
        
        age = today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))

        self.user_health_profile['is_over_65_years_old'] = age > 65


   
    def retrieve_symptom_data(self):

        total_diseases_list = []

        symptoms_lists = self.firestore_handler.fetch_data('symptoms_list')

        for symptom in self.symptoms:
            associated_disease = symptoms_lists[symptom]['diseases']
            total_diseases_list.extend(associated_disease)

        element_counts = Counter(total_diseases_list)
        total_elements = len(total_diseases_list)
        self.prob_diseases_dict = {key: value / total_elements for key, value in element_counts.items()}

    def consider_risk_factors(self):

        self.risk_factors_dict = {}
        diseases_with_risk_factors_list = self.firestore_handler.fetch_data('diseases')

        for doc in diseases_with_risk_factors_list.values():

            doc_risk_factors, disease = doc['risk_factors'], doc['name']

            if disease in self.prob_diseases_dict: 
          
                number_of_risk_factors_patient_have = 0
                
                for key, value in doc_risk_factors.items():
                    if value:
                        if key in self.user_health_profile and self.user_health_profile[key] == value:
                            number_of_risk_factors_patient_have += 1
            
                self.prob_diseases_dict[disease] *= 1.1**number_of_risk_factors_patient_have

    @classmethod
    def calculate_combined_probabilities(cls, p_symptom, p_all_neighborhoods, distances, user_neighborhood, alpha=0.5, beta=0.5):
        combined_probabilities = {}
        normalization_factor = 0

        distances = {v['name']:v for k,v in distances.items()}

        for disease in p_symptom:
            combined_probabilities[disease] = 0

        for disease in p_symptom:
            weighted_sum = 0
            for key, value in p_all_neighborhoods.items():
                if value['disease'] == disease:
                    neighborhood = value['neighborhood']
                    probability = value['probability']

                    if neighborhood == user_neighborhood:
                        weighted_sum += alpha * probability
                    else:
                        distance = distances[user_neighborhood].get(neighborhood, float('inf'))
                        if distance != float('inf'):
                            weighted_sum += beta * probability / distance

            combined_probabilities[disease] = p_symptom[disease] * weighted_sum
            normalization_factor += combined_probabilities[disease]

        for disease in combined_probabilities:
            if normalization_factor != 0:
                combined_probabilities[disease] /= normalization_factor

        return combined_probabilities
    
    def execute_calculation(self):

        self.retrieve_symptom_data()

        self.consider_risk_factors()

        symptom_based_diseases = self.prob_diseases_dict

        all_neighborhoods_json_data = self.firestore_handler.fetch_data('diseases_probabilities_neighborhoods')

        neighborhood_distances_data = self.firestore_handler.fetch_data('geometric_info')

        home_address, work_address = self.users_data[self.user_id]['home_address'], self.users_data[self.user_id]['work_address']

        probs_both_address = []

        for address in (home_address, work_address):

            lat, lon = self.geolocator.get_lat_lon(address)

            user_neighborhood_name = self.neighborhood_handler.get_neighborhood(lat, lon)

            self.combined_probabilities = self.calculate_combined_probabilities(
                p_symptom = symptom_based_diseases,
                p_all_neighborhoods = all_neighborhoods_json_data,
                distances = neighborhood_distances_data,
                user_neighborhood = user_neighborhood_name)
            
            probs_both_address.append(self.combined_probabilities)

        dict_to_return = dict(sorted(self.combined_probabilities.items(), key=lambda x: x[1], reverse=True)[:5])

        return {key:value for key,value in dict_to_return.items() if value > 0.1} 


class DiseaseProbabilityHandler:

    def __init__(self, user_data_):

        self.user_data_ = user_data_

        self.firestore_handler = FirestoreHandler()

    def get_probabilities(self):

        user_data = self.firestore_handler.fetch_data(collection_name='user_info')
        
        updater = DiseaseProbabilityUpdater(specific_user_data = self.user_data_, 
                                            firestore_handler = self.firestore_handler, 
                                            users_data=user_data)
        
        updated_probabilities = updater.execute_calculation()

        logger.info(f'\n\n{updated_probabilities=}')

        return updated_probabilities

if __name__ == '__main__':

    data = {
        "user_id": "user13@example.com",
        "symptoms": ["fever","cough","diarrhea"]
    }

    disease_probability = DiseaseProbabilityHandler(data)
    disease_probability.get_probabilities()
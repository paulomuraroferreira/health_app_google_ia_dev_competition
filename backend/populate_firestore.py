import json
from retrieval_process_firebase_vector_store import (
    RAGRetrieverDisease,
    RAGRetrieverRiskFactor,
)
from risk_factors_calculation_save_on_collection import RiskFactorAnalyzer

from functions.geometry_calculations import Neighborhoods
from functions.logger_setup import logger
from functions.utils import PathInfo
import pandas as pd

def format_string(input_string):
    formatted_string = input_string.lower()
    formatted_string = formatted_string.replace(" ", "_")
    formatted_string = formatted_string.replace("-", "_")
    formatted_string = "".join(
        char if char.isalnum() or char == "_" else "_" for char in formatted_string
    )

    return formatted_string


class FirestoreCollectionsUploader:
    def __init__(self, firestore_handler):
        self.firestore_handler = firestore_handler
        self.json_path = PathInfo.NEIGHBORHOOD_DISEASES_DISTRIBUTION_JSON_PATH
        self.neighborhood_handler = Neighborhoods(PathInfo.NEIGHBORHOOD_SHP_FILE_PATH)

    def load_json_data(self, json_path):
        with open(json_path, "r") as json_file:
            loaded_json = json.load(json_file)
        return loaded_json

    def add_centroids(self):
        loaded_json = self.load_json_data(
            json_path=PathInfo.NEIGHBORHOOD_DISEASES_DISTRIBUTION_JSON_PATH
        )
        dict_with_centroids = {}

        df = pd.read_csv(PathInfo.GEOMETRIC_RADIUS_CSV)
        for doc in loaded_json:
            neighborhood = doc["neighborhood"]
            radius = df[df["ntaname"] == neighborhood]["radius"].values[0]
            centroid = self.neighborhood_handler.get_centroid(neighborhood)
            distances = self.neighborhood_handler.calculate_distances(centroid)

            dict_with_centroids[format_string(neighborhood)] = {
                "radius_in_kilometers": radius,
                "name": neighborhood,
                "centroid": {"lat": centroid.y, "lon": centroid.x},
                "distances": distances,
            }
        return dict_with_centroids

    def upload_data_deseases(self, collection_name='diseases_probabilities_neighborhoods'):

        logger.info(f'Uploading diseases probabilities to collection {collection_name}')

        collection_ref = self.firestore_handler.get_collection_reference(
            collection_name
        )
        loaded_json = self.load_json_data(
            json_path=PathInfo.NEIGHBORHOOD_DISEASES_DISTRIBUTION_JSON_PATH
        )
        for entry in loaded_json:
            entry["neighborhood_geometric_info_id"] = format_string(
                entry["neighborhood"]
            )
            collection_ref.add(entry)

        logger.info(f'Finished uploading diseases probabilities to collection {collection_name}')

    def upload_neighborhood_geometric_info(self, collection_name='geometric_info'):
        logger.info(f'Uploading neighborhood geometric info to collection {collection_name}')
        loaded_json_centroids = self.add_centroids()
        collection_ref = self.firestore_handler.get_collection_reference(
            collection_name
        )

        for neighborhood, geometric in loaded_json_centroids.items():
            logger.info(f'Uploading neighborhood {neighborhood} to collection {collection_name}')
            collection_ref.document(neighborhood).set(geometric)

        logger.info(f'Finished uploading neighborhood geometric info to collection {collection_name}')

    def upload_user_info(self, collection_name='user_info'):

        logger.info(f'Uploading user info to collection {collection_name}')

        user_info = self.load_json_data(json_path=PathInfo.USERS_INFO)

        collection_ref = self.firestore_handler.get_collection_reference(
            collection_name
        )

        for doc in user_info:
            doc["name"] = doc["email"]
            collection_ref.document(doc["email"]).set(
                {k: v for k, v in doc.items() if k not in ("email",)}
            )

        logger.info(f'Finished uploading user info to collection {collection_name}')

    def upload_symptoms_list(self, collection_name='symptoms_list'):

        logger.info(f'Uploading symptoms list to collection {collection_name}')

        collection_ref = self.firestore_handler.get_collection_reference(collection_name)

        symptoms_list = self.load_json_data(PathInfo.SYMPTOMS_LIST)['symptoms']

        symptoms_dict = {}

        if 'FIRESTORE_EMULATOR_HOST' in os.environ:
            del os.environ['FIRESTORE_EMULATOR_HOST']

        rag_retriever = RAGRetrieverDisease()

        for symptom in symptoms_list:
            symptoms_dict[symptom] = rag_retriever.retrieve_and_generate(symptom)

        if "--emulator" in sys.argv:
            print("Returning to emulator mode")
            os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
            
        for symptom, diseases_list in symptoms_dict.items():

            diseases_list = [disease.replace('*','').strip() for disease in diseases_list if disease]

            collection_ref.document(format_string(symptom)).set({"name": symptom,"diseases": diseases_list})

        logger.info(f'Finished uploading symptoms list to collection {collection_name}')

    def get_risk_factor_from_disease_(self, disease):

        try:
            input_list = self.rag_retriever_risk_factor.retrieve_and_generate(disease)
        except Exception as e:
            logger.error(f"Error: {e}")

        return input_list

    def upload_risk_factors(self):

        logger.info(f'Uploading the risk factors to the collection diseases')

        patient_health_profile = [
            "is_smoker",
            "is_pregnant",
            "is_sedentary",
            "is_obese",
            "is_diabetic",
            "is_hypertensive",
            "is_asthmatic",
            "is_cancer_patient",
            "is_cardiovascular_patient",
            "is_immunocompromised",
            "is_over_65_years_of_age",
        ]

        symptoms_list = self.firestore_handler.fetch_data("symptoms_list").values()

        list_unique_diseases = list(
            set(
                [
                    disease
                    for symptom in symptoms_list
                    for disease in symptom["diseases"]
                ]
            )
        )

        list_unique_diseases = [disease.replace('*','').strip() for disease in list_unique_diseases if disease]

        analyzer = RiskFactorAnalyzer()

        risk_factors_dict = {}

        if 'FIRESTORE_EMULATOR_HOST' in os.environ:
            del os.environ['FIRESTORE_EMULATOR_HOST']

        self.rag_retriever_risk_factor = RAGRetrieverRiskFactor()

        logger.info(f'{list_unique_diseases=}')

        for disease in list_unique_diseases:
            logger.info(f'{disease=}')
            risk_factors_list = self.get_risk_factor_from_disease_(disease)

            risk_factors_list = [risk_factor.replace('*','').strip() for risk_factor in risk_factors_list if risk_factor]

            logger.info(f"{risk_factors_list=}")

            result = analyzer.analyze_risk_factors(
                patient_health_profile, risk_factors_list
            )

            logger.info(f"{result=}")

            risk_factors_dict[disease] = result

        if "--emulator" in sys.argv:
            print("Returning to emulator mode")
            os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"

        collection_ref_diseases = self.firestore_handler.get_collection_reference("diseases")

        print(f'{risk_factors_dict=}')

        for disease, result in risk_factors_dict.items():
            print('disease, result', disease, result)

            collection_ref_diseases.document(format_string(disease)).set(
                {"name": disease, "risk_factors": result}
            )

        logger.info('Finished uploading the risk factors to the collection diseases')


def main():
    from functions.firestore_handler import FirestoreHandler

    firestore_handler = FirestoreHandler()

    uploader = FirestoreCollectionsUploader(firestore_handler=firestore_handler)

    #collections MUST be uploaded in this order.    
    # uploader.upload_neighborhood_geometric_info()
    # uploader.upload_user_info()
    uploader.upload_data_deseases()
    # uploader.upload_symptoms_list()
    # uploader.upload_risk_factors()
    

if __name__ == "__main__":

    import sys
    import os

    if "--emulator" in sys.argv:
        print("Running in emulator mode")
        os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
    else:
        print("Running in prod mode")

    main()
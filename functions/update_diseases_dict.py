import firebase_admin
from firebase_admin import credentials, firestore
import math
from datetime import datetime
import os

class FirestoreHandler:
    def __init__(self, credential_path, emulator_host=None):
        self.credential_path = credential_path
        self.emulator_host = emulator_host
        self.db = None
        self.initialize_firestore()

    def initialize_firestore(self):
        cred = credentials.Certificate(self.credential_path)
        firebase_admin.initialize_app(cred)
        if self.emulator_host:
            os.environ["FIRESTORE_EMULATOR_HOST"] = self.emulator_host
        self.db = firestore.client()

    def get_collection_reference(self, collection_name):
        return self.db.collection(collection_name)

class DiseaseProbabilityUpdater:
    def __init__(self, decay_rate):
        self.decay_rate = decay_rate
    
    def update_probabilities(self, disease_probabilities, current_date):
        updated_probabilities = {}
        for neighborhood, diseases in disease_probabilities.items():
            updated_probabilities[neighborhood] = {}
            for disease, data in diseases.items():
                probability = data['probability']
                report_date = datetime.strptime(data['date'], '%Y-%m-%d')
                days_diff = (current_date - report_date).days
                time_factor = math.exp(-self.decay_rate * days_diff)
                updated_probability = probability * time_factor
                updated_probabilities[neighborhood][disease] = {
                    'probability': updated_probability,
                    'date': data['date']
                }
        return updated_probabilities

class FirestoreUpdater:
    def __init__(self, firestore_handler, collection_name, decay_rate):
        self.firestore_handler = firestore_handler
        self.collection_name = collection_name
        self.decay_rate = decay_rate

    def fetch_data(self):
        collection_ref = self.firestore_handler.get_collection_reference(self.collection_name)
        docs = collection_ref.stream()
        data = {doc.id: doc.to_dict() for doc in docs}
        return data

    def upload_updated_data(self, updated_probabilities):
        collection_ref = self.firestore_handler.get_collection_reference(self.collection_name)
        for neighborhood, diseases in updated_probabilities.items():
            collection_ref.document(neighborhood).set(diseases)

    def update_firestore_data(self):
        current_data = self.fetch_data()

        updater = DiseaseProbabilityUpdater(decay_rate=self.decay_rate)
        current_date = datetime.now()
        updated_probabilities = updater.update_probabilities(current_data, current_date)
        
        self.upload_updated_data(updated_probabilities)

if __name__ == "__main__":
    firestore_handler = FirestoreHandler()
    
    updater = FirestoreUpdater(
        firestore_handler=firestore_handler,
        collection_name='diseases_probabilities_neighborhoods',
        decay_rate=0.01
    )

    updater.update_firestore_data()

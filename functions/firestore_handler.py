import firebase_admin
from firebase_admin import firestore
from logger_setup import logger
from dotenv import load_dotenv
load_dotenv()

class FirestoreHandler:
    def __init__(self):

        if not firebase_admin._apps:
            logger.info("Initializing Firebase App")
            firebase_admin.initialize_app()
        else:
            logger.info("Firebase App already initialized. Reusing the existing app.")

        self.db = firestore.client()        

    def get_collection_reference(self, collection_name):
        return self.db.collection(collection_name)

    def fetch_data(self, collection_name):
        collection_ref = self.get_collection_reference(collection_name)
        docs = collection_ref.stream()
        data = {doc.id: doc.to_dict() for doc in docs}
        return data

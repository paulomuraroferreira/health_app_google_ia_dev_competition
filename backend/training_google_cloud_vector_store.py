from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_google_firestore import FirestoreVectorStore
from langchain_google_vertexai import VertexAIEmbeddings
import os
from langchain_core.documents import Document
from dotenv import load_dotenv
from functions.logger_setup import logger

load_dotenv()

class DataIngestion:
    def __init__(self, folder_path):
        self.folder_path = folder_path
        self.text_splitter = CharacterTextSplitter(chunk_size=2000, chunk_overlap=500, separator='.\n')
        self.PROJECT_ID = 'dev-competition-8f302'
        self.embedding_model = VertexAIEmbeddings(
            model_name="textembedding-gecko@latest",
            project=self.PROJECT_ID,
        )
       
    def load_pdfs(self):
        list_documents = []
        for file_name in os.listdir(self.folder_path):
            if file_name.endswith('.pdf'):
                loader = PyMuPDFLoader(os.path.join(self.folder_path, file_name))
                doc_loaded = loader.load()
                pdf_source = doc_loaded[0].metadata['source']
                concatenated_text = "\n\n\n\n\n\n".join([page.page_content for page in doc_loaded])
                document = Document(metadata={'source': pdf_source}, page_content=concatenated_text)
                list_documents.append(document)

        return list_documents
    
    def upload_in_batches(self, data_list, vector_store, batch_size=100):
        # Calculate the number of batches
        total_batches = len(data_list) // batch_size + (1 if len(data_list) % batch_size != 0 else 0)
        
        for i in range(total_batches):
            # Get the current batch
            start_index = i * batch_size
            end_index = min((i + 1) * batch_size, len(data_list))
            batch = data_list[start_index:end_index]
            
            # Upload the current batch to the vector store
            vector_store.add_documents(batch)
            logger.info(f'Uploaded batch {i + 1} of {total_batches}')
            

    def process_and_store(self):
        list_documents = self.load_pdfs()
        vector_store = FirestoreVectorStore(
                        collection="medical_docs_vector_store",
                        embedding_service=self.embedding_model)
        chunks = self.text_splitter.split_documents(list_documents)

        self.upload_in_batches(chunks, vector_store, batch_size=100)

        logger.info(f"Stored {len(chunks)} chunks in the Vertex Vector Store.")




if __name__ == '__main__':
    

    from functions.utils import PathInfo

    pdf_folder = PathInfo.PDFS_FOLDER
    data_ingestion = DataIngestion(folder_path=pdf_folder)
    data_ingestion.process_and_store()




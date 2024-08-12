from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_firestore import FirestoreVectorStore
from langchain_google_vertexai import VertexAIEmbeddings
from functions.logger_setup import logger
from functions.utils import PathInfo
import os
from dotenv import load_dotenv
load_dotenv(dotenv_path=PathInfo.ENV_FILE_PATH)

class RAGRetrieverDisease:
    def __init__(self):

        self.PROJECT_ID = os.getenv('GCLOUD_PROJECT_ID')
        self.embedding_model = VertexAIEmbeddings(
            model_name="textembedding-gecko@latest",
            project=self.PROJECT_ID,
        )
        
        self.vector_store = FirestoreVectorStore(
                        collection="medical_docs_vector_store",
                        embedding_service=self.embedding_model)
        
        
        self.llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0, max_retries=4)
        self.prompt_template = PromptTemplate(
            template="Context:{context}\n\n---\n\nGiven the context above and the symptom {prompt}, return the diseases associated with it, one in each line:"
        )

    def retrieve_and_generate(self, prompt):
        question = f'Which diseases are associated with the symptom {prompt}?'
        logger.info(f'{question=}')
        retrieved_docs = self.vector_store.similarity_search(question, k=20)
        logger.info(f'{len(retrieved_docs)=}')
        context = "\n".join([doc.page_content for doc in retrieved_docs])
        formated_prompt = self.prompt_template.format(context=context, prompt=question)
        response = self.llm.invoke(formated_prompt)

        return [disease.replace('-', '').strip() for disease in list(set(response.content.split('\n')))]


class RAGRetrieverRiskFactor:
    def __init__(self):

        self.PROJECT_ID = 'dev-competition-8f302'
        self.embedding_model = VertexAIEmbeddings(
            model_name="textembedding-gecko@latest",
            project=self.PROJECT_ID)

        self.vector_store = FirestoreVectorStore(
                        collection="medical_docs_vector_store",
                        embedding_service=self.embedding_model)
        
        self.llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0, max_retries=4)
        self.prompt_template = PromptTemplate(
            template="Context:{context}\n\n---\n\nGiven the context above and the disease {prompt}, return the risk factors associated with it, one in each line:"
        )

    def retrieve_and_generate(self, prompt):
        question = f'Which risk factors or conditions are associated with the disease {prompt}?'
        retrieved_docs = self.vector_store.similarity_search(question, k=20)
        context = "\n".join([doc.page_content for doc in retrieved_docs])
        formated_prompt = self.prompt_template.format(context=context, prompt=prompt)
        response = self.llm.invoke(formated_prompt)
        return [disease.replace('-', '').strip() for disease in list(set(response.content.split('\n')))]


def main_diseases(symptom="Fever"):

    rag_retriever = RAGRetrieverDisease()
    response = rag_retriever.retrieve_and_generate(symptom)
    logger.info(f'Diseases: {response}')

def main_risk_factors():

    rag_retriever = RAGRetrieverRiskFactor()
    question = "Addison disease"
    response = rag_retriever.retrieve_and_generate(question)
    logger.info(f'Risk factors: {response}')


if __name__ == '__main__':

    main_diseases()




    

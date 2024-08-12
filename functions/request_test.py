import requests
from logger_setup import logger

def test_requisition_diseases():

    url_deployed='https://get-disease-probability-deployv7-ut54nzwa4a-uc.a.run.app'


    data = {
        "user_id": "user13@example.com",
        "symptoms": ["fever","cough","diarrhea"]
    }

    response = requests.post(url_deployed, json=data)

    logger.info(f"Response: {response.json()}")

if __name__ == "__main__":
    test_requisition_diseases()

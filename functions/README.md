## Running application

    git clone https://github.com/paulomuraroferreira/health_app_google_ia_dev_competition.git  

    cd health_app_google_ia_dev_competition

    pip install -e .

Fill the enviroment variables on functions/.env with the following variables

GOOGLE_API_KEY  
GOOGLEV3_GEOCODING_KEY  
GCLOUD_PROJECT_ID

Install the packages dependencies:

    pip install -r functions/requirements.txt

Create a google cloud project following https://developers.google.com/workspace/guides/create-project?hl=pt-br#gcloud-cli_1

Init and authenticate the google cloud project with

    gcloud init  
    
    gcloud auth login

Create an index on google cloud with (replace the <PROJECT_ID> with your google project id.)

    gcloud alpha firestore indexes composite create --project=<PROJECT_ID> --collection-group=medical_docs_collection --query-scope=COLLECTION --field-config=vector-config='{"dimension":"768","flat": "{}"}',field-path=embedding

To run the emulator:

    firebase init emulators

    firebase emulators:start

    run `backend/populate_firestore.py` with the --emulator flag to populate the emulator firestore,
    or without the flag to populate the deployed firestore.

To deploy:

Replace the endpoints in functions/main.py with your firebase project endpoints.

    firebase deploy --only functions


use the route `get_disease_probability` to run the inference.

It must receive

    data = {
    "user_id": "useremail@email.com",
    "symptoms": "fever,cough,shortness of breath",
    }

A request can be seen on functions/request_test.py.
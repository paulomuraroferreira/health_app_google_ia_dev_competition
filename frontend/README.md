# React + TypeScript + Vite

## Running application

Create .env file in frontend folder with the following configuration:

    VITE_FIREBASE_EMULATOR=true/false
    VITE_DISEASE_PROBABILITY_ENDPOINT=endpoint of get-disease-probability function

To run in dev mode:

    npm run dev

## Build

    npm run build
    firebase deploy --only hosting

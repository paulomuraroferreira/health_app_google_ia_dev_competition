import firebase_admin
from firebase_functions import https_fn, options
import json

firebase_admin.initialize_app()

from calculate_probilities import DiseaseProbabilityHandler

@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins=[r"firebase\.com$", "https://dev-competition-8f302.web.app", "https://dev-competition-8f302.firebaseapp.com", "http://localhost:5173"],
        cors_methods=["GET", "POST"],
    )
)
def get_disease_probability(req):

    data = req.json

    disease_probability = DiseaseProbabilityHandler(data)
    probabilities = disease_probability.get_probabilities()

    return https_fn.Response(
        json.dumps(probabilities),
        mimetype="application/json",
    )







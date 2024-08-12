from pydantic import BaseModel, create_model
from typing import Literal, Dict, List, Type
from langchain.output_parsers import PydanticOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from pprint import pprint
from dotenv import load_dotenv
from functions.logger_setup import logger
from functions.utils import PathInfo
load_dotenv(dotenv_path=PathInfo.ENV_FILE_PATH)

class RiskFactorAnalyzer:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0, max_retries=4)

    def _create_prompt_template(self, condition: str, output_model: Type[BaseModel]):
        output_parser = PydanticOutputParser(pydantic_object=output_model)
        return PromptTemplate(
            template="""
You are given a specific patient health condition:

Condition: {condition}

You also have a list of disease risk factors:

{disease_risk_factors}

Your task is to determine whether the condition exactly matches any of the risk factors. 
Indicate "YES" only if the condition explicitly matches one of the risk factors provided. 
If there is no direct match, respond with "NO".

Consider only the risk factors listed and do not infer or assume any additional connections.

{format_instructions}
""",
            input_variables=["condition", "disease_risk_factors"],
            partial_variables={"format_instructions": output_parser.get_format_instructions()}
        )

    def _create_output_model(self) -> Type[BaseModel]:
        return create_model("ConditionMatch", match=(Literal["YES", "NO"], ...))

    def analyze_risk_factors(self, patient_health_profile: List[str], disease_risk_factors: List[str]) -> Dict[str, bool]:
        output_model = self._create_output_model()
        results = {}

        for condition in patient_health_profile:
            prompt_template = self._create_prompt_template(condition, output_model)
            output_parser = PydanticOutputParser(pydantic_object=output_model)
            
            disease_risk_factors_str = "\n".join(f"- {factor.replace('_', ' ')}" for factor in disease_risk_factors)
            input_data = {
                "condition": condition.replace('_', ' '),
                "disease_risk_factors": disease_risk_factors_str
            }
            
            result = (
                prompt_template | self.llm | output_parser
            ).invoke(input_data)

            logger.info(f"Condition: {condition}, Match: {result.match}")
            results[condition] = result.match == "YES"
        
        return results

def main():
    analyzer = RiskFactorAnalyzer()
    
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
          "is_over_65_years_of_age"]

    disease_risk_factors = [
        "lack_of_physical_exercise",
        "smoking",
        "old age",
    ]

    result = analyzer.analyze_risk_factors(patient_health_profile, disease_risk_factors)

    pprint(result)

if __name__ == "__main__":
    main()

export interface UserProfile {
  home_address: string;
  work_address: string;
  date_of_birth: string;
  health_profile: {
    [key: string]: boolean;
  };
}

export const UserHealthProfileOptions: { [key: string]: string } = {
  is_smoker: "Smoker",
  is_pregnant: "Pregnant",
  is_sedentary: "Sedentary",
  is_obese: "Obese",
  is_diabetic: "Diabetic",
  is_hypertensive: "Hypertensive",
  is_asthmatic: "Asthmatic",
  is_cancer_patient: "Cancer Patient",
  is_cardiovascular_patient: "Cardiovascular Patient",
  is_immunocompromised: "Immunocompromised",
};

export type UserSymptoms = {
  _id: string;
  user_id: string;
  symptoms: {
    _id: string;
    name: string;
  }[];
  result: {
    disease: string;
    probability: number;
  }[];
  created: string;
};

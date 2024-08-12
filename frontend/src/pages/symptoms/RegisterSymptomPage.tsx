import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Controller, useForm } from "react-hook-form";
import useAuth from "../../lib/auth/useAuth";
import { db } from "../../firebase-config";
import { useCollection } from "../../hooks/useCollection";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { toast } from "react-toastify";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

type FormValues = {
  [key: string]: boolean;
};

type Symptom = {
  _id: string;
  [key: string]: string;
};

const getDiseaseProbability = async (userId: string, symptoms: string[]) => {
  const response = await fetch(
    import.meta.env.VITE_DISEASE_PROBABILITY_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId, symptoms }),
    }
  );

  const responseData: { [key: string]: number } = await response.json();

  const kvResponse = Object.entries(responseData)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      disease: key,
      probability: value,
    }));

  return kvResponse;
};

const RegisterSymptomPage = () => {
  const { currentUser } = useAuth();
  const symptomOptions = useCollection<Symptom>(db, "symptoms_list");
  const { handleSubmit, control } = useForm<FormValues>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    const selectedSymptoms = Object.keys(data)
      .map((_, index) => ({
        _id: symptomOptions.data![index]._id,
        name: symptomOptions.data![index].name,
      }))
      .filter((symptom) => data[symptom._id]);

    if (selectedSymptoms.length < 2) {
      toast.info("Please select at least 2 symptoms");
      return;
    }

    const symptomsIds = selectedSymptoms.map((symptom) => symptom._id);

    try {
      const kvResponse = await getDiseaseProbability(
        currentUser!.email!,
        symptomsIds
      );

      const document = {
        user_id: currentUser?.email,
        symptoms: selectedSymptoms,
        result: kvResponse,
        created: new Date().toString(),
      };
      const docRef = await addDoc(collection(db, "symptoms_history"), document);
      navigate(`/symptoms?id=${docRef.id}`);
      toast.success("Symptom registered successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to register symptom try again later");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Box>
      {loading && <CircularProgress />}

      <Typography component="h1" variant="h4">
        Register Symptom
      </Typography>

      <Box component="form" noValidate onSubmit={onSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          {symptomOptions.data?.map((symptom) => (
            <Grid item xs={12} sm={4} key={symptom.name}>
              <FormControlLabel
                control={
                  <Controller
                    control={control}
                    name={symptom._id}
                    render={({ field }) => (
                      <Checkbox
                        checked={!!field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                }
                label={symptom.name}
              />
            </Grid>
          ))}
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default RegisterSymptomPage;

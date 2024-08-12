import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useDocument } from "../../hooks/useDocument";
import useAuth from "../../lib/auth/useAuth";
import { db } from "../../firebase-config";
import { UserProfile, UserSymptoms } from "../../models/user";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import Button from "@mui/material/Button";
import { useCollection } from "../../hooks/useCollection";
import { where } from "firebase/firestore";
import Grid from "@mui/material/Grid";
import UserSymptomResultCard from "../../components/UserSymptomResultCard/UserSymptomResultCard";

const SymptomsPage = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const userProfile = useDocument<UserProfile>(
    db,
    "user_info",
    currentUser?.email ?? ""
  );
  const userSymptoms = useCollection<UserSymptoms>(
    db,
    "symptoms_history",
    where("user_id", "==", currentUser?.email)
  );
  const cannotRegisterSymptoms =
    (!userProfile.loading && !userProfile.data?.home_address) ||
    !userProfile.data?.work_address;
  const selectedSymptom = searchParams.get("id");

  return (
    <Box>
      <Alert severity="info" sx={{ my: 2 }}>
        This page shows the symptoms you have reported. You can register new
        symptoms by clicking the "Register New" button below. It was generated
        by artificial intelligence and may not be accurate. Please consult a
        doctor for a proper diagnosis.
      </Alert>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography component="h1" variant="h4">
          Symptoms
        </Typography>
        <Button
          variant="contained"
          component={RouterLink}
          to="/symptoms/register"
          disabled={cannotRegisterSymptoms}
        >
          Register New
        </Button>
      </Box>

      {cannotRegisterSymptoms && (
        <Alert severity="warning" sx={{ my: 2 }}>
          Please update your profile to report symptoms. You can do that{" "}
          <Link to="/settings/profile" variant="body2" component={RouterLink}>
            here.
          </Link>
        </Alert>
      )}

      <Grid container spacing={2}>
        {!userSymptoms.loading &&
          userSymptoms.data
            ?.sort(
              (s1, s2) =>
                new Date(s1.created).getTime() - new Date(s2.created).getTime()
            )
            .reverse()
            .map((symptom) => (
              <Grid item xs={12} key={symptom._id}>
                <UserSymptomResultCard
                  symptom={symptom}
                  selectedSymptom={selectedSymptom}
                />
              </Grid>
            ))}
      </Grid>

      {!userSymptoms.loading && userSymptoms.data?.length === 0 && (
        <Typography
          component="h2"
          variant="h5"
          textAlign="center"
          sx={{ mt: 4 }}
        >
          No symptoms reported yet
        </Typography>
      )}

      {userSymptoms.error && (
        <Alert severity="error" sx={{ my: 2 }}>
          An error occurred while fetching your symptoms. Please try again
          later.
        </Alert>
      )}
    </Box>
  );
};

export default SymptomsPage;

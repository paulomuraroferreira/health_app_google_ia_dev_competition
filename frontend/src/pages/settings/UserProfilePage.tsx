import Typography from "@mui/material/Typography";
import useAuth from "../../lib/auth/useAuth";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Controller, useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { db } from "../../firebase-config";
import { useDocument } from "../../hooks/useDocument";
import { doc, DocumentData, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { UserHealthProfileOptions, UserProfile } from "../../models/user";

const UserProfilePage = () => {
  const { currentUser } = useAuth();
  const { data } = useDocument<UserProfile>(
    db,
    "user_info",
    currentUser?.email ?? ""
  );
  const {
    handleSubmit,
    control,
    formState: { isDirty, isValid },
  } = useForm<UserProfile>({
    values: {
      date_of_birth: data?.date_of_birth ?? "",
      home_address: data?.home_address ?? "",
      work_address: data?.work_address ?? "",
      health_profile: data?.health_profile ?? {},
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const ref = doc(db, "user_info", currentUser?.email ?? "");
      Object.keys(data.health_profile).forEach((key) => {
        data.health_profile[key] = !!data.health_profile[key];
      });
      await setDoc(ref, data as DocumentData);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  });

  return (
    <Box>
      <Typography component="h1" variant="h4">
        User Profile
      </Typography>
      <Typography>Email: {currentUser?.email}</Typography>
      <Typography>
        Last Login: {currentUser?.metadata.lastSignInTime}
      </Typography>
      <Box component="form" noValidate onSubmit={onSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="home_address"
              render={({ field }) => (
                <TextField {...field} required fullWidth label="Home Address" />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="work_address"
              render={({ field }) => (
                <TextField {...field} required fullWidth label="Work Address" />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="date_of_birth"
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>
          {Object.keys(UserHealthProfileOptions).map((option) => (
            <Grid item xs={12} sm={4} key={option}>
              <FormControlLabel
                control={
                  <Controller
                    control={control}
                    name={`health_profile.${option}`}
                    render={({ field }) => (
                      <Checkbox
                        checked={!!field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                }
                label={UserHealthProfileOptions[option]}
              />
            </Grid>
          ))}
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={!isDirty || !isValid}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default UserProfilePage;

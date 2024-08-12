import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Button from "@mui/material/Button";
import { useState } from "react";
import useAuth from "../../lib/auth/useAuth";
import { FirebaseError } from "firebase/app";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);

    const password = data.get("password") as string;
    if (password !== data.get("repeatPassword")) {
      setError("Passwords do not match");
      return;
    }

    const email = data.get("email") as string;

    try {
      await auth.signUp(email, password);
      await auth.signIn(email, password);
      navigate("/");
    } catch (error) {
      const knownError = error as FirebaseError;
      console.error("Error:", knownError);
      if (knownError.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else {
        setError("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            type="email"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="repeatPassword"
            label="Repeat Password"
            type="password"
            id="repeatPassword"
          />
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Create Account
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SignUpPage;

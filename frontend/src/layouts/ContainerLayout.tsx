import { Outlet } from "react-router-dom";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";

const ContainerLayout = () => {
  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Toolbar />
      <Outlet />
    </Container>
  );
};

export default ContainerLayout;

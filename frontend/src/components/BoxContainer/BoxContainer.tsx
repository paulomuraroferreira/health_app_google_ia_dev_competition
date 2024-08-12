import { styled } from "@mui/material";
import Box from "@mui/material/Box";

const BoxContainer = styled(Box)`
  width: 100%;
  overflow: auto;
  height: calc(
    100vh - ${(props) => props.theme.mixins.toolbar.minHeight}px -
      ${(props) => props.theme.spacing(2)}
  );
  margin-top: calc(
    ${(props) => props.theme.mixins.toolbar.minHeight}px +
      ${(props) => props.theme.spacing(0.5)}
  );
  ${(props) => props.theme.breakpoints.up("md")} {
    margin-top: calc(
      ${(props) => props.theme.mixins.toolbar.minHeight}px +
        ${(props) => props.theme.spacing(2)}
    );
  }
`;

export default BoxContainer;

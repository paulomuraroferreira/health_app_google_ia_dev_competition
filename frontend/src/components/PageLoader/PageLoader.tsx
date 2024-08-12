import CircularProgress from "@mui/material/CircularProgress";
import React, { FC, Suspense } from "react";

interface Props {
  children: React.ReactNode;
}

const PageLoader: FC<Props> = ({ children }) => {
  return <Suspense fallback={<CircularProgress />}>{children}</Suspense>;
};

export default PageLoader;

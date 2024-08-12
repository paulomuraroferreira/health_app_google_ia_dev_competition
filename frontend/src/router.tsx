/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import HomePage from "./pages/home/HomePage";
import ContainerLayout from "./layouts/ContainerLayout";
import { lazy } from "react";
import PageLoader from "./components/PageLoader/PageLoader";

const UserProfilePage = lazy(() => import("./pages/settings/UserProfilePage"));
const SignInPage = lazy(() => import("./pages/auth/SignInPage"));
const SignUpPage = lazy(() => import("./pages/auth/SignUpPage"));
const RegisterSymptomPage = lazy(
  () => import("./pages/symptoms/RegisterSymptomPage")
);
const SymptomsPage = lazy(() => import("./pages/symptoms/SymptomsPage"));
const AboutPage = lazy(() => import("./pages/about/AboutPage"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        element: <ContainerLayout />,
        children: [
          {
            path: "/about",
            element: <AboutPage />,
          },
          {
            path: "/symptoms",
            children: [
              {
                index: true,
                element: <SymptomsPage />,
              },
              {
                path: "register",
                element: <RegisterSymptomPage />,
              },
            ],
          },
          {
            path: "/settings",
            children: [
              {
                path: "profile",
                element: <UserProfilePage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/auth/sign-in",
    element: (
      <PageLoader>
        <SignInPage />
      </PageLoader>
    ),
  },
  {
    path: "/auth/sign-up",
    element: (
      <PageLoader>
        <SignUpPage />
      </PageLoader>
    ),
  },
]);

export default router;

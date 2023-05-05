import React from "react";
import SignupForm from "../components/Form/SignupForm";
import { ToastContainer } from "react-toastify";

const signup = () => {
  return (
    <div>
      <ToastContainer />
      <SignupForm />
    </div>
  );
};

export default signup;
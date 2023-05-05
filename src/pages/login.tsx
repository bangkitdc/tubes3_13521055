import React from "react";
import LoginForm from "../components/Form/LoginForm";
import { ToastContainer } from "react-toastify";

const login = () => {
  return (
    <div>
      <ToastContainer />
      <LoginForm />
    </div>
  );
};

export default login;
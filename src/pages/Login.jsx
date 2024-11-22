import React, { useEffect } from "react";
import LoginHeader from "../components/All Headers/loginHeader/LoginHeader";
import LoginUI from "../components/loginUI/LoginUI";
const Login = () => {
  useEffect(()=>{
    localStorage.removeItem("lCpFhWZtGKKejSX")
  },[])
  return (
    <>
      <LoginHeader />
      <LoginUI />
    </>
  );
};

export default Login;

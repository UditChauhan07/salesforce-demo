import React from "react";
import LoginHeader from "../components/All Headers/loginHeader/LoginHeader";
import CreateAccountForm from "../components/Account/CreateAccount";

const SignUp = () => {
  return (
    <>
      <LoginHeader />
      <div className="row d-flex flex-column justify-content-around align-items-center lg:min-h-[300px] xl:min-h-[400px]">
        <div className="col-10">
          <CreateAccountForm/>
        </div>
      </div>
    </>
  );
};

export default SignUp;

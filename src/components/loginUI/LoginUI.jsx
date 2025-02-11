import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import Loading from "../Loading";
import useLogin from "../../api/useLogin";
import { Link, useNavigate } from "react-router-dom";
import ModalPage from "../Modal UI";
import { useAuth } from "../../context/UserContext";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { LoginFormSchema } from "../../validation schema/LoginValidation";
import TextError from "../../validation schema/TextError";
import { EmailIcon, PasswordIcon } from "../../lib/svg";
import StylesModal from "../Modal UI/Styles.module.css";

const LoginUI = () => {
  const api = useLogin();
  const navigate = useNavigate();
  const { setUserValue } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salesRepLogin, setSalesRepLogin] = useState(true);
  const [tokenAccess, setTokenAccess] = useState(false)
  const [token, setToken] = useState();
  const [tokenError, setTokenError] = useState(false);
  const [retryCredentials, setRetryCredentials] = useState(null);
  const initialValues = {
    email: localStorage.getItem("emailB2B") || "",
    password: localStorage.getItem("passwordB2B") || "",
    remember: true,
  };
  useEffect(() => { }, [retryCredentials, token, tokenAccess])
  const onSubmit = async (values, action) => {
    setLoading(true);
    const apiData = await api.mutateLogin(values.email, values.password);
    setLoading(false);
    if (apiData?.status === 200) {
      if (values.remember) {
        localStorage.setItem("emailB2B", values.email);
        localStorage.setItem("passwordB2B", values.password);
      }
      localStorage.setItem("Name", apiData?.data?.Name);
      localStorage.setItem("token", token)

      localStorage.setItem("Api Data", JSON.stringify(apiData));
      const fetched = localStorage.getItem("Api Data");
      setUserValue(JSON.parse(fetched));
      navigate("/dashboard");
    } else if (apiData?.status === 400) {
      console.log({ 'token required': apiData?.data?.error });

      if (apiData?.data?.error == "invalid_grant") {
        let storeToken = localStorage.getItem("token");
        console.log({ storeToken });
        if (storeToken) {
          setToken(storeToken);
          setRetryCredentials(values);
          setTimeout(() => {
            loginRetry(storeToken,values)
          }, 1000);
        } else {
          setRetryCredentials(values);
          setTokenAccess(true);
        }
      } else {
        setModalOpen(true);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
    action.resetForm();
  };

  const loginRetry = async (retryToken = null,loginCredentials=null) => {
    
    const { email, password, remember } = loginCredentials||retryCredentials;
    if (!email||!password) {
      console.error("No credentials available for retry.");
      return;
    }
    if (token || retryToken) {
      handleClose();
      setLoading(true);
      const apiData = await api.mutateLogin(email, password + (token||retryToken));
      setLoading(false);
      console.log({ apiData, email,password,token,retryToken });

      if (apiData?.status === 200) {
        if (remember) {
          localStorage.setItem("emailB2B", email);
          localStorage.setItem("passwordB2B", password);
        }
        localStorage.setItem("Name", apiData?.data?.Name);
        localStorage.setItem("token", token)

        localStorage.setItem("Api Data", JSON.stringify(apiData));
        const fetched = localStorage.getItem("Api Data");
        setUserValue(JSON.parse(fetched));
        navigate("/dashboard");
      } else if (apiData?.status === 400) {
        console.log({ 'token required': apiData?.data?.error });
        if (apiData?.data?.error == "invalid_grant") {
          let storeToken = localStorage.getItem("token");
          if (storeToken) {
            localStorage.removeItem("token")
          }
          setTokenAccess(true);
        } else {
          setModalOpen(true);
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    } else {
      setTokenError(true);
    }
  }
  const handleSalesRepLogin = () => {
    // salesRepLogin ? navigate("/register-salesrep") : navigate("/register");
    setSalesRepLogin(true);
  };
  const handleRetailerLogin = () => {
    setSalesRepLogin(false);
  };
  useEffect(() => {

  }, [token])
  const handleClose = () => setTokenAccess(false);
  return (
    <>
      {loading ? (
        <ModalPage
          open
          content={
            <div>
              <Loading />
              Loading ...
            </div>
          }
          onClose={() => setLoading(false)}
        />
      ) : null}
      {tokenAccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="max-w-md p-4 shadow-lg rounded-2xl bg-white">
            <div>
              <h2 className="text-xl font-bold mb-2">
                Security Token Verification Needed by Salesforce
              </h2>
              <p className="mb-2">
                Salesforce now requires a security token for logging into integrated apps. Check your email for a message with the subject "Your new Salesforce security token" from "support@salesforce.com".
              </p>
              <p className="m-auto mb-4">
                <input
                  type="text"
                  className="shadow-none outline-0 border-bottom border-dark form-control"
                  onChange={(e) => setToken(e.target.value || null)}
                  placeholder="Enter your security token"
                />
                {tokenError && <p className="text-danger text-[12px] mt-1">* Please enter your Token.</p>}
              </p>
              <div className="flex justify-center space-x-4 mt-2">
                <button variant="secondary" className={StylesModal.modalButton} onClick={handleClose}>
                  Cancel
                </button>
                <button className={StylesModal.modalButton} onClick={() => {
                  if (token) {
                    loginRetry();
                  } else {
                    setTokenError(true);
                  }
                }}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Formik initialValues={initialValues} validationSchema={LoginFormSchema} onSubmit={onSubmit}>
        <div>
          <div className="container">
            <div className={styles.LoginMain}>
              <div className="d-flex col-12">
                <div className="col-6">
                  <button className={styles.tab}>
                    Sales Rep Login
                  </button>
                  <hr className={styles.hr} />
                </div>
                <div className="col-6">
                  <a className={styles.tabNotActive} href="https://retailer.beautyfashionsales.com">
                    Retailer Login
                  </a>
                  <hr />
                </div>
              </div>
              <h4>Access My Account</h4>
              <Form>
                <div className={styles.EmailDiv}>
                  <div className={styles.SvgEmail}>
                    <EmailIcon />
                  </div>

                  <div className={styles.LabelEmail}>
                    <label>Email</label> <br />
                    <Field type="email" className="border-0 h-50 border-bottom" style={{ width: "100%", outline: "none" }} name="email" />
                    <ErrorMessage component={TextError} name="email" />
                  </div>
                </div>

                <div className={`${styles.EmailDiv} ${styles.passwardDiv}`}>
                  <div className={styles.SvgEmail}>
                    <PasswordIcon />
                  </div>

                  <div className={styles.LabelEmail}>
                    <label>Password</label> <br />
                    <Field type="password" className="border-0 h-50 border-bottom" style={{ width: "100%", outline: "none" }} name="password" />
                    <ErrorMessage component={TextError} name="password" />
                  </div>
                </div>

                <div className={`${styles.ReCheck}`}>
                  <div className={`${styles.RememMe} ${styles.rememInput}`}>
                    <input type="checkbox" name="remember" defaultChecked />
                    Remember me
                  </div>

                  <div className={styles.Forget}>Forgot your password?</div>
                </div>

                <div className={styles.ButtonLogin}>
                  <button type="submit" className={`text-white py-2 w-100 ${styles.loginBtn}`}>
                    Login
                  </button>
                </div>
              </Form>
              <Link to={"/sign-up"}>
                <div className={styles.SignUpW} onClick={() => navigate("/sign-up")}>
                  <p>
                    Don’t have an account ? <span>Sign up.</span>
                  </p>
                </div>
              </Link>
            </div>

            <div className={styles.PolicyA}>
              <p>
                By signing in or clicking "Login", you agree to our <a href="https://beautyfashionsales.com/terms-and-services" style={{ color: '#000', fontWeight: 'bold' }}>Terms of Service </a> Please also read our<a href="https://beautyfashionsales.com/privacy-policy" style={{ color: '#000', fontWeight: 'bold' }}> Privacy Policy </a>
              </p>
            </div>
          </div>
        </div>
      </Formik>

      {modalOpen ? (
        <ModalPage
          open={modalOpen}
          content={
            <>
              <h2>Warning</h2>
              <p className="mt-3">Invalid Credentials!</p>
              <div className="d-flex justify-content-center">
                <button className={styles.closeButton} onClick={() => setModalOpen(false)}>
                  OK
                </button>

                {/* <button className={Styles.modalClose} onClick={onClose}>
                CANCEL
              </button> */}
              </div>
            </>
          }
          onClose={() => setModalOpen(false)}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default LoginUI;

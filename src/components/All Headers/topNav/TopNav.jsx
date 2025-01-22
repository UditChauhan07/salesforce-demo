import React, { useEffect, useState, useMemo } from "react";
import styles from "./index.module.css";
import { Link, useNavigate } from "react-router-dom";
import {
  CustomerServiceIcon,
  NeedHelp,
  OrderStatusIcon,
} from "../../../lib/svg";
import ModalPage from "../../Modal UI";
import SelectCaseReason from "../../CustomerServiceFormSection/SelectCaseReason/SelectCaseReason";
import { GetAuthData, admins, getSessionStatus } from "../../../lib/store";
import { BiLogoZoom, BiMailSend, BiStar } from "react-icons/bi";
import { RiGuideLine } from "react-icons/ri";
import { getPermissions } from "../../../lib/permission";
import PermissionDenied from "../../PermissionDeniedPopUp/PermissionDenied";
// import Redirect from "../../Redirect";
const TopNav = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem("Name"));
  const [showSetting, setShowSetting] = useState(false);

  const [permissions, setPermissions] = useState(null);

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const user = await GetAuthData(); // Fetch user data
        const userPermissions = await getPermissions(); // Fetch permissions
        setPermissions(userPermissions); // Set permissions in state
      } catch (err) {
        console.error("Error fetching permissions", err);
      }
    }

    fetchPermissions(); // Fetch permissions on mount
  }, []);

  // Memoize permissions to avoid unnecessary re-calculations
  const memoizedPermissions = useMemo(() => permissions, [permissions]);
console.log(memoizedPermissions?.modules?.godLevel)

  // Handle restricted access
  const handleRestrictedAccess = () => {
    PermissionDenied();
  };
  useEffect(() => {
    GetAuthData()
      .then((user) => {
        getSessionStatus({
          key: user?.x_access_token,
          salesRepId: user?.Sales_Rep__c,
        })

          .then((status) => {
            if (memoizedPermissions?.modules?.godLevel) {
              setShowSetting(true);
            }
            setUserName(status?.data?.Name);
          })
          .catch((statusErr) => {
            console.log({ statusErr });
          });
      })
      .catch((userErr) => {
        console.log({ userErr });
      });
  }, []);

  // console.log("userDetails", userDetails);
  const reasons = {
    Charges: "Charges",
    "Product Missing": "Product Missing",
    "Product Overage Shipped": "Product Overage",
    "Product Damage": "Product Damage",
    "Update Account Info": "Update Account Info",
  };
  return (
    <>
      {/* {userDetails?.status === 200 ? ( */}
      <>
        <div className={`${styles.NeedNone} d-none-print`}>
          <ModalPage
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            content={
              <SelectCaseReason
                reasons={reasons}
                onClose={() => setModalOpen(false)}
                recordType={{
                  id: "0123b0000007z9pAAA",
                  name: "Customer Service",
                }}
              />
            }
          />

          <div
            className={`${styles.topNav} d-flex justify-content-between  align-items-center gap-2 `}
          >
            <div className="d-flex justify-content-center align-items-center gap-2">
              <img src={"/assets/images/americanFlag.svg"} alt="img" />
              <div className={styles.vr}></div>
              <p className={`m-0 ${styles.language}`}>EN</p>
              <p className={`m-0 ${styles.language} ${styles.text} flex`}>
                {memoizedPermissions?.modules?.customerSupport?.childModules?.order_Status?.view||memoizedPermissions?.modules?.customerSupport?.childModules?.customer_service?.view||memoizedPermissions?.modules?.customerSupport?.childModules?.how_To_Guide?.view?
                <div
                  className="dropdown d-flex justify-content-center align-items-center"
                  role="button"
                  data-bs-toggle="dropdown"
                  style={{ zIndex: 1021 }}
                >
                  Need Help?&nbsp; <NeedHelp />
                  <ul className="dropdown-menu">
                    {/* order status  */}
                    {memoizedPermissions?.modules?.customerSupport?.childModules?.order_Status?.view ? (
                      <li onClick={() => navigate("/orderStatus")}>
                        <Link
                          to="/order-list"
                          className={`dropdown-item text-start d-flex align-items-center ${styles.nameText} focus:!bg-black active:!bg-black focus:!text-white active:!text-white`}
                        >
                          <OrderStatusIcon width={15} height={15} />
                          &nbsp;Order Status
                        </Link>
                      </li>
                    ) : null}

                    {/* customer services */}
                    {memoizedPermissions?.modules?.customerSupport?.childModules?.customer_service?.view ? (
                      <li onClick={() => navigate("/customerService")}>
                        <Link
                          to="/customerService"
                          className={`dropdown-item text-start d-flex align-items-center ${styles.nameText} focus:!bg-black active:!bg-black focus:!text-white active:!text-white`}
                        >
                          <CustomerServiceIcon width={15} height={15} />
                          &nbsp;Customer Services
                        </Link>
                      </li>
                    ) : null}

                    {/* help section */}
                    {memoizedPermissions?.modules?.customerSupport?.childModules?.how_To_Guide?.view ? (
                      <li onClick={() => navigate("/Help-Section")}>
                        <Link
                          className={`dropdown-item text-start d-flex align-items-center ${styles.nameText} focus:!bg-black active:!bg-black focus:!text-white active:!text-white`}
                        >
                          <RiGuideLine width={15} height={15} />
                          &nbsp;How-To Guides
                        </Link>
                      </li>
                    ) : null}
                  </ul>
                </div>:null}

              </p>
            </div>
            <div className="d-flex justify-content-center align-items-center gap-3">
              <p className={`m-0 ${styles.welcomeText}`}>
                Welcome,
                <span className={`m-0 ${styles.nameText}`}>
                  {userName ?? "User"}
                </span>
              </p>
             

              
                  {memoizedPermissions?.modules?.godLevel ? <>
                    <div className={styles.vr}></div>
                    <p className={`m-0 ${styles.nameText}`}>

                      <div
                        className="dropdown d-flex justify-content-center align-items-center"
                        role="button"
                        data-bs-toggle="dropdown"
                        style={{ zIndex: 1021 }}
                      >
                        Admin
                        <ul className="dropdown-menu ">
                          {/* email blast  */}
                          {memoizedPermissions?.modules?.emailBlast?.view ? (
                            <li
                              onClick={() => navigate("/newsletter")}
                              className={`dropdown-item rounded ${styles.nameText} p-1  d-flex align-items-center focus:!bg-black active:!bg-black focus:!text-white active:!text-white hover:bg-[#eeeeef] hover:rounded-lg`}
                              style={{ lineHeight: "15px" }}
                            >
                              <BiMailSend />
                              &nbsp;Email Blast
                            </li>
                          ) : (
                            null
                          )}

                          {/* account tier */}
                          {memoizedPermissions?.modules?.reports?.accountTier?.view ? (
                            <li
                              onClick={() => navigate("/TierStanding")}
                              className={`dropdown-item rounded ${styles.nameText} p-1  d-flex align-items-center focus:!bg-black active:!bg-black focus:!text-white active:!text-white hover:bg-[#eeeeef] hover:rounded-lg`}
                              style={{ lineHeight: "15px" }}
                            >
                              <BiStar />
                              &nbsp;Account Tier & Standing Report
                            </li>
                          ) : (
                            null
                          )}

                          {/* audit report */}
                          {memoizedPermissions?.modules?.reports?.auditReport?.view ? (
                            <li
                              onClick={() => navigate("/AuditReport")}
                              className={`dropdown-item rounded ${styles.nameText} p-1 d-flex align-items-center focus:!bg-black active:!bg-black focus:!text-white active:!text-white hover:bg-[#eeeeef] hover:rounded-lg`}
                              style={{ lineHeight: "15px" }}
                            >
                              <BiLogoZoom />
                              &nbsp;Audit Report
                            </li>
                          ) : (
                            null
                          )}
                        </ul>
                      </div>

                    </p>
                  </> : null}

               
              <div className={styles.vr}></div>

              {/* My orders  */}
              {memoizedPermissions?.modules?.order?.view ?
                <p className={`m-0 ${styles.nameText}`}>
                  <Link to="/order-list" className="linkStyle">
                    My Orders{" "}
                  </Link>
                </p>
                : <p className={`m-0 ${styles.nameText}`} onClick={handleRestrictedAccess}>
                  <Link className="linkStyle"
                    style={{

                      cursor: "not-allowed",
                      color: "grey",
                    }}
                  >
                    My Orders{" "}


                  </Link>
                </p>}

              <div className={styles.vr}></div>
              <p className={`m-0 ${styles.nameText}`}>
                <Link to="/logout" className="linkStyle">
                  Logout
                </Link>
              </p>
            </div>
          </div>
        </div>
      </>
      {/* ) : (
        <>
          <Redirect href="https://b2b-v3.vercel.app/#/" />
        </>
      )} */}
    </>
  );
};

export default TopNav;

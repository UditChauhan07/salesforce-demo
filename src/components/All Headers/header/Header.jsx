import React, { useEffect, useState, useMemo } from "react";
import styles from "./index.module.css";
import { Link, useNavigate } from "react-router-dom";
import { getPermissions } from "../../../lib/permission";
import PermissionDenied from "../../PermissionDeniedPopUp/PermissionDenied";
import "./index.css";
import { GetAuthData, getSessionStatus } from "../../../lib/store";

const Header = () => {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState(null);

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const user = await GetAuthData();
        const userPermissions = await getPermissions();
        setPermissions(userPermissions);
      } catch (err) {
        console.log("Error fetching permissions", err);
      }
    }

    fetchPermissions();
  }, []);

  // Memoize permissions to avoid unnecessary re-calculations
  const memoizedPermissions = useMemo(() => permissions, [permissions]);

  // Handle restricted access with alert
  const handleRestrictedAccess = (moduleName) => {
    PermissionDenied();
  };

  const path = window.location.pathname;

  return (
    <div className="d-none-print">
      <div id={`${styles.main}`} className="d-flex justify-content-between align-items-center gap-1">
        {memoizedPermissions?.modules?.topProducts?.view ? (
          <p className={`m-0 ${styles.text}`}>
            <Link to="/top-products" className="linkStyle">Top selling products</Link>
          </p>
        ) : (
          <p className={`m-0 ${styles.text}`}>
            <span
              className={`linkStyle`}
              onClick={() => handleRestrictedAccess('Top Products')}
              style={{ cursor: 'not-allowed', color: 'grey' }}
            >
              Top selling products
            </span>
          </p>
        )}

        {memoizedPermissions?.modules?.marketingCalender.view ? (
          <p className={`m-0 ${styles.text}`}>
            <Link to="/marketing-calendar" className="linkStyle">Marketing Calendar</Link>
          </p>
        ) : (
          <p className={`m-0 ${styles.text}`}>
            <span
              className={`linkStyle`}
              onClick={() => handleRestrictedAccess('Marketing Calendar')}
              style={{ cursor: 'not-allowed', color: 'grey' }}
            >
              Marketing Calendar
            </span>
          </p>
        )}

        {memoizedPermissions?.modules?.educationCenter?.view ? (
          <p className={`m-0 ${styles.text}`}>
            <Link to="/education-center" className="linkStyle">Education Center</Link>
          </p>
        ) : (
          <p className={`m-0 ${styles.text}`}>
            <span
              className={`linkStyle`}
              onClick={() => handleRestrictedAccess('Education Center')}
              style={{ cursor: 'not-allowed', color: 'grey' }}
            >
              Education Center
            </span>
          </p>
        )}

        {memoizedPermissions?.modules?.customerSupport.view ? (
          <p className={`m-0 ${styles.text}`}>
            <Link to="/customer-support" className="linkStyle">Customer Support</Link>
          </p>
        ) : (
          <p className={`m-0 ${styles.text}`}>
            <span
              className={`linkStyle`}
              onClick={() => handleRestrictedAccess('Customer Support')}
              style={{ cursor: 'not-allowed', color: 'grey' }}
            >
              Customer Support
            </span>
          </p>
        )}

        <p className={`m-0 ${styles.text}`}>
          <Link to="" className="linkStyle">
            <div className="dropdown dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              {path === "/sales-report" ? "Sales Report" : null ||
                path === "/newness-report" ? "Newness Report" : null ||
                  path === "/comparison-report" ? "Comparison Report" : null ||
                    path === "/comparison" ? "Yearly Comparison Report" : null ||
                      path === "/Target-Report" ? "Target Report" : null ||
                        path === "/account-contact-detailed-Report" ? "Account Contact Detailed Report" : "Reports"
              }
              <ul className="dropdown-menu">
                {/* Sales Report */}
                {memoizedPermissions?.modules?.reports?.salesReport?.view ? (
                  <li>
                    <Link
                      to="/sales-report"
                      className="dropdown-item text-start focus:!bg-black active:!bg-black focus:!text-white active:!text-white hover:bg-[#eeeeef] hover:rounded-lg"
                      onClick={() => navigate("/sales-report")}
                    >
                      Sales Report
                    </Link>
                  </li>
                ) : (
                  null
                )}

                {/* Newness Report */}
                {memoizedPermissions?.modules?.reports?.newnessReport?.view ? (
                  <li>
                    <Link
                      to="/newness-report"
                      className="dropdown-item text-start focus:!bg-black active:!bg-black focus:!text-white active:!text-white hover:bg-[#eeeeef] hover:rounded-lg"
                      onClick={() => navigate("/newness-report")}
                    >
                      Newness Report
                    </Link>
                  </li>
                ) : (
                  null
                )}

                {/* Comparison Report */}
                {memoizedPermissions?.modules?.reports?.comparisonReport?.view ? (
                  <li>
                    <Link
                      to="/comparison-report"
                      className="dropdown-item text-start focus:!bg-black active:!bg-black focus:!text-white active:!text-white hover:bg-[#eeeeef] hover:rounded-lg"
                      onClick={() => navigate("/comparison-report")}
                    >
                      Comparison Report
                    </Link>
                  </li>
                ) : (
                  null
                )}

                {/* Yearly Comparison Report */}
                {memoizedPermissions?.modules?.reports?.yearlyComparisonReport?.view ? (
                  <li>
                    <Link
                      to="/comparison"
                      className="dropdown-item text-start focus:!bg-black active:!bg-black focus:!text-white active:!text-white hover:bg-[#eeeeef] hover:rounded-lg"
                      onClick={() => navigate("/comparison")}
                    >
                      Yearly Comparison Report
                    </Link>
                  </li>
                ) : (
                  null
                )}

                {/* Target Report */}
                {memoizedPermissions?.modules?.reports?.targetReport?.view ? (
                  <li>
                    <Link
                      to="/Target-Report"
                      className="dropdown-item text-start focus:!bg-black active:!bg-black focus:!text-white active:!text-white hover:bg-[#eeeeef] hover:rounded-lg"
                      onClick={() => navigate("/Target-Report")}
                    >
                      Target Report
                    </Link>
                  </li>
                ) : (
                  null
                )}

                {/* Account Contact Detailed Report */}
                {memoizedPermissions?.modules?.reports?.contactDetailedReport?.view ? (
                  <li>
                    <Link
                      to="/account-contact-detailed-Report"
                      className="dropdown-item text-start focus:!bg-black active:!bg-black focus:!text-white active:!text-white hover:bg-[#eeeeef] hover:rounded-lg"
                      onClick={() => navigate("/account-contact-detailed-Report")}
                    >
                      Account Contact Detailed Report
                    </Link>
                  </li>
                ) : (
                  null
                )}
              </ul>

            </div>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Header;

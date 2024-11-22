import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdKeyboardArrowRight } from "react-icons/md";
import { CustomerServiceIcon, OrderStatusIcon } from "../../../lib/svg";
import styles from "./index.module.css";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { BiMailSend } from "react-icons/bi";
import { GetAuthData, admins, getSessionStatus } from "../../../lib/store";

const MobileHeader = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);
  const [show, setShow] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem("Name"));


  useEffect(() => {
    GetAuthData().then((user) => {
      getSessionStatus({ key: user?.x_access_token, salesRepId: user?.Sales_Rep__c }).then((status) => {
        if (admins.includes(status.data.Id)) {

        }
        setUserName(status?.data?.Name)
      }).catch((statusErr) => {
        console.log({ statusErr });
      })
    }).catch((userErr) => {
      console.log({ userErr });
    })
  }, [])
  const togglePanel = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <div className={`${styles.mobileHeader}`}>

      <div className="">

        <div className={styles.flexMain1}>
          <div className={styles.flexMain2}>

            {/* <div   className={`dropdown-toggle ${styles["dropdown-toggle"]} ${styles.AfterRemove}`} type="button" data-bs-toggle="dropdown">
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none">
  <path d="M7.08301 9.9165H26.9163" stroke="black" strokeWidth="2" stroke-linecap="round"/>
  <path d="M7.08301 17H21.2497" stroke="black" strokeWidth="2" stroke-linecap="round"/>
  <path d="M7.08301 24.0835H15.583" stroke="black" strokeWidth="2" stroke-linecap="round"/>
</svg>
            </div> */}

            {/* ankush code start */}
            <>
              <div className={styles.navbar}>
                <button onClick={handleShow} className={styles.barButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none">
                    <path d="M7.08301 9.9165H26.9163" stroke="black" strokeWidth="2" stroke-linecap="round" />
                    <path d="M7.08301 17H21.2497" stroke="black" strokeWidth="2" stroke-linecap="round" />
                    <path d="M7.08301 24.0835H15.583" stroke="black" strokeWidth="2" stroke-linecap="round" />
                  </svg>

                </button>

                <Offcanvas className={styles.offcanvasMain} show={show} onHide={handleClose}>
                  <Offcanvas.Header closeButton>
                    <div className={styles.country}>
                      <div>
                        <img src={"/assets/images/americanFlag.svg"} alt="img" />
                      </div>
                      <div className={styles.line}></div>

                      <div>
                        <p className={`m-0 ${styles.language}`}>EN</p>
                      </div>
                    </div>

                  </Offcanvas.Header>
                  <div className={styles.welcomeAdmin}>
                    <p className={`m-0 ${styles.welcomeText}`}>
                      Welcome,
                      <span className={`m-0 ${styles.nameText}`}>{userName ?? "User"}</span>
                    </p>
                  </div>




                  {/* ..accordian need start */}
                  <div className={styles.accordion}>
                    <div className={styles.panel}>
                      <div className={styles.panelHeader} onClick={() => togglePanel(0)}>
                        Need Help?&nbsp;
                        <span className={`${styles.arrow} ${activeIndex === 0 ? styles.arrowUp : ''}`}><MdKeyboardArrowRight /></span>
                      </div>
                      {activeIndex === 0 && (
                        <div className={styles.panelContent}>
                          <ul>
                            <li onClick={() => navigate("/orderStatus")}>
                              <Link to="/order-list" className={`dropdown-item text-start d-flex align-items-center ${styles.text}`}>
                                <OrderStatusIcon width={15} height={15} />&nbsp;Order Status
                              </Link>
                            </li>
                            <li
                              onClick={() => {
                                // setModalOpen(true);
                                navigate("/customerService")
                              }}
                            >
                              <Link to="/customerService" className={`dropdown-item text-start d-flex align-items-center ${styles.text}`}>
                                <CustomerServiceIcon width={15} height={15} />&nbsp;Customer Services
                              </Link>
                            </li>
                          </ul>

                        </div>
                      )}
                    </div>

                  </div>
                  {/* accordian need end */}

                  {/* accordian admin start */}
                  <div className={styles.accordion}>
                    <div className={styles.panel}>
                      <div className={styles.panelHeader} onClick={() => togglePanel(1)}>
                        Admin
                        <span className={`${styles.arrow} ${activeIndex === 1 ? styles.arrowUp : ''}`}><MdKeyboardArrowRight /></span>
                      </div>
                      {activeIndex === 1 && (
                        <div className={styles.panelContent}>
                          <ul>
                            <li onClick={() => navigate("/newsletter")} className={`dropdown-item rounded ${styles.text} hover:bg-[#eeeeef] p-1 hover:rounded-lg d-flex align-items-center`} style={{ lineHeight: '15px' }}>
                              <BiMailSend />&nbsp;Email Blast
                            </li>

                          </ul>

                        </div>
                      )}
                    </div>

                  </div>
                  {/* accordian admin end  */}

                  {/* accordian Reports Start*/}
                  <div className={styles.accordion}>
                    <div className={styles.panel}>
                      <div className={styles.panelHeader} onClick={() => togglePanel(2)}>
                        REPORTS
                        <span className={`${styles.arrow} ${activeIndex === 2 ? styles.arrowUp : ''}`}><MdKeyboardArrowRight /></span>
                      </div>
                      {activeIndex === 2 && (
                        <div className={styles.panelContent2}>
                          <ul>
                         <li>
                        <Link to="/sales-report" className={` linkStyle ${styles.text}`}>
                          Sales Report
                        </Link>
                      </li>
                      <li>
                        <Link to="/newness-report" className={` linkStyle ${styles.text}`}>
                          Newness Report
                        </Link>
                      </li>
                      <li>
                  <Link
                    to="/comparison-report"
                    className={` linkStyle ${styles.text}`}
                    // onClick={() => {
                    //   navigate("/comparison-report");
                    // }}
                  >
                    Comparison Report
                  </Link>
                </li>
                <li>
                  <Link
                    to="/comparison-report"
                    className={` linkStyle ${styles.text}`}
                    // onClick={() => {
                    //   navigate("/comparison");
                    // }}
                   style={{lineHeight: "1px"}}>Yearly Comparison Report
                  </Link>
                </li>
                <li>
                  <Link
                    to="/Target-Report"
                    className={` linkStyle ${styles.text}`}
                    // onClick={() => {
                    //   navigate("/Target-Report");
                    // }}
                  >
                    Target Report
                  </Link>
                </li>

                          </ul>

                        </div>
                      )}
                    </div>

                  </div>
                  {/* accordian Reports End*/}


                  <Offcanvas.Body className={styles.offcanvasBody}>

                    <ul>
                      <li>
                        <Link to="/order-list" className={`p-1 px-2 linkStyle ${styles.text}`}>
                          My Orders{" "}
                        </Link>
                      </li>

                      <li>
                        <Link to="/top-products" className={`p-1 px-2 linkStyle ${styles.text}`}>
                        Popular selling products
                        </Link>
                      </li>
                    
                      <li>
                        <Link to="/marketing-calendar" className={`p-1 px-2 linkStyle ${styles.text}`}>
                          Marketing Calendar
                        </Link>
                      </li>
                      <li>
                        <Link to="/education-center" className={`p-1 px-2 linkStyle ${styles.text}`}>
                          Education Center
                        </Link>
                      </li>
                      <li>
                        <Link to="/customer-support" className={`p-1 px-2 linkStyle ${styles.text}`}>
                          Customer Support
                        </Link>
                      </li>

                    </ul>
                  </Offcanvas.Body>
                </Offcanvas>
              </div>

            </>

            {/* ankush code end */}


            {/* <ul className="dropdown-menu" style={{ minWidth: "max-content" }}>
              <li>
                <Link to="/top-products" className={`p-1 px-2 linkStyle ${styles.text}`}>
                  Top Products
                </Link>
              </li>

              <li>
                <Link to="/sales-report" className={`p-1 px-2 linkStyle ${styles.text}`}>
                  Sales Report
                </Link>
              </li>
              <li>
                <Link to="/newness-report" className={`p-1 px-2 linkStyle ${styles.text}`}>
                  Newness Report
                </Link>
              </li>
              <li>
                <Link to="/marketing-calendar" className={`p-1 px-2 linkStyle ${styles.text}`}>
                  Marketing Calendar
                </Link>
              </li>
              <li>
                <Link to="/education-center" className={`p-1 px-2 linkStyle ${styles.text}`}>
                  Education Center
                </Link>
              </li>
              <li>
                <Link to="/customer-support" className={`p-1 px-2 linkStyle ${styles.text}`}>
                  Customer Support
                </Link>
              </li>
            </ul> */}

            <div className="d-flex  ">
              <Link to="/dashboard" className={`linkStyle`}>
                <img src={"/assets/images/b2bMobile.svg"} alt="img" />
              </Link>
            </div>

          </div>

          <div className={styles.flexMain3}>
            <p className={`m-0  d-flex ${styles.language}`} style={{ minWidth: "max-content" }}>
              <input type="text" placeholder="Search..." />
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9.16602" cy="9.1665" r="5" stroke="black" />
                <path d="M9.16602 6.6665C8.83771 6.6665 8.51262 6.73117 8.20931 6.85681C7.90599 6.98244 7.63039 7.16659 7.39825 7.39874C7.1661 7.63088 6.98195 7.90648 6.85632 8.2098C6.73068 8.51311 6.66602 8.8382 6.66602 9.1665" stroke="black" stroke-linecap="round" />
                <path d="M16.666 16.6665L14.166 14.1665" stroke="black" stroke-linecap="round" />
              </svg>
            </p>
            <div className="d-flex  align-items-center">
              <Link to="/dashboard" className={`linkStyle`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
                  <path d="M8.99744 2.43686L16.1906 7.58724V18.3188H12.5267V11.4543V9.87031H10.9667H7.03392H5.47392V11.4543V18.3188H1.81V7.58698L8.99744 2.43686ZM8.99744 0.498047L0.25 6.76594V19.9028H7.03834C7.0373 19.8751 7.03418 19.8477 7.03418 19.8199V11.4543H10.9669V19.8199C10.9669 19.8477 10.9636 19.8751 10.963 19.9028H17.7511V6.76594L8.99744 0.498047Z" fill="black" />
                </svg>
              </Link>
            </div>
            <div className="d-flex  align-items-center">
              <Link to="/dashboard" className={`linkStyle`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="21" viewBox="0 0 16 21" fill="none">
                  <path d="M12.3079 5.89534V5.01241C12.3079 2.66808 10.3694 0.75 8.00012 0.75C5.63085 0.75 3.69236 2.66808 3.69236 5.01241V5.89534H1.23079H0V7.11317V20.2049C0 20.5398 0.276927 20.8138 0.615394 20.8138H15.3848C15.7233 20.8138 16.0002 20.5398 16.0002 20.2049V7.11317V5.89534H14.7694H12.3079ZM4.92315 5.04286C4.92315 3.36834 6.30779 1.99828 8.00012 1.99828C9.69245 1.99828 11.0771 3.36834 11.0771 5.04286V5.92578H4.92315V5.04286ZM14.7694 19.5959H1.23079V7.11317H3.69236V11.1016H4.92315V7.11317H11.0771V11.1016H12.3079V7.11317H14.7694V19.5959Z" fill="black" />
                </svg>
              </Link>
            </div>
            <div className="d-flex  align-items-center">
              <Link to="/dashboard" className={`linkStyle`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none">
                  <path d="M10 1.26667C10.7417 1.26667 11.4667 1.48953 12.0834 1.90708C12.7001 2.32463 13.1807 2.91811 13.4645 3.61247C13.7484 4.30683 13.8226 5.07088 13.6779 5.80801C13.5333 6.54514 13.1761 7.22223 12.6517 7.75367C12.1272 8.28511 11.459 8.64703 10.7316 8.79365C10.0042 8.94028 9.25016 8.86502 8.56494 8.57741C7.87971 8.2898 7.29404 7.80274 6.88199 7.17783C6.46993 6.55293 6.25 5.81824 6.25 5.06667C6.25112 4.05919 6.64657 3.09331 7.34959 2.38092C8.05261 1.66852 9.00578 1.2678 10 1.26667ZM10 0C9.01109 0 8.0444 0.297155 7.22215 0.853887C6.3999 1.41062 5.75904 2.20193 5.3806 3.12774C5.00216 4.05355 4.90315 5.07229 5.09607 6.05512C5.289 7.03796 5.7652 7.94075 6.46447 8.64934C7.16373 9.35793 8.05464 9.84048 9.02455 10.036C9.99445 10.2315 10.9998 10.1311 11.9134 9.74766C12.827 9.36417 13.6079 8.71476 14.1573 7.88156C14.7068 7.04835 15 6.06876 15 5.06667C15 3.7229 14.4732 2.43418 13.5355 1.48399C12.5979 0.533808 11.3261 0 10 0ZM16.25 13.9333C16.9128 13.9341 17.5483 14.2012 18.0169 14.6762C18.4856 15.1511 18.7493 15.795 18.75 16.4667C18.7496 16.8025 18.6178 17.1245 18.3835 17.3619C18.1491 17.5994 17.8314 17.733 17.5 17.7333H2.5C2.16859 17.733 1.85087 17.5994 1.61653 17.3619C1.38219 17.1245 1.25037 16.8025 1.25 16.4667C1.25075 15.795 1.51438 15.1511 1.98306 14.6762C2.45174 14.2012 3.08719 13.9341 3.75 13.9333H16.25ZM16.25 12.6667H3.75C2.75544 12.6667 1.80161 13.067 1.09835 13.7797C0.395088 14.4923 0 15.4588 0 16.4667C0 17.1385 0.263392 17.7829 0.732233 18.258C1.20107 18.7331 1.83696 19 2.5 19H17.5C18.163 19 18.7989 18.7331 19.2678 18.258C19.7366 17.7829 20 17.1385 20 16.4667C20 15.4588 19.6049 14.4923 18.9017 13.7797C18.1984 13.067 17.2446 12.6667 16.25 12.6667Z" fill="black" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* lableStart */}
        <div className={styles.ControlMobNav}>
          {/* <p className={`m-0 pt-2 ${styles.myRetailer}`}>
            <Link to="/my-retailers" className={`${styles.myRetailer}`}>
              My Retailers
            </Link>
          </p> */}
          {/* <p className={`m-0  pt-2 ${styles.myRetailer} `}>
            <Link to="/new-arrivals" className={`${styles.myRetailer} ${styles.myRetailerPaddingBorder}`}>
              New Arrivals
            </Link>
          </p> */}
          {/* <p className={`m-0  pt-2 ${styles.myRetailer}`}>
            <Link to="/brand" className={`${styles.myRetailer}`}>
              Brands
            </Link>
          </p> */}

          <p className={`m-0  pt-2 ${styles.myRetailer}`}>
            <Link to="" className={`${styles.myRetailer}`}>
              <div className={styles.MoblabelLine}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M0.428661 1.99921H6.35561C6.44703 2.32761 6.64348 2.61704 6.91493 2.82325C7.18638 3.02945 7.51789 3.14109 7.85878 3.14109C8.19967 3.14109 8.53119 3.02945 8.80264 2.82325C9.07409 2.61704 9.27054 2.32761 9.36195 1.99921H10.7165C10.8302 1.99921 10.9392 1.95404 11.0196 1.87365C11.1 1.79326 11.1452 1.68423 11.1452 1.57054C11.1452 1.45686 11.1 1.34783 11.0196 1.26744C10.9392 1.18705 10.8302 1.14188 10.7165 1.14188H9.36195C9.27054 0.81348 9.07409 0.524051 8.80264 0.317844C8.53119 0.111637 8.19967 0 7.85878 0C7.51789 0 7.18638 0.111637 6.91493 0.317844C6.64348 0.524051 6.44703 0.81348 6.35561 1.14188H0.428661C0.314973 1.14188 0.205941 1.18705 0.125552 1.26744C0.0451623 1.34783 0 1.45686 0 1.57054C0 1.68423 0.0451623 1.79326 0.125552 1.87365C0.205941 1.95404 0.314973 1.99921 0.428661 1.99921ZM7.85878 0.85611C8.00009 0.85611 8.13822 0.898011 8.2557 0.976514C8.37319 1.05502 8.46476 1.1666 8.51884 1.29714C8.57291 1.42769 8.58706 1.57134 8.55949 1.70992C8.53192 1.84851 8.46388 1.97581 8.36397 2.07573C8.26405 2.17564 8.13675 2.24369 7.99816 2.27125C7.85958 2.29882 7.71593 2.28467 7.58538 2.2306C7.45484 2.17652 7.34326 2.08495 7.26475 1.96746C7.18625 1.84998 7.14435 1.71185 7.14435 1.57054C7.14435 1.38107 7.21962 1.19935 7.3536 1.06536C7.48758 0.931381 7.6693 0.85611 7.85878 0.85611Z" fill="black" />
                  <path d="M10.7165 4.57157H4.78957C4.69815 4.24317 4.5017 3.95374 4.23025 3.74753C3.9588 3.54132 3.62729 3.42969 3.2864 3.42969C2.94551 3.42969 2.614 3.54132 2.34255 3.74753C2.0711 3.95374 1.87465 4.24317 1.78323 4.57157H0.428661C0.314973 4.57157 0.205941 4.61673 0.125552 4.69712C0.0451623 4.77751 0 4.88654 0 5.00023C0 5.11392 0.0451623 5.22295 0.125552 5.30334C0.205941 5.38373 0.314973 5.42889 0.428661 5.42889H1.78323C1.87465 5.7573 2.0711 6.04673 2.34255 6.25293C2.614 6.45914 2.94551 6.57078 3.2864 6.57078C3.62729 6.57078 3.9588 6.45914 4.23025 6.25293C4.5017 6.04673 4.69815 5.7573 4.78957 5.42889H10.7165C10.8302 5.42889 10.9392 5.38373 11.0196 5.30334C11.1 5.22295 11.1452 5.11392 11.1452 5.00023C11.1452 4.88654 11.1 4.77751 11.0196 4.69712C10.9392 4.61673 10.8302 4.57157 10.7165 4.57157ZM3.2864 5.71467C3.1451 5.71467 3.00697 5.67277 2.88948 5.59426C2.77199 5.51576 2.68042 5.40418 2.62635 5.27364C2.57227 5.14309 2.55813 4.99944 2.58569 4.86085C2.61326 4.72227 2.6813 4.59497 2.78122 4.49505C2.88113 4.39514 3.00843 4.32709 3.14702 4.29953C3.28561 4.27196 3.42926 4.28611 3.5598 4.34018C3.69035 4.39425 3.80193 4.48583 3.88043 4.60331C3.95893 4.7208 4.00084 4.85893 4.00084 5.00023C4.00084 5.18971 3.92556 5.37143 3.79158 5.50541C3.6576 5.6394 3.47588 5.71467 3.2864 5.71467Z" fill="black" />
                  <path d="M10.7165 8.00126H9.36195C9.27054 7.67286 9.07409 7.38343 8.80264 7.17722C8.53119 6.97101 8.19967 6.85938 7.85878 6.85938C7.51789 6.85938 7.18638 6.97101 6.91493 7.17722C6.64348 7.38343 6.44703 7.67286 6.35561 8.00126H0.428661C0.314973 8.00126 0.205941 8.04642 0.125552 8.12681C0.0451623 8.2072 0 8.31623 0 8.42992C0 8.54361 0.0451623 8.65264 0.125552 8.73303C0.205941 8.81342 0.314973 8.85858 0.428661 8.85858H6.35561C6.44703 9.18698 6.64348 9.47641 6.91493 9.68262C7.18638 9.88883 7.51789 10.0005 7.85878 10.0005C8.19967 10.0005 8.53119 9.88883 8.80264 9.68262C9.07409 9.47641 9.27054 9.18698 9.36195 8.85858H10.7165C10.8302 8.85858 10.9392 8.81342 11.0196 8.73303C11.1 8.65264 11.1452 8.54361 11.1452 8.42992C11.1452 8.31623 11.1 8.2072 11.0196 8.12681C10.9392 8.04642 10.8302 8.00126 10.7165 8.00126ZM7.85878 9.14436C7.71748 9.14436 7.57935 9.10245 7.46187 9.02395C7.34438 8.94545 7.25281 8.83387 7.19873 8.70332C7.14466 8.57278 7.13051 8.42913 7.15808 8.29054C7.18564 8.15195 7.25369 8.02465 7.3536 7.92474C7.45352 7.82482 7.58082 7.75678 7.7194 7.72921C7.85799 7.70165 8.00164 7.71579 8.13219 7.76987C8.26273 7.82394 8.37431 7.91551 8.45282 8.033C8.53132 8.15049 8.57322 8.28862 8.57322 8.42992C8.57322 8.6194 8.49795 8.80112 8.36397 8.9351C8.22998 9.06908 8.04826 9.14436 7.85878 9.14436Z" fill="black" />
                </svg>
              </div>
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default MobileHeader;

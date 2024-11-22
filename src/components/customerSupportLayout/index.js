import React, { useState } from "react";
import AppLayout from "../AppLayout";
import Styles from "../CustomerSupportPage/Style.module.css"
import Styles1 from "./Style.module.css"
import ModalPage from "../Modal UI";
import { Link, useNavigate } from "react-router-dom";
import { CustomerServiceIcon, OrderStatusIcon, DefaultSupportIcon, MarketingSupportIcon, DIFTestIcon, DisplayIssuesIcon, BackArrow } from "../../lib/svg";
import { BiLeftArrow } from "react-icons/bi";
import PermissionDenied from "../PermissionDeniedPopUp/PermissionDenied";

const CustomerSupportLayout = ({ children, filterNodes, permissions }) => {
    const navigate = useNavigate();
    const path = window.location.pathname;
    let to = "/customer-support"
    if (path == "/orderStatusForm") {
        to = "/orderStatus"
    }
    console.log({permissions});
    

    const reasons = {
        Charges: "Charges",
        "Product Missing": "Product Missing",
        "Product Overage Shipped": "Product Overage",
        "Product Damage": "Product Damage",
        "Update Account Info": "Update Account Info",
    };
    return (
        <AppLayout
            filterNodes={filterNodes}
        >
            <div>
                <div className="">
                    <div className={Styles.supportMain}>
                        <div className="row">
                            <div className="col-lg-3 col-md-12 col-sm-12">
                                <div className={Styles.supportLeft}>
                                    {permissions?.modules?.customerSupport?.childModules?.order_Status?.create ?
                                        <Link to={"/orderStatus"} className={`${(path == "/orderStatus" || path == "/orderStatusForm") && Styles1.activeReason}`}>
                                            <div className={`${Styles.supportLeftBox} cardHover`} >
                                                <div className={Styles.supportLeftImg}>
                                                    <OrderStatusIcon width={42} height={42} />
                                                </div>

                                                <div className={Styles.supportLeftContent}>
                                                    <h2>Order Status</h2>
                                                    <p>View or Request Invoices and Tracking</p>
                                                </div>
                                            </div>
                                        </Link> : <div className={`${Styles.supportLeftBox} cardHover`} onClick={PermissionDenied}>
                                            <div className={Styles.supportLeftImg}>
                                                <OrderStatusIcon width={42} height={42} />
                                            </div>

                                            <div className={Styles.supportLeftContent}>
                                                <h2>Order Status</h2>
                                                <p>View or Request Invoices and Tracking</p>
                                            </div>
                                        </div>}
                                    {permissions?.modules?.customerSupport?.childModules?.customer_service?.create ?
                                        <Link to={"/customerService"} className={`${path == "/customerService" && Styles1.activeReason}`}>
                                            <div
                                                className={`${Styles.supportLeftBox} cardHover`}
                                                style={{ cursor: "pointer" }}
                                            // onClick={() => {
                                            //   setModalOpen(true);
                                            // }}
                                            >
                                                <div className={Styles.supportLeftImg}>
                                                    <CustomerServiceIcon width={42} height={42} />
                                                </div>
                                                <div className={Styles.supportLeftContent}>
                                                    <h2>Customer Services </h2>
                                                    <p>Report order issues or update account</p>
                                                </div>
                                            </div>
                                        </Link> : <div
                                            className={`${Styles.supportLeftBox} cardHover`}
                                            style={{ cursor: "pointer" }}
                                            onClick={PermissionDenied}
                                        >
                                            <div className={Styles.supportLeftImg}>
                                                <CustomerServiceIcon width={42} height={42} />
                                            </div>
                                            <div className={Styles.supportLeftContent}>
                                                <h2>Customer Services </h2>
                                                <p>Report order issues or update account</p>
                                            </div>
                                        </div>}
                                    {/* Brand Management Approval */}
                                    {permissions?.modules?.customerSupport?.childModules?.brandManagementApproval?.create ?
                                        <Link
                                            to={"/brandManagementApproval"}
                                            className={`${path == "/brandManagementApproval" && Styles1.activeReason}`}
                                        >
                                            <div className={`${Styles.supportLeftBox} cardHover`}>
                                                <div className={Styles.supportLeftImg}>
                                                    <DefaultSupportIcon width={42} height={42} />
                                                </div>
                                                <div className={Styles.supportLeftContent}>
                                                    <h2>Brand Management Approval </h2>
                                                    <p>Effective Management</p>
                                                </div>
                                            </div>
                                        </Link> : <div className={`${Styles.supportLeftBox} cardHover`} onClick={PermissionDenied}>
                                            <div className={Styles.supportLeftImg}>
                                                <DefaultSupportIcon width={42} height={42} />
                                            </div>
                                            <div className={Styles.supportLeftContent}>
                                                <h2>Brand Management Approval </h2>
                                                <p>Effective Management</p>
                                            </div>
                                        </div>}

                                    <div>
                                        <div className={`${Styles.supportLeftBox} cardHover`}>
                                            <div className={Styles.supportLeftImg}>
                                                <MarketingSupportIcon width={42} height={42} />
                                            </div>

                                            <div className={Styles.supportLeftContent}>
                                                <h2>Marketing Request</h2>
                                                <p>Elevate Your Marketing with Proactive Solutions.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className={`${Styles.supportLeftBox} cardHover`}>
                                            <div className={Styles.supportLeftImg}>
                                                <DisplayIssuesIcon width={42} height={42} />
                                            </div>

                                            <div className={Styles.supportLeftContent}>
                                                <h2>Displays Issues </h2>
                                                <p>Request updates</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={`${Styles.supportLeftBox} cardHover`}>
                                            <div className={Styles.supportLeftImg}>
                                                <DIFTestIcon width={42} height={42} />
                                            </div>

                                            <div className={Styles.supportLeftContent}>
                                                <h2>DIF Tester Issue </h2>
                                                <p>Empowering Solutions for Effective Management</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-9 col-md-12 col-sm-12">
                                <Link to={to} style={{ color: "#000", display: 'flex', alignItems: 'center' }}><BackArrow />&nbsp;Go Back</Link>
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default CustomerSupportLayout;

import React, { useMemo, useState } from "react";
import Styles from "./Style.module.css";
import MySupportTicket from "./MySupportTicket";
import { Link } from "react-router-dom";
import { CustomerServiceIcon, OrderStatusIcon, DefaultSupportIcon, MarketingSupportIcon, DIFTestIcon, DisplayIssuesIcon } from "../../lib/svg";
import ModalPage from "../Modal UI";
import SelectCaseReason from "../CustomerServiceFormSection/SelectCaseReason/SelectCaseReason";
import BrandManagementModal from "../Brand Management Approval/BrandManagementModal";
import PermissionDenied from "../PermissionDeniedPopUp/PermissionDenied";

function CustomerSupportPage({ data, PageSize, currentPage, manufacturerFilter, searchBy, retailerFilter, memoizedPermissions = {} }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [brandManagementModalOpen, setBrandManagementModalOpen] = useState(false);

  const reasons = {
    Charges: "Charges",
    "Product Missing": "Product Missing",
    "Product Overage Shipped": "Product Overage",
    "Product Damage": "Product Damage",
    "Update Account Info": "Update Account Info",
  };

  return (
    <div>
      <div className="">
        <ModalPage
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          content={<SelectCaseReason reasons={reasons} onClose={() => setModalOpen(false)} recordType={{ id: "0123b0000007z9pAAA", name: "Customer Service" }} />}
        />
        <ModalPage
          open={brandManagementModalOpen}
          onClose={() => setBrandManagementModalOpen(false)}
          content={<BrandManagementModal onClose={() => setBrandManagementModalOpen(false)} recordType={{ id: "0123b000000GfOEAA0", name: "Brand Management Approval" }} />}
        />
        <div className={Styles.supportMain}>
          <div className="row">
            <div className="col-lg-3 col-md-12 col-sm-12">
              <div className={Styles.supportLeft}>
                {memoizedPermissions?.modules?.customerSupport?.childModules?.order_Status?.create ?
                  <Link to={"/orderStatus"}>
                    <div className={`${Styles.supportLeftBox} cardHover`}>
                      <div className={Styles.supportLeftImg}>
                        <OrderStatusIcon width={42} height={42} />
                      </div>

                      <div className={Styles.supportLeftContent}>
                        <h2>Order Status</h2>
                        <p>View or Request Invoices and Tracking</p>
                      </div>
                    </div>
                  </Link> : <div className={`${Styles.supportLeftBox} cardHover`} onClick={() => { PermissionDenied() }}>
                    <div className={Styles.supportLeftImg}>
                      <OrderStatusIcon width={42} height={42} />
                    </div>

                    <div className={Styles.supportLeftContent}>
                      <h2>Order Status</h2>
                      <p>View or Request Invoices and Tracking</p>
                    </div>
                  </div>}
                {memoizedPermissions?.modules?.customerSupport?.childModules?.customer_service?.create ?
                  <Link to={"/customerService"}>
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
                  </Link> :
                  <div
                    className={`${Styles.supportLeftBox} cardHover`}
                    style={{ cursor: "pointer" }}
                    onClick={() => { PermissionDenied() }}
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
                {memoizedPermissions?.modules?.customerSupport?.childModules?.brandManagementApproval?.create ?
                  <Link
                    to={"/brandManagementApproval"}
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
                  </Link> : <div className={`${Styles.supportLeftBox} cardHover`} onClick={() => { PermissionDenied() }}>
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
              {data.length ? (
                <MySupportTicket data={data} currentPage={currentPage} PageSize={PageSize} />
              ) : (
                <div className="flex justify-center items-center py-4 w-full lg:min-h-[300px] xl:min-h-[380px]">No data found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerSupportPage;

import React, { useMemo } from "react";
import Styles from "./Style.module.css";
import {
  CustomerServiceIcon,
  DefaultSupportIcon,
  MarketingSupportIcon,
  OrderStatusIcon,
  UserChecked,
} from "../../lib/svg";
import { Link } from "react-router-dom";
import { DateConvert } from "../../lib/store";
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function MySupportTicket({ data, PageSize, currentPage }) {
  const filteredOrders = useMemo(() => {
    return data?.slice((currentPage - 1) * PageSize, currentPage * PageSize);
  }, [data, currentPage, PageSize]);
  return (
    <div>
      <div className="">
        <div className={Styles.SupportTicketMain}>
          <h3>My Support Tickets</h3>

          <div className={Styles.TicketsMain}>
            {filteredOrders?.length > 0 &&
              filteredOrders.map((item, index) => {
                const date = new Date(item.Date_Opened__c);
                return (
                  <Link to={`${"/CustomerSupportDetails?id=" + item.Id}`} className={Styles.QuearyTicket}>
                    <div className={Styles.customerProblem}>
                      <p>
                        {item.RecordType?.Name ? (
                          item.RecordType?.Name == "Customer Service Issues" ? (
                            <CustomerServiceIcon />
                          ) : item.RecordType?.Name == "Order Status" ? (
                            <OrderStatusIcon />
                          ) : item.RecordType?.Name == "Management Cases" || "Marketing Support Issues" ? (
                            <MarketingSupportIcon />
                          ) : (
                            <DefaultSupportIcon />
                          )
                        ) : (
                          <DefaultSupportIcon />
                        )}
                        <span className={Styles.Queary}>{item.RecordType?.Name ? item.RecordType?.Name : "No Record Type"} </span>&nbsp;for&nbsp;
                        <span className={Styles.Underline}>{item.Reason} </span>
                        {item.Associated_PO_Number__c &&<>&nbsp;having PO&nbsp;<span className={Styles.PoNumberStatus}>#{item.Associated_PO_Number__c}</span></>}
                        &nbsp;<span className={Styles.CreatedInBold}>Created</span>&nbsp;on&nbsp;
                        <span className={Styles.QuearyRiseDate}>{`${date.getDate()} ${monthNames[date.getMonth()]}`}</span>
                      </p>
                    </div>

                    <div className={Styles.CaseDivControll}>
                      <div className={Styles.CaseNumber}>
                        <h3>Case Number</h3>
                        <p>{item.CaseNumber}</p>
                      </div>

                      <div className={Styles.ShopNameBrand}>
                        {item.Account?.Name&&<p className={Styles.ShopNameLocation}>
                          <UserChecked />
                          &nbsp;{item.Account?.Name}
                        </p>}
                        <p className={Styles.Para2}>
                          {item.ManufacturerName__c && (
                            <>
                              For&nbsp;<span className={Styles.BrandMName}>{item.ManufacturerName__c}</span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className={Styles.CostomerStatusVisit}>
                        <p className={Styles.StatusColor}>{item.Status}</p>
                        <h6>{DateConvert(item.Date_Opened__c,true)}</h6>
                      </div>

                      {/* <div className={Styles.CustomerCloneColor}>
                        {item.Priority == "High" ? (
                          <SupportStatusRed />
                        ) : item.Priority == "Medium" ? (
                          <SupportStatusYellow />
                        ) : (
                          <SupportStatusGreen />
                        )}
                      </div> */}
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MySupportTicket;

import React from "react";
import Loading from "../Loading";
import styles from "./table.module.css";
const YearlyComparisonReportTable = ({ comparisonData, status }) => {
  const formentAcmount = (amount, totalorderPrice, monthTotalAmount) => {
    return `${Number(amount, totalorderPrice, monthTotalAmount).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`
  }
  let totalwholesale = 0;
  let totalretailer = 0;
  let monthTotalAmount = {
    Jan: {
      retailer: 0,
      wholesale: 0
    },
    Feb: {
      retailer: 0,
      wholesale: 0
    },
    Mar: {
      retailer: 0,
      wholesale: 0
    },
    Apr: {
      retailer: 0,
      wholesale: 0
    },
    May: {
      retailer: 0,
      wholesale: 0
    },
    Jun: {
      retailer: 0,
      wholesale: 0
    },
    Jul: {
      retailer: 0,
      wholesale: 0
    },
    Aug: {
      retailer: 0,
      wholesale: 0
    },
    Sep: {
      retailer: 0,
      wholesale: 0
    },
    Oct: {
      retailer: 0,
      wholesale: 0
    },
    Nov: {
      retailer: 0,
      wholesale: 0
    },
    Dec: {
      retailer: 0,
      wholesale: 0
    },
    total: {
      retailer: 0,
      wholesale: 0
    }
  };

  return (
    <>
      {comparisonData ? (
        <>
          <div className={`d-flex p-3 ${styles.tableBoundary} mb-5`}>
            <div className="" style={{ maxHeight: "73vh", minHeight: "40vh", overflow: "auto", width: "100%" }}>
              <table id="salesReportTable" className="table table-responsive " style={{ minHeight: "400px" }}>
                <thead>
                  <tr>
                    <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>
                      Retail Store
                    </th>
                    <th className={`${styles.th}  ${styles.stickyMonth}`} style={{ minWidth: "200px" }}>
                      Estee Lauder Number
                    </th>
                    <th className={`${styles.th} ${styles.stickyMonth}`}> Sales Rep</th>
                    <th className={`${styles.th} ${styles.stickyMonth}`}> Status</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '200px' }}>Jan Retail Revenue</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '250px' }}>Jan Wholesale Amount</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '200px' }}>Feb Retail Revenue</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '250px' }}>Feb Wholesale Amount</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '200px' }}>Mar Retail Revenue</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '250px' }}>Mar Wholesale Amount</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '200px' }}>Apr Retail Revenue</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '250px' }}>Apr Wholesale Amount</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '200px' }}>May Retail Revenue</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '250px' }}>May Wholesale Amount</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '200px' }}>Jun Retail Revenue</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '250px' }}>Jun Wholesale Amount</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '200px' }}>Jul Retail Revenue</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '250px' }}>Jul Wholesale Amount</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '200px' }}>Aug Retail Revenue</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '250px' }}>Aug Wholesale Amount</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '200px' }}>Set Retail Revenue</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '250px' }}>Set Wholesale Amount</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '200px' }}>Oct Retail Revenue</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '250px' }}>Oct Wholesale Amount</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '200px' }}>Nov Retail Revenue</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '250px' }}>Nov Wholesale Amount</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '200px' }}>Dec Retail Revenue</th>
                    <th className={`${styles.th} ${styles.stickyMonth} `} style={{ minWidth: '250px' }}>Dec Wholesale Amount</th>
                    
                    <th className={`${styles.th} ${styles.stickyMonth} ${styles.stickySecondLastColumnHeading2}`} style={{ maxWidth: "200px" }}>
                      Total Retail Revenue
                    </th>
                    <th className={`${styles.th} ${styles.stickyMonth} ${styles.stickyLastColumnHeading} `} style={{ maxWidth: "150px"   }}>
                      Total Wholesale Amount
                    </th>
                    <th className={`${styles.th} `}></th>
                  </tr>
                </thead>
                {comparisonData?.length ? (
                  <tbody>
                    <>
                      {comparisonData?.map((ele, index) => {
                        if ((status == 1 && ele.Status == "Active") || status == 2) {
                          // console.log({ele});
                          totalretailer = 0;
                          totalwholesale = 0;
                          totalretailer += ele.Jan.retail_revenue__c;
                          monthTotalAmount.Jan.retailer += ele.Jan.retail_revenue__c;
                          monthTotalAmount.Jan.wholesale += ele.Jan.Whole_Sales_Amount;
                          totalwholesale += ele.Jan.Whole_Sales_Amount;
                          totalretailer += ele.Feb.retail_revenue__c;
                          monthTotalAmount.Feb.retailer += ele.Feb.retail_revenue__c;
                          monthTotalAmount.Feb.wholesale += ele.Feb.Whole_Sales_Amount;
                          totalwholesale += ele.Feb.Whole_Sales_Amount;
                          totalretailer += ele.Mar.retail_revenue__c;
                          totalwholesale += ele.Mar.Whole_Sales_Amount;
                          monthTotalAmount.Mar.retailer += ele.Mar.retail_revenue__c;
                          monthTotalAmount.Mar.wholesale += ele.Mar.Whole_Sales_Amount;
                          totalretailer += ele.Apr.retail_revenue__c;
                          totalwholesale += ele.Apr.Whole_Sales_Amount;
                          monthTotalAmount.Apr.retailer += ele.Apr.retail_revenue__c;
                          monthTotalAmount.Apr.wholesale += ele.Apr.Whole_Sales_Amount;
                          totalretailer += ele.May.retail_revenue__c;
                          totalwholesale += ele.May.Whole_Sales_Amount;
                          monthTotalAmount.May.retailer += ele.May.retail_revenue__c;
                          monthTotalAmount.May.wholesale += ele.May.Whole_Sales_Amount;
                          totalretailer += ele.Jun.retail_revenue__c;
                          totalwholesale += ele.Jun.Whole_Sales_Amount;
                          monthTotalAmount.Jun.retailer += ele.Jun.retail_revenue__c;
                          monthTotalAmount.Jun.wholesale += ele.Jun.Whole_Sales_Amount;
                          totalretailer += ele.Jul.retail_revenue__c;
                          totalwholesale += ele.Jul.Whole_Sales_Amount;
                          monthTotalAmount.Jul.retailer += ele.Jul.retail_revenue__c;
                          monthTotalAmount.Jul.wholesale += ele.Jul.Whole_Sales_Amount;
                          totalretailer += ele.Aug.retail_revenue__c;
                          totalwholesale += ele.Aug.Whole_Sales_Amount;
                          monthTotalAmount.Aug.retailer += ele.Aug.retail_revenue__c;
                          monthTotalAmount.Aug.wholesale += ele.Aug.Whole_Sales_Amount;
                          totalretailer += ele.Sep.retail_revenue__c;
                          totalwholesale += ele.Sep.Whole_Sales_Amount;
                          monthTotalAmount.Sep.retailer += ele.Sep.retail_revenue__c;
                          monthTotalAmount.Sep.wholesale += ele.Sep.Whole_Sales_Amount;
                          totalretailer += ele.Oct.retail_revenue__c;
                          totalwholesale += ele.Oct.Whole_Sales_Amount;
                          monthTotalAmount.Oct.retailer += ele.Oct.retail_revenue__c;
                          monthTotalAmount.Oct.wholesale += ele.Oct.Whole_Sales_Amount;
                          totalretailer += ele.Nov.retail_revenue__c;
                          totalwholesale += ele.Nov.Whole_Sales_Amount;
                          monthTotalAmount.Nov.retailer += ele.Nov.retail_revenue__c;
                          monthTotalAmount.Nov.wholesale += ele.Nov.Whole_Sales_Amount;
                          totalretailer += ele.Dec.retail_revenue__c;
                          totalwholesale += ele.Dec.Whole_Sales_Amount;
                          monthTotalAmount.Dec.retailer += ele.Dec.retail_revenue__c;
                          monthTotalAmount.Dec.wholesale += ele.Dec.Whole_Sales_Amount;
                          monthTotalAmount.total.retailer += totalretailer;
                          monthTotalAmount.total.wholesale += totalwholesale
                          return (
                            <>
                              <tr key={index}>
                                <td className={`${styles.td} ${styles.stickyFirstColumn}`}>{ele.AccountName}</td>
                                <td className={`${styles.td}`}>{ele.Estee_Lauder_Number__c ?? "---"} </td>
                                <td className={`${styles.td}`}>{ele.Sales_Rep__c}</td>
                                <td className={`${styles.td}`}>{ele.Status}</td>
                                <td className={`${styles.td}`}>
                                  {ele.Jan.retail_revenue__c ? "$" + formentAcmount(Number(ele.Jan.retail_revenue__c).toFixed(2)) : "NA"}
                                </td>
                                <td className={`${styles.td}`}>${formentAcmount(Number(ele.Jan.Whole_Sales_Amount).toFixed(2))}</td>
                                <td className={`${styles.td}`}>
                                  {ele.Feb.retail_revenue__c ? "$" + formentAcmount(Number(ele.Feb.retail_revenue__c).toFixed(2)) : "NA"}
                                </td>
                                <td className={`${styles.td}`}>${formentAcmount(Number(ele.Feb.Whole_Sales_Amount).toFixed(2))}</td>
                                <td className={`${styles.td}`}>
                                  {ele.Mar.retail_revenue__c ? "$" + formentAcmount(Number(ele.Mar.retail_revenue__c).toFixed(2)) : "NA"}
                                </td>
                                <td className={`${styles.td}`}>${formentAcmount(Number(ele.Mar.Whole_Sales_Amount).toFixed(2))}</td>
                                <td className={`${styles.td}`}>
                                  {ele.Apr.retail_revenue__c ? "$" + formentAcmount(Number(ele.Apr.retail_revenue__c).toFixed(2)) : "NA"}
                                </td>
                                <td className={`${styles.td}`}>${formentAcmount(Number(ele.Apr.Whole_Sales_Amount).toFixed(2))}</td>
                                <td className={`${styles.td}`}>
                                  {ele.May.retail_revenue__c ? "$" + formentAcmount(Number(ele.May.retail_revenue__c).toFixed(2)) : "NA"}
                                </td>
                                <td className={`${styles.td}`}>${formentAcmount(Number(ele.May.Whole_Sales_Amount).toFixed(2))}</td>
                                <td className={`${styles.td}`}>
                                  {ele.Jun.retail_revenue__c ? "$" + formentAcmount(Number(ele.Jun.retail_revenue__c).toFixed(2)) : "NA"}
                                </td>
                                <td className={`${styles.td}`}>${formentAcmount(Number(ele.Jun.Whole_Sales_Amount).toFixed(2))}</td>
                                <td className={`${styles.td}`}>
                                  {ele.Jul.retail_revenue__c ? "$" + formentAcmount(Number(ele.Jul.retail_revenue__c).toFixed(2)) : "NA"}
                                </td>
                                <td className={`${styles.td}`}>${formentAcmount(Number(ele.Jul.Whole_Sales_Amount).toFixed(2))}</td>
                                <td className={`${styles.td}`}>
                                  {ele.Aug.retail_revenue__c ? "$" + formentAcmount(Number(ele.Aug.retail_revenue__c).toFixed(2)) : "NA"}
                                </td>
                                <td className={`${styles.td}`}>${formentAcmount(Number(ele.Aug.Whole_Sales_Amount).toFixed(2))}</td>
                                <td className={`${styles.td}`}>
                                  {ele.Sep.retail_revenue__c ? "$" + formentAcmount(Number(ele.Sep.retail_revenue__c).toFixed(2)) : "NA"}
                                </td>
                                <td className={`${styles.td}`}>${formentAcmount(Number(ele.Sep.Whole_Sales_Amount).toFixed(2))}</td>
                                <td className={`${styles.td}`}>
                                  {ele.Oct.retail_revenue__c ? "$" + formentAcmount(Number(ele.Oct.retail_revenue__c).toFixed(2)) : "NA"}
                                </td>
                                <td className={`${styles.td}`}>${formentAcmount(Number(ele.Oct.Whole_Sales_Amount).toFixed(2))}</td>
                                <td className={`${styles.td}`}>
                                  {ele.Nov.retail_revenue__c ? "$" + formentAcmount(Number(ele.Nov.retail_revenue__c).toFixed(2)) : "NA"}
                                </td>
                                <td className={`${styles.td}`}>${formentAcmount(Number(ele.Nov.Whole_Sales_Amount).toFixed(2))}</td>
                                <td className={`${styles.td}`}>
                                  {ele.Dec.retail_revenue__c ? "$" + formentAcmount(Number(ele.Dec.retail_revenue__c).toFixed(2)) : "NA"}
                                </td>
                                <td className={`${styles.td}`}>${formentAcmount(Number(ele.Dec.Whole_Sales_Amount).toFixed(2))}</td>
                                <td className={`${styles.td} ${styles.stickySecondLastColumn2}`} style={{ maxWidth: "100px" }}>
                                  ${formentAcmount(Number(totalretailer).toFixed(2))}
                                </td>
                                <td className={`${styles.td} ${styles.stickyLastColumn}`}>${formentAcmount(Number(totalwholesale).toFixed(2))}</td>
                              </tr>
                            </>
                          );
                        }
                      })}
                    </>
                  </tbody>
                ) : (
                  <tbody><tr className="d-flex justify-content-center align-items-center position-absolute top-200 start-50">No data found</tr></tbody>
                )}
                <tfoot>
                  <tr>
                    {" "}
                    <td className={`${styles.lastRow} ${styles.stickyFirstColumn} ${styles.stickyLastRow}`}>
                      {" "}
                      TOTAL
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}></td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}></td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}></td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {" "}
                      {monthTotalAmount.Jan.retailer
                        ? "$" + formentAcmount(Number(monthTotalAmount.Jan.retailer).toFixed(2))
                        : "NA"}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {"$" + formentAcmount(Number(monthTotalAmount.Jan.wholesale).toFixed(2))}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {" "}
                      {monthTotalAmount.Feb.retailer
                        ? "$" + formentAcmount(Number(monthTotalAmount.Feb.retailer).toFixed(2))
                        : "NA"}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {"$" + formentAcmount(Number(monthTotalAmount.Feb.wholesale).toFixed(2))}{" "}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {monthTotalAmount.Mar.retailer
                        ? "$" + formentAcmount(Number(monthTotalAmount.Mar.retailer).toFixed(2))
                        : "NA"}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {"$" + formentAcmount(Number(monthTotalAmount.Mar.wholesale).toFixed(2))}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {monthTotalAmount.Apr.retailer
                        ? "$" + formentAcmount(Number(monthTotalAmount.Apr.retailer).toFixed(2))
                        : "NA"}{" "}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {"$" + formentAcmount(Number(monthTotalAmount.Apr.wholesale).toFixed(2))}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {monthTotalAmount.May.retailer
                        ? "$" + formentAcmount(Number(monthTotalAmount.May.retailer).toFixed(2))
                        : "NA"}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {"$" + formentAcmount(Number(monthTotalAmount.May.wholesale).toFixed(2))}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {monthTotalAmount.Jun.retailer
                        ? "$" + formentAcmount(Number(monthTotalAmount.Jun.retailer).toFixed(2))
                        : "NA"}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {"$" + formentAcmount(Number(monthTotalAmount.Jun.wholesale).toFixed(2))}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {monthTotalAmount.Jul.retailer
                        ? "$" + formentAcmount(Number(monthTotalAmount.Jul.retailer).toFixed(2))
                        : "NA"}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {"$" + formentAcmount(Number(monthTotalAmount.Jul.wholesale).toFixed(2))}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {monthTotalAmount.Aug.retailer
                        ? "$" + formentAcmount(Number(monthTotalAmount.Aug.retailer).toFixed(2))
                        : "NA"}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {"$" + formentAcmount(Number(monthTotalAmount.Aug.wholesale).toFixed(2))}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {monthTotalAmount.Sep.retailer
                        ? "$" + formentAcmount(Number(monthTotalAmount.Sep.retailer).toFixed(2))
                        : "NA"}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {"$" + formentAcmount(Number(monthTotalAmount.Sep.wholesale).toFixed(2))}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {monthTotalAmount.Oct.retailer
                        ? "$" + formentAcmount(Number(monthTotalAmount.Oct.retailer).toFixed(2))
                        : "NA"}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {"$" + formentAcmount(Number(monthTotalAmount.Oct.wholesale).toFixed(2))}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {monthTotalAmount.Nov.retailer
                        ? "$" + formentAcmount(Number(monthTotalAmount.Nov.retailer).toFixed(2))
                        : "NA"}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {"$" + formentAcmount(Number(monthTotalAmount.Nov.wholesale).toFixed(2))}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {monthTotalAmount.Dec.retailer
                        ? "$" + formentAcmount(Number(monthTotalAmount.Dec.retailer).toFixed(2))
                        : "NA"}
                    </td>
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      {"$" + formentAcmount(Number(monthTotalAmount.Dec.wholesale).toFixed(2))}
                    </td>
                    <td className={`${styles.lastRow} ${styles.stickyLastRow} ${styles.stickySecondLastColumn2}`} style={{ maxWidth: "100px" }}>
                      ${formentAcmount(Number(monthTotalAmount.total.retailer).toFixed(2))}
                    </td>
                    <td className={`${styles.lastRow} ${styles.stickyLastRow} ${styles.stickyLastColumn}`}>${formentAcmount(monthTotalAmount.total.wholesale.toFixed(2))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : (
        <Loading height={"70vh"} />
      )}
    </>
  );
};

export default YearlyComparisonReportTable;


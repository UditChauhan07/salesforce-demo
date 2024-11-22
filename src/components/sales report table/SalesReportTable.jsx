import React from "react";
import styles from "./table.module.css";
import Loading from "../Loading";
import { DateConvert } from "../../lib/store";
const SalesReportTable = ({ salesData, year, ownerPermission }) => {
  const allOrdersEmpty = salesData.every((item) => item.Orders.length <= 0);
  const d = new Date();
  let month = d.getMonth();
  let currentYear = d.getFullYear();
  if (!year) year = currentYear;
  let totalOrder = 0,
    totalOrderPrice = 0;
  let monthTotalAmount = {
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0,
  };
  const formentAcmount =(amount,totalorderPrice,monthTotalAmount)=>{
    return `${Number(amount,totalorderPrice,monthTotalAmount).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`
  }
  return (
    <>
      {salesData.length ? (
        <div className={`d-flex p-3 ${styles.tableBoundary} mb-5`}>
          <div className="" style={{ maxHeight: "73vh", minHeight: "40vh", overflow: "auto", width: "100%" }}>
            <table id="salesReportTable" className="table table-responsive" style={{ minHeight: "600px" }}>
              <thead>
                <tr>
                  <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "170px" }}>
                    Brand
                  </th>
                  <th className={`${styles.th} ${styles.stickySecondColumnHeading}`} style={{ minWidth: "150px" }}>
                  Retailer
                  </th>
                  <th className={`${styles.th} ${styles.stickyThirdColumnHeading}`} style={{ minWidth: "200px" }}>
                    Sales Rep
                  </th>
                  <th className={`${styles.month} ${styles.stickyMonth}`} style={{ maxWidth: "200px" }}>
                  Retailer Type
                  </th>
                  <th className={`${styles.month} ${styles.stickyMonth}`} style={{ minWidth: "150px" }}>
                    Date Open
                  </th>
                  <th className={`${styles.month} ${styles.stickyMonth}`}>Status</th>
                  {currentYear == year ? (
                    month >= 0 && <th className={`${styles.month} ${styles.stickyMonth}`}>Jan</th>
                  ) : (
                    <th className={`${styles.month} ${styles.stickyMonth}`}>Jan</th>
                  )}
                  {currentYear == year ? (
                    month >= 1 && <th className={`${styles.month} ${styles.stickyMonth}`}>Feb</th>
                  ) : (
                    <th className={`${styles.month} ${styles.stickyMonth}`}>Feb</th>
                  )}
                  {currentYear == year ? (
                    month >= 2 && <th className={`${styles.month} ${styles.stickyMonth}`}>Mar</th>
                  ) : (
                    <th className={`${styles.month} ${styles.stickyMonth}`}>Mar</th>
                  )}
                  {currentYear == year ? (
                    month >= 3 && <th className={`${styles.month} ${styles.stickyMonth}`}>Apr</th>
                  ) : (
                    <th className={`${styles.month} ${styles.stickyMonth}`}>Apr</th>
                  )}
                  {currentYear == year ? (
                    month >= 4 && <th className={`${styles.month} ${styles.stickyMonth}`}>May</th>
                  ) : (
                    <th className={`${styles.month} ${styles.stickyMonth}`}>May</th>
                  )}
                  {currentYear == year ? (
                    month >= 5 && <th className={`${styles.month} ${styles.stickyMonth}`}>Jun</th>
                  ) : (
                    <th className={`${styles.month} ${styles.stickyMonth}`}>Jun</th>
                  )}
                  {currentYear == year ? (
                    month >= 6 && <th className={`${styles.month} ${styles.stickyMonth}`}>Jul</th>
                  ) : (
                    <th className={`${styles.month} ${styles.stickyMonth}`}>Jul</th>
                  )}
                  {currentYear == year ? (
                    month >= 7 && <th className={`${styles.month} ${styles.stickyMonth}`}>Aug</th>
                  ) : (
                    <th className={`${styles.month} ${styles.stickyMonth}`}>Aug</th>
                  )}
                  {currentYear == year ? (
                    month >= 8 && <th className={`${styles.month} ${styles.stickyMonth}`}>Sep</th>
                  ) : (
                    <th className={`${styles.month} ${styles.stickyMonth}`}>Sep</th>
                  )}
                  {currentYear == year ? (
                    month >= 9 && <th className={`${styles.month} ${styles.stickyMonth}`}>Oct</th>
                  ) : (
                    <th className={`${styles.month} ${styles.stickyMonth}`}>Oct</th>
                  )}
                  {currentYear == year ? (
                    month >= 10 && <th className={`${styles.month} ${styles.stickyMonth}`}>Nov</th>
                  ) : (
                    <th className={`${styles.month} ${styles.stickyMonth}`}>Nov</th>
                  )}
                  {currentYear == year ? (
                    month >= 11 && <th className={`${styles.month} ${styles.stickyMonth}`}>Dec</th>
                  ) : (
                    <th className={`${styles.month} ${styles.stickyMonth}`}>Dec</th>
                  )}
                  <th className={`${styles.th} ${styles.stickySecondLastColumnHeading}`} style={{ maxWidth: "100px" }}>
                    Total Order
                  </th>
                  <th className={`${styles.th} ${styles.stickyLastColumnHeading}`} style={{ maxWidth: "150px" }}>
                    Total Amount
                  </th>
                </tr>
              </thead>
              {allOrdersEmpty ? (
                <div className={`${styles.NodataText} flex justify-center items-center py-4 w-full lg:min-h-[300px] xl:min-h-[380px]`} key="no-data">
                  <p>No data found</p>
                </div>
              ) : (
                <tbody>
                  {salesData.map((ele) => {
                    return ele.Orders.map((item, index) => {
                      totalOrder += Number(item.totalOrders);
                      totalOrderPrice += Number(item.totalorderPrice);
                      monthTotalAmount.Jan += Number(item.Jan.amount);
                      monthTotalAmount.Feb += Number(item.Feb.amount);
                      monthTotalAmount.Mar += Number(item.Mar.amount);
                      monthTotalAmount.Apr += Number(item.Apr.amount);
                      monthTotalAmount.May += Number(item.May.amount);
                      monthTotalAmount.Jun += Number(item.Jun.amount);
                      monthTotalAmount.Jul += Number(item.Jul.amount);
                      monthTotalAmount.Aug += Number(item.Aug.amount);
                      monthTotalAmount.Sep += Number(item.Sep.amount);
                      monthTotalAmount.Oct += Number(item.Oct.amount);
                      monthTotalAmount.Nov += Number(item.Nov.amount);
                      monthTotalAmount.Dec += Number(item.Dec.amount);
                      return (
                        <tr key={index}>
                          <td className={`${styles.td} ${styles.stickyFirstColumn}`}>{ele?.ManufacturerName__c}</td>
                          <td className={`${styles.td} ${styles.stickySecondColumn}`}>{ownerPermission ? item?.AccountName : item?.Name}</td>
                          <td className={`${styles.td} ${styles.stickyThirdColumn}`}>
                            {item?.AccountRepo ?? JSON.parse(localStorage.getItem("Api Data")).data.Name}
                          </td>
                          <td className={`${styles.td}`} style={{ maxWidth: "200px",wordWrap: "break-word" }}>
                            {item?.AccountType ?? "---"}
                          </td>
                          <td className={`${styles.td}`} style={{ minWidth: "150px" }}>
                            {DateConvert(item?.DateOpen)}
                          </td>
                          <td className={`${styles.td}`}>{item?.Status ?? "---"}</td>
                          {currentYear == year ? (
                            month >= 0 && <td className={`${styles.td}`}>${formentAcmount(item.Jan.amount)}</td>
                          ) : (
                            <td className={`${styles.td}`}>${formentAcmount(item.Jan.amount)}</td>
                          )}
                          {currentYear == year ? (
                            month >= 1 && <td className={`${styles.td}`}>${formentAcmount(item.Feb.amount)}</td>
                          ) : (
                            <td className={`${styles.td}`}>${formentAcmount(item.Feb.amount)}</td>
                          )}
                          {currentYear == year ? (
                            month >= 2 && <td className={`${styles.td}`}>${formentAcmount(item.Mar.amount)}</td>
                          ) : (
                            <td className={`${styles.td}`}>${formentAcmount(item.Mar.amount)}</td>
                          )}
                          {currentYear == year ? (
                            month >= 3 && <td className={`${styles.td}`}>${formentAcmount(item.Apr.amount)}</td>
                          ) : (
                            <td className={`${styles.td}`}>${formentAcmount(item.Apr.amount)}</td>
                          )}
                          {currentYear == year ? (
                            month >= 4 && <td className={`${styles.td}`}>${formentAcmount(item.May.amount)}</td>
                          ) : (
                            <td className={`${styles.td}`}>${formentAcmount(item.May.amount)}</td>
                          )}
                          {currentYear == year ? (
                            month >= 5 && <td className={`${styles.td}`}>${formentAcmount(item.Jun.amount)}</td>
                          ) : (
                            <td className={`${styles.td}`}>${formentAcmount(item.Jun.amount)}</td>
                          )}
                          {currentYear == year ? (
                            month >= 6 && <td className={`${styles.td}`}>${formentAcmount(item.Jul.amount)}</td>
                          ) : (
                            <td className={`${styles.td}`}>${formentAcmount(item.Jul.amount)}</td>
                          )}
                          {currentYear == year ? (
                            month >= 7 && <td className={`${styles.td}`}>${formentAcmount(item.Aug.amount)}</td>
                          ) : (
                            <td className={`${styles.td}`}>${formentAcmount(item.Aug.amount)}</td>
                          )}
                          {currentYear == year ? (
                            month >= 8 && <td className={`${styles.td}`}>${formentAcmount(item.Sep.amount)}</td>
                          ) : (
                            <td className={`${styles.td}`}>${formentAcmount(item.Sep.amount)}</td>
                          )}
                          {currentYear == year ? (
                            month >= 9 && <td className={`${styles.td}`}>${formentAcmount(item.Oct.amount)}</td>
                          ) : (
                            <td className={`${styles.td}`}>${formentAcmount(item.Oct.amount)}</td>
                          )}
                          {currentYear == year ? (
                            month >= 10 && <td className={`${styles.td}`}>${formentAcmount(item.Nov.amount)}</td>
                          ) : (
                            <td className={`${styles.td}`}>${formentAcmount(item.Nov.amount)}</td>
                          )}
                          {currentYear == year ? (
                            month >= 11 && <td className={`${styles.td}`}>${formentAcmount(item.Dec.amount)}</td>
                          ) : (
                            <td className={`${styles.td}`}>${formentAcmount(item.Dec.amount)}</td>
                          )}
                          <td className={`${styles.td} ${styles.stickySecondLastColumn}`} style={{ maxWidth: "100px" }}>
                            {item?.totalOrders}
                          </td>
                          <td className={`${styles.td} ${styles.stickyLastColumn}`}>${formentAcmount(item?.totalorderPrice)}</td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              )}
              <tfoot>
                <tr>
                  <td className={`${styles.lastRow} ${styles.stickyFirstColumn} ${styles.stickyLastRow}`} colSpan={3}>
                    TOTAL
                  </td>
                  <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`} style={{ wordWrap: "break-word" }}></td>
                  <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`} style={{ wordWrap: "break-word" }}></td>
                  <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`} style={{ wordWrap: "break-word" }}></td>
                  {currentYear == year ? (
                    month >= 0 && (
                      <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                        ${formentAcmount(monthTotalAmount.Jan)}
                      </td>
                    )
                  ) : (
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Jan)}
                    </td>
                  )}
                  {currentYear == year ? (
                    month >= 1 && (
                      <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                        ${formentAcmount(monthTotalAmount.Feb)}
                      </td>
                    )
                  ) : (
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Feb)}
                    </td>
                  )}
                  {currentYear == year ? (
                    month >= 2 && (
                      <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                        ${formentAcmount(monthTotalAmount.Mar)}
                      </td>
                    )
                  ) : (
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Mar)}
                    </td>
                  )}
                  {currentYear == year ? (
                    month >= 3 && (
                      <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                        ${formentAcmount(monthTotalAmount.Apr)}
                      </td>
                    )
                  ) : (
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Apr)}
                    </td>
                  )}
                  {currentYear == year ? (
                    month >= 4 && (
                      <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                        ${formentAcmount(monthTotalAmount.May)}
                      </td>
                    )
                  ) : (
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.May)}
                    </td>
                  )}
                  {currentYear == year ? (
                    month >= 5 && (
                      <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                        ${formentAcmount(monthTotalAmount.Jun)}
                      </td>
                    )
                  ) : (
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Jun)}
                    </td>
                  )}
                  {currentYear == year ? (
                    month >= 6 && (
                      <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                        ${formentAcmount(monthTotalAmount.Jul)}
                      </td>
                    )
                  ) : (
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Jul)}
                    </td>
                  )}
                  {currentYear == year ? (
                    month >= 7 && (
                      <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                        ${formentAcmount(monthTotalAmount.Aug)}
                      </td>
                    )
                  ) : (
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Aug)}
                    </td>
                  )}
                  {currentYear == year ? (
                    month >= 8 && (
                      <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                        ${formentAcmount(monthTotalAmount.Sep)}
                      </td>
                    )
                  ) : (
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Sep)}
                    </td>
                  )}
                  {currentYear == year ? (
                    month >= 9 && (
                      <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                        ${formentAcmount(monthTotalAmount.Oct)}
                      </td>
                    )
                  ) : (
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Oct)}
                    </td>
                  )}
                  {currentYear == year ? (
                    month >= 10 && (
                      <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                        ${formentAcmount(monthTotalAmount.Nov)}
                      </td>
                    )
                  ) : (
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Nov)}
                    </td>
                  )}
                  {currentYear == year ? (
                    month >= 11 && (
                      <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                        ${formentAcmount(monthTotalAmount.Dec)}
                      </td>
                    )
                  ) : (
                    <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Dec)}
                    </td>
                  )}
                  <td className={`${styles.lastRow} ${styles.stickyLastRow} ${styles.stickySecondLastColumn}`}>{totalOrder}</td>
                  <td className={`${styles.lastRow} ${styles.stickyLastRow} ${styles.stickyLastColumn}`}>${formentAcmount(totalOrderPrice)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <Loading height={"70vh"} />
      )}
    </>
  );
};

export default SalesReportTable;

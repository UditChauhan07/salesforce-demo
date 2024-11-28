import React, { useMemo } from "react";
import styles from "./table.module.css";
import Loading from "../Loading";
import { DateConvert } from "../../lib/store";

const SalesReportTable = ({ salesData, year, ownerPermission }) => {
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Ensure the year is valid
  if (!year) year = currentYear;

  // Check if all orders are empty
  const allOrdersEmpty = salesData.every((item) => item.Orders.length <= 0);

  // Memoize total and month-wise calculations
  const {
    totalOrder,
    totalOrderPrice,
    monthTotalAmount,
  } = useMemo(() => {
    let totalOrder = 0, totalOrderPrice = 0;
    const monthTotalAmount = {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0,
      Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
    };

    salesData.forEach((ele) => {
      ele.Orders.forEach((item) => {
        totalOrder += Number(item.totalOrders);
        totalOrderPrice += Number(item.totalorderPrice);
        Object.keys(monthTotalAmount).forEach((month) => {
          monthTotalAmount[month] += Number(item[month]?.amount || 0);
        });
      });
    });

    return { totalOrder, totalOrderPrice, monthTotalAmount };
  }, [salesData]);

  // Function to format amount
  const formatAmount = (amount) => {
    return `${Number(amount).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`;
  };

  // Function to dynamically generate month columns
  const renderMonthColumns = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((monthName, index) => {
      if (currentYear === year && month < index) return null;
      return (
        <th key={monthName} className={`${styles.month} ${styles.stickyMonth}`}>
          {monthName}
        </th>
      );
    });
  };

  // Function to render table rows
  const renderRows = () => {
    return salesData.map((ele, rowIndex) => {
      return ele.Orders.map((item, index) => {
        return (
          <tr key={`${rowIndex}-${index}`}>
            <td className={`${styles.td} ${styles.stickyFirstColumn}`}>{ele?.ManufacturerName__c}</td>
            <td className={`${styles.td} ${styles.stickySecondColumn}`}>
              {ownerPermission ? item?.AccountName : item?.Name}
            </td>
            <td className={`${styles.td} ${styles.stickyThirdColumn}`}>
              {item?.AccountRepo ?? JSON.parse(localStorage.getItem("Api Data")).data.Name}
            </td>
            <td className={`${styles.td}`} style={{ maxWidth: "200px", wordWrap: "break-word" }}>
              {item?.AccountType ?? "---"}
            </td>
            <td className={`${styles.td}`} style={{ minWidth: "150px" }}>
              {DateConvert(item?.DateOpen)}
            </td>
            <td className={`${styles.td}`}>{item?.Status ?? "---"}</td>
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
              (monthName) => (
                <td key={monthName} className={`${styles.td}`}>
                  {formatAmount(item[monthName]?.amount || 0)}
                </td>
              )
            )}
            <td className={`${styles.td} ${styles.stickySecondLastColumn}`} style={{ maxWidth: "100px" }}>
              {item?.totalOrders}
            </td>
            <td className={`${styles.td} ${styles.stickyLastColumn}`}>
              {formatAmount(item?.totalorderPrice)}
            </td>
          </tr>
        );
      });
    });
  };

  // Function to render footer
  const renderFooter = () => {
    return (
      <tr>
        <td className={`${styles.lastRow} ${styles.stickyFirstColumn} ${styles.stickyLastRow}`} colSpan={3}>
          TOTAL
        </td>
        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
          (monthName) => (
            <td key={monthName} className={`${styles.lastRow} ${styles.lastRowMonth} ${styles.stickyLastRow}`}>
              {formatAmount(monthTotalAmount[monthName])}
            </td>
          )
        )}
        <td className={`${styles.lastRow} ${styles.stickyLastRow} ${styles.stickySecondLastColumn}`}>
          {totalOrder}
        </td>
        <td className={`${styles.lastRow} ${styles.stickyLastRow} ${styles.stickyLastColumn}`}>
          {formatAmount(totalOrderPrice)}
        </td>
      </tr>
    );
  };

  return (
    <>
      {salesData.length ? (
        <div className={`d-flex p-3 ${styles.tableBoundary} mb-5`}>
          <div style={{ maxHeight: "73vh", minHeight: "40vh", overflow: "auto", width: "100%" }}>
            <table id="salesReportTable" className="table table-responsive" style={{ minHeight: "600px" }}>
              <thead>
                <tr>
                  <th className={`${styles.th} ${styles.stickyFirstColumnHeading}`} style={{ minWidth: "170px" }}>
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
                  {renderMonthColumns()}
                  <th className={`${styles.th} ${styles.stickySecondLastColumnHeading}`} style={{ maxWidth: "100px" }}>
                    Total Order
                  </th>
                  <th className={`${styles.th} ${styles.stickyLastColumnHeading}`} style={{ maxWidth: "150px" }}>
                    Total Amount
                  </th>
                </tr>
              </thead>
              {allOrdersEmpty ? (
                <div className={`${styles.NodataText} flex justify-center items-center py-4 w-full lg:min-h-[300px] xl:min-h-[380px]}`} key="no-data">
                  <p>No data found</p>
                </div>
              ) : (
                <tbody>{renderRows()}</tbody>
              )}
              <tfoot>{renderFooter()}</tfoot>
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

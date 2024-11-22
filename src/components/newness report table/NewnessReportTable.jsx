import React from "react";
import styles from "./table.module.css";
import { Link } from "react-router-dom";
import Loading from "../Loading";
const NewnessReportTable = ({ newnessData, dataDisplay }) => {
  const handleTableDataDisplay = (value) => {
    if (dataDisplay === "price")
      return `$${Number(value)
        .toFixed(2)
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}`;
    else return value;
  };
  let length = 0;
  function convertDateStringToDate(dateString) {
    if (dateString) {
      const [year, month, day] = dateString.split(/[-/]/);
      if (day && month && year) {
        let parsedDate = new Date(`${month}/${day}/${year}`);
        if (!isNaN(parsedDate.getTime())) {
          const options = { day: "numeric", month: "short", year: "numeric" };
          let launchDateFormattedDate = new Intl.DateTimeFormat("en-US", options).format(new Date(parsedDate));
          return launchDateFormattedDate;
        }
      }
      // throw new Error("Invalid date string");
    }
  }
  const calculateColumnTotals = () => {
    const totals = {};
    newnessData.header?.forEach((item) => {
      totals[item.name] = newnessData.AccountList.reduce((acc, ele) => {
        const value = ele[item.name][dataDisplay === "quantity" ? "qty" : dataDisplay];
        return acc + parseFloat(value);
      }, 0);
    });
    return totals;
  };
  const columnTotals = calculateColumnTotals();
  return (
    <>
      {newnessData?.status === 200 ? (
        newnessData.AccountList.length ? (
          <div className={`d-flex p-3 ${styles.tableBoundary} mb-5`}>
            <div className={`{styles.WidthTable} table-responsive overflow-scroll `} style={{ maxHeight: "67vh", minHeight: "40vh"  , width: "100%"}}>
              <table id="salesReportTable" className="table table-responsive">
                <thead>
                  <tr>
                    <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>
                      Account Name
                    </th>
                    <th className={`${styles.th} ${styles.stickySecondColumnHeading}`} style={{ minWidth: "200px" }}>
                      Account Owner Name
                    </th>
                    <th className={`${styles.th} ${styles.stickyThirdColumnHeading1}`}>Sales Rep</th>
                    <th className={`${styles.month} ${styles.stickyMonth}`}>Account Status</th>
                    {newnessData?.header?.map((ele, index) => {
                      length = ele?.name?.length * 9.5;
                      let launchDateFormattedDate = null;
                      if (!ele.launchDate || ele.launchDate == null || ele.launchDate == "") {
                        launchDateFormattedDate = "N/A";
                      } else if (ele.launchDate !== "N/A") {
                        launchDateFormattedDate = convertDateStringToDate(ele?.launchDate ?? null);
                      } else {
                        launchDateFormattedDate = ele.launchDate;
                      }
                      let shipDateFormattedDate = null;
                      if (!ele.shipDate || ele.shipDate == null || ele.shipDate == "") {
                        shipDateFormattedDate = "N/A";
                      } else if (ele.shipDate !== "N/A") {
                        shipDateFormattedDate = convertDateStringToDate(ele?.shipDate ?? null);
                      } else {
                        shipDateFormattedDate = ele.shipDate;
                      }
                      return (
                        // ele?.length >= 45 ? ele?.length * 6 : ele?.length * 6
                        <>
                          <th key={index} className={`${styles.month} ${styles.stickyMonth}`} style={{ minWidth: `${length}px` }}>
                            <p className="m-0" style={{ height: "34px" }}>
                              {ele.name}
                            </p>
                            <p className={`${styles.dateDisplay}`}>Launch Date: {launchDateFormattedDate}</p>
                            <p className={`${styles.dateDisplay} mt-1`} style={{ backgroundColor: "#eaffee", color: "#3c9a4e" }}>
                              Shipment Date: {shipDateFormattedDate}
                            </p>
                          </th>
                        </>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {newnessData.AccountList.map((ele, index) => {
                    return (
                      <tr key={index}>
                        <td className={`${styles.td} ${styles.stickyFirstColumn}`}>{ele?.AccountName__c}</td>
                        <td className={`${styles.td} ${styles.stickySecondColumn}`}>{ele?.OwnerName}</td>
                        <td className={`${styles.td} ${styles.stickyThirdColumn1}`}>{ele?.Sales_Rep_Name__c}</td>
                        <td className={`${styles.td}`}>{ele?.Active_Closed__c}</td>

                        {newnessData?.header?.map((item, innerIndex) => {
                          return (
                            <>
                              <td className={`${styles.td}`} key={innerIndex}>
                                {handleTableDataDisplay(ele[item.name][dataDisplay === "quantity" ? "qty" : dataDisplay])}
                              </td>
                            </>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <tfoot>
                <tr>
                  <td className={`${styles.lastRow} ${styles.stickyFirstColumn} ${styles.stickyLastRow}`} style={{ minWidth: "191px" }}>Total</td>
                  {/* <td colSpan={3}></td> */}
                  <td className={`${styles.lastRow} ${styles.stickySecondColumn} ${styles.stickyLastRow}`} style={{ minWidth: "225px" }}></td>
                  <td className={`${styles.lastRow} ${styles.stickyThirdColumn} ${styles.stickyLastRow}`} style={{ minWidth: "120px" }}></td>
                  <td className={`${styles.lastRow} ${styles.stickyLastRow}`} style={{ minWidth: "120px" }}></td>

                  {newnessData.header.map((item, innerIndex) => {
                    length = item?.name?.length * 9.5;
                    return (
                      <td className={`${styles.lastRow}  ${styles.lastRowMonth}  ${styles.stickyLastRow}`} key={innerIndex} style={{ textAlign: 'start', minWidth: `${length}px` }}>
                        {handleTableDataDisplay(columnTotals[item.name])}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </div>
          </div>
        ) : (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
            {/* <Link to="/newness-report" className="linkStyle d-flex"> */}
            No Data Found
            {/* </Link> */}
          </div>
        )
      ) : (
        <Loading height={"70vh"} />
      )}
    </>
  );
};

export default NewnessReportTable;

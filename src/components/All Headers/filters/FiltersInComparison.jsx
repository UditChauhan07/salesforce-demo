import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { useComparisonReport } from "../../../api/useComparisonReport";
import Loading from "../../Loading";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import ComparisonReportTable from "../../comparison report table/ComparisonReportTable";
const FiltersInComparison = () => {
  const initialValues = {
    ManufacturerId__c: "a0O3b00000p7zqKEAQ",
    month: 6,
    year: 2023,
    selectedManufacturer: "BOBBI BROWN",
    selectedMonth: "June",
  };
  const [filter, setFilter] = useState(initialValues);
  const originalApiData = useComparisonReport(filter);
  const [apiData, setApiData] = useState(originalApiData || {});
  const handleManufacturerFilter = (e) => {
    let filteredData = originalApiData?.date?.brandsList?.filter((ele) => ele.Id === e.target.value);
    setFilter((prev) => ({
      ...prev,
      ManufacturerId__c: e.target.value,
      selectedManufacturer: filteredData[0].Name,
    }));
  };
  const handleYearReport = (e) => {
    setFilter((prev) => ({
      ...prev,
      year: e.target.value,
    }));
  };
  const handleMonthReport = (e) => {
    let filteredMonth = originalApiData?.date?.monthList?.filter((ele) => ele.value == e.target.value);
    setFilter((prev) => ({
      ...prev,
      month: e.target.value,
      selectedMonth: filteredMonth[0].name,
    }));
  };
  //csv Data
  let csvData = [];
  if (apiData?.data?.length) {
    apiData?.data?.map((ele) => {
      return csvData.push({
        AccountName: ele.AccountName,
        Estee_Lauder_Number__c: ele.Estee_Lauder_Number__c,
        Sales_Rep__c: ele.Sales_Rep__c,
        retail_revenue__c: `$${Number(ele.retail_revenue__c).toFixed(2)}`,
        Whole_Sales_Amount: `$${Number(ele.Whole_Sales_Amount).toFixed(2)}`,
      });
    });
  }
  
  const handleClearFilter = () => {
    setFilter(() => initialValues);
  };
  let selectedManufacturerLength = filter?.selectedManufacturer?.length < 10 ? filter?.selectedManufacturer?.length * 14 : filter?.selectedManufacturer?.length * 12;
  let selectedMonthLength = filter?.selectedMonth?.length < 5 ? filter?.selectedMonth?.length * 18 : filter?.selectedMonth?.length * 15;
  useEffect(() => {
    setApiData(originalApiData);
  }, [originalApiData, filter]);
  const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, `Comparison Report ${new Date()}` + fileExtension);
  };
  return (
    <>
      {originalApiData?.status === 200 && apiData ? (
        <>
          <div className={`${styles.heightFix} d-flex bg-black justify-content-center  align-items-center  gap-5 `}>
            {/* filer manufacturer */}
            <select className={`${styles.text} bg-black`} style={{ outline: "none", maxWidth: `${selectedManufacturerLength}px` }} onChange={handleManufacturerFilter} value={filter.ManufacturerId__c}>
              {originalApiData?.date?.brandsList?.map((ele, index) => {
                return (
                  <option key={index} value={ele?.Id} className={`${styles.option}`}>
                    {ele?.Name}
                  </option>
                );
              })}
            </select>

            {/* Month Filter  */}
            <select className={`${styles.text} bg-black`} style={{ outline: "none", maxWidth: `${selectedMonthLength}px` }} onChange={handleMonthReport} value={filter.month}>
              {originalApiData?.date?.monthList?.map((ele, index) => {
                return (
                  <option key={index} value={ele.value} className={`${styles.option}`}>
                    {ele?.name}
                  </option>
                );
              })}
            </select>

            {/* Year Filter  */}
            <select className={`${styles.text} bg-black`} style={{ outline: "none", maxWidth: `${200}px` }} onChange={handleYearReport} value={filter.year}>
              {originalApiData?.date?.yearList?.map((ele, index) => {
                return (
                  <option key={index} value={ele.value} className={`${styles.option}`}>
                    {ele?.name}
                  </option>
                );
              })}
            </select>

            {/* clear filters */}
            <p className={`m-0  ${styles.text} `}>
              <button style={{ border: "1px solid white", lineHeight: "20px" }} className={`m-0 px-1 ${styles.text} bg-black`} onClick={handleClearFilter}>
                clear all
              </button>
            </p>
            {/* export excel */}
            <p className={`m-0  ${styles.text}`}>
              <button style={{ border: "1px solid white", lineHeight: "20px" }} className={`m-0 px-1 ${styles.text} bg-black`} onClick={exportToExcel}>
                export
              </button>
            </p>
          </div>
          <ComparisonReportTable comparisonData={apiData}/>
        </>
      ) : (
        <Loading  height={"70vh"}/>
      )}
    </>
  );
};

export default FiltersInComparison;

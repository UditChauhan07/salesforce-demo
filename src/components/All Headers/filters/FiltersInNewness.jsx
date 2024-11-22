import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import NewnessReportTable from "../../newness report table/NewnessReportTable";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { useNewnessReport } from "../../../api/useNewnessReport";
import { useManufacturer } from "../../../api/useManufacturer";
import Loading from "../../Loading";
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";
const FiltersInNewness = () => {
  let currentDate = new Date().toJSON().slice(0, 10);
  const subtract6Months = (date) => {
    date.setMonth(date.getMonth() - 6);
    return date;
  };
  let past6monthDate = subtract6Months(new Date());
  const [filter, setFilter] = useState({
    ManufacturerId__c: "a0O3b00000p7zqKEAQ",
    toDate: currentDate,
    fromDate: past6monthDate.toJSON().slice(0, 10),
    dataDisplay: "quantity",
    selectedManufacturer: "BOBBI BROWN",
  });
  const originalApiData = useNewnessReport(filter);

  const { data: manufacturers, isLoading, error } = useManufacturer();
  if (manufacturers?.status !== 200) {
    // DestoryAuth();
  }
  const [newnessData, setNewnessData] = useState(originalApiData || {});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // if(loading){
    setLoading(true);
    setNewnessData(originalApiData);
    setLoading(false);
    // }
    // }, []);
  }, [originalApiData, filter]);

  const applyFilters = () => {
    setLoading(true);
    // const data=await useNewnessReport(filter)
    setNewnessData(originalApiData);
    setLoading(false);
  };
  const clearFilters = () => {
    setFilter((prev) => ({
      ManufacturerId__c: "a0O3b00000p7zqKEAQ",
      toDate: currentDate,
      fromDate: "2023-01-01",
      dataDisplay: "qty",
    }));
  };
  const handleDataDisplay = (e) => {
    setFilter((prev) => ({
      ...prev,
      dataDisplay: e.target.value,
    }));
  };
  const PriceDisplay = (value) => {
    return `$${Number(value).toFixed(2)}`;
  };
  const csvData = () => {
    let finalData = [];
    if (newnessData?.AccountList?.length) {
      newnessData?.AccountList?.map((ele) => {
        let temp = {};
        temp["Account_Name"] = ele.AccountName__c;
        temp["Account_Owner_Name"] = ele.OwnerName;
        temp["Account_Status"] = ele.Active_Closed__c;
        temp["Sales_Rep"] = ele.Sales_Rep_Name__c;
        temp["ManufacturerName__c"] = ele.ManufacturerName__c;
        newnessData?.header?.map((item) => {
          temp[`${item} Price`] = PriceDisplay(ele[item]?.price);
          temp[`${item} Quantity`] = ele[item]?.qty;
        });
        finalData.push(temp);
      });
    }
    return finalData;
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(csvData());
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, `Newness Report ${new Date()}` + fileExtension);
  };
  let length = 0;
  const handleFromDate = (e) => {
    setFilter((prev) => ({
      ...prev,
      fromDate: e.target.value,
    }));
  };
  const handleToDate = (e) => {
    // console.log(e.target.value);
    setFilter((prev) => ({
      ...prev,
      toDate: e.target.value,
    }));
  };
  const handleManufacturerFilter = (e) => {
    let filteredData = manufacturers?.data?.filter((ele) => ele.Id === e.target.value);
    setFilter((prev) => ({
      ...prev,
      ManufacturerId__c: e.target.value,
      selectedManufacturer: filteredData[0].Name,
    }));
  };
  length = filter.dataDisplay.length * 14 ?? "42px";
  let selectedManufacturerLength = (filter.selectedManufacturer?.length < 10 ? filter.selectedManufacturer?.length * 14 : filter.selectedManufacturer?.length * 12) ?? "50px";

  return (
    <>
      {/* {manufacturers?.status === 200 && manufacturers.data.length ? ( */}
      <>
        <div className={`${styles.FliterNewNessNone}  bg-black justify-content-evenly  align-items-center  gap-2`}>
          {/* filer manufacturer */}
          <select
            className={`${styles.text} bg-black`}
            style={{
              outline: "none",
              maxWidth: `${selectedManufacturerLength}px`,
            }}
            onChange={handleManufacturerFilter}
            value={filter.ManufacturerId__c}
          >
            {manufacturers?.data?.map((ele, index) => {
              return (
                <option key={index} value={ele?.Id} className={`${styles.option}`}>
                  {ele?.Name}
                </option>
              );
            })}
          </select>

          {/* filer price/quantity */}
          <select className={`${styles.text} bg-black`} style={{ outline: "none", maxWidth: `${length}px` }} onChange={handleDataDisplay} value={filter.dataDisplay}>
            <option value="quantity" className={`${styles.option}`}>
              Quantity
            </option>
            <option value="price" className={`${styles.option}`}>
              Price
            </option>
          </select>
          {/* First Calender Filter-- from date */}
          <p className={`m-0 ${styles.text} d-flex gap-1 justify-content-center align-items-center`}>
            start date :
            <input type="date" className={`${styles.text} bg-black`} defaultValue={filter.fromDate} onChange={handleFromDate} style={{ outline: "none", maxWidth: "93px", colorScheme: "dark" }} />
          </p>
          {/* Second Calender Filter -- to date */}
          <p className={`m-0 ${styles.text} ${styles.text2}  d-flex gap-1 justify-content-center align-items-center`}>
            end date :
            <input type="date" className={`${styles.text} bg-black`} style={{ maxWidth: "93px", colorScheme: "dark", outline: "none" }} onChange={handleToDate} defaultValue={filter.toDate} />
          </p>

          {/* clear and apply filters */}
          <p className={`m-0  ${styles.text} d-flex gap-3`}>
            {/* <button style={{ border: "1px solid white", lineHeight: "20px" }} className={`m-0 px-1 ${styles.text} bg-black`} onClick={applyFilters}>
              apply
            </button> */}
            <button style={{ border: "1px solid white", lineHeight: "20px" }} className={`m-0 px-1 ${styles.text} bg-black`} onClick={clearFilters}>
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
        <br />
        {loading ? <Loading height={"70vh"} /> : <NewnessReportTable newnessData={newnessData} dataDisplay={filter.dataDisplay} />}
      </>
    </>
  );
};

export default FiltersInNewness;

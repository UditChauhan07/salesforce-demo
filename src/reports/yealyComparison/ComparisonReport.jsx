import React, { useEffect, useState , useMemo } from "react";
import AppLayout from "../../components/AppLayout";
import Loading from "../../components/Loading";
import Styles from "./index.module.css";
import { FilterItem } from "../../components/FilterItem";
import { useManufacturer } from "../../api/useManufacturer";
import { MdOutlineDownload } from "react-icons/md";
import ModalPage from "../../components/Modal UI";
import styles from "../../components/Modal UI/Styles.module.css";
import { CloseButton, SearchIcon } from "../../lib/svg";
import YearlyComparisonReportTable from "../../components/comparison report table/YearlyComparisonReport";
import { getYearlyComparison, sortArrayHandler } from "../../lib/store";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { GetAuthData } from "../../lib/store";
import { getPermissions } from "../../lib/permission";
import { useNavigate } from "react-router-dom";
import PermissionDenied from "../../components/PermissionDeniedPopUp/PermissionDenied";
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";
const date = new Date();

const YearlyComparisonReport = () => {
  const [exportToExcelState, setExportToExcelState] = useState(false);
  const [status, setStatus] = useState(1); // State to track active or all accounts

  const initialValues = {
    ManufacturerId__c: "a0O3b00000p7zqKEAQ",
    year: date.getFullYear(),
  };
  const { data: manufacturers } = useManufacturer();
  const [filter, setFilter] = useState(initialValues);
  const [apiData, setApiData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSalesRepId, setSelectedSalesRepId] = useState();
  const [userData, setUserData] = useState({});
  const [hasPermission, setHasPermission] = useState(null);  
  const [permissions, setPermissions] = useState(null);
const navigate = useNavigate()
  useEffect(() => {
    // Update API data when filter or status changes
    sendApiCall();
  }, []); // Update when filter or status changes

  const handleExportToExcel = () => {
    setExportToExcelState(true);
  };

  //csv Data
  let csvData = [];
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
  if (apiData?.length) {
    apiData?.map((ele, index) => {
      if ((status == 1 && ele.Status == "Active") || status == 2) {
        totalwholesale=0
        totalretailer=0
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

        csvData.push({
          "Retail Store": ele.AccountName,
          "Estee Lauder Number": ele.Estee_Lauder_Number__c,
          "Sales Rep": ele.Sales_Rep__c,
          Status: ele.Status,
          "Jan Retail Revenue": `$${Number(ele.Jan.retail_revenue__c).toFixed(2)}`,
          "Jan Wholesale Amount": `$${Number(ele.Jan.Whole_Sales_Amount).toFixed(2)}`,
          "Feb Retail Revenue": `$${Number(ele.Feb.retail_revenue__c).toFixed(2)}`,
          "Feb Wholesale Amount": `$${Number(ele.Feb.Whole_Sales_Amount).toFixed(2)}`,
          "Mar Retail Revenue": `$${Number(ele.Mar.retail_revenue__c).toFixed(2)}`,
          "Mar Wholesale Amount": `$${Number(ele.Mar.Whole_Sales_Amount).toFixed(2)}`,
          "Apr Retail Revenue": `$${Number(ele.Apr.retail_revenue__c).toFixed(2)}`,
          "Apr Wholesale Amount": `$${Number(ele.Apr.Whole_Sales_Amount).toFixed(2)}`,
          "May Retail Revenue": `$${Number(ele.May.retail_revenue__c).toFixed(2)}`,
          "May Wholesale Amount": `$${Number(ele.May.Whole_Sales_Amount).toFixed(2)}`,
          "Jun Retail Revenue": `$${Number(ele.Jun.retail_revenue__c).toFixed(2)}`,
          "Jun Wholesale Amount": `$${Number(ele.Jun.Whole_Sales_Amount).toFixed(2)}`,
          "Jul Retail Revenue": `$${Number(ele.Jul.retail_revenue__c).toFixed(2)}`,
          "Jul Wholesale Amount": `$${Number(ele.Jul.Whole_Sales_Amount).toFixed(2)}`,
          "Aug Retail Revenue": `$${Number(ele.Aug.retail_revenue__c).toFixed(2)}`,
          "Aug Wholesale Amount": `$${Number(ele.Aug.Whole_Sales_Amount).toFixed(2)}`,
          "Sep Retail Revenue": `$${Number(ele.Sep.retail_revenue__c).toFixed(2)}`,
          "Sep Wholesale Amount": `$${Number(ele.Sep.Whole_Sales_Amount).toFixed(2)}`,
          "Oct Retail Revenue": `$${Number(ele.Oct.retail_revenue__c).toFixed(2)}`,
          "Oct Wholesale Amount": `$${Number(ele.Oct.Whole_Sales_Amount).toFixed(2)}`,
          "Nov Retail Revenue": `$${Number(ele.Nov.retail_revenue__c).toFixed(2)}`,
          "Nov Wholesale Amount": `$${Number(ele.Nov.Whole_Sales_Amount).toFixed(2)}`,
          "Dec Retail Revenue": `$${Number(ele.Dec.retail_revenue__c).toFixed(2)}`,
          "Dec Wholesale Amount": `$${Number(ele.Dec.Whole_Sales_Amount).toFixed(2)}`,
          "Total Retail Revenue": `$${Number(totalretailer).toFixed(2)}`,
          "Total Wholesale Amount": `$${Number(totalwholesale).toFixed(2)}`,
        });
      }
      if ((apiData.length - 1) == index) {
        csvData.push({
          "Retail Store": "Total",
          "Jan Retail Revenue": `$${Number(monthTotalAmount.Jan.retailer).toFixed(2)}`,
          "Jan Wholesale Amount": `$${Number(monthTotalAmount.Jan.wholesale).toFixed(2)}`,
          "Feb Retail Revenue": `$${Number(monthTotalAmount.Feb.retailer).toFixed(2)}`,
          "Feb Wholesale Amount": `$${Number(monthTotalAmount.Feb.wholesale).toFixed(2)}`,
          "Mar Retail Revenue": `$${Number(monthTotalAmount.Mar.retailer).toFixed(2)}`,
          "Mar Wholesale Amount": `$${Number(monthTotalAmount.Mar.wholesale).toFixed(2)}`,
          "Apr Retail Revenue": `$${Number(monthTotalAmount.Apr.retailer).toFixed(2)}`,
          "Apr Wholesale Amount": `$${Number(monthTotalAmount.Apr.wholesale).toFixed(2)}`,
          "May Retail Revenue": `$${Number(monthTotalAmount.May.retailer).toFixed(2)}`,
          "May Wholesale Amount": `$${Number(monthTotalAmount.May.wholesale).toFixed(2)}`,
          "Jun Retail Revenue": `$${Number(monthTotalAmount.Jun.retailer).toFixed(2)}`,
          "Jun Wholesale Amount": `$${Number(monthTotalAmount.Jun.wholesale).toFixed(2)}`,
          "Jul Retail Revenue": `$${Number(monthTotalAmount.Jul.retailer).toFixed(2)}`,
          "Jul Wholesale Amount": `$${Number(monthTotalAmount.Jul.wholesale).toFixed(2)}`,
          "Aug Retail Revenue": `$${Number(monthTotalAmount.Aug.retailer).toFixed(2)}`,
          "Aug Wholesale Amount": `$${Number(monthTotalAmount.Aug.wholesale).toFixed(2)}`,
          "Sep Retail Revenue": `$${Number(monthTotalAmount.Sep.retailer).toFixed(2)}`,
          "Sep Wholesale Amount": `$${Number(monthTotalAmount.Sep.wholesale).toFixed(2)}`,
          "Oct Retail Revenue": `$${Number(monthTotalAmount.Oct.retailer).toFixed(2)}`,
          "Oct Wholesale Amount": `$${Number(monthTotalAmount.Oct.wholesale).toFixed(2)}`,
          "Nov Retail Revenue": `$${Number(monthTotalAmount.Nov.retailer).toFixed(2)}`,
          "Nov Wholesale Amount": `$${Number(monthTotalAmount.Nov.wholesale).toFixed(2)}`,
          "Dec Retail Revenue": `$${Number(monthTotalAmount.Dec.retailer).toFixed(2)}`,
          "Dec Wholesale Amount": `$${Number(monthTotalAmount.Dec.wholesale).toFixed(2)}`,
          "Total Retail Revenue": `$${Number(monthTotalAmount.total.retailer).toFixed(2)}`,
          "Total Wholesale Amount": `$${Number(monthTotalAmount.total.wholesale).toFixed(2)}`,
        });
      }
      return csvData;
    });
  }
  const exportToExcel = () => {
    setExportToExcelState(false);
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, `Comparison Report ${new Date().toDateString()}` + fileExtension);
  };
  // const exportToExcel = () => {
  //   setExportToExcelState(false);
  //   // Your export logic here
  // };

  const resetFilter = async () => {
    setIsLoading(true);
    const result = await getYearlyComparison({
      year: initialValues.year,
      manufacturerId: initialValues.ManufacturerId__c,
    });
    sortArrayHandler(result?.data || [], g => g?.AccountName)
    setApiData(result.data);
    setFilter(initialValues);
    setIsLoading(false);
    setStatus(1); // Reset status to active accounts
  };
  const sendApiCall = async () => {
    setIsLoading(true);
    const result = await getYearlyComparison({ ...filter });
    console.log({ result });
    sortArrayHandler(result || [], g => g?.AccountName)
    setApiData(result);
    setIsLoading(false);
  };


  // Fetch user data and permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userPermissions = await getPermissions();
        setPermissions(userPermissions);
        setHasPermission(userPermissions?.modules?.reports?.yearlyComparisonReport?.view);

        // If no permission, redirect to dashboard
        if (userPermissions?.modules?.reports?.yearlyComparisonReport?.view === false) {
          PermissionDenied();
          navigate("/dashboard");
        }
        
      } catch (error) {
        console.log({ error });
      }
    };
    
    fetchData();
  }, []);

  // Memoize permissions to avoid unnecessary re-calculations
  const memoizedPermissions = useMemo(() => permissions, [permissions]);

  return (
    <AppLayout
      filterNodes={
        <>
       
          <FilterItem
            minWidth="220px"
            label="All Manufacturers"
            name="All-Manufacturers"
            value={filter.ManufacturerId__c}
            options={manufacturers?.data?.map((manufacturer) => ({
              label: manufacturer.Name,
              value: manufacturer.Id,
            }))}
            onChange={(value) => setFilter((prev) => ({ ...prev, ManufacturerId__c: value }))}
          />
          <FilterItem
            minWidth="220px"
            label="Year"
            name="Year"
            value={filter.year}
            options={[{ label: 2024, value: 2024 }, { label: 2023, value: 2023 }]}
            onChange={(value) => setFilter((prev) => ({ ...prev, year: value }))}
          />
          <FilterItem
            label={status === 1 ? "Active Account" : "All Account"}
            name="Status"
            value={status}
            options={[
              { label: "Active Account", value: 1 },
              { label: "All Account", value: 2 },
            ]}
            onChange={(value) => setStatus(value)}
          />
          <div className="d-flex gap-3">
            <button className="border px-2 d-grid py-1 leading-tight" onClick={sendApiCall}>
              <SearchIcon fill="#fff" width={20} height={20} />
              <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>search</small>
            </button>
            <button className="border px-2 d-grid py-1 leading-tight" onClick={resetFilter}>
              <CloseButton crossFill={'#fff'} height={20} width={20} />
              <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>clear</small>
            </button>
          </div>
          <button className="border px-2 d-grid py-1 leading-tight d-grid" onClick={handleExportToExcel}>
            <MdOutlineDownload size={16} className="m-auto" />
            <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>export</small>
          </button>

        
        </>
      }
    >
      {exportToExcelState && (
        <ModalPage
          open
          content={
            <>
              <div style={{ maxWidth: "380px" }}>
                <h1 className={`fs-5 ${styles.ModalHeader}`}>Warning</h1>
                <p className={` ${styles.ModalContent}`}>Do you want to download Comparison Report?</p>
                <div className="d-flex justify-content-center gap-3 ">
                  <button className={`${styles.modalButton}`} onClick={exportToExcel}>
                    OK
                  </button>
                  <button className={`${styles.modalButton}`} onClick={() => setExportToExcelState(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </>
          }
          onClose={() => {
            setExportToExcelState(false);
          }}
        />
      )}
      <div className={Styles.inorderflex}>
        <div>
          <h2>
            Yearly Comparison Report
          </h2>
        </div>
        <div></div>
      </div>
      {!isLoading ? <YearlyComparisonReportTable comparisonData={apiData} status={status} /> : <Loading height={"70vh"} />}
    </AppLayout>
  );
};

export default YearlyComparisonReport;

// .............
// import React, { useEffect, useState } from "react";
// import AppLayout from "../../components/AppLayout";
// import Loading from "../../components/Loading";
// import ComparisonReportTable from "../../components/comparison report table/ComparisonReportTable";
// import { useComparisonReport } from "../../api/useComparisonReport";
// import * as FileSaver from "file-saver";
// import * as XLSX from "xlsx";
// import { FilterItem } from "../../components/FilterItem";
// import { useManufacturer } from "../../api/useManufacturer";
// import { MdOutlineDownload } from "react-icons/md";
// import ModalPage from "../../components/Modal UI";
// import styles from "../../components/Modal UI/Styles.module.css";
// import { CloseButton, SearchIcon } from "../../lib/svg";
// import YearlyComparisonReportTable from "../../components/comparison report table/YearlyComparisonReport";
// import { getYearlyComparison } from "../../lib/store";

// const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
// const fileExtension = ".xlsx";
// const date = new Date();
// const YearlyComparisonReport = () => {
//   const [exportToExcelState, setExportToExcelState] = useState(false);

//   const initialValues = {
//     ManufacturerId__c: "a0O3b00000p7zqKEAQ",
//     year: date.getFullYear(),
//   };
//   const { data: manufacturers } = useManufacturer();
//   const [filter, setFilter] = useState(initialValues);
//   const originalApiData = useComparisonReport();
//   const [apiData, setApiData] = useState();
//   const [isLoading, setIsLoading] = useState(false);

//   //csv Data
//   let csvData = [];
//   let totalwholesale = 0;
//   let totalretailer = 0;
//   if (apiData?.data?.length) {
//     apiData?.data?.map((ele) => {
//       totalretailer+=ele.Jan.retail_revenue__c;
//       totalwholesale+=ele.Jan.Whole_Sales_Amount;
//       totalretailer+=ele.Feb.retail_revenue__c;
//       totalwholesale+=ele.Feb.Whole_Sales_Amount;
//       totalretailer+=ele.Mar.retail_revenue__c;
//       totalwholesale+=ele.Mar.Whole_Sales_Amount;
//       totalretailer+=ele.Apr.retail_revenue__c;
//       totalwholesale+=ele.Apr.Whole_Sales_Amount;
//       totalretailer+=ele.May.retail_revenue__c;
//       totalwholesale+=ele.May.Whole_Sales_Amount;
//       totalretailer+=ele.Jun.retail_revenue__c;
//       totalwholesale+=ele.Jun.Whole_Sales_Amount;
//       totalretailer+=ele.Jul.retail_revenue__c;
//       totalwholesale+=ele.Jul.Whole_Sales_Amount;
//       totalretailer+=ele.Aug.retail_revenue__c;
//       totalwholesale+=ele.Aug.Whole_Sales_Amount;
//       totalretailer+=ele.Sep.retail_revenue__c;
//       totalwholesale+=ele.Sep.Whole_Sales_Amount;
//       totalretailer+=ele.Oct.retail_revenue__c;
//       totalwholesale+=ele.Oct.Whole_Sales_Amount;
//       totalretailer+=ele.Nov.retail_revenue__c;
//       totalwholesale+=ele.Nov.Whole_Sales_Amount;
//       totalretailer+=ele.Dec.retail_revenue__c;
//       totalwholesale+=ele.Dec.Whole_Sales_Amount;
//       return csvData.push({
//         AccountName: ele.AccountName,
//         Estee_Lauder_Number__c: ele.Estee_Lauder_Number__c,
//         Sales_Rep__c: ele.Sales_Rep__c,
//         "Jan Retail Revenue": `$${Number(ele.Jan.retail_revenue__c).toFixed(2)}`,
//         "Jan Wholesale Amount": `$${Number(ele.Jan.Whole_Sales_Amount).toFixed(2)}`,
//         "Feb Retail Revenue": `$${Number(ele.Feb.retail_revenue__c).toFixed(2)}`,
//         "Feb Wholesale Amount": `$${Number(ele.Feb.Whole_Sales_Amount).toFixed(2)}`,
//         "Mar Retail Revenue": `$${Number(ele.Mar.retail_revenue__c).toFixed(2)}`,
//         "Mar Wholesale Amount": `$${Number(ele.Mar.Whole_Sales_Amount).toFixed(2)}`,
//         "Apr Retail Revenue": `$${Number(ele.Apr.retail_revenue__c).toFixed(2)}`,
//         "Apr Wholesale Amount": `$${Number(ele.Apr.Whole_Sales_Amount).toFixed(2)}`,
//         "May Retail Revenue": `$${Number(ele.May.retail_revenue__c).toFixed(2)}`,
//         "May Wholesale Amount": `$${Number(ele.May.Whole_Sales_Amount).toFixed(2)}`,
//         "Jun Retail Revenue": `$${Number(ele.Jun.retail_revenue__c).toFixed(2)}`,
//         "Jun Wholesale Amount": `$${Number(ele.Jun.Whole_Sales_Amount).toFixed(2)}`,
//         "Jul Retail Revenue": `$${Number(ele.Jul.retail_revenue__c).toFixed(2)}`,
//         "Jul Wholesale Amount": `$${Number(ele.Jul.Whole_Sales_Amount).toFixed(2)}`,
//         "Aug Retail Revenue": `$${Number(ele.Aug.retail_revenue__c).toFixed(2)}`,
//         "Aug Wholesale Amount": `$${Number(ele.Aug.Whole_Sales_Amount).toFixed(2)}`,
//         "Sep Retail Revenue": `$${Number(ele.Sep.retail_revenue__c).toFixed(2)}`,
//         "Sep Wholesale Amount": `$${Number(ele.Sep.Whole_Sales_Amount).toFixed(2)}`,
//         "Oct Retail Revenue": `$${Number(ele.Oct.retail_revenue__c).toFixed(2)}`,
//         "Oct Wholesale Amount": `$${Number(ele.Oct.Whole_Sales_Amount).toFixed(2)}`,
//         "Nov Retail Revenue": `$${Number(ele.Nov.retail_revenue__c).toFixed(2)}`,
//         "Nov Wholesale Amount": `$${Number(ele.Nov.Whole_Sales_Amount).toFixed(2)}`,
//         "Dec Retail Revenue": `$${Number(ele.Dec.retail_revenue__c).toFixed(2)}`,
//         "Dec Wholesale Amount": `$${Number(ele.Dec.Whole_Sales_Amount).toFixed(2)}`,
//         "Total Retail Revenue": `$${Number(ele.Dec.retail_revenue__c).toFixed(2)}`,
//         "Total Wholesale Amount": `$${Number(ele.Dec.Whole_Sales_Amount).toFixed(2)}`,
//       });
//     });
//   }
//   useEffect(() => {
//     sendApiCall();
//   }, []);

//   const handleExportToExcel = () => {
//     setExportToExcelState(true);
//   };
//   const exportToExcel = () => {
//     setExportToExcelState(false);
//     const ws = XLSX.utils.json_to_sheet(csvData);
//     const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
//     const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//     const data = new Blob([excelBuffer], { type: fileType });
//     FileSaver.saveAs(data, `Comparison Report ${new Date().toDateString()}` + fileExtension);
//   };
//   const resetFilter = async () => {
//     setIsLoading(true);
//     const result = getYearlyComparison({year:initialValues.year,manufacturerId:initialValues.ManufacturerId__c})
//     setApiData(result);
//     setFilter(() => initialValues);
//     setIsLoading(false);
//   };
//   const sendApiCall = async () => {
//     setIsLoading(true);
//     const result = await getYearlyComparison({ ...filter });
//     setApiData(result);
//     setIsLoading(false);
//   };
//   return (
//     <AppLayout
//       filterNodes={
//         <>
//           <FilterItem
//             minWidth="220px"
//             label="All Manufacturers"
//             name="All-Manufacturers"
//             value={filter.ManufacturerId__c}
//             options={manufacturers?.data?.map((manufacturer) => ({
//               label: manufacturer.Name,
//               value: manufacturer.Id,
//             }))}
//             onChange={(value) => setFilter((prev) => ({ ...prev, ManufacturerId__c: value }))}
//           />
//           <FilterItem
//             minWidth="220px"
//             label="Year"
//             name="Year"
//             value={filter.year}
//             options={[{label:2024,value:2024},{label:2023,value:2023}]}
//             onChange={(value) => setFilter((prev) => ({ ...prev, year: value }))}
//           />
//           <div className="d-flex gap-3">
//             <button className="border px-2 d-grid py-1 leading-tight" onClick={sendApiCall}>
//             <SearchIcon fill="#fff" width={20} height={20}/>
//             <small style={{ fontSize: '6px',letterSpacing: '0.5px',textTransform:'uppercase'}}>search</small>
//             </button>
//             <button className="border px-2 d-grid py-1 leading-tight" onClick={resetFilter}>
//             <CloseButton crossFill={'#fff'} height={20} width={20}/>
//             <small style={{ fontSize: '6px',letterSpacing: '0.5px',textTransform:'uppercase'}}>clear</small>
//             </button>
//           </div>
//           <button className="border px-2 d-grid py-1 leading-tight d-grid" onClick={handleExportToExcel}>
//           <MdOutlineDownload size={16} className="m-auto"/>
//          <small style={{ fontSize: '6px',letterSpacing: '0.5px',textTransform:'uppercase'}}>export</small>
//           </button>
//         </>
//       }
//     >
//        {exportToExcelState && (
//         <ModalPage
//           open
//           content={
//             <>
//               <div style={{ maxWidth: "380px" }}>
//                 <h1 className={`fs-5 ${styles.ModalHeader}`}>Warning</h1>
//                 <p className={` ${styles.ModalContent}`}>Do you want to download Comparison Report?</p>
//                 <div className="d-flex justify-content-center gap-3 ">
//                   <button className={`${styles.modalButton}`} onClick={exportToExcel}>
//                     OK
//                   </button>
//                   <button className={`${styles.modalButton}`} onClick={() => setExportToExcelState(false)}>
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </>
//           }
//           onClose={() => {
//             setExportToExcelState(false);
//           }}
//         />
//       )}
//       {!isLoading ? <YearlyComparisonReportTable comparisonData={apiData} /> : <Loading height={"70vh"} />}
//     </AppLayout>
//   );
// };

// export default YearlyComparisonReport;

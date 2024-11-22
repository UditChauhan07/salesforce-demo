import React, { useEffect, useState   , useMemo } from "react";
import AppLayout from "../../components/AppLayout";
import Loading from "../../components/Loading";
import ComparisonReportTable from "../../components/comparison report table/ComparisonReportTable";
import { useComparisonReport } from "../../api/useComparisonReport";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { FilterItem } from "../../components/FilterItem";
import { useManufacturer } from "../../api/useManufacturer";
import { MdOutlineDownload } from "react-icons/md";
import ModalPage from "../../components/Modal UI";
import styles from "../../components/Modal UI/Styles.module.css";
import { CloseButton, SearchIcon } from "../../lib/svg";
import Styles from "./index.module.css";
import { sortArrayHandler } from "../../lib/store";
import { GetAuthData } from "../../lib/store";
import { getPermissions } from "../../lib/permission";
import { useNavigate } from "react-router-dom";
import PermissionDenied from "../../components/PermissionDeniedPopUp/PermissionDenied";
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";
const date = new Date();
const ComparisonReport = () => {
  const [exportToExcelState, setExportToExcelState] = useState(false);

  const initialValues = {
    ManufacturerId__c: "a0O3b00000p7zqKEAQ",
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    dataDisplay: "Active Account",

  };
  const { data: manufacturers } = useManufacturer();
  const [dataDisplayHandler, setDataDisplayHandler] = useState('Active Account');
  const [filter, setFilter] = useState(initialValues);
  const originalApiData = useComparisonReport();
  const [apiData, setApiData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setstatus] = useState(1)
  const [selectedSalesRepId, setSelectedSalesRepId] = useState();
  const [userData, setUserData] = useState({});
  const [hasPermission, setHasPermission] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const navigate = useNavigate()
  sortArrayHandler(apiData?.data || [], g => g?.AccountName)
  //csv Data
  let csvData = [];
  if (apiData?.data?.length) {
    let totalRetail = 0;
    let totalWhole = 0
    apiData?.data?.map((ele) => {
      totalRetail += ele.retail_revenue__c
      totalWhole += ele.Whole_Sales_Amount
      return csvData.push({
        "Retailers Name": ele.AccountName,
        "Estee Lauder Number": ele.Estee_Lauder_Number__c ?? "NA",
        "SalesRep Name": ele.Sales_Rep__c,
        Status: ele.Status,
        "Retail Revenue": ele.retail_revenue__c ? `$${Number(ele.retail_revenue__c).toFixed(2)}` : 'NA',
        "Wholesales Amount": `$${Number(ele.Whole_Sales_Amount).toFixed(2)}`,
      });
    });
    csvData.push({
      "Retailers Name": "Total",
      "Retail Revenue": totalRetail?`$${Number(totalRetail).toFixed(2)}`:'NA',
      "Wholesales Amount": `$${Number(totalWhole).toFixed(2)}`,
    })
  }
  useEffect(() => {
    sendApiCall();
  }, []);

  const handleExportToExcel = () => {
    setExportToExcelState(true);
  };
  const exportToExcel = () => {
    setExportToExcelState(false);
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, `Comparison Report ${new Date().toDateString()}` + fileExtension);
  };
  const resetFilter = async () => {
    setIsLoading(true);
    const result = await originalApiData.fetchComparisonReportAPI(initialValues);
    setApiData(result);
    setFilter(initialValues);
    setIsLoading(false);
    setstatus(1);
  };
  // const sendApiCall = async () => {
  //   setIsLoading(true);
  //   const result = await originalApiData.fetchComparisonReportAPI(filter);
  //   setApiData(result);
  //   setIsLoading(false);
  // };
  // ..........
  const sendApiCall = async () => {
    setIsLoading(true);
    const result = await originalApiData.fetchComparisonReportAPI(filter);
    let short = result.data.filter(item => status === 1 ? item.Status !== "In-Active" : item);
    let temp = {
      ...result,
      data: short,
    };
    setFilter(prev => ({
      ...prev,
      dataDisplay: status === 1 ? "Active Account" : "All Account",
    }));
    setApiData(temp);

    setIsLoading(false);
  };

  // Fetch user data and permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userPermissions = await getPermissions();
        setPermissions(userPermissions)
        setHasPermission(userPermissions?.modules?.reports?.comparisonReport?.view);

        // If no permission, redirect to dashboard
        if (userPermissions?.modules?.reports?.comparisonReport?.view === false) {
          PermissionDenied()
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
            label="Months"
            name="Months"
            value={filter.month}
            options={apiData?.date?.monthList?.map((month) => ({
              label: month?.name,
              value: month.value,
            })) || []}
            onChange={(value) => setFilter((prev) => ({ ...prev, month: value }))}
          />
          <FilterItem
            minWidth="220px"
            label="Year"
            name="Year"
            value={filter.year}
            options={apiData?.date?.yearList?.map((year) => ({
              label: year?.name,
              value: year.value,
            })) || []}
            onChange={(value) => setFilter((prev) => ({ ...prev, year: value }))}
          />
          <FilterItem
            label={status === 1 ? "Active Account" : "All Account"}
            name="Status"
            value={status}
            options={[
              {
                label: "Active Account",
                value: 1,
              },
              {
                label: "All Account",
                value: 2,
              },
            ]}
            onChange={(value) => {
              setstatus(value)
            }}
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
            Comparison Report
          </h2>
        </div>
        <div></div>
      </div>
      {!isLoading ? <ComparisonReportTable comparisonData={apiData} /> : <Loading height={"70vh"} />}
    </AppLayout>
  );
};

export default ComparisonReport;

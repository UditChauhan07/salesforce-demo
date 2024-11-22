import React, { useEffect, useState , useMemo } from "react";
import { useNavigate } from "react-router";
import AppLayout from "../../components/AppLayout";
import Loading from "../../components/Loading";
import NewnessReportTable from "../../components/newness report table/NewnessReportTable";
import { useNewnessReport } from "../../api/useNewnessReport";
import { useManufacturer } from "../../api/useManufacturer";
import Styles from "./index.module.css";
import * as XLSX from "xlsx";
import { FilterItem } from "../../components/FilterItem";
import FilterDate from "../../components/FilterDate";
import { MdOutlineDownload } from "react-icons/md";
import ModalPage from "../../components/Modal UI";
import styles from "../../components/Modal UI/Styles.module.css";
import { CloseButton, SearchIcon } from "../../lib/svg";
import { GetAuthData } from "../../lib/store";
import { getPermissions } from "../../lib/permission";
import PermissionDenied from "../../components/PermissionDeniedPopUp/PermissionDenied";
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";
const NewnessReport = () => {
  const navigate = useNavigate();
  const [exportToExcelState, setExportToExcelState] = useState(false);

  let currentDate = new Date().toJSON().slice(0, 10);
  const subtract6Months = (date) => {
    date.setMonth(date.getMonth() - 6);
    return date;
  };
  let past6monthDate = subtract6Months(new Date());
  const initialValues = {
    ManufacturerId__c: "a0O3b00000p7zqKEAQ",
    toDate: currentDate,
    fromDate: past6monthDate.toJSON().slice(0, 10),
    dataDisplay: "quantity",
  };
  const [dataDisplayHandler, setDataDisplayHandler] = useState('quantity');
  const [filter, setFilter] = useState(initialValues);
  const originalApiData = useNewnessReport();
  const { data: manufacturers, isLoading, error } = useManufacturer();
  const [newnessData, setNewnessData] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setstatus] = useState(1)
  const [selectedSalesRepId, setSelectedSalesRepId] = useState();
  const [userData, setUserData] = useState({});
  const [hasPermission, setHasPermission] = useState(null);
  const [permissions, setPermissions] = useState(null);
  // if (manufacturers?.status !== 200) {
  //   // DestoryAuth();
  // }
  const resetFilter = async () => {
    setLoading(true);
    setstatus(1)
    setFilter(initialValues);
    const result = await originalApiData.fetchNewnessApiData(initialValues);
    setNewnessData(result);
    setLoading(false);
  };
  const PriceDisplay = (value) => {
    return `$${Number(value).toFixed(2)}`;
  };
  const csvData = (price) => {
    let finalData = [];
    let footer = {};
    if (newnessData?.AccountList?.length) {
      newnessData?.AccountList?.map((ele) => {
        let temp = {};
        temp["Retailer Name"] = ele.AccountName__c;
        temp["Retailer Owner Name"] = ele.OwnerName;
        temp["Retailer Status"] = ele.Active_Closed__c;
        temp["Sales Rep"] = ele.Sales_Rep_Name__c;
        temp["Manufacturer Name"] = ele.ManufacturerName__c;
        newnessData?.header?.map((item) => {
          if (price) {
            temp[`${item.name}`] = PriceDisplay(ele[item.name]?.price);
            if (!footer[item.name]) { footer[item.name] = 0; }
            footer[item.name] += parseFloat(ele[item.name]?.price);
          } else {
            temp[`${item.name}`] = ele[item.name]?.qty;
            if (!footer[item.name]) { footer[item.name] = 0; }
            footer[item.name] += parseInt(ele[item.name]?.qty);
          }
        });
        finalData.push(temp);
      });
    }
    let footKey = Object.keys(footer)
    if (footKey.length > 1) {
      footer["Retailer Name"] = "Total";
      if (price) {
        footKey.map((key) => {
          footer[key] = PriceDisplay(footer[key])
        })
      }
      finalData.push(footer)
    }
    return finalData;
  };
  const csvDataV2 = (price) => {
    let finalData = [];
    let footer = {};
    if (newnessData?.AccountList?.length) {
      newnessData?.AccountList?.map((ele, index) => {
        let temp = {};
        temp["Retailer Name"] = ele.AccountName__c;
        temp["Retailer Owner Name"] = ele.OwnerName;
        temp["Retailer Status"] = ele.Active_Closed__c;
        temp["Retailer Sales Rep"] = ele.Sales_Rep_Name__c;
        temp["Manufacturer Name"] = ele.ManufacturerName__c;
        newnessData?.header?.map((item) => {
          temp[`${item.name} Price`] = PriceDisplay(ele[item.name]?.price);
          temp[`${item.name} Quantity`] = ele[item.name]?.qty;
          if (!footer[`${item.name} Price`]) { footer[`${item.name} Price`] = 0; }
          footer[`${item.name} Price`] += parseFloat(ele[item.name]?.price);
          if (!footer[`${item.name} Quantity`]) { footer[`${item.name} Quantity`] = 0; }
          footer[`${item.name} Quantity`] += parseInt(ele[item.name]?.qty);
        });
        if (index == 0) {
          let helper1 = {
            "Retailer Name": "",
            "Retailer Owner Name": "",
            "Retailer Status": "",
            "Retailer Sales Rep": "",
            "Manufacturer Name": "Launch:",
          };
          let helper2 = {
            "Retailer Name": "",
            "Retailer Owner Name": "",
            "Retailer Status": "",
            "Retailer Sales Rep": "",
            "Manufacturer Name": "Ship:",
          };
          newnessData?.header?.map((item) => {
            if (!helper1[`${item.name} Price`]) {
              helper1[`${item.name} Price`] = "";
            }
            helper1[`${item.name} Price`] = item.launchDate
            if (!helper1[`${item.name} Quantity`]) {
              helper1[`${item.name} Quantity`] = "";
            }
            helper1[`${item.name} Quantity`] = item.launchDate
            if (!helper2[`${item.name} Price`]) {
              helper2[`${item.name} Price`] = "";
            }
            helper2[`${item.name} Price`] = item.shipDate
            if (!helper2[`${item.name} Quantity`]) {
              helper2[`${item.name} Quantity`] = "";
            }
            helper2[`${item.name} Quantity`] = item.shipDate
          });
          finalData.push(helper1);
          finalData.push(helper2);
        }
        finalData.push(temp);
      });
    }
    let footKey = Object.keys(footer)
    if (footKey.length > 1) {
      footer["Retailer Name"] = "Total";
      footKey.map((key) => {
        if (key.includes("Price")) {
          footer[key] = PriceDisplay(footer[key])
        }
      })
      finalData.push(footer)
    }
    return finalData;
  };
  const handleExportToExcel = () => {
    setExportToExcelState(true);
  };
  const exportToExcel = () => {
    let temp = csvDataV2();
    // return;
    var ws = XLSX.utils.json_to_sheet(csvData(true));
    var ws2 = XLSX.utils.json_to_sheet(csvData());
    var ws3 = XLSX.utils.json_to_sheet(temp);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Price Report");
    XLSX.utils.book_append_sheet(wb, ws2, "Quantity Report");
    XLSX.utils.book_append_sheet(wb, ws3, "All Report");

    XLSX.writeFile(wb, `Newness Report ${new Date().toDateString()}` + fileExtension);
    setExportToExcelState(false);
    // const ws = XLSX.utils.json_to_sheet(csvData());
    // const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    // const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    // const data = new Blob([excelBuffer], { type: fileType });
    // FileSaver.saveAs(data, `Newness Report ${new Date().toDateString()}` + fileExtension);
  };
  useEffect(() => {
    const userData = localStorage.getItem("Name");
    if (!userData) {
      navigate("/");
    }
  }, []);
  useEffect(() => {
    sendApiCall();
  }, []);
  const sendApiCall = async () => {
    setLoading(true);
    const result = await originalApiData.fetchNewnessApiData(filter);
    let short = result.AccountList.filter(item => status == 1 ? item.Active_Closed__c !== "Closed Account" : item)
    setFilter((prev) => ({
      ...prev,
      dataDisplay: dataDisplayHandler,
    }));
    let temp = {
      status: result.status,
      header: result.header,
      AccountList: short,
    }
    setNewnessData(temp);
    setLoading(false);
  };

    // Fetch user data and permissions
    useEffect(() => {
      const fetchData = async () => {
        try {
  
          const userPermissions = await getPermissions();
          setPermissions(userPermissions);
          setHasPermission(userPermissions?.modules?.reports?.newnessReport?.view );
  
          // If no permission, redirect to dashboard
          if (userPermissions?.modules?.reports?.newnessReport?.view === false) {
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
            minWidth="200px"
            label="All Manufacturers"
            name="AllManufacturers12"
            value={filter.ManufacturerId__c}
            options={manufacturers?.data?.map((manufacturer) => ({
              label: manufacturer.Name,
              value: manufacturer.Id,
            }))}
            onChange={(value) => setFilter((prev) => ({ ...prev, ManufacturerId__c: value }))}
          />
          <FilterItem
            label="Qty/price"
            name="Qty/price"
            value={dataDisplayHandler}
            // value={filter.dataDisplay}
            options={[
              {
                label: "Quantity",
                value: "quantity",
              },
              {
                label: "Price",
                value: "price",
              },
            ]}
            onChange={(value) => {
              // setFilter((prev) => ({
              //   ...prev,
              //   dataDisplay: value,
              // }));
              setDataDisplayHandler(value)
            }}
          />
          <FilterItem
            label="Status"
            name="Status"
            value={status}
            // value={filter.dataDisplay}
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
          {/* First Calender Filter-- from date */}
          <FilterDate
            onChange={(e) => {
              setFilter((prev) => ({
                ...prev,
                fromDate: new Date(e).toJSON().slice(0, 10),
              }));
            }}
            value={filter.fromDate}
            label={"start date : "}
            minWidth="95px"
          />
          {/* Second Calender Filter -- to date */}
          <FilterDate
            onChange={(e) => {
              setFilter((prev) => ({
                ...prev,
                toDate: new Date(e).toJSON().slice(0, 10),
              }));
            }}
            value={filter.toDate}
            label={"end date :"}
            minWidth="95px"
          />
          <div className="d-flex gap-1 ">
            <button className="border px-2 py-1 leading-tight  d-grid ms-3" onClick={sendApiCall}>
              <SearchIcon fill="#fff" width={20} height={20} />
              <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>search</small>
            </button>
            <button className="border px-2 py-1 leading-tight d-grid" onClick={resetFilter}>
              <CloseButton crossFill={'#fff'} height={20} width={20} />
              <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>clear</small>
            </button>
          </div>
          <button className="border px-2 py-1 leading-tight d-grid" onClick={handleExportToExcel}>
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
              <div style={{ maxWidth: "370px" }}>
                <h1 className={`fs-5 ${styles.ModalHeader}`}>Warning</h1>
                <p className={` ${styles.ModalContent}`}>Do you want to download Newness Report?</p>
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
            Newness Report
          </h2>
        </div>
        <div></div>
      </div>
      {loading ? <Loading height={"70vh"} /> : <NewnessReportTable newnessData={newnessData} dataDisplay={filter.dataDisplay} />}
    </AppLayout>
  );
};

export default NewnessReport;

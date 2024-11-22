import React, { useEffect, useMemo, useState } from "react";
import useSalesReport from "../../api/useSalesReport";
import { useNavigate } from "react-router";
import AppLayout from "../../components/AppLayout";
import { FilterItem } from "../../components/FilterItem";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import SalesReportTable from "../../components/sales report table/SalesReportTable";
import Loading from "../../components/Loading";
import FilterSearch from "../../components/FilterSearch";
import Styles from "./index.module.css";
import { MdOutlineDownload } from "react-icons/md";
import ModalPage from "../../components/Modal UI";
import styles from "../../components/Modal UI/Styles.module.css";
import { CloseButton, SearchIcon } from "../../lib/svg";
import { GetAuthData } from "../../lib/store";
import { getPermissions } from "../../lib/permission";
import PermissionDenied from "../../components/PermissionDeniedPopUp/PermissionDenied";
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";

const SalesReport = () => {
  const [manufacturers, setManufacturers] = useState([]);
  const [yearFor, setYearFor] = useState(2024);
  const salesReportApi = useSalesReport();
  const [isLoading, setIsLoading] = useState(false);
  const [manufacturerFilter, setManufacturerFilter] = useState();
  const [highestOrders, setHighestOrders] = useState(true);
  const [activeAccounts, setActiveAccounts] = useState("Active Account");
  const [salesReportData, setSalesReportData] = useState([]);
  const [ownerPermission, setOwnerPermission] = useState(false);
  const [searchBy, setSearchBy] = useState("");
  const [searchBySalesRep, setSearchBySalesRep] = useState("");
  const [salesRepList, setSalesRepList] = useState([]);
  const [yearForTableSort, setYearForTableSort] = useState(2024);
  const [exportToExcelState, setExportToExcelState] = useState(false);
  const [selectedSalesRepId, setSelectedSalesRepId] = useState();
  const [userData, setUserData] = useState({});
  const [hasPermission, setHasPermission] = useState(null); 
  const [permissions, setPermissions] = useState(null);
  const [dateFilter, setDateFilter] = useState("Created-Date")
  console.log({salesRepList});
  
  const filteredSalesReportData = useMemo(() => {
    let filtered = salesReportData.filter((ele) => {
      return !manufacturerFilter || !ele.ManufacturerName__c.localeCompare(manufacturerFilter);
    });
    if (searchBy) {
      filtered = filtered?.map((ele) => {
        const Orders = ele.Orders.filter((item) => {
          if (item.Name?.toLowerCase().includes(searchBy?.toLowerCase())||item.AccountName?.toLowerCase().includes(searchBy?.toLowerCase())) {
            return item;
          }
        });
        return {
          ...ele,
          Orders,
        };
      });
    }
    if (searchBySalesRep) {
      filtered = filtered?.map((ele) => {
        const Orders = ele.Orders.filter((item) => {
          if (item.AccountRepo?.toLowerCase().includes(searchBySalesRep?.toLowerCase())) {
            return item;
          }
        });
        return {
          ...ele,
          Orders,
        };
      });
    }
    // if (activeAccounts === "Active Account") {
    //   filtered = filtered?.filter((ele) =>
    //     ele.Orders.find((item) => item.Status === "Active Account"));
    //   // i need only active account in this function but is not working?
    // }
    
    if (activeAccounts === "Active Account") {
      filtered = filtered?.map((ele) => {
        const Orders = ele.Orders.filter((item) => {
          if (item.Status === "Active Account") {
            return item;
          }
        });
        return {
          ...ele,
          Orders,
        };
      });
    }else {
      filtered = filtered;
    };
    // ..........
    if (highestOrders) {
      filtered = filtered?.map((ele) => {
        const Orders = ele.Orders.sort((a, b) => b.totalOrders - a.totalOrders);
        return {
          ...ele,
          Orders,
        };
      });
    } else {
      filtered = filtered?.map((ele) => {
        const Orders = ele.Orders.sort((a, b) => a.totalOrders - b.totalOrders);
        return {
          ...ele,
          Orders,
        };
      });
    }
    return filtered;
  }, [manufacturerFilter, salesReportData, highestOrders, searchBy, searchBySalesRep, activeAccounts]);


  // ................
  const csvData = useMemo(() => {
    const dataWithTotals = filteredSalesReportData?.map((ele) =>
      ele.Orders.map((item) => ({
        "Brand Name": ele.ManufacturerName__c,
        "Retailer Name": item.AccountName??item.Name,
        "Retailer Type": item.AccountType,
        "Date Open": item.DateOpen,
        Status: item.Status,
        "Retailer Sales Rep": item?.AccountRepo ?? JSON.parse(localStorage.getItem("Api Data")).data.Name,
        "Jan Orders": item.Jan.items?.length,
        "Jan Amount": item.Jan.amount,
        "Feb Orders": item.Feb.items?.length,
        "Feb Amount": item.Feb.amount,
        "Mar Orders": item.Mar.items?.length,
        "Mar Amount": item.Mar.amount,
        "Apr Orders": item.Apr.items?.length,
        "Apr Amount": item.Apr.amount,
        "May Orders": item.May.items?.length,
        "May Amount": item.May.amount,
        "Jun Orders": item.Jun.items?.length,
        "Jun Amount": item.Jun.amount,
        "Jul Orders": item.Jul.items?.length,
        "Jul Amount": item.Jul.amount,
        "Aug Orders": item.Aug.items?.length,
        "Aug Amount": item.Aug.amount,
        "Sep Orders": item.Sep.items?.length,
        "Sep Amount": item.Sep.amount,
        "Oct Orders": item.Oct.items?.length,
        "Oct Amount": item.Oct.amount,
        "Nov Orders": item.Nov.items?.length,
        "Nov Amount": item.Nov.amount,
        "Dec Orders": item.Dec.items?.length,
        "Dec Amount": item.Dec.amount,
        "Total Orders": item.totalOrders,
        "Total Amount": item.totalorderPrice,
      }))
    ).flat();

    const totals = {
      "Brand Name": "Total",
      "Jan Orders": dataWithTotals.reduce((total, item) => total + (item["Jan Orders"] || 0), 0),
      "Jan Amount": dataWithTotals.reduce((total, item) => total + (item["Jan Amount"] || 0), 0),

      "Feb Orders": dataWithTotals.reduce((total, item) => total + (item["Feb Orders"] || 0), 0),
      "Feb Amount": dataWithTotals.reduce((total, item) => total + (item["Feb Amount"] || 0), 0),

      "Mar Orders": dataWithTotals.reduce((total, item) => total + (item['Mar Orders'] || 0), 0),
      "Mar Amount": dataWithTotals.reduce((total, item) => total + (item['Mar Amount'] || 0), 0),

      "Apr Orders": dataWithTotals.reduce((total, item) => total + (item['Apr Orders'] || 0), 0),
      "Apr Amount": dataWithTotals.reduce((total, item) => total + (item['Apr Amount'] || 0), 0),

      "May Orders": dataWithTotals.reduce((total, item) => total + (item['May Orders'] || 0), 0),
      "May Amount": dataWithTotals.reduce((total, item) => total + (item['May Amount'] || 0), 0),

      "Jun Orders": dataWithTotals.reduce((total, item) => total + (item['Jun Orders'] || 0), 0),
      "Jun Amount": dataWithTotals.reduce((total, item) => total + (item['Jun Amount'] || 0), 0),

      "Jul Orders": dataWithTotals.reduce((total, item) => total + (item['Jul Orders'] || 0), 0),
      "Jul Amount": dataWithTotals.reduce((total, item) => total + (item['Jul Amount'] || 0), 0),

      "Aug Orders": dataWithTotals.reduce((total, item) => total + (item['Aug Orders'] || 0), 0),
      "Aug Amount": dataWithTotals.reduce((total, item) => total + (item['Aug Amount'] || 0), 0),

      "Sep Orders": dataWithTotals.reduce((total, item) => total + (item['Sep Orders'] || 0), 0),
      "Sep Amount": dataWithTotals.reduce((total, item) => total + (item['Sep Amount'] || 0), 0),

      "Oct Orders": dataWithTotals.reduce((total, item) => total + (item['Oct Orders'] || 0), 0),
      "Oct Amount": dataWithTotals.reduce((total, item) => total + (item['Oct Amount'] || 0), 0),

      "Nov Orders": dataWithTotals.reduce((total, item) => total + (item['Nov Orders'] || 0), 0),
      "Nov Amount": dataWithTotals.reduce((total, item) => total + (item['Nov Amount'] || 0), 0),

      'Dec Orders': dataWithTotals.reduce((total, item) => total + (item['Dec Orders'] || 0), 0),
      "Dec Amount": dataWithTotals.reduce((total, item) => total + (item['Dec Amount'] || 0), 0),

      "Total Orders": dataWithTotals.reduce((total, item) => total + (item['Total Orders'] || 0), 0),
      "Total Amount": dataWithTotals.reduce((total, item) => total + (item['Total Amount'] || 0), 0),
    };

    const dataWithTotalRow = [...dataWithTotals, totals];

    return dataWithTotalRow;
  }, [filteredSalesReportData, manufacturerFilter]);

  const handleExportToExcel = () => {
    setExportToExcelState(true);
  };
  const exportToExcel = () => {
    setExportToExcelState(false);
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, `Sales Report ${new Date().toDateString()}` + fileExtension);
  };
  const resetFilter = () => {
    setManufacturerFilter(null);
    setHighestOrders(true);
    setActiveAccounts("Active Account");
    setYearFor(2024);
    setSearchBy("");
    setSearchBySalesRep("");
    setYearForTableSort(2024);
  };
  const navigate = useNavigate();


// Memoize permissions to avoid unnecessary re-calculations
const memoizedPermissions = useMemo(() => permissions, [permissions]);





  // 
  const getSalesData = async (yearFor, dateFilter) => {
    setIsLoading(true);
    setYearForTableSort(yearFor);
    const result = await salesReportApi.salesReportData({ yearFor, dateFilter });
    let salesListName = [];
    let salesList = [];
    let manuIds = [];
    let manufacturerList = [];
    result?.data?.data?.map((manu) => {
      if (!manuIds.includes(manu.ManufacturerId__c)) {
        manuIds.push(manu.ManufacturerId__c);
        manufacturerList.push({
          label: manu.ManufacturerName__c,
          value: manu.ManufacturerName__c,
          // value: manu.ManufacturerId__c,
        });
      }
      if (manu.Orders.length) {
        manu.Orders.map((item) => {
          if (!salesListName.includes(item.AccountRepo)&&item.AccountRepo) {
            salesListName.push(item.AccountRepo);
            
            salesList.push({
              label: item.AccountRepo,
              value: item.AccountRepo,
            });
          }
        });
      }
    });
    setManufacturers(manufacturerList)
    setSalesRepList(salesList);
    setSalesReportData(result?.data?.data);
    setOwnerPermission(result.data.ownerPermission);
    setIsLoading(false);
  };
  console.log("owner Permissions " ,ownerPermission )
  // console.log("salesReportData", salesReportData);
  useEffect(() => {
    const userData = localStorage.getItem("Name");
    if (userData) {
      getSalesData(yearFor, dateFilter);
    } else {
      navigate("/");
    }
  }, []);
  const sendApiCall = () => {
    setManufacturerFilter(null);
    setSearchBySalesRep("");
    // setManufacturerFilter(null);
    // setHighestOrders(true);
    // getSalesData(yearFor);
    // setSearchBy("");
    // setSearchBySalesRep("");
    getSalesData(yearFor, dateFilter);
  };
  let yearList = [
    { value: 2024, label: 2024 },
    { value: 2023, label: 2023 },
    { value: 2022, label: 2022 },
    { value: 2021, label: 2021 },
    { value: 2020, label: 2020 },
    { value: 2019, label: 2019 },
    { value: 2018, label: 2018 },
    { value: 2017, label: 2017 },
    { value: 2016, label: 2016 },
    { value: 2015, label: 2015 },
  ]

  // Fetch user data and permissions
  useEffect(() => {
    const fetchData = async () => {
      try {

        const userPermissions = await getPermissions();
        setPermissions(userPermissions);
        setHasPermission(userPermissions?.modules?.reports?.salesReport?.view);

        // If no permission, redirect to dashboard
        if (userPermissions?.modules?.reports?.salesReport?.view  === false) {
          PermissionDenied()
          navigate("/dashboard");
        }
        
      } catch (error) {
        console.log({ error });
      }
    };
    
    fetchData();
  }, []);


  
  return (
    <AppLayout
      filterNodes={
        <>
        
          <div className="d-flex justify-content-between m-auto" style={{ width: '99%' }}>
          <div className="d-flex justify-content-start gap-4 col-4">
          <FilterItem
              label="year"
              name="Year"
              value={yearFor}
              options={yearList}
              onChange={(value) => setYearFor(value)}
            />
            <FilterItem
              label="date"
              name="date"
              value={dateFilter}
              options={[{ label: "Created Date", value: "Created-Date" }, { label: "Closed Date", value: "Closed-Date" }]}
              onChange={(value) => setDateFilter(value)}
            />
            <button onClick={() => sendApiCall()} className="border px-2 py-1 leading-tight d-grid"> <SearchIcon fill="#fff" width={20} height={20} />
              <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>search</small>
            </button>
            </div>
       
         <div className="d-flex justify-content-end col-1"><hr className={Styles.breakHolder} /></div>
         <div className="d-flex justify-content-end gap-4 col-7">
           {ownerPermission && <FilterItem minWidth="220px" label="All Sales Rep" name="AllSalesRep" value={searchBySalesRep} options={salesRepList} onChange={(value) => setSearchBySalesRep(value)} />}
           <FilterItem
             minWidth="220px"
             label="All Brands"
             name="AllManufacturers1"
             value={manufacturerFilter}
             options={manufacturers}
             onChange={(value) => setManufacturerFilter(value)}
           />
           <FilterItem
             minWidth="220px"
             label="Lowest Amount Orders"
             name="LowestOrders"
             value={highestOrders}
             options={[
               {
                 label: "Highest Amount Orders",
                 value: true,
               },
               {
                 label: "Lowest Amount Orders",
                 value: false,
               },
             ]}
             onChange={(value) => setHighestOrders(value)}
           />
           <FilterItem
             minWidth="220px"
             label="Status"
             name="Status"
             value={activeAccounts}
             options={[
               {
                 label: "Active Account",
                 value: "Active Account",
               },
               {
                 label: "All Account",
                 value: "All Account",
               },
             ]}
             onChange={(value) => {
               setActiveAccounts(value);
             }}
           />

           {/* First Calender Filter-- start date */}
           <FilterSearch onChange={(e) => setSearchBy(e.target.value)} value={searchBy} placeholder={"Search by account"} minWidth={"167px"} />
           <div className="d-flex gap-3">
             <button className="border px-2 py-1 leading-tight d-grid" onClick={resetFilter}>
               <CloseButton crossFill={'#fff'} height={20} width={20} />
               <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>clear</small>
             </button>
           </div>
           <button className="border px-2 py-1 leading-tight d-grid" onClick={handleExportToExcel}>

             <MdOutlineDownload size={16} className="m-auto" />
             <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>EXPORT</small>
           </button>
         </div>
       </div>
         
       
        </>
      }
    >
      {exportToExcelState && (
        <ModalPage
          open
          content={
            <>
              <div style={{ maxWidth: "330px" }}>
                <h1 className={`fs-5 ${styles.ModalHeader}`}>Warning</h1>
                <p className={` ${styles.ModalContent}`}>Do you want to download Sales Report?</p>
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
            {ownerPermission ? `${searchBySalesRep ? searchBySalesRep + "`s" : "All"} Sales Report` : "Your Sales Report"}
            {manufacturerFilter && " for " + manufacturerFilter}
          </h2>
        </div>
        <div>
          {false && <div className={`d-flex align-items-center ${Styles.InputControll}`}>
            <select onChange={(e) => setYearFor(e.target.value)}>
              <option value={2015} selected={yearFor == 2015 ? true : false}>
                2015
              </option>
              <option value={2016} selected={yearFor == 2016 ? true : false}>
                2016
              </option>
              <option value={2017} selected={yearFor == 2017 ? true : false}>
                2017
              </option>
              <option value={2018} selected={yearFor == 2018 ? true : false}>
                2018
              </option>
              <option value={2019} selected={yearFor == 2019 ? true : false}>
                2019
              </option>
              <option value={2020} selected={yearFor == 2020 ? true : false}>
                2020
              </option>
              <option value={2021} selected={yearFor == 2021 ? true : false}>
                2021
              </option>
              <option value={2022} selected={yearFor == 2022 ? true : false}>
                2022
              </option>
              <option value={2023} selected={yearFor == 2023 ? true : false}>
                2023
              </option>
              <option value={2024} selected={yearFor == 2024 ? true : false}>
                2024
              </option>
            </select>
            <button onClick={() => sendApiCall()}>Search Sales</button>
          </div>}
        </div>
      </div>

      {filteredSalesReportData?.length && !isLoading ? (
        <SalesReportTable salesData={filteredSalesReportData} year={yearForTableSort} ownerPermission={ownerPermission} />
      ) : filteredSalesReportData.length === 0 && !isLoading ? (
        <div className="flex justify-center items-center py-4 w-full lg:min-h-[300px] xl:min-h-[380px]">No data found</div>
      ) : (
        <Loading height={"70vh"} />
      )}

    </AppLayout>
  );
};

export default SalesReport;

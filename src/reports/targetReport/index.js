import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../components/AppLayout";
import Styles from "./index.module.css";
import { DateConvert, GetAuthData, getTargetReportAll } from "../../lib/store";
import Loading from "../../components/Loading";
import { useManufacturer } from "../../api/useManufacturer";
import { FilterItem } from "../../components/FilterItem";
import FilterSearch from "../../components/FilterSearch";
import { MdOutlineDownload } from "react-icons/md";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import ModalPage from "../../components/Modal UI";
import styles from "../../components/Modal UI/Styles.module.css";
import { useLocation } from "react-router-dom";
import { CloseButton, SearchIcon } from "../../lib/svg";
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";

const TargetReport = () => {
  const location = useLocation();
  const { state } = location || {};
  const { data: manufacturers } = useManufacturer();
  const [isLoaded, setIsLoaded] = useState(false);
  const [target, setTarget] = useState({ ownerPermission: false, list: [] });
  const [manufacturerFilter, setManufacturerFilter] = useState();
  const [activeAccounts, setActiveAccounts] = useState("Active Account");
  const [searchBy, setSearchBy] = useState("");
  let currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [preOrder, setPreOrder] = useState(false);
  const [searchSaleBy, setSearchSaleBy] = useState("");
  const [salesRepList, setSalesRepList] = useState([]);
  const [exportToExcelState, setExportToExcelState] = useState(false);
  // let brandcount = {}
  // let sum = 0;
  useEffect(() => {
    GetAuthData()
      .then((user) => {
        console.log(user)
        getTargetReportAll({ user, year, preOrder })
          .then((targetRes) => {
            console.log(targetRes)
            console.log(targetRes)
            if (targetRes) {
              setIsLoaded(true);
            }
            let salesRep = [];
            targetRes.list.map((tar) => {
              if (!salesRep.includes(tar.SalesRepName)) {
                salesRep.push(tar.SalesRepName);
              }
            });
            setSalesRepList(salesRep);
            setTarget(targetRes);
            setManufacturerFilter(targetRes.ownerPermission ? state?.manufacturerId : null);
            setSearchSaleBy(targetRes.ownerPermission ? state?.salesRepId : null);
          })
          .catch((targetErr) => {
            console.error({ targetErr });
          });
      })
      .catch((userErr) => {
        console.error({ userErr });
      });
  }, []);
  const filteredTargetData = useMemo(() => {
    let filtered = target.list.filter((ele) => {
      if (!manufacturerFilter || !ele.ManufacturerId.localeCompare(manufacturerFilter)) {
        return ele;
      }
    });
    if (searchBy) {
      console.log({ searchBy });
      filtered = filtered.filter((item) => {
        if (item.AccountName?.toLowerCase().includes(searchBy?.toLowerCase())) {
          return item;
        }
      });
    }
    if (searchSaleBy) {
      filtered = filtered.filter((item) => {
        if (item.SalesRepName?.toLowerCase().match(searchSaleBy?.toLowerCase())?.length) {
          // if (item.SalesRepName?.toLowerCase().includes(searchSaleBy?.toLowerCase())) {
          return item;
        }
      });
    }
    filtered = filtered?.filter((item) => {
      if (activeAccounts === "Active Account") {
        if (item.Status === "Active") {
          return item;
        }
      } else if (activeAccounts === "All Account") {
        return item;
      }
    })
    //     if (activeAccounts === "Active Account") {
    //       filtered = filtered?.filter((ele) => 
    //      ele.Orders?.some((item) => 
    // item.Status === "Active Account" ));
    //     }else if(activeAccounts === "All Account"){
    //       filtered=filtered;
    //         };

    return filtered;
  }, [manufacturerFilter, searchBy, searchSaleBy, activeAccounts, isLoaded]);
  const resetFilter = () => {
    setManufacturerFilter(null);
    setSearchBy("");
    setSearchSaleBy("");
    setYear(currentDate.getFullYear());
    setPreOrder(true);
    sendApiCall();
  };
  const PriceDisplay = (value) => {
    return `$${Number(value).toFixed(2)}`;
  };
  const csvData = () => {
    let finalData = [];
    if (filteredTargetData.length) {
      filteredTargetData.map((target) => {
        let temp = {
          SalesRepName: target.SalesRepName,
          AccountName: target.AccountName,
          ManufacturerName: target.ManufacturerName,
          Status: target.Status,
          DateOpen: target.DateOpen,
          JanuaryTarget: target.January.target,
          JanuarySale: target.January.sale,
          JanuaryDiff: target.January.diff,

          FebruaryTarget: target.February.target,
          FebruarySale: target.February.sale,
          FebruaryDiff: target.February.diff,

          MarchTarget: target.March.target,
          MarchSale: target.March.sale,
          MarchDiff: target.March.diff,

          AprilTarget: target.April.target,
          AprilSale: target.April.sale,
          AprilDiff: target.April.diff,

          MayTarget: target.May.target,
          MaySale: target.May.sale,
          MayDiff: target.May.diff,

          JuneTarget: target.June.target,
          JuneSale: target.June.sale,
          JuneDiff: target.June.diff,

          JulyTarget: target.July.target,
          JulySale: target.July.sale,
          JulyDiff: target.July.diff,

          AugustTarget: target.August.target,
          AugustSale: target.August.sale,
          AugustDiff: target.August.diff,

          SeptemberTarget: target.September.target,
          SeptemberSale: target.September.sale,
          SeptemberDiff: target.September.diff,

          OctoberTarget: target.October.target,
          OctoberSale: target.October.sale,
          OctoberDiff: target.October.diff,

          NovemberTarget: target.November.target,
          NovemberSale: target.November.sale,
          NovemberDiff: target.November.diff,

          DecemberTarget: target.December.target,
          DecemberSale: target.December.sale,
          DecemberDiff: target.December.diff,

          TotalTarget: target.Total.target,
          TotalSale: target.Total.sale,
          TotalDiff: target.Total.diff,
        };
        finalData.push(temp);
      });
    }
    return finalData;
  };
  // .............
  const exportToExcel2 = () => {
    setExportToExcelState(false);

    const totalRow = {
      SalesRepName: "TOTAL",
      AccountName: "",
      ManufacturerName: "",
      Status: "",
      JanuaryTarget: 0,
      JanuarySale: 0,
      JanuaryDiff: 0,

      FebruaryTarget: 0,
      FebruarySale: 0,
      FebruaryDiff: 0,

      MarchTarget: 0,
      MarchSale: 0,
      MarchDiff: 0,

      AprilTarget: 0,
      AprilSale: 0,
      AprilDiff: 0,

      MayTarget: 0,
      MaySale: 0,
      MayDiff: 0,

      JuneTarget: 0,
      JuneSale: 0,
      JuneDiff: 0,

      JulyTarget: 0,
      JulySale: 0,
      JulyDiff: 0,

      AugustTarget: 0,
      AugustSale: 0,
      AugustDiff: 0,

      SeptemberTarget: 0,
      SeptemberSale: 0,
      SeptemberDiff: 0,

      OctoberTarget: 0,
      OctoberSale: 0,
      OctoberDiff: 0,

      NovemberTarget: 0,
      NovemberSale: 0,
      NovemberDiff: 0,

      DecemberTarget: 0,
      DecemberSale: 0,
      DecemberDiff: 0,


      TotalTarget: 0,
      TotalSale: 0,
      TotalDiff: 0,
    };

    filteredTargetData.forEach(element => {
      totalRow.JanuaryTarget += parseFloat(element.January.target);
      totalRow.JanuarySale += parseFloat(element.January.sale);
      totalRow.JanuaryDiff += parseFloat(element.January.diff);

      totalRow.FebruaryTarget += parseFloat(element.February.target);
      totalRow.FebruarySale += parseFloat(element.February.sale);
      totalRow.FebruaryDiff += parseFloat(element.February.diff);

      totalRow.MarchTarget += parseFloat(element.March.target);
      totalRow.MarchSale += parseFloat(element.March.sale);
      totalRow.MarchDiff += parseFloat(element.March.diff);

      totalRow.AprilTarget += parseFloat(element.April.target);
      totalRow.AprilSale += parseFloat(element.April.sale);
      totalRow.AprilDiff += parseFloat(element.April.diff);

      totalRow.MayTarget += parseFloat(element.May.target);
      totalRow.MaySale += parseFloat(element.May.sale);
      totalRow.MayDiff += parseFloat(element.May.diff);

      totalRow.JuneTarget += parseFloat(element.June.target);
      totalRow.JuneSale += parseFloat(element.June.sale);
      totalRow.JuneDiff += parseFloat(element.June.diff);

      totalRow.JulyTarget += parseFloat(element.July.target);
      totalRow.JulySale += parseFloat(element.July.sale);
      totalRow.JulyDiff += parseFloat(element.July.diff);

      totalRow.AugustTarget += parseFloat(element.August.target);
      totalRow.AugustSale += parseFloat(element.August.sale);
      totalRow.AugustDiff += parseFloat(element.August.diff);

      totalRow.SeptemberTarget += parseFloat(element.September.target);
      totalRow.SeptemberSale += parseFloat(element.September.sale);
      totalRow.SeptemberDiff += parseFloat(element.September.diff);

      totalRow.OctoberTarget += parseFloat(element.October.target);
      totalRow.OctoberSale += parseFloat(element.October.sale);
      totalRow.OctoberDiff += parseFloat(element.October.diff);

      totalRow.NovemberTarget += parseFloat(element.November.target);
      totalRow.NovemberSale += parseFloat(element.November.sale);
      totalRow.NovemberDiff += parseFloat(element.November.diff);

      totalRow.DecemberTarget += parseFloat(element.December.target);
      totalRow.DecemberSale += parseFloat(element.December.sale);
      totalRow.DecemberDiff += parseFloat(element.December.diff);


      // Repeat the same for other months and total columns
      // ...
      totalRow.TotalTarget += parseFloat(element.Total.target);
      totalRow.TotalSale += parseFloat(element.Total.sale);
      totalRow.TotalDiff += parseFloat(element.Total.diff);
    });

    const dataWithTotalRow = [...csvData(), totalRow];
    const ws = XLSX.utils.json_to_sheet(dataWithTotalRow);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });

    let title = target.ownerPermission ? `${searchSaleBy ? searchSaleBy + "`s" : "All"} Target Report` : "Target Report";
    if (manufacturerFilter) {
      title += " for " + getManufactureName(manufacturerFilter);
    }
    title += ` ${new Date().toDateString()}`;

    FileSaver.saveAs(data, title + fileExtension);
  };
  // ...............
  const allOrdersEmpty = filteredTargetData.every((item) => item.Orders?.length <= 0);
  const handleExportToExcel = () => {
    setExportToExcelState(true);
  };
  const getManufactureName = (id = null) => {
    if (id) {
      let name = null;
      manufacturers?.data?.map((manufacturer) => {
        if (manufacturer.Id == id) name = manufacturer.Name;
      });
      return name;
    }
  };
  console.log({ filteredTargetData, salesRepList });
  const exportToExcel = () => {
    setExportToExcelState(false);
    const ws = XLSX.utils.json_to_sheet(csvData());
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    let title = target.ownerPermission ? `${searchSaleBy ? searchSaleBy + "`s" : "All"} Target Report` : "Target Report";
    if (manufacturerFilter) {
      title += " for " + getManufactureName(manufacturerFilter);
    }
    title += ` ${new Date().toDateString()}`;
    FileSaver.saveAs(data, title + fileExtension);
  };
  let monthTotalAmount = {
    Jan: {
      target: 0,
      sale: 0,
      diff: 0,
    },
    Feb: {
      target: 0,
      sale: 0,
      diff: 0,
    },
    Mar: {
      target: 0,
      sale: 0,
      diff: 0,
    },
    Apr: {
      target: 0,
      sale: 0,
      diff: 0,
    },
    May: {
      target: 0,
      sale: 0,
      diff: 0,
    },
    Jun: {
      target: 0,
      sale: 0,
      diff: 0,
    },
    Jul: {
      target: 0,
      sale: 0,
      diff: 0,
    },
    Aug: {
      target: 0,
      sale: 0,
      diff: 0,
    },
    Sep: {
      target: 0,
      sale: 0,
      diff: 0,
    },
    Oct: {
      target: 0,
      sale: 0,
      diff: 0,
    },
    Nov: {
      target: 0,
      sale: 0,
      diff: 0,
    },
    Dec: {
      target: 0,
      sale: 0,
      diff: 0,
    },
    Total: {
      target: 0,
      sale: 0,
      diff: 0,
    },
  };
  const sendApiCall = () => {
    setIsLoaded(false);
    GetAuthData()
      .then((user) => {
        console.log(user)
        getTargetReportAll({ user, year, preOrder })
          .then((targetRes) => {

            if (targetRes) {
              setIsLoaded(true);
            }
            let salesRep = [];
            targetRes.list.map((tar) => {
              if (!salesRep.includes(tar.SalesRepName)) {
                salesRep.push(tar.SalesRepName);
              }
            });
            setSalesRepList(salesRep);
            setTarget(targetRes);
            setManufacturerFilter(targetRes.ownerPermission ? state?.manufacturerId : manufacturerFilter);
            setSearchSaleBy(targetRes.ownerPermission ? state?.salesRepId : searchSaleBy);
          })
          .catch((targetErr) => {
            console.error({ targetErr });
          });
      })
      .catch((userErr) => {
        console.error({ userErr });
      });
  };
  let reportStatus = [
    { label: "With Pre-Order", value: true },
    { label: "With out Pre-Order", value: false },
  ];
  let yearlist = [
    { label: currentDate.getFullYear(), value: currentDate.getFullYear() },
    { label: currentDate.getFullYear() - 1, value: currentDate.getFullYear() - 1 },
  ];
  const formentAcmount = (target, sale, diff, totalorderPrice, monthTotalAmount) => {
    return `${Number(target, sale, diff, totalorderPrice, monthTotalAmount).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`
  }
  return (
    <AppLayout
      filterNodes={
        <div className="d-flex justify-content-between m-auto" style={{ width: "99%" }}>
          <div className="d-flex justify-content-start col-3 gap-4">
            <FilterItem
              minWidth="200px"
              label="Status"
              value={preOrder}
              options={reportStatus}
              onChange={(value) => setPreOrder(value)}
              name="reportStatus"
              containNullValue
            />
            <FilterItem
              minWidth="100px"
              label="Year"
              value={year}
              options={yearlist}
              onChange={(value) => setYear(value)}
              name="yearStatus"
              containNullValue
            />

            <button onClick={() => sendApiCall()} className="border px-2 d-grid py-1 leading-tight flex justify-center align-center gap-1">
              <SearchIcon fill="#fff" width={20} height={20} />
              <small style={{ fontSize: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>search</small>
            </button>
          </div>
          <div className="d-flex justify-content-around col-1"></div>
          <div className="d-flex justify-content-around col-2">
            <hr className={Styles.breakHolder} />
          </div>
          <div className="d-flex justify-content-end col-6 gap-4">
            {target.ownerPermission && (
              <FilterItem
                minWidth="220px"
                label="All Sales Rep"
                value={searchSaleBy}
                options={salesRepList.map((salerep) => ({
                  label: salerep,
                  value: salerep,
                }))}
                onChange={(value) => setSearchSaleBy(value)}
                name="salesRepSearch"
              />
            )}

           
            <FilterItem
              minWidth="220px"
              label="All Manufacturers"
              value={manufacturerFilter}
              options={manufacturers?.data?.map((manufacturer) => ({
                label: manufacturer.Name,
                value: manufacturer.Id,
              }))}
              onChange={(value) => setManufacturerFilter(value)}
            />
            <FilterItem
              label="Status"
              name="Status"
              value={activeAccounts}
              // value={filter.dataDisplay}
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
                setActiveAccounts(value)
              }}
            />
            <div className="d-flex gap-3">
              <button className="border px-2 d-grid py-1 leading-tight" onClick={resetFilter}>
                <CloseButton crossFill={"#fff"} height={20} width={20} />
                <small style={{ fontSize: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>clear</small>
              </button>
              <button className="border px-2 d-grid py-1 leading-tight" onClick={handleExportToExcel}>
                <MdOutlineDownload size={16} className="m-auto" />
                <small style={{ fontSize: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>export</small>
              </button>
            </div>

            {/* <button className="border px-2.5 py-1 leading-tight flex justify-center align-center gap-1" onClick={handleExportToExcel}>
            EXPORT
            <MdOutlineDownload size={16} />
          </button> */}
          </div>
        </div>
      }
    >
      {exportToExcelState && (
        <ModalPage
          open
          content={
            <>
              <div style={{ maxWidth: "370px" }}>
                <h1 className={`fs-5 ${styles.ModalHeader}`}>Warning</h1>
                <p className={` ${styles.ModalContent}`}>Do you want to download Target Report?</p>
                <div className="d-flex justify-content-center gap-3 ">
                  <button className={`${styles.modalButton}`} onClick={exportToExcel2}>
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
      {!isLoaded ? (
        <Loading />
      ) : (
        <section>
          {true && (
            <div className={Styles.inorderflex}>
              <div>
                <h2>
                  {target.ownerPermission ? `${searchSaleBy ? searchSaleBy + "`s" : "All"} Target Report` : "Your Target Report"}
                  {manufacturerFilter && " for " + getManufactureName(manufacturerFilter)}
                </h2>
              </div>
              <div></div>
            </div>
          )}
          <div className={`d-flex p-3 ${Styles.tableBoundary} mb-5`}>
            <div className="" style={{ maxHeight: "73vh", minHeight: "40vh", overflow: "auto", width: "100%" }}>
              <table id="salesReportTable" className="table table-responsive" style={{ minHeight: "300px" }}>
                <thead>
                  <tr>
                    <th className={`${Styles.th} ${Styles.stickyFirstColumnHeading} `} style={{ minWidth: "170px" }}>
                      Sales Rep
                    </th>
                    <th className={`${Styles.th} ${Styles.stickySecondColumnHeading}`} style={{ minWidth: "150px" }}>
                      Account
                    </th>
                    <th className={`${Styles.th} ${Styles.stickyThirdColumnHeading}`} style={{ minWidth: "200px" }}>
                      Manufacturer
                    </th>
                    <th className={`${Styles.th} ${Styles.stickyThirdColumnHeading}`} style={{ minWidth: "200px" }}>
                      Status
                    </th>
                    <th className={`${Styles.th} ${Styles.stickyThirdColumnHeading}`} style={{ minWidth: "200px" }}>
                      Date Open
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Jan Target
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Jan Sales
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Jan Diff
                    </th>

                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Feb Target
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Feb Sales
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Feb Diff
                    </th>

                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Mar Target
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Mar Sales
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Mar Diff
                    </th>

                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Apr Target
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Apr Sales
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Apr Diff
                    </th>

                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      May Target
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      May Sales
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      May Diff
                    </th>

                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Jun Target
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Jun Sales
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Jun Diff
                    </th>

                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Jul Target
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Jul Sales
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Jul Diff
                    </th>

                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Aug Target
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Aug Sales
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Aug Diff
                    </th>

                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Sep Target
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Sep Sales
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Sep Diff
                    </th>

                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Oct Target
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Oct Sales
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Oct Diff
                    </th>

                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Nov Target
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Nov Sales
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Nov Diff
                    </th>

                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Dec Target
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Dec Sales
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyMonth}`} style={{ minWidth: "125px" }}>
                      Dec Diff
                    </th>

                    <th className={`${Styles.month} ${Styles.stickyThirdLastColumnHeading}`} style={{ minWidth: "150px" }}>
                      Yearly Target
                    </th>
                    <th className={`${Styles.month} ${Styles.stickySecondLastColumnHeading}`} style={{ minWidth: "150px" }}>
                      Yearly Sales
                    </th>
                    <th className={`${Styles.month} ${Styles.stickyLastColumnHeading}`} style={{ minWidth: "150px" }}>
                      Yearly Diff
                    </th>
                  </tr>
                </thead>
                {allOrdersEmpty ? (
                  <div className={`${styles.NodataText} py-4 w-full lg:min-h-[300px] xl:min-h-[380px]`} key="no-data">
                    <p>No data found</p>
                  </div>
                ) : (
                  <tbody>
                    {filteredTargetData.map((element, index) => {
                      // if (!brandcount[element.ManufacturerName]) {
                      //     brandcount[element.ManufacturerName] = 0
                      // }
                      // brandcount[element.ManufacturerName] += Number(element.January.target)
                      monthTotalAmount.Jan.target += Number(element.January.target);
                      monthTotalAmount.Jan.sale += Number(element.January.sale);
                      monthTotalAmount.Jan.diff += Number(element.January.diff);
                      monthTotalAmount.Feb.target += Number(element.February.target);
                      monthTotalAmount.Feb.sale += Number(element.February.sale);
                      monthTotalAmount.Feb.diff += Number(element.February.diff);
                      monthTotalAmount.Mar.target += Number(element.March.target);
                      monthTotalAmount.Mar.sale += Number(element.March.sale);
                      monthTotalAmount.Mar.diff += Number(element.March.diff);
                      monthTotalAmount.Apr.target += Number(element.April.target);
                      monthTotalAmount.Apr.sale += Number(element.April.sale);
                      monthTotalAmount.Apr.diff += Number(element.April.diff);
                      monthTotalAmount.May.target += Number(element.May.target);
                      monthTotalAmount.May.sale += Number(element.May.sale);
                      monthTotalAmount.May.diff += Number(element.May.diff);
                      monthTotalAmount.Jun.target += Number(element.June.target);
                      monthTotalAmount.Jun.sale += Number(element.June.sale);
                      monthTotalAmount.Jun.diff += Number(element.June.diff);
                      monthTotalAmount.Jul.target += Number(element.July.target);
                      monthTotalAmount.Jul.sale += Number(element.July.sale);
                      monthTotalAmount.Jul.diff += Number(element.July.diff);
                      monthTotalAmount.Aug.target += Number(element.August.target);
                      monthTotalAmount.Aug.sale += Number(element.August.sale);
                      monthTotalAmount.Aug.diff += Number(element.August.diff);
                      monthTotalAmount.Sep.target += Number(element.September.target);
                      monthTotalAmount.Sep.sale += Number(element.September.sale);
                      monthTotalAmount.Sep.diff += Number(element.September.diff);
                      monthTotalAmount.Oct.target += Number(element.October.target);
                      monthTotalAmount.Oct.sale += Number(element.October.sale);
                      monthTotalAmount.Oct.diff += Number(element.October.diff);
                      monthTotalAmount.Nov.target += Number(element.November.target);
                      monthTotalAmount.Nov.sale += Number(element.November.sale);
                      monthTotalAmount.Nov.diff += Number(element.November.diff);
                      monthTotalAmount.Dec.target += Number(element.December.target);
                      monthTotalAmount.Dec.sale += Number(element.December.sale);
                      monthTotalAmount.Dec.diff += Number(element.December.diff);
                      monthTotalAmount.Total.target += Number(element.Total.target);
                      monthTotalAmount.Total.sale += Number(element.Total.sale);
                      monthTotalAmount.Total.diff += Number(element.Total.diff);
                      return (
                        <tr key={index}>
                          <td className={`${Styles.td} ${Styles.stickyFirstColumn}`}>{element?.SalesRepName}</td>
                          <td className={`${Styles.td} ${Styles.stickySecondColumn}`}>{element?.AccountName}</td>
                          <td className={`${Styles.td} ${Styles.stickyThirdColumn}`}>{element.ManufacturerName}</td>
                          <td className={`${Styles.td} ${Styles.stickyThirdColumn}`}>{element.Status}</td>
                          <td className={`${Styles.td} ${Styles.stickyThirdColumn}`}>{DateConvert(element?.DateOpen)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.January.target)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.January.sale)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.January.diff)}</td>

                          <td className={`${Styles.td}`}>${formentAcmount(element.February.target)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.February.sale)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.February.diff)}</td>

                          <td className={`${Styles.td}`}>${formentAcmount(element.March.target)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.March.sale)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.March.diff)}</td>

                          <td className={`${Styles.td}`}>${formentAcmount(element.April.target)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.April.sale)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.April.diff)}</td>

                          <td className={`${Styles.td}`}>${formentAcmount(element.May.target)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.May.sale)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.May.diff)}</td>

                          <td className={`${Styles.td}`}>${formentAcmount(element.June.target)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.June.sale)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.June.diff)}</td>

                          <td className={`${Styles.td}`}>${formentAcmount(element.July.target)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.July.sale)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.July.diff)}</td>

                          <td className={`${Styles.td}`}>${formentAcmount(element.August.target)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.August.sale)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.August.diff)}</td>

                          <td className={`${Styles.td}`}>${formentAcmount(element.September.target)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.September.sale)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.September.diff)}</td>

                          <td className={`${Styles.td}`}>${formentAcmount(element.October.target)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.October.sale)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.October.diff)}</td>

                          <td className={`${Styles.td}`}>${formentAcmount(element.November.target)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.November.sale)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.November.diff)}</td>

                          <td className={`${Styles.td}`}>${formentAcmount(element.December.target)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.December.sale)}</td>
                          <td className={`${Styles.td}`}>${formentAcmount(element.December.diff)}</td>

                          <td className={`${Styles.td} ${Styles.stickyThirdLastColumn}`}>${formentAcmount(element.Total.target)}</td>
                          <td className={`${Styles.td} ${Styles.stickySecondLastColumn}`}>${formentAcmount(element.Total.sale)}</td>
                          <td className={`${Styles.td} ${Styles.stickyLastColumn}`}>${formentAcmount(element.Total.diff)}</td>
                        </tr>
                      );
                    })}

                  </tbody>
                )}
                <tfoot>
                  <tr>
                    <td className={`${Styles.lastRow} ${Styles.stickyFirstColumn} ${Styles.stickyLastRow}`} colSpan={3}>
                      TOTAL
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`} >
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Jan.target)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Jan.sale)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Jan.diff)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Feb.target)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Feb.sale)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Feb.diff)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Mar.target)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Mar.sale)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Mar.diff)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Apr.target)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Apr.sale)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Apr.diff)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.May.target)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.May.sale)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.May.diff)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Jun.target)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Jun.sale)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Jun.diff)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Jul.target)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Jul.sale)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Jul.diff)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Aug.target)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Aug.sale)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Aug.diff)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Sep.target)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Sep.sale)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Sep.diff)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Oct.target)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Oct.sale)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Oct.diff)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Nov.target)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Nov.sale)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Nov.diff)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Dec.target)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Dec.sale)}
                    </td>
                    <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                      ${formentAcmount(monthTotalAmount.Dec.diff)}
                    </td>
                    <td className={`${Styles.lastRow} ${Styles.stickyLastRow} ${Styles.stickyThirdLastColumn}`}>
                      ${formentAcmount(monthTotalAmount.Total.target)}
                    </td>
                    <td className={`${Styles.lastRow} ${Styles.stickyLastRow} ${Styles.stickySecondLastColumn}`}>
                      ${formentAcmount(monthTotalAmount.Total.sale)}
                    </td>
                    <td className={`${Styles.lastRow} ${Styles.stickyLastRow} ${Styles.stickyLastColumn}`}>
                      ${formentAcmount(monthTotalAmount.Total.diff)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>
      )}
    </AppLayout>
  );
};
export default TargetReport;

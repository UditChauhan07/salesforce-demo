import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../components/AppLayout";
import Styles from "./index.module.css";
import { DateConvert, defaultLoadTime, GetAuthData, getRollOver, months, sortArrayHandler } from "../../lib/store";
import Loading from "../../components/Loading";
import { useManufacturer } from "../../api/useManufacturer";
import { FilterItem } from "../../components/FilterItem";
import FilterSearch from "../../components/FilterSearch";
import { MdOutlineDownload } from "react-icons/md";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import ModalPage from "../../components/Modal UI";
import styles from "../../components/Modal UI/Styles.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CloseButton, SearchIcon } from "../../lib/svg";
import { getPermissions } from "../../lib/permission";
import PermissionDenied from "../../components/PermissionDeniedPopUp/PermissionDenied";
import dataStore from "../../lib/dataStore";
import useBackgroundUpdater from "../../utilities/Hooks/useBackgroundUpdater";
import DynamicTable from "../../utilities/Hooks/DynamicTable";
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";
const TargetReport = () => {
    const [PageSize, setPageSize] = useState(100);
    const location = useLocation();
    const { state } = location || {};
    const { data: manufacturers } = useManufacturer();
    const [manufacturerList, setManufacturerList] = useState([]);
    useEffect(() => {
        dataStore.subscribe("/brands", (data) => setManufacturerList(data));
        if (manufacturers?.data?.length) {
            dataStore.updateData("/brands", manufacturers.data);
            setManufacturerList(manufacturers.data)
        }
        return () => dataStore.unsubscribe("/brands", (data) => setManufacturerList(data));
    }, [manufacturers?.data])
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
    const [hasPermission, setHasPermission] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    // let brandcount = {}
    // let sum = 0;
    const handleTargetReady = (data) => {

        if (data) {
            setIsLoaded(true);
        }
        let salesRep = [];
        data.list.map((tar) => {
            if (!salesRep.includes(tar.salesRepName)) {
                salesRep.push(tar.salesRepName);
            }
        });
        setSalesRepList(salesRep);
        setTarget(data);
    }
    const filteredTargetData = useMemo(() => {
        setCurrentPage(1);
        let filtered = target.list.filter((ele) => {
            if (!manufacturerFilter || !ele.ManufacturerId.localeCompare(manufacturerFilter)) {
                return ele;
            }
        });
        if (searchBy) {
            filtered = filtered.filter((item) => {
                if (item.AccountName?.toLowerCase().includes(searchBy?.toLowerCase())) {
                    return item;
                }
            });
        }
        if (searchSaleBy) {
            filtered = filtered.filter((item) => {
                if (item.salesRepName?.toLowerCase().match(searchSaleBy?.toLowerCase())?.length) {
                    // if (item.SalesRepName?.toLowerCase().includes(searchSaleBy?.toLowerCase())) {
                    return item;
                }
            });
        }
        filtered = filtered?.filter((item) => {
            if (activeAccounts === "Active Account") {
                if (item.Status === activeAccounts) {
                    return item;
                }
            } else if (activeAccounts === "All Account") {
                return item;
            }
        })
        return filtered;
    }, [manufacturerFilter, searchBy, searchSaleBy, activeAccounts, isLoaded]);

    const GetTargetData = () => {
        GetAuthData()
            .then((user) => {
                dataStore.getPageData("/Target-Report", () => getRollOver({ user, year, preOrder }))
                    .then((targetRes) => {
                        setCurrentPage(1);
                        handleTargetReady(targetRes)
                    })
                    .catch((targetErr) => {
                        console.error({ targetErr });
                    });
            })
            .catch((userErr) => {
                console.error({ userErr });
            });
    }
    console.log({ manufacturerFilter, searchSaleBy });

    useEffect(() => {
        dataStore.subscribe("/Target-Report", handleTargetReady)
        GetTargetData();
       
        setManufacturerFilter(target?.ownerPermission ? state?.manufacturerId : null);
        setSearchSaleBy(target?.ownerPermission ? state?.salesRepId : null);
        return () => {
            dataStore.unsubscribe("/Target-Report", handleTargetReady)
        }
    }, []);

    useBackgroundUpdater(GetTargetData, defaultLoadTime);


    const resetFilter = () => {
        setCurrentPage(1);
        setManufacturerFilter(null);
        setSearchBy("");
        setSearchSaleBy("");
        setActiveAccounts("Active Account");
        // setYear(currentDate.getFullYear());
        // setPreOrder(true);
        // sendApiCall();
    };
    const PriceDisplay = (value) => {
        return `$${Number(value).toFixed(2)}`;
    };
    const csvData = () => {
        let finalData = [];
        if (filteredTargetData.length) {
            filteredTargetData.map((target) => {
                let temp = {
                    SalesRepName: target.salesRepName,
                    AccountName: target.AccountName,
                    ManufacturerName: target.ManufacturerName,
                    DateOpen: target.DateOpen,
                    Status: target.Status,
                    JanuaryTarget: target.January.staticTarget,
                    JanuarySale: target.January.sales,
                    JanuaryDiff: target.January.staticTarget - target.January.sales,

                    FebruaryTarget: target.February.staticTarget,
                    FebruarySale: target.February.sales,
                    FebruaryDiff: target.February.staticTarget - target.February.sales,

                    MarchTarget: target.March.staticTarget,
                    MarchSale: target.March.sales,
                    MarchDiff: target.March.staticTarget - target.March.sales,

                    AprilTarget: target.April.staticTarget,
                    AprilSale: target.April.sales,
                    AprilDiff: target.April.staticTarget - target.April.sales,

                    MayTarget: target.May.staticTarget,
                    MaySale: target.May.sales,
                    MayDiff: target.May.staticTarget - target.May.sales,

                    JuneTarget: target.June.staticTarget,
                    JuneSale: target.June.sales,
                    JuneDiff: target.June.staticTarget - target.June.sales,

                    JulyTarget: target.July.staticTarget,
                    JulySale: target.July.sales,
                    JulyDiff: target.July.staticTarget - target.July.sales,

                    AugustTarget: target.August.staticTarget,
                    AugustSale: target.August.sales,
                    AugustDiff: target.August.staticTarget - target.August.sales,

                    SeptemberTarget: target.September.staticTarget,
                    SeptemberSale: target.September.sales,
                    SeptemberDiff: target.September.staticTarget - target.September.sales,

                    OctoberTarget: target.October.staticTarget,
                    OctoberSale: target.October.sales,
                    OctoberDiff: target.October.staticTarget - target.October.sales,

                    NovemberTarget: target.November.staticTarget,
                    NovemberSale: target.November.sales,
                    NovemberDiff: target.November.staticTarget - target.November.sales,

                    DecemberTarget: target.December.staticTarget,
                    DecemberSale: target.December.sales,
                    DecemberDiff: target.December.staticTarget - target.December.sales,

                    TotalTarget: target.Total.staticTarget,
                    TotalSale: target.Total.sales,
                    TotalDiff: target.Total.staticTarget - target.Total.sales,
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
            totalRow.JanuaryTarget += parseFloat(element.January.staticTarget);
            totalRow.JanuarySale += parseFloat(element.January.sales);
            totalRow.JanuaryDiff += parseFloat(element.January.staticTarget - element.January.sales);

            totalRow.FebruaryTarget += parseFloat(element.February.staticTarget);
            totalRow.FebruarySale += parseFloat(element.February.sales);
            totalRow.FebruaryDiff += parseFloat(element.February.staticTarget - element.February.sales);

            totalRow.MarchTarget += parseFloat(element.March.staticTarget);
            totalRow.MarchSale += parseFloat(element.March.sales);
            totalRow.MarchDiff += parseFloat(element.March.staticTarget - element.March.sales);

            totalRow.AprilTarget += parseFloat(element.April.staticTarget);
            totalRow.AprilSale += parseFloat(element.April.sales);
            totalRow.AprilDiff += parseFloat(element.April.staticTarget - element.April.sales);

            totalRow.MayTarget += parseFloat(element.May.staticTarget);
            totalRow.MaySale += parseFloat(element.May.sales);
            totalRow.MayDiff += parseFloat(element.May.staticTarget - element.May.sales);

            totalRow.JuneTarget += parseFloat(element.June.staticTarget);
            totalRow.JuneSale += parseFloat(element.June.sales);
            totalRow.JuneDiff += parseFloat(element.June.staticTarget - element.June.sales);

            totalRow.JulyTarget += parseFloat(element.July.staticTarget);
            totalRow.JulySale += parseFloat(element.July.sales);
            totalRow.JulyDiff += parseFloat(element.July.staticTarget - element.July.sales);

            totalRow.AugustTarget += parseFloat(element.August.staticTarget);
            totalRow.AugustSale += parseFloat(element.August.sales);
            totalRow.AugustDiff += parseFloat(element.August.staticTarget - element.August.sales);

            totalRow.SeptemberTarget += parseFloat(element.September.staticTarget);
            totalRow.SeptemberSale += parseFloat(element.September.sales);
            totalRow.SeptemberDiff += parseFloat(element.September.staticTarget - element.September.sales);

            totalRow.OctoberTarget += parseFloat(element.October.staticTarget);
            totalRow.OctoberSale += parseFloat(element.October.sales);
            totalRow.OctoberDiff += parseFloat(element.October.staticTarget - element.October.sales);

            totalRow.NovemberTarget += parseFloat(element.November.staticTarget);
            totalRow.NovemberSale += parseFloat(element.November.sales);
            totalRow.NovemberDiff += parseFloat(element.November.staticTarget - element.November.sales);

            totalRow.DecemberTarget += parseFloat(element.December.staticTarget);
            totalRow.DecemberSale += parseFloat(element.December.sales);
            totalRow.DecemberDiff += parseFloat(element.December.staticTarget - element.December.sales);


            // Repeat the same for other months and total columns
            // ...
            totalRow.TotalTarget += parseFloat(element.Total.staticTarget);
            totalRow.TotalSale += parseFloat(element.Total.sales);
            totalRow.TotalDiff += parseFloat(element.Total.staticTarget - element.Total.sales);
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

    // Fetch user data and permissions
    useEffect(() => {
        const fetchData = async () => {
            try {


                const userPermissions = await getPermissions();
                setPermissions(userPermissions)
                setHasPermission(userPermissions?.modules?.reports?.targetReport?.view);

                // If no permission, redirect to dashboard
                if (userPermissions?.modules?.reports?.targetReport?.view === false) {
                    PermissionDenied()
                    navigate("/dashboard");
                }

            } catch (error) {
                console.log({ error });
            }
        };

        fetchData();
    }, []);

    const { monthTotalAmount, Total } = useMemo(() => {
        const Total = {
            target: 0,
            sale: 0,
            diff: 0,
        };

        const monthTotalAmount = Object.fromEntries(
            months.map(month => [month, { target: 0, sale: 0, diff: 0 }])
        );

        filteredTargetData.forEach(item => {
            months.forEach(month => {
                const staticTarget = Number(item[month]?.staticTarget || 0);
                const sales = Number(item[month]?.sales || 0);
                const diff = staticTarget - sales;

                monthTotalAmount[month].target += staticTarget;
                monthTotalAmount[month].sale += sales;
                monthTotalAmount[month].diff += diff;

                Total.target += staticTarget;
                Total.sale += sales;
                Total.diff += diff;
            });
        });

        return { Total, monthTotalAmount };
    }, [filteredTargetData]);
    return (
        <AppLayout
            filterNodes={
                <>
                    <div className="d-flex justify-content-center gap-3" style={{ width: "99%" }}>
                        {target.ownerPermission && (
                            <FilterItem
                                minWidth="220px"
                                label="All Sales Rep"
                                value={searchSaleBy}
                                options={salesRepList.sort((a, b) => a.localeCompare(b)).sort((a, b) => a.localeCompare(b)).map((salerep) => ({
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
                            options={manufacturerList?.map((manufacturer) => ({
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
                        <FilterSearch onChange={(e) => setSearchBy(e.target.value)} value={searchBy} placeholder={"Search by account"} minWidth={"167px"} />
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
                    </div>


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
                <Loading height={"70vh"} />
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
                        <div className="" style={{ overflow: "auto", width: "100%" }}>
                            <DynamicTable mainData={sortArrayHandler(filteredTargetData, g => g.ManufacturerName)} head={<thead>
                                <tr>
                                    <th className={`${Styles.th} ${Styles.stickyFirstColumnHeading} `} style={{ minWidth: "170px" }}>
                                        Sales Rep
                                    </th>
                                    <th className={`${Styles.th} ${Styles.stickySecondColumnHeading}`} style={{ minWidth: "150px" }}>
                                        Account
                                    </th>
                                    <th className={`${Styles.th} ${Styles.stickyThirdColumnHeading}`} style={{ minWidth: "200px" }}>
                                        Brand
                                    </th>
                                    <th className={`${Styles.th} ${Styles.stickyMonth}`} style={{ minWidth: "200px" }}>
                                        Status
                                    </th>
                                    <th className={`${Styles.th} ${Styles.stickyMonth}`} style={{ minWidth: "200px" }}>
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
                            </thead>} foot={<tfoot>
                                <tr>
                                    <td className={`${Styles.lastRow} ${Styles.stickyFirstColumn} ${Styles.stickyLastRow}`}>
                                        TOTAL
                                    </td>
                                    <td className={`${Styles.lastRow}  ${Styles.stickySecondColumn}  ${Styles.stickyLastRow}`} >
                                    </td>
                                    <td className={`${Styles.lastRow}  ${Styles.stickyThirdColumn}  ${Styles.stickyLastRow}`} >
                                    </td>
                                    <td className={`${Styles.lastRow}  ${Styles.stickyFirstColumn}  ${Styles.stickyLastRow}`} >
                                    </td>
                                    <td className={`${Styles.lastRow}  ${Styles.stickyFirstColumn}  ${Styles.stickyLastRow}`} >
                                    </td>
                                    {months.map((month) => (
                                        <>
                                            <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                                                ${formentAcmount(monthTotalAmount?.[month]?.target)}
                                            </td>
                                            <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                                                ${formentAcmount(monthTotalAmount?.[month]?.sale)}
                                            </td>
                                            <td className={`${Styles.lastRow}  ${Styles.lastRowMonth}  ${Styles.stickyLastRow}`}>
                                                ${formentAcmount(monthTotalAmount?.[month]?.diff)}
                                            </td>
                                        </>
                                    ))}

                                    <td className={`${Styles.lastRow} ${Styles.stickyLastRow} ${Styles.stickyThirdLastColumn}`}>
                                        ${formentAcmount(Total.target)}
                                    </td>
                                    <td className={`${Styles.lastRow} ${Styles.stickyLastRow} ${Styles.stickySecondLastColumn}`}>
                                        ${formentAcmount(Total.sale)}
                                    </td>
                                    <td className={`${Styles.lastRow} ${Styles.stickyLastRow} ${Styles.stickyLastColumn}`}>
                                        ${formentAcmount(Total.diff)}
                                    </td>
                                </tr>
                            </tfoot>} id="salesReportTable" className="table table-responsive">

                                {(items) => allOrdersEmpty ? (
                                    <div className={`${styles.NodataText} py-4 w-full lg:min-h-[300px] xl:min-h-[380px]`} key="no-data">
                                        <p>No data found</p>
                                    </div>
                                ) : (
                                    <>
                                        <td className={`${Styles.td} ${Styles.stickyFirstColumn}`}>{items?.salesRepName}</td>
                                        <td className={`${Styles.td} ${Styles.stickySecondColumn}`}><Link style={{ color: '#000' }} to={'/store/' + items.AccountId}>{items?.AccountName}</Link></td>
                                        <td className={`${Styles.td} ${Styles.stickyThirdColumn}`}><Link to={'/Brand/' + items.ManufacturerId} style={{ color: '#000' }}>{items.ManufacturerName}</Link></td>
                                        <td className={`${Styles.td}`}>{items.Status}</td>
                                        <td className={`${Styles.td}`}>{DateConvert(items?.DateOpen)}</td>
                                        {months.map((month) => (
                                            <>
                                                <td className={`${Styles.td}`}>${formentAcmount(items?.[month]?.staticTarget)}
                                                    {/* {items?.[month]?.totalRoll ? (items?.[month]?.totalRoll > 0 ? <><br /><p className={Styles.calHolder}><small style={{ color: 'red' }}>{formentAcmount(items?.[month]?.totalRoll)}</small>+{formentAcmount(items?.[month]?.staticTarget)}</p></> : false ? <><br /><p className={Styles.calHolder}>{formentAcmount(items?.[month]?.staticTarget)}-<small style={{ color: 'green' }}>{formentAcmount(-items?.[month]?.totalRoll)}</small></p></> : null) : null} */}
                                                </td>
                                                <td className={`${Styles.td}`}>${formentAcmount(items?.[month]?.sales)}
                                                </td>
                                                <td className={`${Styles.td}`}>${items?.[month]?.staticTarget - items?.[month]?.sales >= 0 ? formentAcmount(items?.[month]?.staticTarget - items?.[month]?.sales) : <b style={{ color: 'green' }}>{formentAcmount(Math.abs(items?.[month]?.staticTarget - items?.[month]?.sales))}</b>}</td>
                                            </>
                                        ))}

                                        <td className={`${Styles.td} ${Styles.stickyThirdLastColumn}`}>${formentAcmount(items.Total.staticTarget)}</td>
                                        <td className={`${Styles.td} ${Styles.stickySecondLastColumn}`}>${formentAcmount(items.Total.sales)}</td>
                                        <td className={`${Styles.td} ${Styles.stickyLastColumn}`}>${formentAcmount(items.Total.staticTarget - items.Total.sales)}</td>
                                    </>
                                )}

                            </DynamicTable>
                        </div>
                    </div>
                </section>
            )}
        </AppLayout>
    );
};
export default TargetReport;

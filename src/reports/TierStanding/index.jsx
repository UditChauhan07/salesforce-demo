import { useEffect, useMemo, useState } from "react"
import { GetAuthData, admins, formatNumber, getTierReportHandler, } from "../../lib/store"
import Loading from "../../components/Loading";
import AppLayout from "../../components/AppLayout";
import Styles from "./index.module.css";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { MdOutlineDownload } from "react-icons/md";
import { LuArrowBigDownDash, LuArrowBigUpDash } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { BiDollar } from "react-icons/bi";
import MapGenerator from "../../components/Map";
import classNames from "classnames";
import { getPermissions } from "../../lib/permission";
import PermissionDenied from "../../components/PermissionDeniedPopUp/PermissionDenied";
import dataStore from "../../lib/dataStore";
import DynamicTable from "../../utilities/Hooks/DynamicTable";
const center = {
    lat: 38,
    lng: -97
};

const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";

const Tier = () => {
    const navigate = useNavigate();
    let date = new Date();
    let dYear = date.getFullYear();
    const [ext, setExt] = useState(false);
    const [permissions , setPermissions] = useState()
    const [year, setYear] = useState(dYear)
    const [tier, setTier] = useState({ isLoad: false, data: [], getSalesHolder: {}, currentYearRevenue: 0, previousYearRevenue: 0 });

    const TierReady = (data) => {
        if (data) {
            let currentYearRevenue = data?.salesArray.reduce((acc, curr) => acc + curr[year], 0);
            let previousYearRevenue = data?.salesArray.reduce((acc, curr) => acc + curr[year - 1], 0);
            setTier({ isLoad: true, data: data?.salesArray ?? [], getSalesHolder: data?.getSalesHolder ?? {}, currentYearRevenue, previousYearRevenue });
        }
    }
    useEffect(() => {
        // Fetch permissions when the component mounts
        const fetchData = async () => {
            try {
                const userPermissions = await getPermissions();
                setPermissions(userPermissions); // Set permissions once they are fetched
            } catch (error) {
                console.log("Permission Error:", error);
            }
        };
    
        fetchData();
    }, []); 
    
    useEffect(() => {
       
        if (memoizedPermissions?.modules?.reports?.accountTier?.view === false) {
            PermissionDenied(); 
            navigate('/dashboard'); 
        }

    }, [permissions]);
    const memoizedPermissions = useMemo(() => permissions, [permissions]);
    const GetDataHandler = () => {
        GetAuthData().then((user) => {
            if (memoizedPermissions?.modules?.godLevel) {
                dataStore.getPageData("/TierStanding", () => getTierReportHandler({ token: user.x_access_token, year: year })).then((res) => {
                    TierReady(res)

                }).catch((resErr) => {
                    console.log({ resErr });
                })
            } else {

            }
        })
    }
    useEffect(() => {
        dataStore.subscribe("/TierStanding", TierReady)
        GetDataHandler()
        return () => dataStore.unsubscribe("/TierStanding", TierReady)
    }, [permissions])
    //define marker
    const MarkLocations = useMemo(() => {
        let response = [];
        if (tier?.data?.length) {
            let markHelper = {};
            tier.data.map((item, index) => {
                // let address = `<b>Address:</b><p>${item.StoreStreet ? item.StoreStreet : ''} ${item.StoreCity ? ', ' + item.StoreCity + ',' : ''}</p><p>${item.StoreState ? item.StoreState : ''} ${item.StoreCountry ? ', ' + item.StoreCountry : ''} ${item.StoreZip ? item.StoreZip : ''}</p>`
                // if (item.location.lat && item.location.long) {
                //     response.push({
                //         Name: item.Name,
                //         Location: item.location,
                //         lat: item.location.lat, lng: item.location.long,
                //         StoreAddress: address,
                //         icon: `/assets/${item.Tier || 'E'}.png`,
                //         content: `${address}<br/><b>Brands:</b><p>${item.BrandName} &nbsp;${item.Tier}</p>`,
                //         tier: item.Tier ?? 'E'
                //     })
                // }
                // console.log({item});
                if (!markHelper[item.Id]) {
                    markHelper[item.Id] = {
                        Name: item.Name,
                        Location: item.location,
                        StoreAddress: `<b>Address:</b><p>${item.StoreStreet ? item.StoreStreet : ''} ${item.StoreCity ? ', ' + item.StoreCity + ',' : ''}</p><p>${item.StoreState ? item.StoreState : ''} ${item.StoreCountry ? ', ' + item.StoreCountry : ''} ${item.StoreZip ? item.StoreZip : ''}</p>`,
                        Brands: {}
                    }
                }
                if (!markHelper[item.Id].Brands?.[item.BrandId]) {
                    markHelper[item.Id].Brands[item.BrandId] = {}
                }
                markHelper[item.Id].Brands[item.BrandId].Name = item.BrandName
                markHelper[item.Id].Brands[item.BrandId].Tier = item.Tier ?? 5
            })
            console.log({ response });
            let accountIds = Object.keys(markHelper);
            if (accountIds.length) {
                accountIds.map((actId) => {
                    if (markHelper[actId]?.Brands && markHelper[actId].Location.lat && markHelper[actId].Location.long) {
                        let helper = {
                            title: markHelper[actId].Name,
                            lat: markHelper[actId].Location.lat, lng: markHelper[actId].Location.long,
                            content: null, icon: null
                        }
                        let brandids = Object.keys(markHelper[actId]?.Brands);
                        let brandStr = "";
                        if (brandids.length) {
                            brandids.map((brandId) => {
                                if (markHelper[actId]?.Brands[brandId]) {
                                    brandStr += `<p>${markHelper[actId]?.Brands[brandId].Name} &nbsp; ${markHelper[actId]?.Brands[brandId].Tier}</p>`
                                }
                            })
                        }
                        let address = markHelper[actId].StoreAddress
                        helper.icon = "/assets/" + 5 + ".png"
                        helper.content = brandStr != "" ? `${address}<br/><b>Brands:</b>${brandStr}` : address + brandStr
                        response.push(helper)
                    }
                })
            }
        }
        return response;
    }, [tier?.data])



    const excelExportHandler = () => {
        const ws = XLSX.utils.json_to_sheet(csvData());
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, `Account Tier & Standing Report ${new Date().toDateString()}` + fileExtension);
    }

    const csvData = () => {
        let csvData = []
        tier.data.map((item) => {
            csvData.push({
                "Account": item.Name,
                "Store Street": item.StoreStreet ?? "NA",
                "City": item.StoreCity ?? "NA",
                "State": item.StoreState ?? "NA",
                "State": item.StoreState ?? "NA",
                "Zip": item.StoreZip ?? "NA",
                "Brand": item.BrandName,
                "Sales Rep": item.SalesRepName,
                "2023 revenue total for all orders": item[2023],
                "2024 YTD for all orders": item[2024],
                "Existing Tier": item.Tier ?? "NA",
                "Suggested Tier": item.Suggested
            })
        })
        return csvData
    }

    const { isLoad, data, getSalesHolder, previousYearRevenue, currentYearRevenue } = tier
    const formentAcmount = (amount) => {
        return `${Number(amount).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`
    }

 
    

    return (
        <AppLayout
            filterNodes={
                <>

                    <button className="border px-2 d-grid py-1 leading-tight d-grid" onClick={excelExportHandler}>
                        <MdOutlineDownload size={16} className="m-auto" />
                        <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>export</small>
                    </button>

                </>}
        >
            <section>
                <div className={Styles.inorderflex}>
                    <div>
                        <h2>
                            Account Tier & Standing Report
                        </h2>
                    </div>
                    <div></div>
                </div>
                {isLoad && false && <div className="mt-2 mb-2 m-auto">
                    <div className={Styles.dFlex}>
                        <div className={Styles.cardMd}>
                            {getSalesHolder?.highest
                                &&
                                <div>
                                    {Object.keys(getSalesHolder?.highest).length ?
                                        <div className={Styles.dGrid}>
                                            <div className={Styles.subTitileHolder} style={{ margin: '10px 10px auto 0' }}>
                                                <img src="\assets\images\boxIcons\highest-graph.png" width={100} /></div>
                                            {Object.keys(getSalesHolder?.highest).map((key) => (
                                                getSalesHolder?.highest[key]?.Id &&
                                                <div className={`${Styles.cardHolder} max-w-[375px]`}>
                                                    <div className={Styles.badge}>
                                                        <LuArrowBigUpDash color="#fff" size={23} />
                                                        {key}
                                                    </div>
                                                    <div>
                                                        <p className={Styles.textHolder}>{getSalesHolder?.highest[key]?.Name}</p>
                                                        <h1 className={Styles.countHolder}>
                                                            <small style={{ fontSize: '11px' }}>Revenue</small>{" "}
                                                            ${formatNumber(getSalesHolder?.highest[key]?.value)}</h1>
                                                    </div>
                                                </div>
                                            ))}
                                        </div> : null}
                                </div>
                            }
                            {getSalesHolder?.lowest &&
                                <div >
                                    {Object.keys(getSalesHolder?.lowest).length ?
                                        <div className={Styles.dGrid}>
                                            <div className={Styles.subTitileHolder} style={{ margin: 'auto 0 10px 10px' }}><img src="\assets\images\boxIcons\lowest-graph.png" width={100} /></div>
                                            {Object.keys(getSalesHolder?.lowest).map((key) => (
                                                getSalesHolder?.lowest[key]?.Id &&
                                                <div className={`${Styles.cardHolder} max-w-[375px]`}>
                                                    <div className={Styles.badge}>
                                                        {key}
                                                        <LuArrowBigDownDash color="#fff" size={23} />
                                                    </div>

                                                    <div>
                                                        <p className={Styles.textHolder}>{getSalesHolder?.lowest[key]?.Name}</p>
                                                        <h1 className={Styles.countHolder}>
                                                            <small style={{ fontSize: '11px' }}>Revenue</small>{" "}
                                                            ${formatNumber(getSalesHolder?.lowest[key]?.value)}</h1>
                                                    </div>
                                                </div>
                                            ))}
                                        </div> : null}
                                </div>
                            }
                        </div>
                        <div className={Styles.cardBr}></div>
                        <div className={Styles.cardSd}>
                            <div className={`${Styles.inorderflex} mt-1 mb-2`}>
                                <h2 className="fs-6">Annual Revenue Summary</h2>
                            </div>
                            <div className={`${Styles.cardHolder} max-w-[375px] mt-2 mb-2`}>
                                <div className={Styles.badge}>
                                    <BiDollar color="#fff" size={23} />
                                </div>
                                <div>
                                    <p className={Styles.textHolder}>{year - 1}</p>
                                    <h1 className={Styles.countHolder}>
                                        {/* <small style={{ fontSize: '11px' }}>Revenue</small>{" "} */}
                                        ${formatNumber(previousYearRevenue)}</h1>
                                </div>
                            </div>
                            <div className={`${Styles.cardHolder} max-w-[375px]`}>
                                <div className={Styles.badge}>
                                    <BiDollar color="#fff" size={23} />
                                </div>
                                <div>
                                    <p className={Styles.textHolder}>{year}</p>
                                    <h1 className={Styles.countHolder}>
                                        {/* <small style={{ fontSize: '11px' }}>Revenue</small>{" "} */}
                                        ${formatNumber(currentYearRevenue)}</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
                {isLoad && true &&
                    <div className="mt-3 mb-3 m-auto">
                        <div className={Styles.mapHolder}>
                            <div className={Styles.mapContainer} style={ext ? { height: '65vh' } : {}}><MapGenerator focusOn={center} MarkLocations={MarkLocations} /></div>
                            <div className={Styles.extHolder} title={ext ? "Click to reduce height" : "click to enlarge height"} onClick={() => setExt(!ext)}> <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="29"
                                height="28"
                                viewBox="0 0 29 28"
                                fill="none"
                                className={classNames({
                                    "rotate-180": ext,
                                })}
                            >
                                <path d="M7.71484 10.8534L14.8098 17.7119L21.9048 10.8534" stroke="#403A35" strokeWidth={"2"} />
                            </svg></div></div>
                    </div>}
                <div className={`d-flex p-3 ${Styles.tableBoundary} mb-5`}>
                    <div className="" style={{ overflow: "auto", width: "100%" }}>
                        {isLoad ?
                            <DynamicTable mainData={data} head={<thead>
                                <th className={`${Styles.th} ${Styles.stickyFirstColumnHeading}`}>Account</th>
                                <th className={`${Styles.th} ${Styles.stickyMonth}`}>Store Street</th>
                                <th className={`${Styles.th} ${Styles.stickyMonth}`}>City</th>
                                <th className={`${Styles.th} ${Styles.stickyMonth}`}>State</th>
                                <th className={`${Styles.th} ${Styles.stickyMonth}`}>Zip</th>
                                <th className={`${Styles.th} ${Styles.stickyMonth}`}>Brand</th>
                                <th className={`${Styles.th} ${Styles.stickyMonth}`}>Sales Rep</th>
                                <th className={`${Styles.th} ${Styles.stickyMonth}`} style={{ width: '150px' }}>{year - 1} revenue</th>
                                <th className={`${Styles.th} ${Styles.stickyMonth}`} style={{ width: '150px' }}>{year} revenue</th>
                                <th className={`${Styles.th} ${Styles.stickySecondLastColumnHeading}`} style={{ width: '150px' }}>Existing Tier</th>
                                <th className={`${Styles.th} ${Styles.stickyLastColumnHeading}`} style={{ width: '150px' }}>Suggested Tier</th>
                            </thead>}>
                                {(item) => (
                                    <>
                                        <td className={`${Styles.td} ${Styles.stickyFirstColumn}`}>{item.Name}</td>
                                        <td className={`${Styles.td}`}>{item.StoreStreet ?? 'NA'}</td>
                                        <td className={`${Styles.td}`}>{item.StoreCity ?? 'NA'}</td>
                                        <td className={`${Styles.td}`}>{item.StoreState ?? 'NA'}</td>
                                        <td className={`${Styles.td}`}>{item.StoreZip ?? 'NA'}</td>
                                        <td className={`${Styles.td}`}>{item.BrandName}</td>
                                        <td className={`${Styles.td}`}>{item.SalesRepName}</td>
                                        <td className={`${Styles.td}`}>${formentAcmount(item[2023])}</td>
                                        <td className={`${Styles.td}`}>${formentAcmount(item[2024])}</td>
                                        <td className={`${Styles.td} ${Styles.stickySecondLastColumn}`}>{item.Tier ?? 'NA'}</td>
                                        <td className={`${Styles.td} ${Styles.stickyLastColumn}`}>{item.Suggested}</td>
                                    </>
                                )}
                            </DynamicTable>
                            : <Loading height={'50vh'} />}
                    </div>
                </div>
            </section>
        </AppLayout>
    )
}
export default Tier
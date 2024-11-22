import Styles from "./index.module.css";
import { DateConvert, GetAuthData, formatNumber, generateAuditTemplate, originAPi, salesRepIdKey } from "../../lib/store";
import { useState , useEffect , useMemo} from "react";
import Loading from "../Loading";
import OwlCarousel from "react-owl-carousel";
import { Link } from "react-router-dom";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import "bootstrap/dist/css/bootstrap.min.css";
import MapGenerator from "../Map";
import Chart from "react-apexcharts";
import { useNavigate } from "react-router-dom";

const StoreDetailCard = ({ account, brandList,memoizedPermissions={} }) => {
    const navigate = useNavigate();
  

    const totalCategories = account.Brands.map((value) => {
        return value?.ManufacturerName__c || "NA";
    })

    const totalSalesData = account.Brands.map((value) => {
        return parseFloat(value?.Sales?.Amount || 0).toFixed(2);
    })
    const totalPurcjaseData = account.Brands.map((value) => {
        return parseFloat(value?.Sales?.Retail || 0).toFixed(2);
    });

    const [startIndex, setStartIndex] = useState(0);
    const [maxVisibleCategories, setMaxVisibleCategories] = useState(4)
    let graph = {
        options: {
            chart: {
                type: 'bar',
                height: 350,
                stacked: false
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '50%',
                    endingShape: 'rounded',
                },
            },
            colors: ['#1E90FF', '#28A745'], // Blue and Green
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 4,
                colors: ['transparent'],
            },
            series: [{
                name: 'Target',
                data: [35, 70, 60, 90]
            }, {
                name: 'Achieved',
                data: [20, 60, 70, 80]
            }],
            xaxis: {
                categories: totalCategories.slice(startIndex, startIndex + maxVisibleCategories),
                labels: {
                    rotate: -27, // Slight rotation for better fit
                    style: {
                        fontSize: '10px', // Adjusted font size
                    },
                    trim: true, // Ensure no labels are trimmed
                },
                tickPlacement: 'on',
            },
            fill: {
                opacity: 1
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
            },
            title: {
                text: 'MTD Revenue by Brand',
                align: 'left',
                style: {
                    fontSize: '15px',
                    fontWeight: '700',
                    fontFamily: 'Montserrat-400',
                    lineHeight: '18.94px',
                    letterSpacing: '0.1em'
                }
            },
            tooltip: {
                enabled: true,
                custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                    return (
                        `<div style="background: #333; color: #fff; padding: 10px; border-radius: 8px;">
                      <strong>${w.globals.categoryLabels[dataPointIndex]}</strong>
                      <br />
                      <span style="color: ${w.globals.colors[seriesIndex]};">
                        ${w.globals.seriesNames[seriesIndex]}: <span style="color: #fff;">$${series[seriesIndex][dataPointIndex].toFixed(2)}</span>
                      </span>
                    </div>`
                    );
                }
            }
        },
        series: [
            {
                name: 'Target',
                data: totalPurcjaseData.slice(startIndex, startIndex + maxVisibleCategories)
            },
            {
                name: 'Achieved',
                data: totalSalesData.slice(startIndex, startIndex + maxVisibleCategories)
            }],
    }
    let [fileDownload, setLoader] = useState(false)

    const options = {
        loop: true,
        margin: 50,
        nav: true,
        dots: false,
        navText: [
            '<svg width="46" style="position: absolute; left: -6%; top: -25%;" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#filter0_d_3824_341)"><circle cx="23" cy="21" r="19" fill="white"/><circle cx="23" cy="21" r="18.75" stroke="#E1E1E1" stroke-width="0.5"/></g><path d="M26.454 27.9102L19.5449 21.0011L26.454 14.092" stroke="black"/><defs><filter id="filter0_d_3824_341" x="0" y="0" width="46" height="46" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="2"/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3824_341"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3824_341" result="shape"/></filter></defs></svg>',
            '<svg width="46" style="position: absolute; right: -6%; top: -25%;" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#filter0_d_3824_342)"><circle cx="23" cy="21" r="19" transform="rotate(-180 23 21)" fill="white"/><circle cx="23" cy="21" r="18.75" transform="rotate(-180 23 21)" stroke="#E1E1E1" stroke-width="0.5"/></g><path d="M19.546 14.0898L26.4551 20.9989L19.546 27.908" stroke="black"/><defs><filter id="filter0_d_3824_342" x="0" y="0" width="46" height="46" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="2"/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3824_342"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3824_342" result="shape"/></filter></defs></svg>',
        ],
        responsive: {
            0: {
                items: 1,
            },
            767: {
                items: 2,
            },
            1000: {
                items: 3,
            },
        },
    };

    const AuditHandler = (brandId, accountName, brandName) => {
        setLoader(true)
        GetAuthData().then((user) => {
            generateAuditTemplate({ key: user.x_access_token, Ids: JSON.stringify([account.Id]), brandId }).then((res) => {
                if (res) {
                    let account = Object.keys(res)
                    let brand = Object.keys(res[account[0]])
                    let url = res[account[0]][brand[0]];
                    const a = document.createElement('a');
                    var date_time = new Date();
                    a.href = originAPi + "/files" + url + '/Audit' + accountName.replaceAll("/","") + '`s ' + brandName + ' ' + date_time + '.pdf/index'
                    a.click();
                    setLoader(false)
                }
            }).catch((err) => {
                console.log({ err });
            })
        }).catch((userErr) => {
            console.log({ userErr });
        })
    }
    const orderHandler = (element) => {
        localStorage.setItem("Account", account.Name);
        localStorage.setItem("AccountId__c", account.Id);
        localStorage.setItem("address", JSON.stringify(account.ShippingAddress));
        localStorage.setItem("manufacturer", element.ManufacturerName__c);
        localStorage.setItem("ManufacturerId__c", element.ManufacturerId__c);
        localStorage.setItem(salesRepIdKey, element.Sales_Rep__c);
        localStorage.setItem("shippingMethod", JSON.stringify({ number: element.Shipping_Account_Number__c, method: element.Shipping_Method__c }));
        navigate(`/product`);
    }
    const doNothing = ()=>{}
    return (<section className={Styles.container}>
        {fileDownload ? <Loading height={'50vh'}/> :
            <div>
                <div className={`${Styles.accountHolder} ${Styles.dFlex} flex-column`}>
                    <div className={`d-flex w-[100%]`}>
                        <div className={Styles.accountTitleHolder}>
                            <p className={Styles.accountLabel}>ACCOUNT NAME</p>
                            <h3 className={Styles.accountNameHolder}>{account.Name}</h3>
                            {account.Website ? <Link to={account.Website} style={{ color: '#000' }} className={Styles.webLinkHolder}>{account.Website}</Link> : null}
                        </div>
                        <div className="d-flex w-[100%] justify-between pl-2 mt-3">
                            <div className="d-flex gap-4">
                                {account.ShippingCity ? <div className={`${Styles.addressHoilder} d-flex flex-column`}>
                                    <span className={Styles.labelHolder}>Store City</span>
                                    <span className={Styles.addCard}>{account.ShippingCity}</span></div> : null}
                                {account.ShippingState ? <div className={`${Styles.addressHoilder} d-flex flex-column`}>
                                    <span className={Styles.labelHolder}>Store State</span>
                                    <span className={Styles.addCard}>{account.ShippingState}</span></div> : null}
                                {account.Phone ? <div className={`${Styles.addressHoilder} d-flex flex-column`}>
                                    <span className={Styles.labelHolder}>Phone</span>
                                    <span className={Styles.addCard}>{account.Phone}</span></div> : null}
                            </div>
                            <div>
                                <p className={Styles.totalRevenueLinkHolder}>Total Revenue</p>
                                <p className={Styles.totalRevenueHolder}>${formatNumber(account.TotalSales || 0)}</p>
                            </div>
                        </div>
                    </div>
                    {account.Brands.length >= 3 ?
                        <div className="d-flex mt-4 min-h-[75px]">
                            <div className={`${Styles.infoHolder} d-flex`}>
                                <p className={Styles.accountDetailerLabel}>Account Details</p>
                                <p className={`${Styles.webLinkHolder} m-auto`}>More Info</p>
                            </div>
                            <div className={`${Styles.BrandInfoHolder} d-flex flex-column`}>
                                <p className={Styles.accountLabel}> {memoizedPermissions?.auditReport?.create ?"Brand Audit Report":"Brands"}</p>

                                <div className={`${Styles.brandContainer} d-flex justify-between`}>
                                    <OwlCarousel {...options} style={{ position: 'absolute', top: '45px', left: '5%', width: '90%' }}>
                                        {account.Brands.map((element, index) => (
                                            <p className={Styles.webLinkHolder} onClick={() => {memoizedPermissions?.auditReport?.specify ? AuditHandler(element.ManufacturerId__c, account.Name, element.ManufacturerName__c) : doNothing() }} style={{ textAlign: 'center', color: '#3296ED', textDecoration: 'underline', cursor: 'pointer' }} key={index}>{element.ManufacturerName__c}</p>
                                        ))}
                                    </OwlCarousel>
                                </div>
                            </div>
                        </div> : account.Brands.length ?
                            <div className="d-flex mt-4 min-h-[75px]">
                                <div className={`${Styles.infoHolder} d-flex`}>
                                    <p className={Styles.accountDetailerLabel}>Account Details</p>
                                    <p className={`${Styles.webLinkHolder} m-auto`}>More Info</p>
                                </div>
                                <div className={`${Styles.BrandInfoHolder} d-flex flex-column`}>
                                    <p className={Styles.accountLabel}>{memoizedPermissions?.auditReport?.create ? "Brand Audit Report":"Brands"}</p>

                                    <div className="m-auto d-flex">
                                        {account.Brands.length?account.Brands.map((element, index) => (
                                            <p className={Styles.webLinkHolder} onClick={() => {memoizedPermissions?.auditReport?.specify ? AuditHandler(element.ManufacturerId__c, account.Name, element.ManufacturerName__c):doNothing()}} style={{ textAlign: 'center', color: '#3296ED', textDecoration: 'underline', marginRight: '2rem' }} key={index}>{element.ManufacturerName__c}</p>
                                        )):null}
                                    </div>
                                </div>
                            </div>
                            : null}
                </div>
                {(memoizedPermissions?.order?.create && brandList.length)?
                <div className={`${Styles.detailsContainer} pb-4`} style={{ borderBottom: '1px solid #ccc' }}>
                    <h3 className={Styles.detailTitleHolder}>Order Now</h3>
                    {brandList.length<10 ?
                    <div className="d-flex mt-4 gap-4 m-auto">
                        {brandList.map((brand) => {
                            return <div key={brand.id} onClick={() => { orderHandler(brand) }} className={Styles.webLinkHolder} style={{ textAlign: 'center', color: '#3296ED', textDecoration: 'underline', cursor: 'pointer' }}  >{brand.ManufacturerName__c}</div>
                        })}
                    </div>:
                       <div className="d-flex mt-4 gap-4 m-auto">
                    <OwlCarousel {...options}>
                        {brandList.map((brand) => {
                            return <div key={brand.id} onClick={() => { orderHandler(brand) }} className={Styles.webLinkHolder} style={{ textAlign: 'center', color: '#3296ED', textDecoration: 'underline', cursor: 'pointer' }}  >{brand.ManufacturerName__c}</div>
                        })}
                    </OwlCarousel>
                    </div>
}
                </div>:null}
                <div className={Styles.detailsContainer}>
                    <h3 className={Styles.detailTitleHolder}>Details</h3>
                    <div className="d-flex mt-4">
                        <div className={`${Styles.accountNumberHolder}`}>
                            <span className={`${Styles.buttonHolder} ${account.Active_Closed__c == "Active Account" ? Styles.activeHolder : Styles.closeHolder}`}>Status: {account.Active_Closed__c == "Active Account" ? "Active" : "In-Active"}</span>
                            <h4 className={Styles.accountNumber}>{account.Estee_Lauder_Account_Number__c}</h4>
                            <p className={Styles.accountNumberTinyText}>Estee Launder Account Name</p>
                        </div>
                        <div className={`${Styles.dGrid} w-[80%]`}>
                            <div className={Styles.detailBox}>
                                <p className={Styles.labelHolder}>Account Owner:</p>
                                <p className={Styles.valueHolder}>{account.Owner?.Name ?? 'NA'}</p>
                            </div>
                            <div className={Styles.detailBox}>
                                <p className={Styles.labelHolder}>Account Name:</p>
                                <p className={Styles.valueHolder}>{account.Name}</p>
                            </div>
                            <div className={Styles.detailBox}>
                                <p className={Styles.labelHolder}>Type of Business:</p>
                                <p className={Styles.valueHolder}>{account.Type_of_Business__c ?? 'NA'}</p>
                            </div>
                            <div className={Styles.detailBox}>
                                <p className={Styles.labelHolder}>Number of Order Placed:</p>
                                <p className={Styles.valueHolder} style={{ marginTop: '20px' }}>{account.TotalSaleCount ?? 0}</p>
                            </div>
                            <div className={Styles.detailBox}>
                                <p className={Styles.labelHolder}>Date Account Est. with BFSG:</p>
                                <p className={Styles.valueHolder} style={{ marginTop: '20px' }}>{DateConvert(account.Date_account_established_with_BFSG__c || null, true) ?? 'NA'}</p>
                            </div>
                            <div className={Styles.detailBox}>
                                <p className={Styles.labelHolder}>Address:</p>
                                <p className={Styles.valueHolder}>{account.ShippingAddress?.street},{account.ShippingAddress.city},<br />{account.ShippingAddress.state} {account.ShippingAddress.postalCode}<br /> {account.ShippingAddress.country}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`${Styles.detailsContainer} d-flex`}>
                    <div className={`${Styles.mapContainer} w-[50%]`}>
                        <h3 className={Styles.detailTitleHolder}>Store Addressed</h3>
                        <div className={`${Styles.mapHolder} mt-4`}>
                            <MapGenerator focusOn={{ lat: account.ShippingLatitude, lng: account.ShippingLongitude }} MarkLocations={[{ lat: account.ShippingLatitude, lng: account.ShippingLongitude }]} zoom={12} icon={false} />
                            <div className="d-flex mt-3">
                                <div className="w-[50%]">
                                    <p className={Styles.subTitleHolder}>Shipping Address</p>
                                    <p className={Styles.addressLabelHolder} style={{ color: '#3296ED' }}>{account.ShippingAddress?.street}{account.ShippingAddress?.street ? ',' : ""}{account.ShippingAddress.city}{account.ShippingAddress?.city ? <>,<br /></> : ""}{account.ShippingAddress.state},{account.ShippingAddress.postalCode}<br /> {account.ShippingAddress.country}</p>
                                </div>
                                <div className="w-[50%]">
                                    <p className={Styles.subTitleHolder}>Billing Address</p>
                                    <p className={Styles.addressLabelHolder} style={{ color: '#3296ED' }}>{account.BillingAddress?.street},{account.BillingAddress.city},<br />{account.BillingAddress.state},{account.BillingAddress.postalCode}<br /> {account.BillingAddress.country}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-[50%]">
                        <h3 className={`${Styles.detailTitleHolder} ml-4`}>Chart</h3>
                        <div>
                            <Chart options={graph.options} series={graph.series} type="bar" width={'100%'} height={320} />
                            {totalCategories.length>4?<div className="d-flex gap-2 justify-end">
                                {startIndex != 0 ? <svg onClick={() => { setStartIndex(startIndex - 1) }} width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#filter0_d_3824_341)"><circle cx="23" cy="21" r="19" fill="white" /><circle cx="23" cy="21" r="18.75" stroke="#E1E1E1" stroke-width="0.5" /></g><path d="M26.454 27.9102L19.5449 21.0011L26.454 14.092" stroke="black" /><defs><filter id="filter0_d_3824_341" x="0" y="0" width="46" height="46" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix" /><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" /><feOffset dy="2" /><feGaussianBlur stdDeviation="2" /><feComposite in2="hardAlpha" operator="out" /><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" /><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3824_341" /><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3824_341" result="shape" /></filter></defs></svg> : <div style={{ width: '46px', height: '46px' }} />}
                                {startIndex != totalCategories.length - 4 ? <svg onClick={() => { setStartIndex(startIndex + 1) }} width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#filter0_d_3824_342)"><circle cx="23" cy="21" r="19" transform="rotate(-180 23 21)" fill="white" /><circle cx="23" cy="21" r="18.75" transform="rotate(-180 23 21)" stroke="#E1E1E1" stroke-width="0.5" /></g><path d="M19.546 14.0898L26.4551 20.9989L19.546 27.908" stroke="black" /><defs><filter id="filter0_d_3824_342" x="0" y="0" width="46" height="46" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix" /><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" /><feOffset dy="2" /><feGaussianBlur stdDeviation="2" /><feComposite in2="hardAlpha" operator="out" /><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" /><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3824_342" /><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3824_342" result="shape" /></filter></defs></svg> : <div style={{ width: '46px', height: '46px' }} />}
                            </div>:null}
                        </div>
                    </div>
                </div>
            </div>
        }
    </section>)
}
export default StoreDetailCard;
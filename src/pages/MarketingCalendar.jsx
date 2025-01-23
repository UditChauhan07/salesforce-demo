import React, { useEffect, useState, useMemo } from "react";
import AppLayout from "../components/AppLayout";
import LaunchCalendar from "../components/LaunchCalendar/LaunchCalendar";
import { FilterItem } from "../components/FilterItem";
import { MdOutlineDownload } from "react-icons/md";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { CloseButton } from "../lib/svg";
import { defaultLoadTime, GetAuthData, getMarketingCalendar, getMarketingCalendarPDF, getMarketingCalendarPDFV2, getMarketingCalendarPDFV3, originAPi } from "../lib/store";
import Loading from "../components/Loading";
import { useManufacturer } from "../api/useManufacturer";
import { getPermissions } from "../lib/permission";
import { useNavigate } from "react-router-dom";
import PermissionDenied from "../components/PermissionDeniedPopUp/PermissionDenied";
import ModalPage from "../components/Modal UI";
import styles from "../components/Modal UI/Styles.module.css";
import dataStore from "../lib/dataStore";
import useBackgroundUpdater from "../utilities/Hooks/useBackgroundUpdater";

const fileExtension = ".xlsx";
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MarketingCalendar = () => {
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
  const [isAlert, setIsAlert] = useState(false);
  let date = new Date();
  // const [isLoading, setIsLoading] = useState(true);
  const [brand, setBrand] = useState(null);
  const [isLoaded, setIsloaed] = useState(false);
  const [isPDFLoaded, setPDFIsloaed] = useState(false);
  const [productList, setProductList] = useState([]);
  const navigate = useNavigate();
  const [selectYear, setSelectYear] = useState()
  const [month, setMonth] = useState("");
  const currentYear = new Date().getFullYear();
  const yearList = useMemo(() => {
    return [
      {value: currentYear - 1, label: currentYear - 1} , 
      { value: currentYear, label: currentYear },
      { value: currentYear + 1, label: currentYear + 1 },
    ];
  }, []);

  const months = useMemo(
    () => [
      { value: null, label: "All" },
      ...monthNames.map((m, i) => ({ value: m.toUpperCase(), label: m.toUpperCase() })),
      { value: "TBD", label: "TBD" },
    ],
    []
  );
  // const readyCalenderHandle = (data) => {
  //   setProductList(data)
  //   setIsloaed(true)
  // }

  // const readyCalendarHandle = (data) => {
  //   setProductList(data);
  //   setIsloaed(true);
  // };
  // const fetchData = async () => {
  //   setIsloaed(false);
  //   try {
  //     const user = await GetAuthData();
  //     dataStore.subscribe(`/marketing-calendar${selectYear}`, readyCalendarHandle);
  //     let res =await dataStore.getPageData(
  //       `/marketing-calendar${selectYear}`,
  //       () => getMarketingCalendar({ key: user.x_access_token, year: selectYear })
  //     );
  //     if(res){
  //       readyCalendarHandle(res);
  //     }

  //   } catch (error) {
  //     console.error("Data Fetch Error", error);
  //   }
  // };
  // useEffect(()=>{
  //   setSelectYear(date.getFullYear());
  // },[])
  // useEffect(() => {
  //   fetchData();
  //   setTimeout(() => {
  //     let getMonth = new Date().getMonth();
  //     var element = document.getElementById(monthNames[getMonth]);
  //     if (element && selectYear == date.getFullYear()) {
  //       element.scrollIntoView({ behavior: "smooth", block: "center" });
  //     }
  //   }, 3000);
  //   return () => dataStore.unsubscribe(`/marketing-calendar${selectYear}`, readyCalendarHandle);
  // }, [selectYear]);

  const readyCalendarHandle = (data) => {
    setProductList(data);
    setIsloaed(true);
  };

  const fetchData = async () => {
    setIsloaed(false);
    try {
      const user = await GetAuthData();
      // Subscribe to the data store for the selected year
      dataStore.subscribe(`/marketing-calendar${selectYear??currentYear}`, readyCalendarHandle);

      // Fetch data from API
      const res = await dataStore.getPageData(
        `/marketing-calendar${selectYear??currentYear}`,
        () => getMarketingCalendar({ key: user.x_access_token, year: selectYear })
      );

      // If response is received, update the product list
      if (res) {
        readyCalendarHandle(res);
      }
    } catch (error) {
      console.error("Data Fetch Error", error);
    }
  };

  useEffect(() => {
    // Fetch data when the component mounts
    fetchData();

    // Scroll to the current month after a delay
    const timeoutId = setTimeout(() => {
      const getMonth = new Date().getMonth();
      const element = document.getElementById(monthNames[getMonth]);
      if (element && selectYear === new Date().getFullYear()) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 3000);

    // Cleanup subscription on unmount
    return () => {
      dataStore.unsubscribe(`/marketing-calendar${selectYear??currentYear}`, readyCalendarHandle);
      clearTimeout(timeoutId);
    };
  }, [selectYear]); // Fetch data whenever selectYear changes

  const handleYearChange = (newYear) => {
    setSelectYear(newYear); // Update the selected year
  };

  useBackgroundUpdater(fetchData, defaultLoadTime);


  const generatePdfServerSide = (version = 0) => {
    setPDFIsloaed(true);
    GetAuthData().then((user) => {
      let manufacturerId = brand ?? null;
      if (manufacturerId) {
        if (version == 1) {
          getMarketingCalendarPDFV2({ key: user.x_access_token, manufacturerId, month, year: selectYear }).then((file) => {
            if (file) {
              const a = document.createElement('a');
              a.href = originAPi + "/download/" + file + "/1/index";
              // a.target = '_blank'
              setPDFIsloaed(false);
              a.click();
            } else {
              const a = document.createElement('a');
              a.href = originAPi + "/download/blank.pdf/1/index";
              // a.target = '_blank'
              setPDFIsloaed(false);
              a.click();
            }
          }).catch((pdfErr) => {
            console.log({ pdfErr });
          })
        } else if (version == 2) {
          getMarketingCalendarPDFV3({ key: user.x_access_token, manufacturerId, month, year: selectYear }).then((file) => {
            if (file) {
              const a = document.createElement('a');
              a.href = originAPi + "/download/" + file + "/1/index";
              // a.target = '_blank'
              setPDFIsloaed(false);
              a.click();
            } else {
              const a = document.createElement('a');
              a.href = originAPi + "/download/blank.pdf/1/index";
              // a.target = '_blank'
              setPDFIsloaed(false);
              a.click();
            }
          }).catch((pdfErr) => {
            console.log({ pdfErr });
          })
        }
        else {
          getMarketingCalendarPDF({ key: user.x_access_token, manufacturerId, month, year: selectYear }).then((file) => {
            if (file) {
              const a = document.createElement('a');
              a.href = originAPi + "/download/" + file + "/1/index";
              // a.target = '_blank'
              setPDFIsloaed(false);
              a.click();
            } else {
              const a = document.createElement('a');
              a.href = originAPi + "/download/blank.pdf/1/index";
              // a.target = '_blank'
              setPDFIsloaed(false);
              a.click();
            }
          }).catch((pdfErr) => {
            console.log({ pdfErr });
          })
        }
      } else {
        setIsAlert(true);
        setPDFIsloaed(false);
      }
    }).catch((userErr) => {
      console.log({ userErr });
    })
  }

  const generateXLSX = () => {
    // Step 1: Filter the product list based on selected brand and month
    const filteredProductList = productList.map((monthData) => {
      // Check if content is available for the month
      if (!monthData.content || !monthData.content.length) return null;

      const filteredContent = monthData.content.filter((item) => {
        const itemBrand = item.ManufacturerId__c;

        // Check for brand and month match
        const brandMatch = brand ? itemBrand === brand : true;
        return brandMatch;
      });

      // Return the filtered content with month information
      return filteredContent.length > 0 ? { ...monthData, content: filteredContent } : null;
    }).filter(monthData => month ? monthData?.month?.toUpperCase() === month : true);


    exportToExcel({ list: filteredProductList });
  };

  // Modified csvData function to map filtered data to proper Excel format
  const csvData = ({ data }) => {
    let finalData = [];
    data.forEach((monthData) => {
      monthData?.content.forEach((item) => {
        let temp = {};
        temp["MC Month"] = monthData.month;
        temp["Product Title"] = item.Name;
        temp["Product Description"] = item.Description;
        temp["Product Size"] = item.Size_Volume_Weight__c;
        temp["Product Ship Date"] = item.Ship_Date__c
          ? `${item.Ship_Date__c.split("-")[2] === '15' ? 'TBD' : item.Ship_Date__c.split("-")[2]}/${monthNames[parseInt(item.Ship_Date__c.split("-")[1], 10) - 1].toUpperCase()}/${item.Ship_Date__c.split("-")[0]}`
          : 'NA';
        temp["OCD Date"] = item.Launch_Date__c
          ? `${item.Launch_Date__c.split("-")[2]}/${monthNames[parseInt(item.Launch_Date__c.split("-")[1], 10) - 1].toUpperCase()}/${item.Launch_Date__c.split("-")[0]}`
          : 'NA';
        temp["Product Brand"] = item.ManufacturerName__c;
        temp["Product Price"] = item.usdRetail__c;
        finalData.push(temp);
      });
    });
    return finalData;
  };

  // Modified exportToExcel function to handle filtered list
  const exportToExcel = ({ list }) => {
    const ws = XLSX.utils.json_to_sheet(csvData({ data: list }));
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    let filename = `Marketing Calendar`;
    if (brand) {
      filename += ` - ${brand?.label}`;
    }
    FileSaver.saveAs(data, `${filename} ${new Date().toISOString()}` + fileExtension);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userPermissions = await getPermissions()
        if (userPermissions?.modules?.marketingCalender?.view === false) { PermissionDenied(); navigate('/dashboard'); }
      } catch (error) {
        console.log("Permission Error", error)
      }
    }
    fetchData()
  }, [])


  return (
    <AppLayout
      filterNodes={
        <>
          <FilterItem
            label= {new Date().getFullYear()}
            name={new Date().getFullYear()}
            value={selectYear}
            options={yearList}
            onChange={handleYearChange}
          />
          <FilterItem
            minWidth="220px"
            label="All Brands"
            name="All-Brand"
            value={brand}
            options={manufacturerList?.map((manufacturer) => ({
              label: manufacturer.Name,
              value: manufacturer.Id,
            }))}
            onChange={(value) => {
              setBrand(value);
            }}
          />
          <FilterItem
            minWidth="220px"
            label="JAN-DEC"
            name="JAN-DEC"
            value={month}
            options={months}
            onChange={(value) => {
              setMonth(value);
            }}
          />
          <button
            className="border px-2 py-1 leading-tight d-grid"
            onClick={() => {
              setBrand("");
              setMonth(null);
              setPDFIsloaed(false);
              setSelectYear(date.getFullYear())
            }}
          >
            <CloseButton crossFill={'#fff'} height={20} width={20} />
            <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>clear</small>
          </button>
          <div
            className="dropdown dropdown-toggle border px-2 py-1 leading-tight d-flex"
          >
            <div className=" d-grid" role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false">
              <MdOutlineDownload size={16} className="m-auto" />
              <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Download</small>
            </div>
            <ul className="dropdown-menu">
              <li>
                <div className="dropdown-item text-start" style={{ cursor: 'pointer' }} onClick={() => generatePdfServerSide()}>
                  &nbsp;Pdf
                </div>
              </li>
              <li>
                <div className="dropdown-item text-start" style={{ cursor: 'pointer' }} onClick={() => generatePdfServerSide(1)}>
                  &nbsp;PDF Quickview 1
                </div>
              </li>
              <li>
                <div className="dropdown-item text-start" style={{ cursor: 'pointer' }} onClick={() => generatePdfServerSide(2)}>
                  &nbsp;PDF Quickview 2
                </div>
              </li>
              <li>
                <div className="dropdown-item text-start" style={{ cursor: 'pointer' }} onClick={() => generateXLSX()}>
                  &nbsp;XLSX
                </div>
              </li>
            </ul>
          </div>


        </>
      }
    >
      <ModalPage
        open={isAlert}
        content={
          <div className="d-flex flex-column gap-3 ">
            <h2>Internal Server Error</h2>
            <p className="modalContent">
              <b>We apologize</b>, Currently the Server is unable to Take the load of Full Marketing Calendar including all brands.<br /><br />

              Kindly select 1 brand at time and try to download again.
            </p>
            <div className="d-flex justify-content-around ">
              <button className={styles.modalButton} onClick={() => setIsAlert(false)}>
                Go Back
              </button>
            </div>
          </div>
        }
        onClose={() => setIsAlert(false)} />
      {isPDFLoaded ? <div><img src="https://i.giphy.com/7jtU9sxHNLZuv8HZCa.webp" style={{ margin: 'auto', mixBlendMode: 'luminosity' }} width="480" height="480" /><p className="text-center mt-2">{`Generating PDF`}</p></div> :
        isLoaded ? <LaunchCalendar brand={brand} month={month} productList={productList} /> : <Loading height={'50vh'} />}

    </AppLayout>
  );
};

export default MarketingCalendar;
import React, { useEffect, useState, useMemo } from "react";
import AppLayout from "../components/AppLayout";
import LaunchCalendar from "../components/LaunchCalendar/LaunchCalendar";
import { FilterItem } from "../components/FilterItem";
import html2pdf from "html2pdf.js";
import { MdOutlineDownload } from "react-icons/md";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { CloseButton } from "../lib/svg";
import { GetAuthData, getMarketingCalendar, getMarketingCalendarPDF, getMarketingCalendarPDFV2, getMarketingCalendarPDFV3, originAPi } from "../lib/store";
import Loading from "../components/Loading";
import { useManufacturer } from "../api/useManufacturer";
import { getPermissions } from "../lib/permission";
import { useNavigate } from "react-router-dom";
import PermissionDenied from "../components/PermissionDeniedPopUp/PermissionDenied";

const fileExtension = ".xlsx";
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MarketingCalendar = () => {
  let date = new Date();
  // const [isLoading, setIsLoading] = useState(true);
  const [brand, setBrand] = useState(null);
  const [isLoaded, setIsloaed] = useState(false);
  const [isPDFLoaded, setPDFIsloaed] = useState(false);
  const [pdfLoadingText, setPdfLoadingText] = useState(".");
  const [productList, setProductList] = useState([]);
  const navigate = useNavigate();
  const [selectYear, setSelectYear] = useState(date.getFullYear())
  let yearList = [
    { value: date.getFullYear(), label: date.getFullYear() },
    { value: date.getFullYear()+1, label: date.getFullYear()+1 }
  ]
  let brands = [
    { value: null, label: "All" },
    { value: "AERIN", label: "AERIN" },
    { value: "ARAMIS", label: "ARAMIS" },
    { value: "Bobbi Brown", label: "Bobbi Brown" },
    { value: "Bumble and Bumble", label: "Bumble and Bumble" },
    { value: "BY TERRY", label: "BY TERRY" },
    { value: "Byredo", label: "Byredo" },
    { value: "Diptyque", label: "Diptyque" },
    { value: "ESTEE LAUDER", label: "ESTEE LAUDER" },
    { value: "Kevyn Aucoin Cosmetics", label: "Kevyn Aucoin Cosmetics" },
    { value: "LOccitane", label: "L'Occitane" },
    { value: "Maison Margiela", label: "Maison Margiela" },
    { value: "Re-Nutriv", label: "Re-Nutriv" },
    { value: "ReVive", label: "ReVive" },
    { value: "RMS Beauty", label: "RMS Beauty" },
    { value: "Smashbox", label: "Smashbox" },
    { value: "Victoria Beckham Beauty", label: "Victoria Beckham Beauty" },
  ];

  useEffect(() => {
    setIsloaed(false)
    GetAuthData().then((user) => {
      
      getMarketingCalendar({ key: user.x_access_token,year:selectYear }).then((productRes) => {        
        setProductList(productRes)
        setIsloaed(true)
        setTimeout(() => {

          let getMonth = new Date().getMonth();
          var element = document.getElementById(monthNames[getMonth]);
          if (element && selectYear == date.getFullYear()) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 2000);
      }).catch((err) => console.log({ err }))
    }).catch((e) => console.log({ e }))
  }, [selectYear])
  const [month, setMonth] = useState("");
  let months = [
    { value: null, label: "All" },
    { value: "JAN", label: "JAN" },
    { value: "FEB", label: "FEB" },
    { value: "MAR", label: "MAR" },
    { value: "APR", label: "APR" },
    { value: "MAY", label: "MAY" },
    { value: "JUN", label: "JUN" },
    { value: "JUL", label: "JUL" },
    { value: "AUG", label: "AUG" },
    { value: "SEP", label: "SEP" },
    { value: "OCT", label: "OCT" },
    { value: "NOV", label: "NOV" },
    { value: "DEC", label: "DEC" },
    { value: "TBD", label: "TBD" },
  ];
  const generatePdf = () => {
    const element = document.getElementById('CalenerContainer'); // The HTML element you want to convert
    // element.style.padding = "10px"
    let filename = `Marketing Calender `;
    if (brand) {
      filename = brand + " "
    }
    filename += new Date();
    const opt = {
      margin: 1,
      filename: filename + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      // jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };
  // .............

  const LoadingEffect = () => {
    const intervalId = setInterval(() => {
      if (pdfLoadingText.length > 6) {
        setPdfLoadingText('.');
      } else {
        setPdfLoadingText(prev => prev + '.');
      }
      if (pdfLoadingText.length > 12) {
        setPdfLoadingText('');
      }
    }, 1000);
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 10000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }

  const { data: manufacturers } = useManufacturer();
  const generatePdfServerSide = (version = 0) => {
    setPDFIsloaed(true);
    LoadingEffect();
    GetAuthData().then((user) => {
      let manufacturerId = null;
      manufacturers.data.filter(item => { if (item?.Name?.toLowerCase() == brand?.toLowerCase()) { manufacturerId = item.Id } })
      if (version == 1) {
        getMarketingCalendarPDFV2({ key: user.x_access_token, manufacturerId, month,year:selectYear }).then((file) => {
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
        getMarketingCalendarPDFV3({ key: user.x_access_token, manufacturerId, month,year:selectYear }).then((file) => {
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
        getMarketingCalendarPDF({ key: user.x_access_token, manufacturerId, month,year:selectYear }).then((file) => {
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
        const itemBrand = item.ManufacturerName__c;

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
      monthData.content.forEach((item) => {
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
      filename += ` - ${brand}`;
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
            label="year"
            name="Year"
            value={selectYear}
            options={yearList}
            onChange={(value) => setSelectYear(value)}
          />
          <FilterItem
            minWidth="220px"
            label="All Brands"
            name="All-Brand"
            value={brand}
            options={brands}
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
      {isPDFLoaded ? <div><img src="https://i.giphy.com/7jtU9sxHNLZuv8HZCa.webp" style={{ margin: 'auto', mixBlendMode: 'luminosity' }} width="480" height="480" /><p className="text-center mt-2">{`Generating PDF`}</p></div> :
        isLoaded ? <LaunchCalendar brand={brand} month={month} productList={productList} /> : <Loading height={'50vh'} />}

    </AppLayout>
  );
};

export default MarketingCalendar;

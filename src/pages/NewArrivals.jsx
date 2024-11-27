import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import Loading from "../components/Loading";
import NewArrivalsPage from "../components/NewArrivalsPage/NewArrivalsPage";
import { FilterItem } from "../components/FilterItem";
import { CloseButton } from "../lib/svg";
import { defaultLoadTime, fetchAccountDetails, GetAuthData, getMarketingCalendar } from "../lib/store";
import { useNavigate } from "react-router-dom";
import { getPermissions } from "../lib/permission";
import { originAPi } from "../lib/store";
import axios from "axios";
import PermissionDenied from "../components/PermissionDeniedPopUp/PermissionDenied";
import dataStore from "../lib/dataStore";
import { useManufacturer } from "../api/useManufacturer";
import useBackgroundUpdater from "../utilities/Hooks/useBackgroundUpdater";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const currentYear = new Date().getFullYear();
const yearList = [
  { value: currentYear, label: currentYear },
  { value: currentYear + 1, label: currentYear + 1 }
];
const months = monthNames.map((month, index) => ({ value: month.toUpperCase(), label: month.toUpperCase() }));

const NewArrivals = () => {
  const { data: manufacturers } = useManufacturer();
  const navigate = useNavigate();

  const [accountDetails, setAccountDetails] = useState(null);
  const [productList, setProductList] = useState([]);
  const [brand, setBrand] = useState(null);
  const [month, setMonth] = useState(months[new Date().getMonth()].value);
  const [isLoaded, setIsLoaded] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const [selectYear, setSelectYear] = useState(currentYear);

  // Fetch account details
  // const fetchAccountDetails = async () => {
  //   try {
  //     const { Sales_Rep__c: salesRepId, x_access_token: accessToken } = await GetAuthData();
  //     const { data } = await dataStore.getPageData(
  //       `actBndRelated${salesRepId}`,
  //       () =>
  //         axios.post(`${originAPi}/beauty/v3/23n38hhduu`, {
  //           salesRepId,
  //           accessToken
  //         })
  //     );
  //     setAccountDetails(data.accountDetails);
  //   } catch (error) {
  //     console.error("Error fetching account details:", error);
  //   }
  // };

  // Fetch marketing calendar data
  const fetchCalendarData = async (year = selectYear) => {
    setIsLoaded(false);
  
    // Handle no data for 2025 explicitly
    if (year === 2025) {
      setProductList([]); // Clear product list
      setIsLoaded(true); // Mark as loaded to skip the loading spinner
      return; // Exit early as no API call is needed
    }
  
    try {
      const user = await GetAuthData();
      const productRes = await dataStore.getPageData(
        `/marketing-calendar${year}`,
        () => getMarketingCalendar({ key: user.x_access_token, year })
      );
      processCalendarData(productRes);
    } catch (err) {
      console.error("Error fetching calendar data:", err);
    }
  };
  

  // Process and format calendar data
  const processCalendarData = (data) => {
    const formattedData = data?.map((month) => {
      month.content = month.content.map((item) => ({
        ...item,
        date: formatDate(item.Ship_Date__c),
        OCDDate: formatDate(item.Launch_Date__c)
      }));
      return month;
    });
    setProductList(formattedData);
    setIsLoaded(true);
  };

  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return "NA";
    const [year, month, day] = dateString.split("-");
    const formattedDay = day === "15" ? "TBD" : day;
    return `${formattedDay}/${monthNames[parseInt(month) - 1].toUpperCase()}/${year}`;
  };

  // Handle year change
  const handleYearChange = (year) => {
    setSelectYear(year);
    fetchCalendarData(year);
  };

  // Clear filters
  const handleClear = () => {
    setBrand(null);
    setMonth(months[new Date().getMonth()].value);
    handleYearChange(currentYear);
  };

  // Initial data fetch and subscription
  useEffect(() => {
    GetAuthData().then((user)=>{
      
      dataStore.getPageData(
        `actBndRelated${user.Sales_Rep__c}`,
        () => fetchAccountDetails()).then((res) => {
          setAccountDetails(res.accountDetails);
        }).catch((err) => console.error({ err })
      );
    }).catch((err) => console.error({ err }))
    fetchCalendarData();
    dataStore.subscribe(`/marketing-calendar${selectYear}`, processCalendarData);

    return () => {
      dataStore.unsubscribe(`/marketing-calendar${selectYear}`, processCalendarData);
    };
  }, [selectYear]);

  useBackgroundUpdater(fetchCalendarData,defaultLoadTime);

  // Check permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const userPermissions = await getPermissions();
        if (!userPermissions?.modules?.newArrivals?.view) {
          PermissionDenied();
          navigate("/dashboard");
        }
        setPermissions(userPermissions);
      } catch (error) {
        console.error("Error checking permissions:", error);
      }
    };
    checkPermissions();
  }, [navigate]);

  useEffect(()=>{},[accountDetails])

  return (
    <AppLayout
    filterNodes={
      <>
        <FilterItem
          label="Year"
          name="Year"
          value={selectYear}
          options={yearList}
          onChange={handleYearChange}
        />
        <FilterItem
          minWidth="220px"
          label="All Brands"
          name="All-Brand"
          value={brand}
          options={[
            { label: "All Brands", value: null },
            ...(manufacturers?.data?.map((manufacturer) => ({
              label: manufacturer.Name,
              value: manufacturer.Id
            })) || [])
          ]}
          onChange={setBrand}
        />
        <FilterItem
          minWidth="220px"
          label="JAN-DEC"
          name="JAN-DEC"
          value={month}
          options={months}
          onChange={setMonth}
        />
        <button className="border px-2 py-1 leading-tight d-grid" onClick={handleClear}>
          <CloseButton crossFill="#fff" height={20} width={20} />
          <small style={{ fontSize: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Clear</small>
        </button>
      </>
    }
  >
    {!isLoaded ? (
      <Loading height="70vh" />
    ) : productList.length === 0 ? (
      <div className="row d-flex flex-column justify-content-center align-items-center lg:min-h-[300px] xl:min-h-[400px]">
      <p className="m-0 fs-2 font-[Montserrat-400] text-center text-[14px] tracking-[2.20px]">
        No Data Found
      </p>
  </div>
    ) : (
      <NewArrivalsPage
        brand={brand}
        month={month}
        productList={productList}
        accountDetails={accountDetails}
      />
    )}
  </AppLayout>
  );
};

export default NewArrivals;

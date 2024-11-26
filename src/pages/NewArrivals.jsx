import React, { useEffect, useState, useMemo } from "react";
import AppLayout from "../components/AppLayout";
import Loading from "../components/Loading";
import NewArrivalsPage from "../components/NewArrivalsPage/NewArrivalsPage";
import { FilterItem } from "../components/FilterItem";
import { CloseButton } from "../lib/svg";
import { GetAuthData, getMarketingCalendar } from "../lib/store";
import { useNavigate } from "react-router-dom";
import { getPermissions } from "../lib/permission";
import { originAPi } from "../lib/store";
import axios from "axios";

import PermissionDenied from "../components/PermissionDeniedPopUp/PermissionDenied";
import dataStore from "../lib/dataStore";
import { useManufacturer } from "../api/useManufacturer";
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const NewArrivals = () => {
  const { data: manufacturers } = useManufacturer();
  const [accountDetails, setAccountDetails] = useState()

  const fetchAccountDetails = async () => {
    let data = await GetAuthData(); // Fetch authentication data
    let salesRepId = data.Sales_Rep__c;
    let accessToken = data.x_access_token;

    try {
      // Await the axios.post call to resolve the Promise
      let res = await dataStore.getPageData("actBndRelated" + salesRepId, () => axios.post(`${originAPi}/beauty/v3/23n38hhduu`, {
        salesRepId,
        accessToken,
      }));


      setAccountDetails(res.data.accountDetails)
    } catch (error) {
      console.error("Error", error); // Log error details
    }
  };


  useEffect(() => {

    fetchAccountDetails()
  }, [])
  let date = new Date();
  const [isLoaded, setIsloaed] = useState(false);
  const [productList, setProductList] = useState([]);
  const [permissions, setPermissions] = useState(null);
  const navigate = useNavigate()
  const [selectYear, setSelectYear] = useState(date.getFullYear())
  let yearList = [
    { value: date.getFullYear(), label: date.getFullYear() },
    { value: date.getFullYear() + 1, label: date.getFullYear() + 1 }
  ]
  const [month, setMonth] = useState("");
  let months = [
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
  ];

  const [brand, setBrand] = useState();

  const readyCalenderHandle = (data) => {
    data?.map((month) => {
      month.content.map((element) => {
        element.date = element.Ship_Date__c ? (element.Ship_Date__c.split("-")[2] == 15 ? 'TBD' : element.Ship_Date__c.split("-")[2]) + '/' + monthNames[parseInt(element.Ship_Date__c.split("-")[1]) - 1].toUpperCase() + '/' + element.Ship_Date__c.split("-")[0] : 'NA';
        element.OCDDate = element.Launch_Date__c ? (element.Launch_Date__c.split("-")[2] == 15 ? 'TBD' : element.Launch_Date__c.split("-")[2]) + '/' + monthNames[parseInt(element.Launch_Date__c.split("-")[1]) - 1].toUpperCase() + '/' + element.Launch_Date__c.split("-")[0] : 'NA';
        return element
      })
      return month;
    })
    setProductList(data)
    setIsloaed(true)
  }

  useEffect(() => {
    dataStore.subscribe("/marketing-calendar" + selectYear, readyCalenderHandle)
    GetAuthData().then((user) => {
      dataStore.getPageData("/marketing-calendar" + selectYear, () => getMarketingCalendar({ key: user.x_access_token, year: selectYear })).then((productRes) => {
        console.log({productRes,selectYear});
        
        readyCalenderHandle(productRes)
      }).catch((err) => console.log({ err }))
    }).catch((e) => console.log({ e }))
    return () => {
      dataStore.unsubscribe("/marketing-calendar" + selectYear, readyCalenderHandle)
    }
  }, [isLoaded,selectYear])

  console.log({productList});
  

  useEffect(() => {
    HendleClear();
  }, []);
  const HendleClear = () => {
    const currentMonthIndex = new Date().getMonth();
    setMonth(months[currentMonthIndex].value);
    setBrand(null);
    setSelectYear(date.getFullYear())
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const userPermissions = await getPermissions()
        if (userPermissions?.modules?.newArrivals?.view === false) { PermissionDenied(); navigate('/dashboard'); }
      } catch (error) {
        console.log("Permission Error", error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const user = await GetAuthData(); // Fetch user data
        const userPermissions = await getPermissions(); // Fetch permissions
        setPermissions(userPermissions); // Set permissions in state
      } catch (err) {
        console.error("Error fetching permissions", err);
      }
    }

    fetchPermissions(); // Fetch permissions on mount
  }, []);

  // Memoize permissions to avoid unnecessary re-calculations
  const memoizedPermissions = useMemo(() => permissions, [permissions]);
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
            options={manufacturers?.data?.map((manufacturer) => ({
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
          <button className="border px-2 py-1 leading-tight d-grid" onClick={HendleClear}>
            <CloseButton crossFill={'#fff'} height={20} width={20} />
            <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>clear</small>
          </button>


        </>
      }
    >
      {!isLoaded ? (
        <Loading height={"70vh"} />
      ) : (
        <NewArrivalsPage brand={brand} month={month} productList={productList} accountDetails={accountDetails} />
      )}
    </AppLayout>
  );
};

export default NewArrivals;

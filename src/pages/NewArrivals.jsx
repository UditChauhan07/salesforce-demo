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
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const NewArrivals = () => {
  const [accountDetails , setAccountDetails] = useState()

  const fetchAccountDetails = async () => {
    let data = await GetAuthData(); // Fetch authentication data
    let salesRepId = data.Sales_Rep__c;
    let accessToken = data.x_access_token;
  
    try {
      // Await the axios.post call to resolve the Promise
      let res = await axios.post(`${originAPi}/beauty/v3/23n38hhduu`, {
        salesRepId,
        accessToken,
      });
  
       
      setAccountDetails(res.data.accountDetails)
    } catch (error) {
      console.error("Error", error); // Log error details
    }
  };
  
  
  useEffect(()=>{

    fetchAccountDetails()
  } , [])

  const [isLoaded, setIsloaed] = useState(false);
  const [productList, setProductList] = useState([]);
  const [permissions, setPermissions] = useState(null);
  const navigate = useNavigate()
  let brands = [
    { value: null, label: "All" },
    { value: "111Skin", label: "111Skin" },
    { value: "Susanne Kaufmann", label: "Susanne Kaufmann" },
    { value: "AERIN", label: "AERIN" },
    { value: "ARAMIS", label: "ARAMIS" },
    { value: "Bobbi Brown", label: "Bobbi Brown" },
    { value: "Bumble and Bumble", label: "Bumble and Bumble" },
    { value: "Byredo", label: "Byredo" },
    { value: "BY TERRY", label: "BY TERRY" },
    { value: "Diptyque", label: "Diptyque" },
    { value: "Kevyn Aucoin Cosmetics", label: "Kevyn Aucoin Cosmetics" },
    { value: "ESTEE LAUDER", label: "ESTEE LAUDER" },
    { value: "L'Occitane", label: "L'Occitane" },
    { value: "Maison Margiela", label: "Maison Margiela" },
    { value: "ReVive", label: "ReVive" },
    { value: "RMS Beauty", label: "RMS Beauty" },
    { value: "Smashbox", label: "Smashbox" },
    { value: "Re-Nutriv", label: "Re-Nutriv" },
    { value: "Victoria Beckham Beauty", label: "Victoria Beckham Beauty" },
    
  ];
  const [month, setMonth] = useState("");
  let months = [
    // { value: null,  },
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
    // { value: "TBD", label: "TBD" },
  ];

  const [brand, setBrand] = useState();

  useEffect(() => {
    GetAuthData().then((user) => {
      getMarketingCalendar({ key: user.x_access_token }).then((productRes) => {
        productRes?.map((month) => {
          month.content.map((element) => {
            element.date = element.Ship_Date__c ? (element.Ship_Date__c.split("-")[2] == 15 ? 'TBD' : element.Ship_Date__c.split("-")[2]) + '/' + monthNames[parseInt(element.Ship_Date__c.split("-")[1]) - 1].toUpperCase() + '/' + element.Ship_Date__c.split("-")[0] : 'NA';
            element.OCDDate = element.Launch_Date__c ? (element.Launch_Date__c.split("-")[2] == 15 ? 'TBD' : element.Launch_Date__c.split("-")[2]) + '/' + monthNames[parseInt(element.Launch_Date__c.split("-")[1]) - 1].toUpperCase() + '/' + element.Launch_Date__c.split("-")[0] : 'NA';
            return element
          })
          return month;
        })
        setProductList(productRes)
        setIsloaed(true)
      }).catch((err) => console.log({ err }))
    }).catch((e) => console.log({ e }))
  }, [isLoaded])

  useEffect(() => {
    HendleClear();
  }, []);
  const HendleClear = () => {
    const currentMonthIndex = new Date().getMonth();
    setMonth(months[currentMonthIndex].value);
    setBrand(null);
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
        <NewArrivalsPage brand={brand} month={month} productList={productList} accountDetails= {accountDetails}/>
      )}
    </AppLayout>
  );
};

export default NewArrivals;

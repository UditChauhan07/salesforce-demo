import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import { ShareDrive, getProductImageAll, topProduct } from "../lib/store";
import Loading from "../components/Loading";
import TopProductCard from "../components/TopProductCard";
import { FilterItem } from "../components/FilterItem";
import { useManufacturer } from "../api/useManufacturer";
import { CloseButton } from "../lib/svg";
import { getPermissions } from "../lib/permission";
import { GetAuthData } from "../lib/store";
import { useNavigate } from "react-router-dom";
import { fetchAccountDetails } from "../lib/store";
import axios from "axios";
import { originAPi } from "../lib/store";
import PermissionDenied from "../components/PermissionDeniedPopUp/PermissionDenied";
import dataStore from "../lib/dataStore";
let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const TopProducts = () => {
  const { data: manufacturers } = useManufacturer();
  const [topProductList, setTopProductList] = useState({ isLoaded: false, data: [], message: null });
  const [monthList, setMonthList] = useState([])
  const d = new Date();
  let monthIndex = d.getMonth();
  const [manufacturerFilter, setManufacturerFilter] = useState();
  const [selectedMonth, setSelectedMonth] = useState();
  const [searchText, setSearchText] = useState();
  const [productImages, setProductImages] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [accountDetails, setAccountDetails] = useState()

  const navigate = useNavigate()


  const readyTopProducthandle = (products) => {
    let data = ShareDrive();
    if (!data) {
      data = {};
    }
    if (manufacturerFilter) {
      if (!data[manufacturerFilter]) {
        data[manufacturerFilter] = {};
      }
      if (Object.values(data[manufacturerFilter]).length > 0) {
        setIsLoaded(true)
        setProductImages({ isLoaded: true, images: data[manufacturerFilter] })
      } else {
        setIsLoaded(true)
        setProductImages({ isLoaded: false, images: {} })
      }
    }
    let result = products.data.sort(function (a, b) {
      return b.Sales - a.Sales;
    });
    setTopProductList({ isLoaded: true, data: result, message: products.message })
    if (result.length > 0) {
      let productCode = "";
      result?.map((product, index) => {
        productCode += `'${product.ProductCode}'`
        if (result.length - 1 != index) productCode += ', ';
      })
      getProductImageAll({ rawData: { codes: productCode } }).then((res) => {
        if (res) {
          if (data[manufacturerFilter]) {
            data[manufacturerFilter] = { ...data[manufacturerFilter], ...res }
          } else {
            data[manufacturerFilter] = res
          }
          ShareDrive(data)
          setProductImages({ isLoaded: true, images: res });
          setIsLoaded(true)
        } else {
          setIsLoaded(true)
          setProductImages({ isLoaded: true, images: {} });
        }
      }).catch((err) => {
        console.log({ err });
      })
    }
  }

  useEffect(() => {
    dataStore.subscribe("/top-productsnull" + monthIndex + 1, readyTopProducthandle);
    GetAuthData().then((user)=>{
      
      dataStore.getPageData(
        `actBndRelated${user.Sales_Rep__c}`,
        () => fetchAccountDetails()).then((res) => {
          setAccountDetails(res.accountDetails);
        }).catch((err) => console.error({ err })
      );
    }).catch((err) => console.error({ err }))
    btnHandler({ manufacturerId: null, month: monthIndex + 1 });
    let indexMonth = [];
    let helperArray = [];
    months.map((month, i) => {
      if (i <= monthIndex) {
        helperArray.push({ label: `${month.slice(0,3)}, 2024`, value: i + 1 })
      } else {
        indexMonth.push({ label: `${month.slice(0,3)}, 2023`, value: i + 1 })
      }
    })
    let finalArray = indexMonth.concat(helperArray)
    setMonthList(finalArray.reverse())
    return () => {
      dataStore.unsubscribe("/top-productsnull" + monthIndex + 1, readyTopProducthandle);
    }
  }, [])

  // const topProductData = useMemo(() => {
  //   return (
  //     topProductList.data1
  //       ?.filter(
  //         (product) =>
  //           !searchText ||
  //           searchText === product.Name
  //       )
  //     // Search by account filter
  //     // ?.filter((product) => {
  //     //   return (
  //     //     !filterValue?.search?.length ||
  //     //     order.AccountName?.toLowerCase().includes(
  //     //       filterValue?.search?.toLowerCase()
  //     //     )
  //     //   );
  //     // })
  //   );
  // }, [searchText, topProductList, selectedMonth]);
  const SearchData = ({ selectedMonth, manufacturerFilter }) => {

    dataStore.getPageData("/top-products" + manufacturerFilter + selectedMonth, () => topProduct({ month: selectedMonth, manufacturerId: manufacturerFilter })).then((products) => {
      readyTopProducthandle(products)
    }).catch((err) => {
      console.log({ err });
    })
  }
  const btnHandler = ({ month, manufacturerId }) => {
    setIsLoaded(false)
    setTopProductList({ isLoaded: false, data: [], message: null })
    setManufacturerFilter(manufacturerId);
    setSelectedMonth(month);
    SearchData({ selectedMonth: month, manufacturerFilter: manufacturerId })
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userPermissions = await getPermissions()
        if (userPermissions?.modules?.topProducts?.view === false) { PermissionDenied(); navigate('/dashboard'); }
      } catch (error) {
        console.log("Permission Error", error)
      }
    }
    fetchData()
  }, [])

  useEffect(()=>{},[accountDetails])

  return (
    <AppLayout filterNodes={<>

      <>
        <FilterItem
          minWidth="220px"
          label="All Brands"
          name="Manufacturer1"
          value={manufacturerFilter}
          options={[
            { label: "All Brands", value: null }, // Add the first option
            ...(manufacturers?.data?.map((manufacturer) => ({
              label: manufacturer.Name,
              value: manufacturer.Id,
            })) || []), // Safely map if manufacturers.data exists, fallback to an empty array
          ]}
          onChange={(value) => btnHandler({ manufacturerId: value, month: selectedMonth })}
        />

        <FilterItem
          label="Month"
          minWidth="220px"
          name="Month"
          value={selectedMonth}
          options={monthList}
          onChange={(value) => btnHandler({ manufacturerId: manufacturerFilter, month: value })}
        />

        <button
          className="border px-2 py-1 leading-tight d-grid"
          onClick={() => { btnHandler({ manufacturerId: null, month: monthIndex + 1 }); }}
        >
          <CloseButton crossFill={'#fff'} height={20} width={20} />
          <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>clear</small>
        </button>
      </>



    </>
    }>
      {!topProductList.isLoaded ? <Loading height={"70vh"} /> : (topProductList.data.length == 0 && topProductList.message) ?
        <div className="row d-flex flex-column justify-content-center align-items-center lg:min-h-[300px] xl:min-h-[400px]">
          <div className="col-4">
            <p className="m-0 fs-2 font-[Montserrat-400] text-[14px] tracking-[2.20px] text-center">
              {topProductList.message}
            </p>
          </div>
        </div>
        :
        <TopProductCard data={topProductList.data} isLoaded={isLoaded} productImages={productImages} accountDetails={accountDetails} />}
    </AppLayout>
  );
};

export default TopProducts;

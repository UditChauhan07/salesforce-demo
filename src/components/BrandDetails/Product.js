import React, { useEffect, useMemo, useState } from "react";
import styles from "./styles.module.css";
import Accordion from "./Accordion/Accordion";
import FilterPage from "./Accordion/FilterPage";
import { MdOutlineDownload, MdOutlineUpload } from "react-icons/md";
import { useAuth } from "../../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../Loading";
import { FilterItem } from "../FilterItem";
import FilterSearch from "../FilterSearch";
import ModalPage from "../Modal UI";
import { GetAuthData, ShareDrive, defaultLoadTime, fetchBeg, getProductImageAll, getProductList, salesRepIdKey, sortArrayHandler } from "../../lib/store";
import Styles from "../Modal UI/Styles.module.css";
import { BackArrow, CloseButton } from "../../lib/svg";
import AppLayout from "../AppLayout";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import SpreadsheetUploader from "./OrderForm";
import { CSVLink } from "react-csv";
import { useCart } from "../../context/CartContext";
import dataStore from "../../lib/dataStore";
import useBackgroundUpdater from "../../utilities/Hooks/useBackgroundUpdater";
import PermissionDenied from "../PermissionDeniedPopUp/PermissionDenied";
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";
const groupBy = function (xs, key) {
  return xs?.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

function Product() {
  const [emptyBag, setEmptyBag] = useState(false);
  const { user } = useAuth();
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [productTypeFilter, setProductTypeFilter] = useState("Wholesale");
  const [sortBy, setSortBy] = useState();
  const [searchBy, setSearchBy] = useState("");
  const navigate = useNavigate();
  const [redirect, setRedirect] = useState(false);
  const [alert, setAlert] = useState(0);
  const [testerInBag, setTesterInBag] = useState(false);
  const [orderFormModal, setOrderFromModal] = useState(false);
  const [productList, setProductlist] = useState({ isLoading: false, data: [], discount: {} });
  const [salesRepId, setSalesrepid] = useState();
  const brandName = productList?.data?.[0]?.ManufacturerName__c;
  const [productCartSchema, setProductCartSchema] = useState({
    testerInclude: true,
    sampleInclude: true,
  });
  useEffect(() => {
    const fetchPermission = async () => {
      let user = await GetAuthData();
      if (user.permission) {
        let permission = JSON.parse(user.permission);

        if (permission?.modules?.order?.create === false) {
          PermissionDenied();
          navigate("/dashboard");
        }
      }
    };
    fetchPermission();
  }, []);

  const groupProductDataByCategory = (productData) => {
    const groupedData = groupBy(productData || [], "Category__c");

    const tester = [...(groupedData["TESTER"] || [])];
    delete groupedData["TESTER"];
    const samples = [...(groupedData["Samples"] || [])];
    delete groupedData["Samples"];

    if (tester?.length) {
      groupedData["TESTER"] = tester;
    }
    if (samples?.length) {
      groupedData["Samples"] = samples;
    }

    return groupedData;
  };
  useEffect(() => {
    if (productTypeFilter === "Pre-order") {
      setCategoryFilters([]);
    }
  }, [productTypeFilter]);

  const formattedData = useMemo(() => groupProductDataByCategory(productList.data), [productList.data]);
  const formattedFilterData = useMemo(() => {
    let finalFilteredProducts = { ...formattedData };
    if (categoryFilters?.length) {
      let newData = {};
      Object.keys(finalFilteredProducts)?.forEach((key) => {
        if (categoryFilters?.includes(key)) {
          newData[key] = finalFilteredProducts[key];
        }
      });
      finalFilteredProducts = { ...newData };
    }
    if (categoryFilters.length == 0 && !productCartSchema.sampleInclude) {
      delete finalFilteredProducts["Samples"];
    }
    if (categoryFilters.length == 0 && !productCartSchema.testerInclude) {
      delete finalFilteredProducts["TESTER"];
    }

    if (productTypeFilter) {
      let newData = {};
      Object.keys(finalFilteredProducts)?.forEach((key) => {
        if (productTypeFilter === "Pre-order") {
          if (key === "PREORDER") {
            newData[key] = finalFilteredProducts[key];
          }
          if (key.match("EVENT")) {
            newData[key] = finalFilteredProducts[key];
          }
        } else {
          if (key !== "PREORDER" && !key.toUpperCase().match("EVENT")) {
            newData[key] = finalFilteredProducts[key];
          }
        }
      });
      finalFilteredProducts = { ...newData };
    }

    if (searchBy) {
      let newData = {};
      const filteredProductsArray = Object.values(finalFilteredProducts)
        ?.flat()
        ?.filter((value) => {
          return (
            value.Name?.toLowerCase().includes(searchBy?.toLowerCase()) ||
            value.ProductCode?.toLowerCase().includes(searchBy?.toLowerCase()) ||
            value.ProductUPC__c?.toLowerCase().includes(searchBy?.toLowerCase())
          );
        });
      newData = groupProductDataByCategory(filteredProductsArray);
      finalFilteredProducts = { ...newData };
    }

    if (sortBy) {
      if (sortBy === "Price: Low To High") {
        let newData = {};
        Object.keys(finalFilteredProducts)?.forEach((key) => {
          const value = finalFilteredProducts[key];

          value?.sort((a, b) => {
            return +a?.usdRetail__c?.replace("$", "") - +b?.usdRetail__c?.replace("$", "");
          });
        });
      } else if (sortBy === "Price: High To Low") {
        let newData = {};
        Object.keys(finalFilteredProducts)?.forEach((key) => {
          const value = finalFilteredProducts[key];
          value?.sort((a, b) => +b?.usdRetail__c?.replace("$", "") - +a?.usdRetail__c?.replace("$", ""));
        });
      } else {
        Object.keys(finalFilteredProducts)?.forEach((key) => {
          const value = finalFilteredProducts[key];
          sortArrayHandler(value, (g) => g.Name);
        });
      }
    } else {
      Object.keys(finalFilteredProducts)?.forEach((key) => {
        const value = finalFilteredProducts[key];
        sortArrayHandler(value, (g) => g.Name);
      });
    }

    return finalFilteredProducts;
  }, [formattedData, categoryFilters, productTypeFilter, sortBy, searchBy]);

  const [productImage, setProductImage] = useState({ isLoaded: true, images: {} });

  const readyProductListHandle = (productRes) => {
    let data = ShareDrive();
    if (!data) {
      data = {};
    }
    if (!data[localStorage.getItem("ManufacturerId__c")]) {
      data[localStorage.getItem("ManufacturerId__c")] = {};
    }
    if (data[localStorage.getItem("ManufacturerId__c")]) {
      if (Object.values(data[localStorage.getItem("ManufacturerId__c")]).length > 0) {
        setProductImage({ isLoaded: true, images: data[localStorage.getItem("ManufacturerId__c")] });
      } else {
        setProductImage({ isLoaded: false, images: {} });
      }
    }
    if (!(localStorage.getItem("ManufacturerId__c") && localStorage.getItem("AccountId__c"))) {
      setRedirect(true);
    }
    let productData = productRes?.data?.records || [];
    productData.map((element) => {
      if (element.AttachedContentDocuments) {
      }
    });
    let discount = productRes?.discount || {};

    setProductCartSchema({ testerInclude: productRes?.discount?.testerInclude, sampleInclude: productRes?.discount?.sampleInclude });
    setProductlist({ data: productData, isLoading: true, discount });

    //version 1
    // productData.map(product => {
    //   let productCode = product?.ProductCode
    //   getProductImage({ rawData: { code: productCode } }).then((res) => {
    //     setProductImage((prev) => ({
    //       ...prev,
    //       [productCode]: res
    //     }));
    //   }).catch((err) => {
    //     console.log({ err });
    //   })
    // })

    // version 2
    if (false) {
      let productCode = "";
      productData.map((product, index) => {
        productCode += `'${product?.ProductCode}'`;
        if (productData.length - 1 != index) productCode += ", ";
      });
      getProductImageAll({ rawData: { codes: productCode } })
        .then((res) => {
          if (res) {
            if (data[localStorage.getItem("ManufacturerId__c")]) {
              data[localStorage.getItem("ManufacturerId__c")] = { ...data[localStorage.getItem("ManufacturerId__c")], ...res };
            } else {
              data[localStorage.getItem("ManufacturerId__c")] = res;
            }
            ShareDrive(data);
            setProductImage({ isLoaded: true, images: res });
          } else {
            setProductImage({ isLoaded: true, images: {} });
          }
        })
        .catch((err) => {
          console.log({ err });
        });
    }
  };

  const getProductListData = () => {
    GetAuthData()
      .then((user) => {
        let rawData = {
          key: user.access_token,
          Sales_Rep__c: localStorage.getItem(salesRepIdKey) ?? user?.Sales_Rep__c,
          Manufacturer: localStorage.getItem("ManufacturerId__c"),
          AccountId__c: localStorage.getItem("AccountId__c"),
        };
        dataStore
          .getPageData(
            "/product" +
              JSON.stringify({
                Sales_Rep__c: localStorage.getItem(salesRepIdKey) ?? user?.Sales_Rep__c,
                Manufacturer: localStorage.getItem("ManufacturerId__c"),
                AccountId__c: localStorage.getItem("AccountId__c"),
              }),
            () => getProductList({ rawData })
          )
          .then((productRes) => {
            readyProductListHandle(productRes);
          })
          .catch((errPro) => {
            console.log({ errPro });
          });
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  useEffect(() => {
    GetAuthData()
      .then((user) => {
        dataStore.subscribe(
          "/product" +
            JSON.stringify({
              Sales_Rep__c: localStorage.getItem(salesRepIdKey) ?? user?.Sales_Rep__c,
              Manufacturer: localStorage.getItem("ManufacturerId__c"),
              AccountId__c: localStorage.getItem("AccountId__c"),
            }),
          readyProductListHandle
        );
        setSalesrepid(localStorage.getItem(salesRepIdKey) ?? user?.Sales_Rep__c);
        getProductListData();
        return () => {
          dataStore.unsubscribe(
            "/product" +
              JSON.stringify({
                Sales_Rep__c: localStorage.getItem(salesRepIdKey) ?? user?.Sales_Rep__c,
                Manufacturer: localStorage.getItem("ManufacturerId__c"),
                AccountId__c: localStorage.getItem("AccountId__c"),
              }),
            readyProductListHandle
          );
        };
      })
      .catch((err) => {
        console.log({ err });
      });
  }, []);

  useBackgroundUpdater(getProductListData, defaultLoadTime);

  const redirecting = () => {
    setTimeout(() => {
      navigate("/my-retailers");
    }, 2000);
    // setRedirect(false);
  };

  const generateOrderHandler = () => {
    let begValue = fetchBeg();
    if (begValue.Account.id == localStorage.getItem("AccountId__c") && begValue.Manufacturer.id == localStorage.getItem("ManufacturerId__c")) {
      if (begValue?.Account?.id && begValue?.Manufacturer?.id && begValue.items.length > 0) {
        let bagPrice = 0;
        let bagTesterPrice = 0;
        begValue.items.map((product) => {
          let productPriceStr = product.price;
          let productQuantity = product.qty;
          let productPrice = parseFloat(productPriceStr || 0);
          bagPrice += productPrice * productQuantity;
        });
        setAlert(0);
        if (productList.discount.MinOrderAmount > bagPrice) {
          setAlert(1);
        } else {
          if (testerInBag && productList.discount.testerproductLimit > bagPrice) {
            setAlert(2);
          } else {

            
            // cartSync({cart:begValue})
            navigate("/my-bag");
          }
        }
        setEmptyBag(false);
      } else {
        setEmptyBag(true);
        setAlert(0);
      }
    } else {
      navigate("/my-bag");
    }
  };
  useEffect(() => {
    setEmptyBag(false);
  }, []);
  const csvData = () => {
    let finalData = [];
    if (productList.data) {
      productList.data.map((ele) => {
        let temp = {};
        temp["Title"] = ele.Name;
        temp["Product Code"] = ele.ProductCode;
        temp["ProductUPC"] = ele.ProductUPC__c;
        temp["Min Order QTY"] = ele.Min_Order_QTY__c;
        temp["Quantity"] = null;
        finalData.push(temp);
      });
    }
    return finalData;
  };
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(csvData());
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, `Order Form ${new Date()}` + fileExtension);
  };

  const OrderQuantity = () => {
    const { getOrderQuantity } = useCart();

    return getOrderQuantity() || 0;
  };
  const OrderPrice = () => {
    const { getOrderTotal } = useCart();
    return Number(getOrderTotal() || 0).toFixed(2);
  };

  return (
    <>
      {redirect ? (
        <ModalPage
          open
          content={
            <>
              <div style={{ maxWidth: "309px" }}>
                <h1 className={`fs-5 ${Styles.ModalHeader}`}>Warning</h1>
                <p className={` ${Styles.ModalContent}`}>
                  Data is not available for selected Account and Manufacturer.
                  {/* No Data available */}
                  <br />
                </p>
                <p>Redirecting to My Retailers page...</p>
                {redirect ? redirecting() : null}
                <div className="d-flex justify-content-center"></div>
              </div>
            </>
          }
          onClose={() => setRedirect(false)}
        />
      ) : (
        <>
          {alert == 1 && (
            <ModalPage
              open
              content={
                <>
                  <div style={{ maxWidth: "309px" }}>
                    <h1 className={`fs-5 ${Styles.ModalHeader}`}>Warning</h1>
                    <p className={` ${Styles.ModalContent}`}>Please Select Products of Minimum Order Amount</p>
                    <div className="d-flex justify-content-center">
                      <button className={`${Styles.modalButton}`} onClick={() => setAlert(0)}>
                        OK
                      </button>
                    </div>
                  </div>
                </>
              }
              onClose={() => setAlert(0)}
            />
          )}
          {alert == 2 && (
            <ModalPage
              open
              content={
                <>
                  <div style={{ maxWidth: "309px" }}>
                    <h1 className={`fs-5 ${Styles.ModalHeader}`}>Warning</h1>
                    <p className={` ${Styles.ModalContent}`}>Please Select Tester Product of Minimum Order Amount</p>
                    <div className="d-flex justify-content-center">
                      <button className={`${Styles.modalButton}`} onClick={() => setAlert(0)}>
                        OK
                      </button>
                    </div>
                  </div>
                </>
              }
              onClose={() => {
                setAlert(0);
              }}
            />
          )}
          {emptyBag && (
            <ModalPage
              open
              content={
                <>
                  <div style={{ maxWidth: "309px" }}>
                    <h1 className={`fs-5 ${Styles.ModalHeader}`}>Warning</h1>
                    <p className={` ${Styles.ModalContent}`}>No Product in your bag</p>
                    <div className="d-flex justify-content-center">
                      <button className={`${Styles.modalButton}`} onClick={() => setEmptyBag(false)}>
                        OK
                      </button>
                    </div>
                  </div>
                </>
              }
              onClose={() => {
                setEmptyBag(false);
              }}
            />
          )}
          {orderFormModal && (
            <ModalPage
              open
              content={
                <>
                  <div style={{ maxWidth: "100%", minWidth: "700px" }}>
                    <h1 className={`fs-5 ${Styles.ModalHeader} d-flex justify-content-between mb-3`}>
                      Upload Order Form
                      <CSVLink
                        data={csvData()}
                        filename={`Order Form ${new Date()}.csv`}
                        className={`${Styles.modalButton} d-flex justify-content-center align-items-center gap-1`}
                        style={{ width: "max-content", padding: "0px 6px" }}
                      >
                        <MdOutlineDownload size={16} />
                        Order Form Template
                      </CSVLink>
                    </h1>
                    <div className={`${Styles.ModalContent} mt-2`}>
                      <SpreadsheetUploader
                        rawData={productList || {}}
                        orderData={{ accountName: localStorage.getItem("Account"), accountId: localStorage.getItem("AccountId__c"), brandId: localStorage.getItem("ManufacturerId__c") }}
                        btnClassName={Styles.modalButton}
                        setOrderFromModal={setOrderFromModal}
                        salesRepId={salesRepId}
                      />
                    </div>
                    <div className="d-flex justify-content-center"></div>
                  </div>
                </>
              }
              onClose={() => {
                setOrderFromModal(false);
              }}
            />
          )}
          <AppLayout
            filterNodes={
              <>
                {!productList.isLoading ? null : (
                  <>
                    {" "}
                    <FilterItem
                      label="Sort by"
                      name="Sort-by"
                      value={sortBy}
                      options={[
                        {
                          label: "Price: High To Low",
                          value: "Price: High To Low",
                        },
                        {
                          label: "Price: Low To High",
                          value: "Price: Low To High",
                        },
                      ]}
                      onChange={(value) => {
                        setSortBy(value);
                      }}
                    />
                    <FilterItem
                      label="Product type"
                      name="Product-type"
                      value={productTypeFilter}
                      options={[
                        {
                          label: "PREORDER",
                          value: "Pre-order",
                         
                        },
                        {
                          label: "Wholesale",
                          value: "Wholesale",
                        },
                      ]}
                      onChange={(value) => {
                        setProductTypeFilter(value);
                      }}
                    />
                    <FilterSearch onChange={(e) => setSearchBy(e.target.value)} value={searchBy} placeholder={"Enter Product name,UPC & SKU"} minWidth="260px" />
                    <button
                      className="border px-2 py-1 leading-tight tracking-[1.2px] uppercase d-grid"
                      onClick={() => {
                        setSortBy("Price: High To Low");
                        setSearchBy("");
                        setProductTypeFilter("Wholesale");
                      }}
                    >
                      <CloseButton crossFill={"#fff"} height={20} width={20} />
                      <small style={{ fontSize: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>clear</small>
                    </button>
                    <button className="border px-2 py-1 leading-tight uppercase tracking-[1.2px] d-grid" onClick={() => setOrderFromModal(true)}>
                      <MdOutlineUpload size={20} className="m-auto" />
                      <small style={{ fontSize: "6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Order Form</small>
                    </button>
                  </>
                )}
              </>
            }
          >
            {!productList.isLoading ? (
              <Loading height={"70vh"} />
            ) : (
              <div>
                <section className="pt-[34px]">
                  <div className="">
                    <div className={styles.BrandTopShow}>
                      <h4 className="flex justify-center items-center gap-4 uppercase font-[Montserrat-500] tracking-[2.20px]">
                        <button
                          onClick={() => {
                            navigate("/my-retailers");
                          }}
                        >
                          <BackArrow />
                        </button>
                        {brandName}
                      </h4>

                      <p>
                        <span>Account</span>:{" "}
                        <Link style={{ color: "#000", textDecoration: "underline" }} to={"/store/" + localStorage.getItem("AccountId__c")}>
                          {localStorage.getItem("Account")}
                        </Link>
                      </p>
                    </div>

                    <div className="row">
                      <div className="col-lg-3 col-md-4 col-sm-12">
                        <FilterPage
                          data={productList}
                          formattedData={formattedData}
                          setCategoryFilters={setCategoryFilters}
                          categoryFilters={categoryFilters}
                          setProductTypeFilter={setProductTypeFilter}
                          productTypeFilter={productTypeFilter}
                          setSortBy={setSortBy}
                          sortBy={sortBy}
                        ></FilterPage>
                      </div>

                      <div className="col-lg-9 col-md-8 col-sm-12 ">
                        <div
                          className={`overflow-auto `}
                          style={{
                            height: "64vh",
                            border: "1px dashed black",
                          }}
                        >
                          <Accordion data={productList} formattedData={formattedFilterData} productImage={productImage} productCartSchema={productCartSchema} salesRepId={salesRepId}></Accordion>
                        </div>
                        <div className={`${styles.TotalSide} `}>
                          <div className="d-flex align-items-start flex-column">
                            <h4>
                              Total Number of Products in Bag : <OrderQuantity />
                            </h4>
                            <h4>
                              Total Price : $<OrderPrice />
                            </h4>
                          </div>
                          <button
                            onClick={() => {
                              generateOrderHandler();
                            }}
                          >
                            Generate Order
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </AppLayout>
        </>
      )}
    </>
  );
}

export default Product;

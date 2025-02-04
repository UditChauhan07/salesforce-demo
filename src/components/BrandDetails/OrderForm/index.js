import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import ModalPage from "../../Modal UI";
import Styles from "../../Modal UI/Styles.module.css";
import { useCart } from "../../../context/CartContext";
import { GetAuthData } from "../../../lib/store";
const SpreadsheetUploader = ({ rawData, showTable = false, setOrderFromModal, orderData = {}, btnClassName = null , salesRepId }) => {
  const { contentApiFunction } = useCart();
  const productList = rawData?.data || [];
  const discount = rawData?.discount || {};
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [errorOnlist, setErrorOnList] = useState(0);
  const [emptyList,setEmptyList]= useState(0);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const [alert, setAlert] = useState('-');
  const [orderType, setorderType] = useState("wholesale")
  const [limitCheck, setLimitCheck] = useState(false)
  const [isLimitPass, setIsLimitPass] = useState(false)
  let orderTypeList = [
    { value: "wholesale", label: "Whole Sales" },
    { value: "preorder", label: "Pre-Order" },
  ]

  const CheckError = (data) => {
    let totalQty = 0;
    let checkLimit = 0;
    let errorCount = data.reduce((accumulator, item) => {
      let productDetails = getProductData(item["Product Code"] || item["ProductCode"] || null);

      if (item?.Quantity) {
        
        let error = !item?.Quantity || !Number.isInteger(item?.Quantity) || item?.Quantity < (productDetails.Min_Order_QTY__c || 0) || !productDetails?.Name || (productDetails.Min_Order_QTY__c > 0 && item?.Quantity % productDetails.Min_Order_QTY__c !== 0);
        if (orderType === "preorder") {
          if (error === false) {
            if (!productDetails?.Category__c?.toLowerCase()?.match("event")) {
              error = productDetails?.Category__c?.toLowerCase() !== orderType.toLowerCase();
            }
          }
        } else {
          if (error === false) {
            error = productDetails?.Category__c?.toLowerCase() === "preorder";
          }
        }

        if (orderType == "wholesale" && (productDetails?.Category__c?.toLowerCase() == "preorder" || productDetails?.Category__c?.toLowerCase()?.match("event"))) {
          error = true;
        }
        checkLimit++;
        return accumulator + (error ? 1 : 0);
      } else {
        totalQty += 1;
      }
      return accumulator;
    }, 0);
    if (checkLimit > 100) {
      setLimitCheck(true)
      setIsLimitPass(true)
    } else {
      setLimitCheck(false)
    }
    
    if (totalQty == data.length) {
      setEmptyList(totalQty);
    } else {
      setErrorOnList(errorCount);
    }
  };
  const readFile = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        resolve(sheetData);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };

      fileReader.readAsArrayBuffer(file);
    });

    return promise;
  };

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setIsLoading(true);
      const file = event.target.files[0];
      readFile(file).then((data) => {
        setData(data);
        CheckError(data);
      });
    }
  };
  const getProductData = (productCode) => {
    if (!productCode) return {};
    let found = productList.find((item) => item.ProductCode == productCode);
    if (!found) return {};
    let retailerPirce = found.usdRetail__c?.trim()?.replace('$', '')?.replace(',', '');
    if (!/^\d*\.?\d+$/.test(retailerPirce)) {
      retailerPirce = 0;
    }

    if (found?.Category__c === "TESTER") {
      let salesPrice = (+retailerPirce - (discount?.testerMargin / 100) * +retailerPirce).toFixed(2);
      found.salesPrice = salesPrice;
      // found.discount = discount?.testerMargin;
    } else if (found.Category__c === "Samples") {
      let salesPrice = (+retailerPirce - (discount?.sample / 100) * +retailerPirce).toFixed(2);
      found.salesPrice = salesPrice;
      // found.discount = discount?.sample;
    } else {
      let salesPrice = (+retailerPirce - (discount?.margin / 100) * +retailerPirce).toFixed(2);
      found.salesPrice = salesPrice;
      // found.discount = discount?.margin;
    }
    return found;
  };
  const submitForm = () => {
    let bagPrice = 0;
    data.map((element) => {
      if (element.Quantity && Number.isInteger(element?.Quantity)) {
        let product = getProductData(element["Product Code"] || element["ProductCode"]);

        const category = product?.Category__c?.toLowerCase();
        if (orderType == "preorder" ? (category === "preorder" || (category?.match("event")?.length > 0)) : (category !== "preorder" && !category?.match("event"))) {
          if (product?.Id && element?.Quantity >= (product.Min_Order_QTY__c || 0) && (!product.Min_Order_QTY__c || element?.Quantity % product.Min_Order_QTY__c === 0)) {
            let salesPrice = null;
            let listPrice = product.usdRetail__c.substring(1);
            if (listPrice == 'NaN') {
              listPrice = 0;
            }
            if (product.Category__c === "TESTER") {
              salesPrice = product.usdRetail__c.includes("$")
                ? (+listPrice - (discount?.testerMargin / 100) * +listPrice).toFixed(2)
                : (+product.usdRetail__c - (discount?.testerMargin / 100) * +product.usdRetail__c).toFixed(2);
            } else if (product.Category__c === "Samples") {
              salesPrice = product.usdRetail__c.includes("$")
                ? (+listPrice - (discount?.sample / 100) * +listPrice).toFixed(2)
                : (+product.usdRetail__c - (discount?.sample / 100) * +product.usdRetail__c).toFixed(2);
            } else {
              salesPrice = product.usdRetail__c.includes("$")
                ? (+listPrice - (discount?.margin / 100) * +listPrice).toFixed(2)
                : (+product.usdRetail__c - (discount?.margin / 100) * +product.usdRetail__c).toFixed(2);
            }
            bagPrice += salesPrice * element["Quantity"];
          }
        }
      }
    })
    setAlert('-');
    if (rawData.discount.MinOrderAmount >= bagPrice) {
      setAlert(bagPrice);
    } else {
      setAlert('-');
      let productCount = 0;
      let createOrderList = [];
      let address = null;
      if (localStorage.getItem("address")) {
        address = JSON.parse(localStorage.getItem("address"));
      }
      let account = {
        
        name: localStorage.getItem("Account"),
        id: localStorage.getItem("AccountId__c"),
        address,
        shippingMethod: JSON.parse(localStorage.getItem("shippingMethod")),
        discount: rawData.discount,
        SalesRepId: salesRepId,
      }

      let manufacturer = {
        name: localStorage.getItem("manufacturer"),
        id: localStorage.getItem("ManufacturerId__c")
      }
      data.map((element) => {
        if (element.Quantity && Number.isInteger(element?.Quantity)) {
          let product = getProductData(element["Product Code"] || element["ProductCode"]);
          const category = product?.Category__c?.toLowerCase();
          if (orderType == "preorder" ? (category === "preorder" || (category?.match("event")?.length > 0)) : (category !== "preorder" && !category?.match("event"))) {
            if (product?.Id && element?.Quantity >= (product.Min_Order_QTY__c || 0) && (!product.Min_Order_QTY__c || element?.Quantity % product.Min_Order_QTY__c === 0)) {
              productCount++;
              let item = {};
              let discountAmount = 0;
              let listPrice = product.usdRetail__c;
              if (product.usdRetail__c.includes("$")) {
                listPrice = product.usdRetail__c.substring(1);
              }
              if (listPrice == 'NaN') {
                listPrice = 0;
              }
              if (product.Category__c === "TESTER") {
                item.discount = discount?.testerMargin;
                discountAmount = discount?.testerMargin;
              } else if (product.Category__c === "Samples") {
                item.discount = discount?.sample;
                discountAmount = discount?.sample;
              } else {
                item.discount = discount?.margin;
                discountAmount = discount?.margin;
              }
              let salesPrice = (+listPrice - (discountAmount / 100) * +listPrice).toFixed(2);
              item.price = salesPrice;
              item.ProductCode = element["Product Code"] || element["ProductCode"];
              item.qty = element["Quantity"];
              let orderType = 'wholesale';
              if (product?.Category__c?.toUpperCase() === "PREORDER" || product?.Category__c?.toUpperCase()?.match("EVENT")) {
                orderType = 'pre-order'
              }
              product.price = salesPrice;
              product.qty = element["Quantity"];
              product.orderType = orderType;
              // console.log(product , "product")
              manufacturer.name = product.ManufacturerName__c
              manufacturer.id = localStorage.getItem("ManufacturerId__c")

              createOrderList.push(product)

            }
          }
        }
      });
      if (productCount) {
        let uploadedType = "wholesale"
        if (orderType == "preorder") {
          uploadedType = "pre-order"
        }
        contentApiFunction(createOrderList, account, manufacturer, uploadedType).then((result) => {
          let currentUrl = window.location.origin;
          // let url = currentUrl + "/my-bag";
          navigate('/my-bag')
        }).catch(e => console.error({ e }))
      } else {
        alert("Product list not found");
      }
    }
  };
  useEffect(() => {
    if (errorOnlist > 0) {
      setOpenModal(true);
    }
    CheckError(data);
  }, [errorOnlist, orderType]);
  
  if (!showTable) {
    return (
      <div>
        {alert != '-' && (
          <ModalPage
            open
            content={
              <>
                <div style={{ maxWidth: "309px" }}>
                  <h1 className={`fs-5 ${Styles.ModalHeader}`}>Warning</h1>
                  <p className={` ${Styles.ModalContent}`}>Please Select Products of Minimum Order Amount</p>
                  <p className={` ${Styles.ModalContent}`}>Selected Order Amount ${alert.toFixed(2)}</p>
                  <div className="d-flex justify-content-center">
                    <button className={`${Styles.modalButton}`} onClick={() => setAlert('-')}>
                      OK
                    </button>
                  </div>
                </div>
              </>
            }
            onClose={() => setAlert('-')}
          />
        )}
        {/* <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleFileChange} /> */}
        <ModalPage
          open={limitCheck || false}
          content={
            <>
              <div style={{ maxWidth: "309px" }}>
                <h1 className={`fs-5 ${Styles.ModalHeader}`}>Warning</h1>
                <p className={` ${Styles.ModalContent}`}>Please upload file with less than 100 products</p>
                <div className="d-flex justify-content-center">
                  <button className={`${Styles.modalButton}`} onClick={() => setLimitCheck(false)}>
                    OK
                  </button>
                </div>
              </div>
            </>
          }
          onClose={() => setLimitCheck(false)}
        />
        <form className="d-flex justify-content-between">
          <div className="d-flex">
            <div className="d-flex flex-column">
              <label for="ordertTypeId" style={{ fontSize: '11px', textAlign: 'start' }}>Order Type</label>
              <select id="ordertTypeId" onChange={(e) => { setorderType(e.target.value) }}>
                {orderTypeList.map((element) => <option value={element.value} selected={element.value == orderType}>{element.label}</option>)}
              </select>
            </div>
            <div className="d-flex flex-column ml-2">
              <label for="orderFile" style={{ fontSize: '11px', textAlign: 'start' }}>File</label>
              <input type="file" id="orderFile" ref={fileInputRef} accept=".csv" onChange={handleFileChange} />
            </div>
          </div>
          <input
            type="reset"
            value={"reset"}
            className={btnClassName}
            onClick={() => {
              setData([]);
              setIsLoading(false);
              setErrorOnList(0);
            }}
          />
        </form>
        <div>{errorOnlist > 0 && errorOnlist !== data.length && <p className="text-start mt-2 text-danger">Highlighted rows have issues in their given quantity. Upload Again or Move further with correct rows.</p>}</div>
        <div>{errorOnlist > 0 && errorOnlist === data.length && <p className="text-start mt-2 text-danger">No Data Found.</p>}</div>
        <div>
          {openModal && errorOnlist > 0 &&errorOnlist === data.length ? (
            <ModalPage
              open
              content={
                <>
                  <div style={{ maxWidth: "309px" }}>
                    <h1 className={`fs-5 ${Styles.ModalHeader}`}>Warning</h1>
                    <p className={` ${Styles.ModalContent} tracking-[1.2px] leading-[20px]`}>No Data Found </p>
                    <div className="d-flex justify-content-center">
                      <button className={`${Styles.modalButton}`} onClick={() => setOpenModal(false)}>
                        OK
                      </button>
                    </div>
                  </div>
                </>
              }
              onClose={() => {
                setOpenModal(false);
              }}
            />
          ) : null}
        </div>
        {openModal && errorOnlist > 0 && errorOnlist !== data.length && (
          <ModalPage
            open
            content={
              <>
                <div style={{ maxWidth: "309px" }}>
                  <h1 className={`fs-5 ${Styles.ModalHeader}`}>Warning</h1>
                  <p className={` ${Styles.ModalContent} tracking-[1.2px] leading-[20px]`}>Highlighted rows have issues in their given quantity.</p>
                  <p className={` ${Styles.ModalContent} tracking-[1.2px] leading-[20px]`}>Upload Again or Move further with correct rows.</p>
                  <div className="d-flex justify-content-center">
                    <button className={`${Styles.modalButton}`} onClick={() => setOpenModal(false)}>
                      OK
                    </button>
                  </div>
                </div>
              </>
            }
            onClose={() => {
              setOpenModal(false);
            }}
          />
        )}
        {isLoading && (
          <>
            <table className="table table-hover text-start">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Product Code</th>
                  <th>Product Category</th>
                  <th>Product UPC</th>
                  <th>MSRP</th>
                  <th>Cost</th>
                  <th>Min Qty</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => {
                  let productDetails = getProductData(item["Product Code"] || item['ProductCode'] || null);
                  if (item?.Quantity) {
                    let error = !item?.Quantity || !Number.isInteger(item?.Quantity) || item?.Quantity < (productDetails.Min_Order_QTY__c || 0) || !productDetails?.Name || productDetails.Min_Order_QTY__c ? item?.Quantity % productDetails.Min_Order_QTY__c !== 0 : false;
                    orderType == "preorder" ? (error == false) ? !productDetails?.Category__c?.toLowerCase()?.match("event") ? error = productDetails?.Category__c?.toLowerCase() != orderType.toLowerCase() : error = error : error = error : (error == false) ? error = (productDetails?.Category__c?.toLowerCase() == "preorder" || productDetails?.Category__c?.toLowerCase()?.match("event")) : error = error
                    return (
                      <tr key={index}>
                        <td style={error ? { background: "red", color: "#fff" } : {}}>{productDetails?.Name || "---"}</td>
                        <td style={error ? { background: "red", color: "#fff" } : {}}>{productDetails?.ProductCode || item["Product Code"] || item['ProductCode']}</td>
                        <td style={error ? { background: "red", color: "#fff" } : {}}>{productDetails?.Category__c || "No Category"}</td>
                        <td style={error ? { background: "red", color: "#fff" } : {}}>{productDetails?.ProductUPC__c || item["ProductUPC"]}</td>
                        <td style={error ? { background: "red", color: "#fff" } : {}}>{productDetails?.usdRetail__c || "---"}</td>
                        <td style={error ? { background: "red", color: "#fff" } : {}}>${productDetails?.salesPrice || "---"}</td>
                        <td style={error ? { background: "red", color: "#fff" } : {}}>{productDetails?.Min_Order_QTY__c || 0}</td>
                        {/* <td><div className='Style_ButtonControl__-vuDew-[85px] h-[27px] flex '><span className='px-[8px] h-full bg-[#f8fafb] border border-solid border-black' style={(!item?.Quantity || Number.isInteger(item?.Quantity) || !productDetails?.Name) ? {} : { background: '#FFC1C3' }}>-</span><input className='w-[25px] text-center text-[12px] leading-tight appearance-none border-t-[1px] border-b-[1px] border-solid border-black' value={item?.Quantity || 0} readOnly /><span className='px-[8px] h-full bg-[#f8fafb] border border-solid border-black' style={(!item?.Quantity || Number.isInteger(item?.Quantity) || !productDetails?.Name) ? {} : { background: '#FFC1C3' }}>+</span></div></td> */}
                        <td style={error ? { background: "red", color: "#fff" } : {}}>{item?.Quantity || 0}</td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
            {emptyList>0&&emptyList && data.length > 0 && emptyList == data.length ? (
              <div className="flex flex-column justify-center items-center py-4 w-full lg:min-h-[300px] xl:min-h-[380px]">
                <div>Products with zero quantity are uploaded! </div>
                <div className="mt-3">No Data Found.</div>
              </div>
            ) : null}
            <div className="d-flex justify-content-center" >
              <button className={btnClassName} onClick={() => { !isLimitPass ? submitForm() : setLimitCheck(true) }}>
                Submit
              </button>
              <button
                style={{
                  color: "#000",
                  fontFamily: "Montserrat",
                  fontSize: "14px",
                  fontStyle: "normal",
                  fontWeight: 600,
                  lineHeight: "normal",
                  letterSpacing: "1.4px",
                  width: "100px",
                  height: "30px",
                  backgroundColor: "#fff",
                  border: "1px solid #000",
                  margin: "0 2rem",
                  textTransform: "uppercase",
                }}
                onClick={() => setOrderFromModal(false)}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    );
  } else {
    return (
      <div>
        <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleFileChange} />
        <table>
          <thead>
            <tr>
              {Object.keys(data[0] || []).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((value, index) => (
                  <td key={index}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
};

export default SpreadsheetUploader;
import React, { useState } from "react";
import styles from "./Style.module.css";
import CollapsibleRow from "../../CollapsibleRow";
import QuantitySelector from "./QuantitySelector";
import ModalPage from "../../Modal UI";
import ProductDetails from "../../../pages/productDetails";
import { useCart } from "../../../context/CartContext";
import ImageHandler from "../../loader/ImageHandler";
import Swal from "sweetalert2";

const Accordion = ({ salesRepId, data, formattedData, productImage = [], productCartSchema = {} }) => {
  const { testerInclude, sampleInclude } = productCartSchema || true;
  let selectedsalesRep = JSON.parse(localStorage.getItem('selectedSalesrepId'))
  console.log(selectedsalesRep, "----accordian salesrep")
  let Img1 = "/assets/images/dummy.png";
  const { order, updateProductQty, addOrder, removeProduct, deleteOrder, isProductCarted, isCategoryCarted, updateProductPrice } = useCart();
  const [replaceCartModalOpen, setReplaceCartModalOpen] = useState(false);
  // console.log(productCartSchema)
  const [replaceCartProduct, setReplaceCartProduct] = useState({});
  const [showName, setShowName] = useState(false);
  const [productDetailId, setProductDetailId] = useState(null);
  const [priceInputs, setPriceInputs] = useState({});
  const [msg, setMsg] = useState("");
  const onPriceChangeHander = (productId, price = '0') => {
    if (price == '') price = 0;
    updateProductPrice(productId, price || 0)
  }

  const onQuantityChange = (element, quantity) => {
    let checkProduct = isProductCarted(element.Id);
    if (data.discount.portalProductManage) {
      if (element.Available_Quantity__c) {
        if (quantity > element.Available_Quantity__c && quantity > checkProduct?.items?.qty) {
          return Swal.fire({
            title: "Alert!",
            text: "Oops! You’re trying to add more than what’s available. We only have " + element.Available_Quantity__c + " left in stock.",
            confirmButtonColor: "#000", // Black
          });
        }
      } else {
        return Swal.fire({
          title: "Oops!",
          text: "The product you're trying to add to your cart is currently out of stock. Please check back soon",
          confirmButtonColor: "#000", // Black
        });
      }
    }
    if (!quantity) {
      quantity = element.Min_Order_QTY__c;
    }

    if (checkProduct) {
      if (order?.Account?.id === localStorage.getItem("AccountId__c")) {
        let cartStatus = updateProductQty(element.Id, quantity);
        return;
      }
    }
    let listPrice = Number(element?.usdRetail__c?.replace("$", "")?.replace(",", ""));
    let account = {
      name: localStorage.getItem("Account"),
      id: localStorage.getItem("AccountId__c"),
      address: JSON.parse(localStorage.getItem("address")),
      shippingMethod: JSON.parse(localStorage.getItem("shippingMethod")),
      discount: data.discount,
      SalesRepId: salesRepId,
    };

    let manufacturer = {
      name: element.ManufacturerName__c,
      id: localStorage.getItem("ManufacturerId__c"),
    };
    let orderType = "wholesale";
    if (element?.Category__c?.toUpperCase() === "PREORDER" || element?.Category__c?.toUpperCase()?.match("EVENT")) {
      orderType = "pre-order";
    }
    element.orderType = orderType;
    let discount = 0;
    if (element?.Category__c === "TESTER") {
      discount = data.discount?.testerMargin || 0;
    } else if (element?.Category__c === "Samples") {
      discount = data.discount?.sample || 0;
    } else {
      discount = data.discount?.margin || 0;
    }
    let salesPrice = (+listPrice - ((discount || 0) / 100) * +listPrice).toFixed(2);
    element.price = salesPrice;
    element.qty = quantity;
    // console.log(salesPrice, "salesprice")
    // element.discount = discount;
    let cartStatus = addOrder(element, account, manufacturer);

  };

  const orderSetting = (product, quantity) => {
    setReplaceCartModalOpen(false);
    addOrder(product, quantity, data.discount);
  };

  const replaceCart = () => {
    localStorage.removeItem("orders");
    setReplaceCartModalOpen(false);
    deleteOrder();
    addOrder(replaceCartProduct.product, replaceCartProduct.quantity, data.discount);
  };

  const sendProductIdHandler = ({ productId, productName }) => {
    // navigate('/product/'+productName.replaceAll(" ","-").replaceAll("=","-"), { state: { productId } });
    setProductDetailId(productId);
  };
  return (
    <>
      {replaceCartModalOpen ? (
        <ModalPage
          open
          content={
            <div className="d-flex flex-column gap-3">
              <h2 className={`${styles.warning} `}>Warning</h2>
              <p className={`${styles.warningContent} `} dangerouslySetInnerHTML={{ __html: msg ? msg : "Adding this item will replace </br> your current cart" }}></p>
              <div className="d-flex justify-content-around ">
                <button className={`${styles.modalButton}`} style={msg ? { width: "150px" } : {}} onClick={replaceCart}>
                  {msg ? "Replace cart" : "OK"}
                </button>
                <button className={`${styles.modalButton}`} onClick={() => setReplaceCartModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          }
          onClose={() => {
            setReplaceCartModalOpen(false);
          }}
        />
      ) : null}
      <div className={styles.OverFloweClass}>
        <div className={styles.accordion}>
          <table className="table table-hover ">
            <thead>
              <tr>
                {/* <th>Image</th> */}
                <th style={{ width: "200px", paddingLeft: "22px" }}>Title</th>
                <th>Product Code</th>
                <th>UPC</th>
                <th>List Price</th>
                <th style={{ width: "175px" }}>Sale Price</th>
                <th>Min Qty</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            {Object.keys(formattedData).length ? (
              <>
                <tbody>
                  {Object.keys(formattedData)?.map((key, index) => {
                    let categoryOrderQuantity = false;
                    if (order?.Account?.id == localStorage.getItem("AccountId__c") && order?.Manufacturer?.id == localStorage.getItem("ManufacturerId__c")) {
                      categoryOrderQuantity = isCategoryCarted(key);
                    }
                    return (
                      <CollapsibleRow title={key != "null" ? key : "No Category"} quantity={categoryOrderQuantity} key={index} index={index}>
                        {Object.values(formattedData)[index]?.map((value, indexed) => {
                          let cartProduct = {};
                          if (order?.Account?.id === localStorage.getItem("AccountId__c") && isProductCarted(value.Id)) {
                            cartProduct = isProductCarted(value.Id);
                          }

                          let listPrice = Number(value?.usdRetail__c?.replace("$", "").replace(",", ""));
                          if (isNaN(listPrice)) {
                            listPrice = 0;
                          }
                          let salesPrice = 0;
                          let discount = 0;
                          let inputPrice = cartProduct?.items?.price;
                          let qtyofItem = cartProduct?.items?.qty || 0;

                          if (value?.Category__c === "TESTER") {
                            discount = data?.discount?.testerMargin;
                          } else if (value?.Category__c === "Samples") {
                            discount = data?.discount?.sample;
                          } else {
                            discount = data?.discount?.margin;
                          }
                          salesPrice = (+listPrice - (discount / 100) * +listPrice).toFixed(2);
                          return (
                            <tr className={`${styles.ControlTR} w-full `} key={indexed}>
                              {/* <td className={styles.ControlStyle} style={{ cursor: "pointer" }}> */}
                              {/* <ImageHandler
                                  image={{ src: value?.ContentDownloadUrl || productImage.images[value?.ProductCode]?.ContentDownloadUrl || productImage.images[value?.ProductCode] || "dummy.png" }}
                                  width={50}
                                  onClick={() => sendProductIdHandler({ productId: value.Id, productName: value.Name })}
                                /> */}
                              {/* </td> */}
                              <td
                                className="text-capitalize linkEffect"
                                style={{ fontSize: "13px", cursor: "pointer", paddingLeft: "22px" }}
                                onMouseEnter={() => setShowName({ index: indexed, type: true })}
                                onMouseLeave={() => setShowName({ index: indexed })}
                                onClick={() => sendProductIdHandler({ productId: value.Id, productName: value.Name })}
                              >
                                {indexed !== showName?.index && value.Name.length >= 23 ? `${value.Name.substring(0, 23)}...` : value.Name}
                              </td>
                              <td>{value.ProductCode}</td>
                              <td>{value.ProductUPC__c === null || value.ProductUPC__c === "n/a" ? "--" : value.ProductUPC__c}</td>
                              <td>{value?.usdRetail__c?.includes("$") ? `$${listPrice}` : `$${Number(value.usdRetail__c).toFixed(2)}`}</td>
                              <td>
                                <div className="d-flex">
                                  ${(inputPrice || inputPrice == 0) ? <input type="number" value={inputPrice} placeholder={Number(inputPrice).toFixed(2)} className={`${styles.customPriceInput} ms-1`}
                                    onChange={(e) => { onPriceChangeHander(value.Id, e.target.value < 10 ? e.target.value.replace("0", "").slice(0, 5) : e.target.value.slice(0, 5) || 0) }} id="limit_input" minLength={0} maxLength={4}
                                    name="limit_input" /> : salesPrice}
                                </div>
                              </td>
                              <td>{value.Min_Order_QTY__c || 0}</td>
                              <td>
                                <QuantitySelector
                                  min={value.Min_Order_QTY__c || 0}
                                  onChange={(quantity) => {
                                    if (data.discount.portalProductManage) {
                                      if (value.Available_Quantity__c) {
                                        if (quantity) {
                                          onQuantityChange(value, quantity);
                                        } else {
                                          if (order?.Account?.id === localStorage.getItem("AccountId__c") && isProductCarted(value.Id)) {
                                            removeProduct(value.Id);
                                          }
                                        }
                                      } else {
                                        Swal.fire({
                                          title: "Oops!",
                                          text: "The product you're trying to add to your cart is currently out of stock. Please check back soon",
                                          icon: "warning",
                                          confirmButtonColor: "#000", // Black
                                        });
                                      }
                                    } else {
                                      if (quantity) {
                                        onQuantityChange(value, quantity);
                                      } else {
                                        if (order?.Account?.id === localStorage.getItem("AccountId__c") && isProductCarted(value.Id)) {
                                          removeProduct(value.Id);
                                        }
                                      }
                                    }
                                  }}
                                  value={order?.Account?.id === localStorage.getItem("AccountId__c") ? qtyofItem : 0}
                                />
                              </td>
                              <td>
                                {order?.Account?.id === localStorage.getItem("AccountId__c") ? (
                                  qtyofItem > 0 ? (
                                    `$${((priceInputs[value.Id] ?? inputPrice ?? salesPrice) * qtyofItem)
                                      .toFixed(2)}`
                                  ) : (
                                    "----"
                                  )
                                ) : (
                                  "----"
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </CollapsibleRow>
                    );
                  })}{" "}
                </tbody>
              </>
            ) : (
              <tbody>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="flex justify-start items-center py-4 w-full lg:min-h-[300px] xl:min-h-[380px]">No Data Found</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
      <ProductDetails
        productId={productDetailId}
        setProductDetailId={setProductDetailId}
        ManufacturerId={localStorage.getItem("ManufacturerId__c")}
        AccountId={[localStorage.getItem("AccountId__c")]}
        selectedsalesRep={selectedsalesRep}
      />
    </>
  );
};

export default Accordion;

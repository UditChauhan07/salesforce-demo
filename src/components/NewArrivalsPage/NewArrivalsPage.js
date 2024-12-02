import React, { useEffect, useState, useMemo } from "react";
import ProductDetails from "../../pages/productDetails";
import Styles from "./NewArrivals.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Pagination from "../Pagination/Pagination";
import { Link } from "react-router-dom";
import ModalPage from "../Modal UI";
import StylesModal from "../Modal UI/Styles.module.css";
import Loading from "../Loading";
import LoaderV2 from "../loader/v2";
import { useCart } from "../../context/CartContext";
import Select from "react-select";
import { DeleteIcon } from "../../lib/svg";
import { useNavigate } from "react-router-dom";
import QuantitySelector from "../BrandDetails/Accordion/QuantitySelector";
import { isDateEqualOrGreaterThanToday } from "../../lib/store";
import ImageHandler from "../loader/ImageHandler";
function NewArrivalsPage({ productList, brand, month, isLoaded, to = null, accountDetails = {} }) {
  const [productData , setProductData] = useState(productList)
  console.log(productList ? 'true' : 'false')
  

  const navigate = useNavigate();
  const { updateProductQty, addOrder, removeProduct, isProductCarted } = useCart();
  useEffect(() => { }, [productList])
  const [modalShow, setModalShow] = useState(false);
  const [productDetailId, setProductDetailId] = useState();
  const [productBrandId, setProductBrandId] = useState();
  const [isEmpty, setIsEmpty] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadEffect, setEffect] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterData, setFilterData] = useState([]);
  const [pagination, setPagination] = useState([]);

  const [dealAccountList, setDealAccountList] = useState([]);
  const [selectAccount, setSelectAccount] = useState();

  const [AccountId, setAccount] = useState();
  const [accountList, setAccountList] = useState([]);
  const [accountSelectCheck, setAccountSelectCheck] = useState(false)
  const [replaceCartProduct, setReplaceCartProduct] = useState({});


  const PageSize = 10;

  const allOrdersEmpty = pagination.every(item => item.content.length <= 0);

  useEffect(() => {
    if (filterData && filterData.length > 0) {
      const startIndex = (currentPage - 1) * PageSize;
      const endIndex = currentPage * PageSize;
      const newValues = filterData.flatMap((month) => month?.content);
      //.slice(startIndex, endIndex)
      setPagination([{ content: newValues }]);
    } else {
      setPagination([{ content: [] }]);
    }
  }, [filterData, currentPage, PageSize]);

  useEffect(() => {
    let temp = true;
    productList.forEach((month) => {
      month.content.forEach((item) => {
        if (!brand || brand === item.brand || brand == item.ManufacturerId__c) {
          temp = false;
        }
      });
    });
    setIsEmpty(temp);
  }, [brand, productList]);

  useEffect(() => {
    if (loadEffect) setLoaded(true);
    let newFilterData;

    if (!month) {
      newFilterData = productList;
    } else {
      newFilterData = productList.map((months) => {
        const filteredContent = months.content.filter((item) => {
          if (month) {
            if (brand && brand !== "All") {
              return brand === item.ManufacturerId__c && item.date.toLowerCase().includes(month.toLowerCase());
            }
            return item.date.toLowerCase().includes(month.toLowerCase());
          }
        });
        return { ...months, content: filteredContent };
      }).filter(months => months.content.length > 0); // Remove months with no content
    }

    setFilterData(newFilterData);
    setEffect(loadEffect + 1);
    setCurrentPage(1); // Reset to the first page when filters change
    setTimeout(() => {
      setLoaded(false);
    }, 500);
  }, [month, brand, productList]);

  const [imageLoading, setImageLoading] = useState({});
  const handleImageLoad = (imageId) => {
    setImageLoading((prevLoading) => ({ ...prevLoading, [imageId]: false }));
  };

  const resetHandler = () => {
    setProductDetailId();
    setProductBrandId();
  };


  const onQuantityChange = (element, quantity) => {
    let listPrice = Number(element?.usdRetail__c?.replace("$", "")?.replace(",", ""));
    let selectProductDealWith = accountDetails?.[element.ManufacturerId__c] || []
    let listOfAccounts = Object.keys(selectProductDealWith);
    let addProductToAccount = null

    if (listOfAccounts.length) {
      if (listOfAccounts.length == 1) {
        addProductToAccount = listOfAccounts[0];
      } else {
        //multi store deal with
        if (selectAccount) {
          if (selectAccount?.value) {
            addProductToAccount = selectAccount.value
          }
        } else {
          let accounts = [];
          listOfAccounts.map((actId) => {
            if (selectProductDealWith[actId]) {
              accounts.push({ value: actId, label: selectProductDealWith[actId].Name })
            }
          })
          setReplaceCartProduct({ product: element, quantity });
          setDealAccountList(accounts);
          //alert user
          return;
        }
      }
      if (addProductToAccount) {
        let selectAccount = selectProductDealWith[addProductToAccount];

        let account = {
          name: selectAccount?.Name,
          id: addProductToAccount,
          address: selectAccount?.ShippingAddress,
          shippingMethod: selectAccount?.ShippingMethod,
          discount: selectAccount?.Discount,
          SalesRepId: selectAccount?.SalesRepId
        }

        let manufacturer = {
          name: element.ManufacturerName__c,
          id: element.ManufacturerId__c,
        }
        let orderType = 'wholesale';
        if (element?.Category__c?.toUpperCase() === "PREORDER" || element?.Category__c?.toUpperCase()?.match("EVENT")) {
          orderType = 'pre-order'
        }
        element.orderType = orderType;
        let discount = 0;
        if (element?.Category__c === "TESTER") {
          discount = selectAccount?.Discount?.testerMargin || 0;
        } else if (element?.Category__c === "Samples") {
          discount = selectAccount?.Discount?.sample || 0;
        } else {
          discount = selectAccount?.Discount?.margin || 0;
        }
        let salesPrice = (+listPrice - ((discount || 0) / 100) * +listPrice)?.toFixed(2);
        element.price = salesPrice;
        element.qty = element.Min_Order_QTY__c;
        let cartStatus = addOrder(element, account, manufacturer);
      }
    }
  }
  const accountSelectionHandler = () => {
    onQuantityChange(replaceCartProduct.product, replaceCartProduct.quantity, replaceCartProduct.salesPrice)
    accountSelectionCloseHandler();
  }
  const accountSelectionCloseHandler = () => {
    setReplaceCartProduct();
    setAccountList();
    setSelectAccount();
    setDealAccountList();
  }

  const HtmlFieldSelect = ({ title, list = [], value, onChange }) => {
    const styles = {
      holder: {
        border: "1px dashed #ccc",
        padding: "10px",
        width: "100%",
        marginBottom: "20px",
      },
      title: {
        color: "#000",
        textAlign: "left",
        fontFamily: "Montserrat",
        fontSize: "14px",
        fontStyle: "normal",
        fontWeight: 500,
        lineHeight: "24px",
        letterSpacing: "2.2px",
        textTransform: "uppercase",
      },
    };

    // Custom styles for react-select
    const customSelectStyles = {
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? "black" : state.isFocused ? "lightgray" : "white",
        color: state.isSelected ? "white" : "black",
      }),
      control: (provided) => ({
        ...provided,
        border: "1px solid #ccc",
      }),
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      menu: (provided) => ({
        ...provided,
        maxHeight: "200px", // Maximum height for the dropdown
        overflowY: "auto", // Adds vertical scrolling
      }),
      menuList: (provided) => ({
        ...provided,
        maxHeight: "200px", // Matches the menu height
        overflowY: "auto", // Adds vertical scrolling
      }),
    };

    return (
      <div style={styles.holder}>
        <p style={styles.title}>{title}</p>
        <Select
          options={list}
          menuPortalTarget={document.body}
          styles={customSelectStyles}
          onChange={onChange}
          value={list.find((option) => option.value === value?.value) || ""}
        />
      </div>
    );
  };

 if (isLoaded) return <Loading height={"70vh"} />
  return (
    <>
      <ModalPage
        open={dealAccountList?.length ? true : false}
        content={
          <div className="d-flex flex-column gap-3">
            <h2>Alert!</h2>
            <p>
              You have multi store with deal with this Brand.<br /> can you please select you create order for
            </p>
              <HtmlFieldSelect value={selectAccount} list={dealAccountList} onChange={(value) => setSelectAccount(value)} />
            <div className="d-flex justify-content-around ">
              <button className={`${StylesModal.modalButton}`} onClick={accountSelectionHandler}>
                OK
              </button>
              <button className={`${StylesModal.modalButton}`} onClick={accountSelectionCloseHandler}>
                Cancel
              </button>
            </div>
          </div>
        }
        onClose={accountSelectionCloseHandler}
      />
      <ModalPage
        open={accountSelectCheck ?? false}
        content={
          <>
            <div style={{ maxWidth: "309px" }}>
              <h1 className={`fs-5 ${StylesModal.ModalHeader}`}>Attention!</h1>
              <p>
                Please select store you want to order for
              </p>
              <Select options={accountList?.map((account) => ({ label: account.Name, value: account.Id }))} />
              <div className="d-flex justify-content-center">
                <button
                  className={`${Styles.modalButton}`}
                  onClick={() => {
                    setAccountSelectCheck(false);
                  }}
                >
                  Add to Bag
                </button>
              </div>
            </div>
          </>
        }
        onClose={() => {
          setAccountSelectCheck(false);
        }}
      />
      {modalShow ? (
        <ModalPage
          open
          content={
            <>
              <div style={{ maxWidth: "309px" }}>
                <h1 className={`fs-5 ${StylesModal.ModalHeader}`}>Bag</h1>
                <p className={` ${StylesModal.ModalContent}`}>This product will be available soon. Please check back later</p>
                <div className="d-flex justify-content-center">
                  <button
                    className={`${StylesModal.modalButton}`}
                    onClick={() => {
                      setModalShow(false);
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </>
          }
          onClose={() => {
            setModalShow(false);
          }}
        />
      ) : null}
      <section id="newArrivalsSection">
        <div>
          <div className={(!isEmpty) ? Styles.dGrid : null} id="dGridHolder">
            {!isEmpty ? (
              pagination?.map((month, _i) => {              
                if (month.content?.length) {
                  if (month.content.length < 5) {
                    let div = document.getElementById("dGridHolder");
                    if (div) {
                      div.style.gridTemplateColumns = `repeat(auto-fill, ${(100 / month.content.length) - 1}`
                    }
                  }
                  return month.content.map((product, __i) => {
                    let ProductInCart = isProductCarted(product.Id);
                    if (true) {
                      let listPrice = Number(product?.usdRetail__c?.replace("$", "")?.replace(",", ""));
                      if (isNaN(listPrice)) {
                        listPrice = product?.usdRetail__c;
                      }
                      let salesPrice = 0;
                      let selectProductDealWith = accountDetails?.[product.ManufacturerId__c] || []
                      let listOfAccounts = Object.keys(selectProductDealWith);
                      let discount = 0;
                      let selAccount = {};
                      if (listOfAccounts.length) {
                        if (listOfAccounts.length == 1) {
                          selAccount = accountDetails?.[product?.ManufacturerId__c]?.[listOfAccounts[0]];
                          if (product?.Category__c === "TESTER") {
                            discount = selAccount?.Discount?.testerMargin || 0;
                          } else if (product?.Category__c === "Samples") {
                            discount = selAccount?.Discount?.sample || 0;
                          } else {
                            discount = selAccount?.Discount?.margin || 0;
                          }
                        }
                      }
                      salesPrice = (+listPrice - ((discount || 0) / 100) * +listPrice);
                      return (

                        <div className={Styles.cardElement}>
                          {/* {isLoaded ? <img className={Styles.imgHolder} onClick={() => { setProductDetailId(product.Id) }} src={product?.[product.ProductCode]?.ContentDownloadUrl ?? product.image} /> : <LoaderV2 />} */}
                          <div className={` last:mb-0 mb-4 ${Styles.HoverArrow}`}>
                            <div className={` border-[#D0CFCF] flex flex-col gap-4 h-full  ${Styles.ImgHover1}`}>
                              {imageLoading[product.Id] ? (
                                <LoaderV2 width={100} height={100} />
                              ) : (
                                <ImageHandler image={{src:product.ProductImage ?? "\\assets\\images\\dummy.png",alt:product.Name}} height={212} width={212} onClick={() => {
                                  setProductDetailId(product.Id);
                                }} onLoad={() => handleImageLoad(product.Id)} />
                              )}
                            </div>
                          </div>
                          <p onClick={() => navigate("/Brand/" + product.ManufacturerId__c)} className={Styles.brandHolder}>{product?.ManufacturerName__c}</p>
                          <p
                            className={Styles.titleHolder}
                            onClick={() => {
                              setProductDetailId(product.Id);
                            }}
                          >
                            {product?.Name?.substring(0, 15)}...
                          </p>
                          {selAccount?.Name ? <small>Price for <b>{selAccount.Name}</b></small> : ProductInCart ? <small>Price for <b>{ProductInCart.Account.name}</b></small> : null}
                          <p className={Styles.priceHolder}>
                            {(!isNaN(salesPrice) && !isNaN(listPrice)) ? salesPrice != listPrice ? <div className={Styles.priceCrossed}>${listPrice?.toFixed(2)}</div> : ProductInCart ? <div className={Styles.priceCrossed}>{listPrice ? '$' + listPrice?.toFixed(2) : null}</div> : null : null}
                            &nbsp;
                            <div>${ProductInCart ? <Link to={"/my-bag"}>{Number(ProductInCart?.items?.price)?.toFixed(2)}</Link> : !isNaN(salesPrice) ? salesPrice?.toFixed(2) : listPrice ?? "-- . --"}</div>
                          </p>
                          <div className={Styles.linkHolder}>
                            {ProductInCart ? (
                              <>

                                {/* <b className={Styles.priceHolder}>{inputPrice * orders[product?.Id]?.quantity}</b> */}
                                <div className="d-flex">
                                  <QuantitySelector
                                    min={product?.Min_Order_QTY__c || 0}
                                    value={ProductInCart?.items?.qty}
                                    onChange={(quantity) => {
                                      updateProductQty(
                                        product.Id,
                                        quantity
                                      );
                                    }}
                                  />
                                  <button
                                    className="ml-4"
                                    onClick={() =>
                                      removeProduct(product.Id)
                                    }
                                  >
                                    <DeleteIcon fill="red" />
                                  </button>
                                </div>
                              </>
                            ) : (

                              <p className={Styles.btnHolder} onClick={() => {
                                if (product.ProductUPC__c && product.ProductCode && product.IsActive && (product?.PricebookEntries?.records?.length && product?.PricebookEntries?.records?.[0]?.IsActive) && (!isNaN(salesPrice) && !isNaN(listPrice)) && isDateEqualOrGreaterThanToday(product.Launch_Date__c)) {
                                  onQuantityChange(
                                    product,
                                    product?.Min_Order_QTY__c || 1,
                                  )
                                } else {
                                  setModalShow(true)
                                }

                              }
                              }>
                                add to Bag {!product.ProductUPC__c || !product.ProductCode || !product.IsActive || (!product?.PricebookEntries?.records?.length || !product?.PricebookEntries?.records?.[0]?.IsActive && (!isNaN(salesPrice) && !isNaN(listPrice)) || !isDateEqualOrGreaterThanToday(product.Launch_Date__c)) ? <small className={Styles.soonHolder}>coming soon</small> : null}
                              </p>)}
                          </div>
                        </div>

                      );
                    }
                  });
                } else {
                    return <div className="row d-flex flex-column justify-content-center align-items-center lg:min-h-[300px] xl:min-h-[400px]" style={{width : '100vw'}}>
                    <div className="col-4">
                      <p className="m-0 fs-2 text-center font-[Montserrat-400] text-[14px] tracking-[2.20px] text-center">
                        No data found
                      </p>
                    </div>
                  </div>
                }
              })
            ) : (
              <div className="row d-flex flex-column justify-content-center align-items-center lg:min-h-[300px] xl:min-h-[400px]">
                <div className="col-4">
                  <p className="m-0 fs-2 text-center font-[Montserrat-400] text-[14px] tracking-[2.20px] text-center">
                    No data found
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        {/*  AccountId={AccountId} */}
        <ProductDetails productId={productDetailId} setProductDetailId={setProductDetailId} />
      </section>
      <Pagination
        className="pagination-bar"
        currentPage={currentPage || 0}
        totalCount={filterData?.flatMap((month) => month?.content)?.length || 0}
        pageSize={PageSize || 0}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  );
}

export default NewArrivalsPage;

import { useEffect, useState } from "react";
import Styles from "./index.module.css";
import { ShareDrive, getProductImageAll } from "../../lib/store";
import LoaderV2 from "../loader/v2";
import { Link } from "react-router-dom";
import ProductDetails from "../../pages/productDetails";
import { useCart } from "../../context/CartContext";
import { DeleteIcon } from "../../lib/svg";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import ModalPage from "../Modal UI";
import QuantitySelector from "../BrandDetails/Accordion/QuantitySelector";
import ImageHandler from "../loader/ImageHandler";

const TopProductCard = ({ data, accountDetails = {} }) => {

  const navigate = useNavigate();
  const [productDetailId, setProductDetailId] = useState(null);
  const { updateProductQty, addOrder, removeProduct, isProductCarted } = useCart();
  const [replaceCartModalOpen, setReplaceCartModalOpen] = useState(false);
  const [dealAccountList, setAccountList] = useState([]);
  const [selectAccount, setSelectAccount] = useState();
  const [replaceCartProduct, setReplaceCartProduct] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectBrand, setBrand] = useState();
  const [salesRepId, setsalesRepId] = useState();
  const [manufacturerId, setManfacturerId] = useState();
  const [manufacturerName, setManufacturerName] = useState();
  const [shippingMethod, setShippingMethod] = useState();
  const [accountNumber, setAccountNumber] = useState();

  const onQuantityChange = (element, quantity) => {
    let listPrice = Number(element?.usdRetail__c?.replace("$", "")?.replace(",", ""));
    let selectProductDealWith = accountDetails[element.ManufacturerId__c] || [];

    let listOfAccounts = Object.keys(selectProductDealWith);

    let addProductToAccount = null;
    if (listOfAccounts.length) {
      if (listOfAccounts.length === 1) {
        addProductToAccount = listOfAccounts[0];
      } else {
        if (selectAccount) {
          if (selectAccount?.value) {
            addProductToAccount = selectAccount.value;
          }
        } else {
          let accounts = [];
          listOfAccounts.forEach((actId) => {
            if (selectProductDealWith[actId]) {
              accounts.push({ value: actId, label: selectProductDealWith[actId].Name });
            }
          });
          setReplaceCartProduct({ product: element, quantity });
          setAccountList(accounts);
          console.log("Accounts for selection:", accounts);
          return; // Prompt user to select an account
        }
      }
      if (addProductToAccount) {
        let selectAccount = selectProductDealWith[addProductToAccount];
        console.log("Selected Account:", selectAccount);

        let account = {
          name: selectAccount?.Name,
          id: addProductToAccount,
          address: selectAccount?.ShippingAddress,
          shippingMethod: selectAccount?.ShippingMethod,
          discount: selectAccount?.Discount,
          SalesRepId: selectAccount?.SalesRepId,
        };

        let manufacturer = {
          name: element.ManufacturerName__c,
          id: element.ManufacturerId__c,
        };

        let orderType = "wholesale";
        if (
          element?.Category__c?.toUpperCase() === "PREORDER" ||
          element?.Category__c?.toUpperCase()?.match("EVENT")
        ) {
          orderType = "pre-order";
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

        let salesPrice = (
          +listPrice -
          ((discount || 0) / 100) * +listPrice
        ).toFixed(2);
        element.price = salesPrice;
        element.qty = element.Min_Order_QTY__c;

        console.log("Adding product to cart:", { element, account, manufacturer });

        let cartStatus = addOrder(element, account, manufacturer);
        console.log("Cart status:", cartStatus);
      }
    } else {
      console.log("No accounts found for this product.");
    }
  };

  const replaceCart = () => {
    setReplaceCartModalOpen(false);
  };

  const accountSelectionHandler = () => {
    onQuantityChange(replaceCartProduct.product, replaceCartProduct.quantity);
    accountSelectionCloseHandler();
  };

  const accountSelectionCloseHandler = () => {
    setReplaceCartProduct({});
    setAccountList([]);
    setSelectAccount(null);
  };

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


  useEffect(() => { }, [productDetailId]);
  return (
    <section>
      <ModalPage
        open={dealAccountList?.length ? true : false}
        content={
          <div className="d-flex flex-column" style={{ width: '400px' }}>
            <h2>Attention!</h2>
            <p>
              You have multi store with deal with this Brand.<br /> can you please select you create order for
            </p>
            <HtmlFieldSelect value={selectAccount} list={dealAccountList} onChange={(value) => setSelectAccount(value)} />
            <div className="d-flex justify-content-around ">
              <button className={Styles.btn} onClick={accountSelectionHandler}>
                OK
              </button>
              <button className={Styles.btn} onClick={accountSelectionCloseHandler}>
                Cancel
              </button>
            </div>
          </div>
        }
        onClose={accountSelectionCloseHandler}
      />
      {replaceCartModalOpen ? (
        <ModalPage
          open
          content={
            <div className="d-flex flex-column gap-3">
              <h2>Warning</h2>
              <p>
                Adding this item will replace <br></br> your current Bag
              </p>
              <div className="d-flex justify-content-around ">
                <button className={Styles.btn} onClick={replaceCart}>
                  OK
                </button>
                <button className={Styles.btn} onClick={() => setReplaceCartModalOpen(false)}>
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
      {isModalOpen ? (
        <ModalPage
          open
          content={
            <div className="d-flex flex-column gap-3">
              <h2>Warning</h2>
              <p>
                You can not order from this brand.<br /> Kindly contact your Sales Rep
              </p>
              <div className="d-flex justify-content-around ">
                <button className={Styles.btn} onClick={() => setIsModalOpen(false)}>
                  Ok
                </button>
              </div>
            </div>
          }
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      ) : null}
      <div>
        <div className={Styles.dGrid}>
          {data.map((product) => {
            let listPrice = Number(product?.usdRetail__c?.replace("$", "")?.replace(",", ""));
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
            salesPrice = (+listPrice - ((discount || 0) / 100) * +listPrice).toFixed(2);
            let ProductInCart = isProductCarted(product.Id);

            return (
              <div className={Styles.cardElement}>
                <div className={Styles.salesHolder}>
                  <svg class="salesIcon" viewBox="0 0 100 100">
                    <circle r="45" cx="50" cy="50" fill="none" stroke="#ccc" stroke-width="5" stroke-dasharray="283" stroke-dashoffset="283">
                      {" "}
                      <animate attributeName="stroke-dashoffset" from="283" to="0" dur="2s" fill="freeze" />{" "}
                    </circle>
                    <text
                      x="50%"
                      y="50%"
                      dominant-baseline="middle"
                      text-anchor="middle"
                      fill="#6a6a6a"
                      font-family="Montserrat-500"
                      font-size="27px"
                      fontWeight="600"
                      line-height="42px"
                      text-shadow="2px 2px 2px rgba(0, 0, 0, 0.5)"
                      text-transform="uppercase"
                    >
                      {" "}
                      <tspan>{product.Sales}</tspan>{" "}
                    </text>{" "}
                  </svg>
                </div>
                <div className={` last:mb-0 mb-4 ${Styles.HoverArrow}`}>
                  <div className={` border-[#D0CFCF] flex flex-col gap-4 h-full  ${Styles.ImgHover1}`}>
                    <ImageHandler
                      onClick={() => {
                        setProductDetailId(product.Id);
                        setBrand(product.ManufacturerId__c);
                        setsalesRepId(accountDetails?.[product.ManufacturerId__c]?.SalesRepId ?? null);
                      }}
                      Id={product.Id}
                      className={Styles.imgHolder}
                    />
                  </div>
                </div>
                <p className={Styles.brandHolder} onClick={() => navigate("/Brand/" + product.ManufacturerId__c)}>{product?.ManufacturerName__c}</p>
                <p
                  className={Styles.titleHolder}
                  onClick={() => {
                    setProductDetailId(product.Id);
                    setBrand(product.ManufacturerId__c);
                    setsalesRepId(accountDetails?.[product.ManufacturerId__c]?.SalesRepId ?? null);
                    setManfacturerId(product.ManufacturerId__c)
                    setManufacturerName(product.ManufacturerName__c)
                    setAccountNumber(accountDetails?.[product.ManufacturerId__c]?.AccountNumber)
                    setShippingMethod(accountDetails?.[product.ManufacturerId__c]?.ShippingMethod)

                  }}
                >
                  {product?.Name.substring(0, 20)}...
                </p>
                {product?.Category__c === "PREORDER" && <small className={Styles.preOrderBadge}>Pre-Order</small>}
                {selAccount?.Name ? <small>Price for <b>{selAccount.Name}</b></small> : ProductInCart ? <small>Price for <b>{ProductInCart.Account.name}</b></small> : null}
                <p className={Styles.priceHolder}>
                  <div>
                    {salesPrice != listPrice ? <p className={Styles.priceCrossed}>${listPrice.toFixed(2)}</p> : ProductInCart ? <p className={Styles.priceCrossed}>${listPrice.toFixed(2)}</p> : null}
                  </div>&nbsp;
                  <div>
                    <p>${ProductInCart ? <Link to={"/my-bag"}>{Number(ProductInCart?.items?.price).toFixed(2)}</Link> : salesPrice}</p>
                  </div>
                </p>
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
                  <p
                    className={Styles.btnHolder}
                    onClick={() =>
                      onQuantityChange(
                        product,
                        product?.Min_Order_QTY__c || 1,
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    Add to Bag
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <ProductDetails
        productId={productDetailId}
        setProductDetailId={setProductDetailId}
      />
    </section>
  );
};
export default TopProductCard;

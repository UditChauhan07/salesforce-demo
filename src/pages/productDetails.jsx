import AppLayout from "../components/AppLayout";
import { useEffect, useState } from "react";
import { defaultLoadTime, GetAuthData, getProductDetails } from "../lib/store";
import Loading from "../components/Loading";
import ModalPage from "../components/Modal UI";
import ProductDetailCard from "../components/ProductDetailCard";
import { CloseButton } from "../lib/svg";
import { useCart } from "../context/CartContext";
import Select from "react-select";
import axios from "axios";
import { originAPi } from "../lib/store";
import dataStore from "../lib/dataStore";
import useBackgroundUpdater from "../utilities/Hooks/useBackgroundUpdater";

const ProductDetails = ({ productId, setProductDetailId, AccountId = null, isPopUp = true, selectedsalesRep }) => {
    const { updateProductQty, addOrder, removeProduct, isProductCarted } = useCart();
    const [product, setProduct] = useState({ isLoaded: false, data: [], discount: {} });
    const [replaceCartModalOpen, setReplaceCartModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(isPopUp);
    const [isModalNoRepOpen, setIsModalNoRepOpen] = useState(false);
    const [dealAccountList, setAccountList] = useState([]);
    const [selectAccount, setSelectAccount] = useState();
    const [replaceCartProduct, setReplaceCartProduct] = useState({});
    const [accountDetails, setAccountDetails] = useState();
    const [manufacturerId, setManufacturerId] = useState();
    const [clickedProduct, setClickedProduct] = useState(null);

    const fetchAccountDetails = async () => {
        const data = await GetAuthData();
        let { Sales_Rep__c: salesRepId, x_access_token: accessToken } = data;
        salesRepId = selectedsalesRep ? selectedsalesRep : salesRepId
        try {
            const res = await dataStore.getPageData("accountDetails" + salesRepId, () => axios.post(`${originAPi}/beauty/v3/23n38hhduu`, {
                salesRepId
                , accessToken
            }));
            if(res){
                setAccountDetails(res?.data?.accountDetails);
            }
        } catch (error) {
            console.error("Error fetching account details:", error);
        }
    };
    const fetchProductDetailHandler = () => {
        if(productId){
            GetAuthData()
            .then((user) => {
                const rawData = { productId, key: user?.x_access_token };
                dataStore.getPageData("/productPage/" + productId, () => getProductDetails({ rawData }))
                .then((productRes) => {
                    readyProductDetails(productRes)
                })
                .catch((err) => console.error("Error fetching product details:", err));
            })
            .catch((err) => console.error("Error fetching auth data:", err));
        }
    }
    const readyProductDetails = (data) => {
        if (data) {
            const manufacturer = data.data?.ManufacturerId__c; // ManufacturerId from the product
            setManufacturerId(manufacturer);
            setClickedProduct(data.data);

            // Logic to handle both cases: with and without AccountId
            let filteredAccountDetails = accountDetails[manufacturer] || {}; // Default to all accounts under the manufacturer
            if (AccountId) {
                if (filteredAccountDetails[AccountId]) {
                    // Filter for specific account if AccountId exists
                    filteredAccountDetails = { [AccountId]: filteredAccountDetails[AccountId] };
                } else {
                    console.warn(`No account details found for AccountId: ${AccountId}`);
                }
            }

            // Extract discount and calculate prices
            const accountDiscount = filteredAccountDetails[AccountId]?.Discount || {};
            const discount = accountDiscount.margin || 0;

            const listPrice = Number(data.data?.usdRetail__c?.replace("$", "").replace(",", ""));
            const salesPrice = (listPrice - (discount / 100) * listPrice).toFixed(2);

            // Update product data with calculated prices and discount
            data.data.salesPrice = salesPrice;
            data.data.discount = discount;

            // Set the product state with the relevant account details
            setProduct({
                isLoaded: true,
                data: data.data,
                discount: filteredAccountDetails, // Either filtered or the default full data
            });
        }
    };

    useEffect(() => {
        fetchAccountDetails();
    }, [selectedsalesRep]);

    useEffect(() => {
        if (productId) {
            dataStore.subscribe("/productPage/" + productId, readyProductDetails);
            setIsModalOpen(isPopUp);
            setProduct({ isLoaded: false, data: [], discount: {} });
            fetchProductDetailHandler();
            return () => {
                dataStore.unsubscribe("/productPage/" + productId, readyProductDetails);
            }
        }
    }, [productId, isPopUp, accountDetails]);

    useBackgroundUpdater(fetchProductDetailHandler, defaultLoadTime);
    if (!productId) return null;


    const onQuantityChange = (element, quantity) => {
        const listPrice = Number(element?.usdRetail__c?.replace("$", "").replace(",", ""));
        const selectProductDealWith = product?.discount || {};
        const listOfAccounts = Object.keys(selectProductDealWith);
        let addProductToAccount = null;

        if (AccountId) {
            // If AccountId is an array, extract the first element
            addProductToAccount = Array.isArray(AccountId) ? AccountId[0] : AccountId;
            console.log(addProductToAccount, "add product to account");
        } else if (listOfAccounts.length) {
            if (listOfAccounts.length === 1) {
                addProductToAccount = listOfAccounts[0];
                console.log(addProductToAccount, "add product to account")
            } else if (selectAccount?.value) {
                addProductToAccount = selectAccount.value;
                console.log(addProductToAccount, "add product to account")
            } else {
                const accounts = listOfAccounts.map((actId) => ({
                    value: actId,
                    label: selectProductDealWith[actId]?.Name,
                }));
                setReplaceCartProduct({ product: element, quantity });
                setAccountList(accounts);
                return;
            }
        }

        if (addProductToAccount) {
            const accountDetails = selectProductDealWith[addProductToAccount] || {};
            const account = {
                shippingMethod: accountDetails?.ShippingMethod,
                name: accountDetails?.Name,
                id: addProductToAccount,

                address: accountDetails?.ShippingAddress


            };
            const manufacturer = {
                name: element.ManufacturerName__c,
                id: element.ManufacturerId__c,
            };

            let orderType = "wholesale";
            if (
                element?.Category__c?.toUpperCase() === "PREORDER" ||
                element?.Category__c?.toUpperCase().includes("EVENT")
            ) {
                orderType = "pre-order";
            }
            element.orderType = orderType;

            const discount =
                element?.Category__c === "TESTER"
                    ? accountDetails?.Discount?.testerMargin || 0
                    : element?.Category__c === "Samples"
                        ? accountDetails?.Discount?.sample || 0
                        : accountDetails?.Discount?.margin || 0;

            const salesPrice = (+listPrice - (discount / 100) * +listPrice).toFixed(2);
            element.price = salesPrice;
            element.qty = element.Min_Order_QTY__c;

            addOrder(element, account, manufacturer);
        }
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
    let styles = {
        btn: { color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: 600, lineHeight: 'normal', letterSpacing: '1.4px', backgroundColor: '#000', width: '100px', height: '30px', cursor: 'pointer' }
    }
    return (
        <>
            {dealAccountList.length > 0 && (
                <ModalPage
                    styles={{ zIndex: 4022 }}
                    open={dealAccountList?.length ? true : false}
                    content={
                        <div className="d-flex flex-column gap-3">
                            <h2>Attention!</h2>
                            <p>
                                You have multi store with deal with this Brand.<br /> can you please select you create order for
                            </p>
                            <HtmlFieldSelect value={selectAccount} list={dealAccountList} onChange={(value) => setSelectAccount(value)} />
                            <div className="d-flex justify-content-around ">
                                <button style={styles.btn} onClick={accountSelectionHandler}>
                                    OK
                                </button>
                                <button style={styles.btn} onClick={accountSelectionCloseHandler}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    }
                    onClose={accountSelectionCloseHandler}
                />
            )}

            {isModalOpen ? (
                <ModalPage
                    open
                    content={
                        <div style={{ width: "75vw" }}>
                            <div
                                style={{
                                    position: "sticky",
                                    top: "-20px",
                                    background: "#fff",
                                    zIndex: 1,
                                    padding: "15px 0 0 0",
                                }}
                            >
                                <div className="d-flex align-items-center justify-content-between" style={{ minWidth: "75vw" }}>
                                    <h1 className="font-[Montserrat-500] text-[22px] tracking-[2.20px] m-0 p-0">
                                        Product Details
                                    </h1>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setProductDetailId(null);
                                        }}
                                    >
                                        <CloseButton />
                                    </button>
                                </div>
                                <hr />
                            </div>
                            {isModalNoRepOpen ? (
                                <ModalPage
                                    open
                                    content={
                                        <div className="d-flex flex-column gap-3">
                                            <h2>Warning</h2>
                                            <p>
                                                You cannot order from this brand.<br /> Kindly contact your Sales Rep.
                                            </p>
                                            <div className="d-flex justify-content-around">
                                                <button
                                                    style={{ color: "#fff", background: "#000" }}
                                                    onClick={() => setIsModalNoRepOpen(false)}
                                                >
                                                    Ok
                                                </button>
                                            </div>
                                        </div>
                                    }
                                    onClose={() => setIsModalNoRepOpen(false)}
                                />
                            ) : null}
                            {!product?.isLoaded ? (
                                <Loading />
                            ) : (
                                <ProductDetailCard
                                    product={product}
                                    orders={isProductCarted(productId)}
                                    onQuantityChange={onQuantityChange}
                                />
                            )}
                        </div>
                    }
                    onClose={() => {
                        setIsModalOpen(false);
                        setProductDetailId(null);
                    }}
                />
            ) : (
                <div className="product-details-content">
                    <h1>Product Details</h1>
                    {!product?.isLoaded ? (
                        <Loading />
                    ) : (
                        <ProductDetailCard
                            product={product}
                            orders={isProductCarted(productId)}
                            onQuantityChange={onQuantityChange}
                        />
                    )}
                </div>
            )}
        </>
    );
};

export default ProductDetails;




import { GetAuthData, ShareDrive, getAccountAllContact, getProductImageAll, getProductList, months, originAPi, sortArrayHandler } from "../../lib/store";
import Styles from "../OrderList/style.module.css"
import Styles1 from "./OrderCardHandler.module.css"
import { useEffect, useState } from "react";
import ProductDetails from "../../pages/productDetails";
import ErrorProductCard from "./ErrorProductCard";
import { BiCheck, BiLeftArrow, BiLock, BiRightArrow } from "react-icons/bi";
import ModalPage from "../Modal UI";
import { RxEyeOpen } from "react-icons/rx";
import Loading from "../Loading";
import { IoIosCloseCircleOutline } from "react-icons/io";
import Swal from 'sweetalert2';
const OrderCardHandler = ({ orders, setOrderId, orderId, reason, orderConfirmedStatus, files = [], desc, errorListObj, manufacturerIdObj, accountIdObj, accountList, contactIdObj, setSubject, Actual_Amount__cObj, autoSelect = null }) => {
    const { setOrderConfirmed, orderConfirmed } = orderConfirmedStatus || null;
    const { accountId, setAccountId } = accountIdObj || null;
    const [productAllList, setProductAllList] = useState([])
    const { manufacturerId, setManufacturerId } = manufacturerIdObj || null;
    const { errorList, setErrorList } = errorListObj || null;
    const { contactId, setContactId } = contactIdObj || null;
    const { Actual_Amount__c, setActual_Amount__c } = Actual_Amount__cObj || null;
    let size = 3;
    const [Viewmore, setviewmore] = useState(false);
    const [searchPo, setSearchPO] = useState(null);
    const [productImage, setProductImage] = useState({ isLoaded: false, images: {} });
    const [productDetailId, setProductDetailId] = useState(null)
    const [errorProductCount, setErrorProductCount] = useState(0)
    const [contacts, setContacts] = useState([])
    const [showProductList, setShowProductList] = useState(false)
    const [productList, setProductList] = useState([]);
    const [searchItem, setSearchItem] = useState(null);
    const [allProductSold, setAllProductSales] = useState(false);
    const [productLoading, setProductLoading] = useState(false);

    const getOrderDetails = ({ order }) => {
        if (order) {
            let data = ShareDrive();
            if (!data) {
                data = {};
            }
            if (Object.values(data).length > 0) {
                if (data[order.ManufacturerId__c]) {
                    if (Object.values(data[order.ManufacturerId__c]).length > 0) {
                        setProductImage({ isLoaded: true, images: data[order.ManufacturerId__c] })
                    } else {
                        setProductImage({ isLoaded: false, images: {} })
                    }
                }
            }
            if (order.OpportunityLineItems && order.OpportunityLineItems.records.length > 0) {
                let productCode = "";
                order.OpportunityLineItems.records?.map((element, index) => {
                    productCode += `'${element?.ProductCode}'`
                    if (order.OpportunityLineItems.records.length - 1 != index) productCode += ', ';
                })
                getProductImageAll({ rawData: { codes: productCode } }).then((res) => {
                    if (res) {
                        if (data[order.ManufacturerId__c]) {
                            data[order.ManufacturerId__c] = { ...data[order.ManufacturerId__c], ...res }
                        } else {
                            data[order.ManufacturerId__c] = res
                        }
                        ShareDrive(data)
                        setProductImage({ isLoaded: true, images: res });
                    } else {
                        setProductImage({ isLoaded: true, images: {} });
                    }
                }).catch((err) => {
                    console.log({ err });
                })
            }
        };
    }

    useEffect(() => {
        if (autoSelect) {
            autoSelectOrderHandler(autoSelect);
        }
    }, [autoSelect])

    const autoSelectOrderHandler = (value) => {
        setProductLoading(true)
        setProductList([])
        setShowProductList(false)
        setOrderId(value)
        let accountItemID = null;
        orders.map((item) => {
            if (value == item.Id) {
                if (reason == "Product Overage") {
                    let opcs = []
                    item.OpportunityLineItems?.records?.map((e) => {
                        opcs.push(e.Product2Id)
                    })
                    GetAuthData().then((user) => {
                        let rawData = {
                            key: user?.x_access_token,
                            Sales_Rep__c: user.Sales_Rep__c,
                            Manufacturer: item.ManufacturerId__c,
                            AccountId__c: item.AccountId,
                        }

                        getProductList({ rawData }).then((productRes) => {
                            let productCode = "";
                            let temp = []
                            if (opcs.length == productRes?.data?.records.length) {
                                setAllProductSales(true)
                            }
                            productRes?.data?.records?.map((product, index) => {
                                productCode += `'${product?.ProductCode}'`
                                if (productRes?.data?.records?.length - 1 != index) productCode += ', ';
                                if (!opcs.includes(product.Id)) {
                                    let pDiscount = 0;
                                    let listPrice = Number(product.usdRetail__c.replace('$', '').replace(',', ''));
                                    if (product.Category__c === "TESTER") {
                                        pDiscount = productRes?.discount?.testerMargin || 0
                                    } else if (product.Category__c === "Samples") {
                                        pDiscount = productRes?.discount?.sample || 0
                                    } else {
                                        pDiscount = productRes?.discount?.margin || 0
                                    }
                                    let salesPrice = (+listPrice - (pDiscount / 100) * +listPrice).toFixed(2)
                                    temp.push({
                                        Id: index + 1,
                                        Name: product.Name,
                                        Product2Id: product.Id,
                                        ProductCode: product.ProductCode,
                                        TotalPrice: salesPrice
                                    })
                                }
                            })
                            // setProductList(temp)
                            sortArrayHandler(temp, g => g.Name)
                            setProductAllList(temp)
                            setProductLoading(false)
                            let data = ShareDrive();
                            if (!data) {
                                data = {};
                            }
                            getProductImageAll({ rawData: { codes: productCode } }).then((res) => {
                                if (res) {
                                    if (data[item.ManufacturerId__c]) {
                                        data[item.ManufacturerId__c] = { ...data[item.ManufacturerId__c], ...res }
                                    } else {
                                        data[item.ManufacturerId__c] = res
                                    }
                                    ShareDrive(data)
                                    setProductImage({ isLoaded: true, images: res });
                                } else {
                                    setProductImage({ isLoaded: true, images: {} });
                                }
                            }).catch((err) => {
                                console.log({ err });
                            })
                        }).catch((productErr) => {
                            console.log({ productErr });
                        })
                    }).catch((err) => {
                        console.log({ err });
                    })
                }
                getOrderDetails({ order: item })
                setManufacturerId(item.ManufacturerId__c)
                setAccountId(item.AccountId)
                accountItemID = item.AccountId
                setActual_Amount__c(item.Amount)
            }
        })
        setSearchPO(null);
        let inputValue = document.getElementById("poSearchInput");
        if (inputValue) {
            inputValue.value = null;
        }
    }
    const [contactLoad,setContactLoad] = useState(false);

    useEffect(() => {
        let contactList = [];
        accountList.map(element => (
            element.Id == accountId &&
            element.contact.map((con) => {
                {
                    contactList.push({ label: con.Name, value: con.Id })
                }
            })
        ))
        setContacts(contactList)
        if (!contactList.length && accountId) {
            setContactLoad(true)
            GetAuthData().then((user) => {
                getAccountAllContact({ key: user.x_access_token, Id: accountId }).then((conRes) => {
                    let cont = [];
                    conRes.map((con)=>{
                        cont.push({ label: con.Name, value: con.Id })
                    })
                    setContacts(cont)
                    setContactLoad(false)
                }).catch((conErr) => {
                    console.log({ conErr });
                })
            }).catch((userErr) => {
                console.log({ userErr });
            })
        }
    }, [accountId, accountList])


    useEffect(() => { }, [searchPo, errorProductCount, productImage])

    const resetForm = () => {
        setOrderId(null);
        setContactId(null)
        setErrorList({})
        setOrderConfirmed(false)
    }
    const productErrorHandler = (element) => {
        //can i use memo for errorlist?
        let temp = errorList;
        if (temp.hasOwnProperty(element.Id)) {
            delete temp[element.Id]; // remove the property from the object
        } else {
            element.issue = 0;
            temp[element.Id] = element;
        }

        setErrorList(temp)
        let pCOunt = Object.values(errorList).length;
        setErrorProductCount(pCOunt);
    }
    const productSelectHandler = (element) => {
        //can i use memo for errorlist?
        let temp = productList;
        if (temp.hasOwnProperty(element.Id)) {
            delete temp[element.Id]; // remove the property from the object
        } else {
            element.issue = 0;
            temp[element.Id] = element;
        }
        setErrorList(temp)
        setProductList(temp)
        let pCOunt = Object.values(errorList).length;
        setErrorProductCount(pCOunt);
    }

    const ErrorProductQtyHandler = (id, value) => {
        let temp = errorList;
        if (temp.hasOwnProperty(id)) {
            // if (parseInt(value) <= temp[id].Quantity) {
            temp[id].issue = parseInt(value)
            setErrorList(temp)
            // }
        }
    }
    const [emptyProduct, setemptyProduct] = useState(false);

    const orderConfirmationHandler = () => {
        let error = Object.keys(errorList)
        if (error.length) {
            let confimationStatus = true;
            if (reason != "Charges") {
                error.map((id) => {
                    if ((errorList[id].issue == 0 || !errorList[id].issue) || (reason != "Product Overage" && errorList[id].issue > errorList[id].Quantity)) {
                        confimationStatus = false;
                        const myElement = document.getElementById(`oP${id}`);
                        if (myElement) {
                            console.warn({ myElement });
                            myElement.scrollIntoView({ behavior: "smooth", block: "center" });
                            myElement.style.borderBottom = "1px solid red";
                            shakeHandler(`oP${id}`)
                            Swal.fire({
                                title: `${reason}!`,
                                text: `You have entered more than the allowed quantity`,
                                icon: 'error',
                                confirmButtonText: 'Ok',
                                confirmButtonColor: '#000'
                            });
                        }
                    } else {
                        const myElement = document.getElementById(`oP${id}`);
                        if (myElement) {
                            myElement.style.borderBottom = "1px solid #00FF00"
                        }
                    }
                })
            }
            if (confimationStatus) {
                error.map((id) => {
                    const myElement = document.getElementById(`oP${id}`);
                    if (myElement) {
                        myElement.style.borderBottom = "1px solid #ccc"
                    }
                })
                if (!contactId) {
                    const myElement = document.getElementById("contactSelector");
                    if (myElement) {
                        console.error({ myElement });
                        myElement.scrollIntoView({ behavior: "smooth", block: "center" });
                        myElement.style.borderBottom = "1px solid red"
                        shakeHandler(`contactSelector`)

                    }

                } else {
                    document.getElementById("AttachementSection")?.scrollIntoView({ behavior: "smooth", block: "center" });
                    const myElement = document.getElementById("contactSelector");
                    if (myElement) {
                        myElement.style.borderBottom = "1px solid #ccc"
                    }
                    setOrderConfirmed(true)
                }
            }
        } else {
            setemptyProduct(true)
            var element = document.getElementsByTagName("checkbox");
            if (element.length > 0) {
                element[0].scrollIntoView({ behavior: "smooth", block: "center" });
            }
            // alert("please select any product...")
        }
    }
    const shakeHandler = (id = null) => {

        let lock1 = document.getElementById(id || "lock1");
        if (lock1) {
            setTimeout(() => {
                lock1.classList.remove(Styles1.shake);
            }, 300)
            lock1.classList.add(Styles1.shake)
        }
    }
    let show = 0;
    return (<section style={{ borderBottom: '1px solid #ccc' }}>
        {emptyProduct ? (
            <ModalPage
                open
                content={
                    <div className="d-flex flex-column gap-3" style={{ maxWidth: '700px' }}>
                        <h2 className={`${Styles.warning} `}>Product Empty</h2>
                        <p className={`${Styles.warningContent} `} style={{ lineHeight: '22px' }}>
                            Please select Product before processing further
                        </p>
                        <div className="d-flex justify-content-around ">
                            <button style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '100px' }} onClick={() => setemptyProduct(false)}>
                                OK
                            </button>
                        </div>
                    </div>
                }
                onClose={() => {
                    setemptyProduct(false);
                }}
            />
        ) : null}
        <ModalPage
            open={showProductList ?? false}
            content={
                <div className="d-flex flex-column gap-3">
                    <h2 className={`${Styles.warning} `}>Select other product of the Brand <button type="button" style={{ float: 'right', marginRight: '10px', width: "15px", height: "20px" }} onClick={() => setShowProductList(false)} >
                        <IoIosCloseCircleOutline size={35} />
                    </button></h2>
                    <div>
                        {(productAllList.length && !allProductSold) ? <div><input type="text" placeholder='Search Product' autoComplete="off" className={Styles1.searchBox} title="You can search Product by Name,SKU or UPC" id="poductInput" onKeyUp={(e) => { setSearchItem(e.target.value) }} style={{ width: '150px', marginBottom: '10px' }} /></div> : null}
                        <div style={{ maxHeight: '500px', overflow: 'scroll', width: '900px' }}>
                            {!productLoading ? productAllList.length ?
                                <table style={{ width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '225px' }}>Name</th>
                                            <th style={{ width: '75px' }}>Code</th>
                                            <th style={{ width: '75px' }}>Qty</th>
                                            <th style={{ width: '75px' }}>Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productAllList.length ? productAllList.map((ele, index) => {
                                            if (!searchItem || (ele.ProductCode?.toLowerCase().includes(
                                                searchItem?.toLowerCase()) || ele.Name?.toLowerCase().includes(
                                                    searchItem?.toLowerCase()) || ele.ProductUPC__c?.toLowerCase().includes(
                                                        searchItem?.toLowerCase()))) {
                                                return (
                                                    <ErrorProductCard Styles1={Styles1} productErrorHandler={productSelectHandler} errorList={productList} setProductDetailId={setProductDetailId} product={ele} productImage={productImage} reason={reason} AccountName={""} ErrorProductQtyHandler={ErrorProductQtyHandler}
                                                        readOnly={orderConfirmed} style={{ cardHolder: { backgroundColor: '#67f5f533', borderBottom: '1px solid #fff' }, nameHolder: { width: '200px', textAlign: 'start' } }} showQTyHandler={false} />
                                                )
                                            }
                                        }) : null}
                                    </tbody>
                                </table> : allProductSold ? <p style={{ display: 'grid', placeContent: 'center', height: '100px' }} colSpan={4}>Brand's all product are in your order.
                                </p> : null : <Loading height={'100px'} />
                            }
                        </div>
                    </div>
                    {/* <div className="d-flex justify-content-around "> */}
                    {/* <button style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '250px' }} onClick={() => setShowProductList(false)}>
                            Go Back
                        </button> */}
                    {/* <button style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '100px' }} onClick={() => setShowProductList(false)}>
                            Cancel
                        </button> */}
                    {/* </div> */}
                </div>
            }
            onClose={() => {
                setShowProductList(false);
            }}
        />
        <p className={Styles1.reasonTitle}>
            <span style={{ cursor: "pointer" }} onClick={() => shakeHandler()}>Select the order you want to handle:</span>
            {!orderId && reason &&
                <input type="text" placeholder='Search Order' autoComplete="off" className={Styles1.searchBox} title="You can search by PO Number, Account Name & Brand for last 3 month Orders" onKeyUp={(e) => { setSearchPO(e.target.value) }} id="poSearchInput" style={{ width: '120px' }} />}
            {(reason && orderId && !orderConfirmed && reason == "Product Overage") ?
                (showProductList) ?
                    null :
                    <button className={Styles1.btnHolder} onClick={() => setShowProductList(true)}><RxEyeOpen />&nbsp; Other Products</button>
                : null}
            {!reason && <BiLock id="lock1" style={{ float: 'right' }} />}</p>
        {reason && reason != "Update Account Info" &&
            <div className={`${Styles1.orderListHolder} ${Styles1.openListHolder}`} style={(orderId && (!searchPo || searchPo == "")) ? { overflow: 'unset', height: 'auto', border: 0 } : {}}>
                <div>
                    {orders.length > 0 ?
                        orders.map((item, index) => {
                            let date = new Date(item.CreatedDate);
                            let cdate = `${date.getDate()} ${months[date.getMonth()]
                                } ${date.getFullYear()}`;
                            let datemonth = `${date.getDate()} ${months[date.getMonth()]
                                }`;
                            if (((searchPo && searchPo != "") ? (item.PO_Number__c?.toLowerCase().includes(
                                searchPo?.toLowerCase()) || item.AccountName?.toLowerCase().includes(
                                    searchPo?.toLowerCase()) || item.ManufacturerName__c?.toLowerCase().includes(
                                        searchPo?.toLowerCase())) : !orderId) || orderId == item.Id) {
                                show++;
                                return (
                                    <div className={` ${Styles.orderStatement} cardHover ${orderId == item.Id ? Styles1.selOrder : ''}`} style={{ paddingBottom: '15px' }} key={index}>
                                        <div style={{ position: 'relative' }} className={(index % 2 == 0) ? Styles1.cardEnterRight : Styles1.cardEnterLeft}>
                                            <input type="radio" id={`order${item.Id}`} value={item.Id} onClick={(e) => { autoSelectOrderHandler(e.target.value) }} name="order" className={Styles1.inputHolder} checked={item.Id == orderId} />
                                            <label for={`order${item.Id}`} title={!orderId ? "click to select" : null} className={Styles.poNumber} style={item.Id == orderId ? { background: 'linear-gradient(90deg, #FFFFFF 0%,#000000 100%)' } : {}}>
                                                <div className={Styles1.dFlex}>
                                                    <div className={Styles.poNumb1}>
                                                        <h3>PO Number</h3>
                                                        <p>{item.PO_Number__c}</p>
                                                    </div>
                                                </div>

                                                <div className={Styles.poNumb1}>
                                                    <h3 style={item.Id == orderId ? { color: '#fff' } : {}}>Brand</h3>
                                                    <p style={item.Id == orderId ? { color: '#fff' } : {}}>{item.ManufacturerName__c}</p>
                                                </div>

                                                <div className={Styles.PoOrderLast}>
                                                    <h3 style={item.Id == orderId ? { color: '#fff' } : {}}>Ship To </h3>
                                                    <p style={item.Id == orderId ? { color: '#fff' } : {}}>{item.AccountName}</p>
                                                </div>
                                            </label>

                                            <div className={`${Styles.productDetail} ${item.Id == orderId ? Styles.warp : null}`} style={{ padding: '0 30px' }}>
                                                <div className={Styles.Prod1}>
                                                    <div className={Styles.ProtuctInnerBox}>
                                                        <div className={Styles.BoxBlack}>
                                                            <div className={Styles.Boxwhite}>
                                                                <h1 style={item.ProductCount.toString().length == 7 ? { fontSize: '21px' } : item.ProductCount.toString().length == 6 ? { fontSize: '24px' } : item.ProductCount.toString().length == 5 ? { fontSize: '27px' } : item.ProductCount.toString().length == 4 ? { fontSize: '30px' } : {}}>
                                                                    {item.ProductCount} <span>Products</span>
                                                                </h1>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={Styles.ProtuctInnerBox1}>
                                                        {item.OpportunityLineItems && item.OpportunityLineItems?.records.length > 0 ? (
                                                            orderId == item.Id ? (<>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th style={{ width: '225px' }}>Name</th>
                                                                            <th style={{ width: '75px' }}>Code</th>
                                                                            <th style={{ width: '75px' }}>Qty</th>
                                                                            <th style={{ width: '75px' }}>Price</th>
                                                                            {reason && reason != "Charges" && <th>{reason}</th>}
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>

                                                                        {item.OpportunityLineItems?.records
                                                                            .map((ele, index) => {
                                                                                if (!orderConfirmed || (orderConfirmed && Object.keys(errorList).includes(ele.Id))) {
                                                                                    return (<ErrorProductCard Styles1={Styles1} productErrorHandler={productErrorHandler} errorList={errorList} setProductDetailId={setProductDetailId} product={ele} productImage={productImage} reason={reason} AccountName={item.AccountName} ErrorProductQtyHandler={ErrorProductQtyHandler} readOnly={orderConfirmed} />)
                                                                                }
                                                                            })}
                                                                        {reason == "Product Overage" && productList.map((ele, index) => {
                                                                            if (!searchItem || (ele.ProductCode?.toLowerCase().includes(
                                                                                searchItem?.toLowerCase()) || ele.Name?.toLowerCase().includes(
                                                                                    searchItem?.toLowerCase()) || ele.ProductUPC__c?.toLowerCase().includes(
                                                                                        searchItem?.toLowerCase()))) {
                                                                                return (
                                                                                    <ErrorProductCard Styles1={Styles1} productErrorHandler={productErrorHandler} errorList={errorList} setProductDetailId={setProductDetailId} product={ele} productImage={productImage} reason={reason} AccountName={item.AccountName} ErrorProductQtyHandler={ErrorProductQtyHandler}
                                                                                        readOnly={orderConfirmed} style={{ cardHolder: { backgroundColor: '#67f5f533', borderBottom: '1px solid #fff' }, nameHolder: { width: '200px' } }} />
                                                                                )
                                                                            }
                                                                        }
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </>) : (
                                                                <ul>{item.OpportunityLineItems?.records
                                                                    .slice(0, size)
                                                                    .map((ele, index) => {
                                                                        return (<li>
                                                                            {(Viewmore)
                                                                                ? ele.Name.split(item.AccountName)[1]
                                                                                : ele.Name.split(item.AccountName)
                                                                                    .length > 1
                                                                                    ? ele.Name.split(item.AccountName)[1]
                                                                                        .length >= 31
                                                                                        ? `${ele.Name.split(
                                                                                            item.AccountName
                                                                                        )[1].substring(0, 28)}...`
                                                                                        : `${ele.Name.split(
                                                                                            item.AccountName
                                                                                        )[1].substring(0, 31)}`
                                                                                    : ele.Name.split(item.AccountName)[0]
                                                                                        .length >= 31
                                                                                        ? `${ele.Name.split(
                                                                                            item.AccountName
                                                                                        )[0].substring(0, 28)}...`
                                                                                        : `${ele.Name.split(
                                                                                            item.AccountName
                                                                                        )[0].substring(0, 31)}`}
                                                                        </li>)
                                                                    })}</ul>)
                                                        ) : (
                                                            <p className={Styles.noProductLabel}>No Product</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={Styles1.totalProductPrice}>
                                                    <div className={Styles1.Margitotal}>
                                                        <p className={Styles1.detailsTitleHolder}>Total</p>
                                                        <p className={Styles1.detailsDescHolder}>${Number(item.Amount).toFixed(2)}</p>
                                                    </div>
                                                    <div className={Styles1.Margitotal}>
                                                        <p className={Styles1.detailsTitleHolder}>Order Placed</p>
                                                        <p className={Styles1.detailsDescHolder}>{cdate}</p>
                                                    </div>
                                                    {(orderId && (!searchPo || searchPo == "")) && <>
                                                        <div className={Styles1.Margitotal}>
                                                            <p className={Styles1.detailsTitleHolder}>Customer Support For</p>
                                                            <p className={Styles1.detailsDescHolder}>Customer Service</p>
                                                        </div>
                                                        <div className={Styles1.Margitotal}>
                                                            <p className={Styles1.detailsTitleHolder}>Customer Service Issue</p>
                                                            <p className={Styles1.detailsDescHolder}>{reason}</p>
                                                        </div>
                                                        <div className={Styles1.Margitotal}>
                                                            <p className={Styles1.detailsTitleHolder}>Subject</p>
                                                            <p className={Styles1.detailsDescHolder}>{setSubject(`Customer Service for ${reason} having PO# ${item.PO_Number__c} Created on ${datemonth}`)}Customer Service for {reason} having <br /> PO# {item.PO_Number__c} Created on {datemonth}</p>
                                                        </div>
                                                    </>}

                                                    {(orderId && (!searchPo || searchPo == "")) && <>
                                                        {item.StageName && <div className={Styles1.Margitotal}>
                                                            <p className={Styles1.detailsTitleHolder}>Stage Name</p>
                                                            <p className={Styles1.detailsDescHolder}>{item.StageName}</p>
                                                        </div>}
                                                        {item.Description && <div className={Styles1.Margitotal}>
                                                            <p className={Styles1.detailsTitleHolder}>Notes</p>
                                                            <p className={Styles1.detailsDescHolder}>{item.Description}</p>
                                                        </div>}
                                                        {(item.Shipping_Street__c || item.Shipping_City__c || item.Shipping_State__c || item.Shipping_Country__c || item.Shipping_Zip__c) &&
                                                            <div className={Styles1.Margitotal}>
                                                                <p className={Styles1.detailsTitleHolder}>Shipping Address</p>
                                                                <p className={Styles1.detailsDescHolder}>{item.Shipping_Street__c}{item.Shipping_City__c && <>,<br /> {item.Shipping_City__c}</>}{item.Shipping_State__c && `, ${item.Shipping_State__c}`}{item.Shipping_Country__c && <>,<br /> {item.Shipping_Country__c}</>}{item.Shipping_Zip__c && `, ${item.Shipping_Zip__c}`}</p>
                                                            </div>}
                                                        {item.Order_Number__c && <div className={Styles1.Margitotal}>
                                                            <p className={Styles1.detailsTitleHolder}>Order Number</p>
                                                            <p className={Styles1.detailsDescHolder}>{item.Order_Number__c}</p>
                                                        </div>}
                                                        {files.length > 0 && <div className={Styles1.Margitotal}>
                                                            <p className={Styles1.detailsDescHolder}>
                                                                <p className={Styles1.detailsTitleHolder}>Attachements</p>
                                                                <div className={Styles1.imgHolder}>
                                                                    {files.map((file, index) => (
                                                                        <img src={file} key={index} />
                                                                    ))}
                                                                </div>
                                                            </p>
                                                        </div>}
                                                        {desc && <div className={Styles1.Margitotal}>
                                                            <p className={Styles1.detailsTitleHolder}>Description</p>
                                                            <p className={Styles1.detailsDescHolder}>{desc}</p>
                                                        </div>}
                                                        <div className={Styles1.Margitotal}>
                                                            <p className={Styles1.detailsTitleHolder}>Contact Person</p>
                                                            <p className={Styles1.detailsDescHolder} style={{ display: 'flex', justifyContent: 'end', marginTop: '5px' }}>

                                                                <select id="contactSelector" style={{ width: '200px' }} className="form-control" onChange={(e) => { setContactId(e.target.value) }} title={!contactId ? "Please select Contact" : null}>
                                                                    <option>Select Contact</option>
                                                                    {contactLoad?<Loading/> :contacts.map(element => (
                                                                        <option value={element.value}>{element.label}</option>
                                                                    ))}
                                                                </select>
                                                            </p>
                                                        </div>
                                                        {(orderId == item.Id && !orderConfirmed) && <div className={Styles1.Margitotal}>
                                                            <div className={Styles1.btnHolder} title="Click here to Continue" onClick={() => orderConfirmationHandler()}>I'M Done<BiCheck /></div>
                                                        </div>}
                                                        {(orderId == item.Id && orderConfirmed) && <div className={Styles1.Margitotal}>
                                                            <div className={Styles1.btnHolder} title="Click here to Change in Products" onClick={() => { setOrderConfirmed(false); }}>Click to edit</div>
                                                        </div>}
                                                    </>}
                                                </div>
                                            </div>
                                        </div>
                                        {orderId && <p aria-label="Click Here" title="Click here" onClick={() => { resetForm() }} style={{ cursor: 'pointer', marginLeft: '15px', textDecoration: 'underline' }}><b>Wrong order?</b> Click here to change selection</p>}
                                    </div>
                                )
                            }
                        }) : <p style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>No Order Found</p>}
                    {orders.length != 0 && show == 0 && <p style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>No Order Found</p>}
                </div >
            </div >}
        <ProductDetails productId={productDetailId} setProductDetailId={setProductDetailId} isAddtoCart={false} AccountId={accountId} ManufacturerId={manufacturerId} />
    </section >)
}
export default OrderCardHandler;
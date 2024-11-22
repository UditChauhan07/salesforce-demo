import React, { useEffect, useState } from "react";
import Styles from "./style.module.css";
import { useNavigate } from "react-router-dom";
import { CloseButton } from "../../../lib/svg";
import { DestoryAuth, GetAuthData, getAllAccount, getOrderList, postSupportAny } from "../../../lib/store";
import Select from "react-select";
import ModalPage from "../../Modal UI";
import styles from "../../Modal UI/Styles.module.css";
import Loading from "../../Loading";

const SelectCaseReason = ({ reasons, onClose, recordType }) => {
  const navigate = useNavigate();
  // const [prioritiesList, setPrioritiesList] = useState([]);
  const [accountList, setAccountList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderIdChild, setOrderIdChild] = useState([]);
  const [typeId, setTypeId] = useState(recordType.id);
  const [desc, setDesc] = useState();
  const [subject, setSubject] = useState();
  const [orderGet, setOrderGet] = useState(false);
  const [selectedOrderItem, setSelectOrderItem] = useState({ id: null, value: null });
  const [orderData, setOrderData] = useState({
    accountId: null,
    orderNumber: null,
    poNumber: null,
    manufacturerId: null,
    opportunityId: null,
    actualAmount: null,
    invoiceNumber: null,
  });
  const [reason, setReason] = useState(null);
  const [reasonName, setReasonName] = useState(null);
  // const [rawData, setRawData] = useState({
  //   orderStatusForm: {
  //     salesRepId: null,
  //     contactId: null,
  //     desc: null,
  //     priority: "Medium",
  //     sendEmail: false,
  //   },
  // });
  const [reasonChangeModalOpen, setReasonChangeModalOpen] = useState(false);
  const [step, setStep] = useState(0);
  function sortingList(data) {
    data.sort(function (a, b) {
      return new Date(b.CreatedDate) - new Date(a.CreatedDate);
    });
    return data;
  }
  useEffect(() => {
    GetAuthData()
      .then((response) => {
        getOrderList({
          user: {
            key: response.x_access_token,
            Sales_Rep__c: false ? "0051O00000CvAVTQA3"||"00530000005AdvsAAC" : response.Sales_Rep__c,
          },
          month: "",
        })
          .then((order) => {
            console.log({order});
            let sorting = sortingList(order);
            setOrders(sorting);
            setOrderGet(true)
          })
          .catch((error) => {
            console.log({ error });
          });
        getAllAccount({ user: response })
          .then((accounts) => {
            setAccountList(accounts);
          })
          .catch((actError) => {
            console.error({ actError });
          });
      })
      .catch((err) => {
        console.log({ err });
      });
  }, [step]);
  const onChangeHandler = (e) => {
    if (reason == null) {
      setReason(e.target.value);
      setReasonName(e.target.value);
      setSelectOrderItem({ id: null, value: null });
      setOrderData({
        accountId: null,
        orderNumber: null,
        poNumber: null,
        manufacturerId: null,
        opportunityId: null,
        actualAmount: null,
        invoiceNumber: null,
      });
      setStep(1);
    } else {
      setReasonChangeModalOpen(true);
      setReasonName(e.target.value);
    }
  };
  const onOrderChangeHandler = (value) => {
    let id = value;
    setSelectOrderItem({ id: null, value: null });
    let orderDetails = orders.filter(function (element) {
      if (element.Id === id) {
        setOrderData({
          accountId: element.AccountId,
          orderNumber: element.Order_Number__c ?? "Not Available",
          poNumber: element.PO_Number__c,
          manufacturerId: element.ManufacturerId__c,
          opportunityId: element.Id,
          actualAmount: element.Amount,
          invoiceNumber: element.Wholesale_Invoice__c?? "Not Available",
        });
        setOrderIdChild(element.OpportunityLineItems.records);
        setStep(2);
        return element;
      }
    });
  };
  const filteredContact = () => {
    const element = orders.filter((ele) => ele.Id == orderData.opportunityId)[0];
    return element
      ? `Order from ${element?.Account?.Name||element?.AccountName} for (${element?.OpportunityLineItems?.totalSize} Products) Actual Amount ${element?.Amount} | ${element?.ManufacturerName__c} | PO #${element?.PO_Number__c}`
      : "Search...";
  };
  const onChnageAccountHander = (value) => {
    // console.log(value);
    setOrderData({ accountId: value });
    setStep(2);
  };
  const onChnageOrderItemHander = (value) => {
    let orderItemDetails = orderIdChild.filter(function (element) {
      let id = value;
      if (element.Id === id) {
        setSelectOrderItem({ id: element.Id, value: element.Quantity });
        return element;
      }
    });
  };
  const submitForm = () => {
    GetAuthData()
      .then((user) => {
        if (user) {
          let rawData = {
            orderStatusForm: {
              typeId,
              salesRepId: user.Sales_Rep__c,
              reason,
              accountId: orderData.accountId,
              orderNumber: orderData.opportunityId ? orderData.orderNumber:null,
              PONumber: orderData.opportunityId ? orderData.poNumber:null,
              manufacturerId:orderData.opportunityId ?  orderData.manufacturerId:null,
              amount:orderData.opportunityId ?  orderData.actualAmount:null,
              invoiceNumber:orderData.opportunityId ?  orderData.invoiceNumber ? orderData.invoiceNumber: "Not Available":null,
              amount: orderData.opportunityId ? orderData.actualAmount:null,
              desc,
              opportunityId: orderData.opportunityId,
              priority: "Medium",
              sendEmail: false,
              subject,
            },
            key: user.x_access_token,
          };
          postSupportAny({ rawData })
            .then((response) => {
              if (response) {
                navigate("/CustomerSupportDetails?id=" + response);
              }
            })
            .catch((err) => {
              console.error({ err });
            });
        } else {
          DestoryAuth();
        }
      })
      .catch((error) => {
        DestoryAuth();
      });
  };
  const filteredobj = orders.filter((ele) => ele.Id === orderData.opportunityId)[0];
  return (
    <>
      {reasonChangeModalOpen ? (
        <ModalPage
          open
          content={
            <>
              <div style={{ maxWidth: "403px" }}>
                <h2 className={` ${styles.modalContentMontserrat}`}>
                  Do you want to <span style={{ fontWeight: "600" }}>change</span> the previous selection?
                </h2>
                <div className="d-flex justify-content-center gap-3 mt-4 ">
                  <button
                    className={`${styles.modalButtonCancel}`}
                    onClick={() => {
                      setReasonChangeModalOpen(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={`${styles.modalButton}`}
                    onClick={() => {
                      setReasonChangeModalOpen(false);
                      setReason(reasonName);
                      setSelectOrderItem({ id: null, value: null });
                      setOrderData({
                        accountId: null,
                        orderNumber: null,
                        poNumber: null,
                        manufacturerId: null,
                        opportunityId: "",
                        actualAmount: null,
                        invoiceNumber: null,
                      });
                      // setStep(1);
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </>
          }
          onClose={() => {
            setReasonChangeModalOpen(false);
          }}
        />
      ) : null}
      <div className={`  ${Styles.ModalLast} ${Styles.delaycontent} `}>
        <div className="d-flex align-items-center justify-content-between">
          <h1 className="font-[Montserrat-500] text-[22px] tracking-[2.20px] m-0 p-0">{recordType.name} Issue</h1>
          <button type="button" onClick={onClose}>
            <CloseButton />
          </button>
        </div>
        <hr />
        <section className={` ${Styles.fadeInUp} `}>
          <div className={Styles.BrandInRadio}>
            <p className={Styles.CaseReason}>
              <span className="text-danger">*</span>Select Case Reason
            </p>
            <div className={Styles.ModalResponsive}>
              {Object.values(reasons)?.map((reasonName, index) => {
                return (
                  <div className={Styles.BrandName} key={index}>
                    <input type="radio" name="reason_name" value={reasonName} onChange={onChangeHandler} id={reasonName} checked={reasonName === reason} />
                    <label htmlFor={reasonName}>{reasonName}</label>
                  </div>
                );
              })}
            </div>
          </div>
          <hr style={{ border: "1px dashed #D5D9D9" }}></hr>
          {step >= 1 && (
            <div className={`${Styles.delay} ${Styles.fadeInUp} `}>
              <div className={Styles.selectDiv}>
                {(reason == "Charges" || reason == "Product Missing" || reason == "Product Overage" || reason == "Product Damage") && (
                  <div style={{ textAlign: "left", margin: "10px 0px" }}>
                    <p className={Styles.CaseReason}>
                      <span className="text-danger">*</span>Select Orders
                    </p>
                    {!orderGet ?
                      <Loading />
                      :
                      <Select
                        options={orders.map((element) => {
                          return {
                            value: element.Id,
                            label: `Order from ${element?.AccountName||element?.Account?.Name} for (${element?.ProductCount||element?.OpportunityLineItems?.totalSize||0} Products) Actual Amount ${element?.Amount} | ${element?.ManufacturerName__c} | PO #${element?.PO_Number__c}`,
                          };
                        })}
                        defaultValue={{
                          value: "Select...",
                          label: "Select...",
                        }}
                        value={{
                          value: orders.filter((ele) => ele.Id == orderData.opportunityId)[0]?.["Id"] || "Search...",
                          label: filteredContact(),
                        }}
                        onChange={(option) => onOrderChangeHandler(option.value)}
                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                        menuPortalTarget={document.body}
                        isSearchable
                        menuPosition={"fixed"}
                        menuShouldScrollIntoView={false}
                      />}
                  </div>
                )}
                {reason == "Update Account Info" && (
                  <div style={{ textAlign: "left", margin: "10px 0px" }}>
                    <p className={Styles.CaseReason}>
                      <span className="text-danger">*</span>Select Account
                    </p>
                    <Select
                      options={accountList.map((element) => {
                        return { value: element.Id, label: element.Name };
                      })}
                      onChange={(option) => onChnageAccountHander(option.value)}
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                      menuPortalTarget={document.body}
                      isSearchable
                      menuPosition={"fixed"}
                      menuShouldScrollIntoView={false}
                      defaultValue={{
                        value: accountList.filter((ele) => ele.Id === orderData.accountId)?.[0]?.["Id"] || "Select...",
                        label: accountList.filter((ele) => ele.Id === orderData.accountId)?.[0]?.["Name"] || "Select...",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {step == 2 && (
            <div className={Styles.fadeInUp}>
              <div style={{ width: "100%" }}>
                {reason == "Charges" && (
                  <div className={Styles.labelAmountDiv}>
                    <div className="d-flex justify-content-start align-items-center gap-3" style={{ width: "40%", borderRight: "1px solid #D9D9D9" }}>
                      <label className={Styles.label}>Actual Amount:</label>
                      <input type="text" className={Styles.labelInput} value={`$${Number(orderData.actualAmount).toFixed(2)}`} />
                    </div>
                    <div className="d-flex justify-content-center align-items-center gap-3 ms-3">
                      <label className={Styles.label}>Associated Invoice Number:</label>
                      <input type="text" value={orderData.invoiceNumber ? orderData.invoiceNumber : "NA"} className={Styles.labelInput} />
                    </div>
                  </div>
                )}
                {(reason == "Product Missing" || reason == "Product Overage") && (
                  <div>
                    <p className={Styles.CaseReason} style={{ marginTop: "20px" }}>
                      Select Product
                    </p>
                    <div style={{ textAlign: "left", margin: "10px 0px 10px 0px" }}>
                      <Select
                        options={orderIdChild.map((element) => {
                          return { value: element.Id, label: element.Name };
                        })}
                        onChange={(option) => onChnageOrderItemHander(option.value)}
                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                        menuPortalTarget={document.body}
                        isSearchable
                        menuPosition={"fixed"}
                        menuShouldScrollIntoView={false}
                      />
                    </div>
                    <div>
                      <input className={Styles.input} type="text" placeholder="Quantity Missing" value={selectedOrderItem.value} />
                    </div>
                  </div>
                )}
                <div>
                  <input
                    className={Styles.input}
                    type="text"
                    placeholder="Provide One line Subject"
                    onKeyDown={(e) => {
                      setSubject(e.target.value);
                    }}
                  />
                </div>
                <div>
                  <textarea
                    className={Styles.input}
                    rows={3}
                    placeholder="Describe your issues"
                    onKeyDown={(e) => {
                      setDesc(e.target.value);
                    }}
                  ></textarea>
                </div>
              </div>
            </div>
          )}
          {step == 2 && (
            <div className={Styles.BrandButton}>
              <button className={Styles.Button1} onClick={onClose}>
                CANCEL
              </button>
              <button
                className={Styles.Button2}
                onClick={() => {
                  submitForm();
                }}
              >
                SUBMIT
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default SelectCaseReason;

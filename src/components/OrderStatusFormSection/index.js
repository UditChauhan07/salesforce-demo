import { useEffect, useState } from "react";
import styles from "./style.module.css";
import stylesV2 from "./stylev2.module.css";
import { DateConvert, GetAuthData, getOrderIdDetails, getSupportFormRaw, postSupport, supportClear, supportDriveBeg, supportShare, uploadFileSupport } from "../../lib/store";
import { Link, useNavigate } from "react-router-dom";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { OrderStatusSchema } from "../../validation schema/OrderStatusValidation";
import TextError from "../../validation schema/TextError";
import Select from "react-select";
import { BiUpload } from "react-icons/bi";
import ModalPage from "../Modal UI";
import Loading from "../Loading";
import dataStore from "../../lib/dataStore";

const OrderStatusFormSection = ({ setSubmitLoad }) => {
  const navigate = useNavigate();
  const [prioritiesList, setPrioritiesList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [supportTicketData, setTicket] = useState();
  const [activeBtn, setActive] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [orderDetails, setOrderDetail] = useState();

  useEffect(() => {
    let data = supportDriveBeg();
    setTicket(data);
    GetAuthData()
      .then((user) => {
        let rawData = {
          key: user.x_access_token,
          AccountId: data.orderStatusForm.accountId,
        };
        getSupportFormRaw({ rawData })
          .then((raw) => {            
            setPrioritiesList(raw.Priority);
            setContactList(raw.ContactList);
            if (data.orderStatusForm.opportunityId) {
              dataStore.getPageData("/orderDetails"+data.orderStatusForm.opportunityId,()=>getOrderIdDetails({ rawData: { key: user.x_access_token, id: data.orderStatusForm.opportunityId } })).then((orderDetails) => {              
                setOrderDetail(orderDetails);
              }).catch((orderErr) => {
                console.log({ orderErr });
              })
            }
          })
          .catch((error) => {
            console.error({ error });
          });
      })
      .catch((err) => {
        console.error({ err });
      });
  }, []);

  const onChangeHandler = (key, value) => {
    let temp = supportTicketData;
    temp.orderStatusForm[key] = value;

    supportShare(temp)
      .then((response) => {
        let data = supportDriveBeg();
        setTicket(data);
      })
      .catch((error) => {
        console.error({ error });
      });
  };
  const onSubmitHandler = (values) => {
    setSubmitLoad(true)
    setActive(true);
    let temp = supportTicketData;
    temp.orderStatusForm["desc"] = values.description;
    temp.orderStatusForm["contactId"] = values.contact.value.value;

    supportShare(temp)
      .then((response) => {
        let data = supportDriveBeg();
        setTicket(data);
      })
      .catch((error) => {
        console.error({ error });
      });

    GetAuthData()
      .then((user) => {
        if (!supportTicketData.orderStatusForm.salesRepId) {
          supportTicketData.orderStatusForm.salesRepId = user.Sales_Rep__c;
        }
        supportTicketData.key = user.x_access_token;
        postSupport({ rawData: supportTicketData })
          .then((response) => {
            let flush = supportClear();
            if (response) {
              if (files.length > 0) {
                uploadFileSupport({ key: user?.data?.x_access_token, supportId: response, files }).then((fileUploader) => {
                  if (fileUploader) {
                    setSubmitLoad(false)
                    navigate("/CustomerSupportDetails?id=" + response);
                  }
                }).catch((fileErr) => {
                  setSubmitLoad(false)
                  console.log({ fileErr });
                })
              } else {
                setSubmitLoad(false)
                navigate("/CustomerSupportDetails?id=" + response);
              }
            }
          })
          .catch((err) => {
            console.error({ err });
          });
      })
      .catch((error) => {
        console.error({ error });
      });
    return;
  };
  const initialValues = {
    description: supportTicketData?.orderStatusForm?.desc || "",
    contact:
      supportTicketData?.orderStatusForm?.contactId || ""
  };
  let [files, setFile] = useState([])

  function handleChange(e) {
    let tempFile = [...files];
    let reqfiles = e.target.files;
    if (reqfiles) {
      if (reqfiles.length > 0) {
        Object.keys(reqfiles).map((index) => {
          let url = URL.createObjectURL(reqfiles[index])
          if (url) {
            tempFile.push({ preview: url, file: reqfiles[index] });
          }
          // this thoughing me Failed to execute 'createObjectURL' on 'URL': Overload resolution failed?
        })
      }
    }
    setFile(tempFile);
  }

  const fileRemoveHandler = (index) => {
    let tempFile = [...files];
    tempFile.splice(index, 1)
    setFile(tempFile);
  }

  const SearchableSelect = (FieldProps) => {
    return (
      <Select
        type="text"
        options={FieldProps.options}
        {...FieldProps.field}
        onChange={(option) => {
          console.log(option, FieldProps);
          FieldProps.form.setFieldValue(FieldProps.field.name, option);
        }}
        value={FieldProps.options ? FieldProps.options.find((option) => option.value === FieldProps.field.value?.value) : ""}
      />
    );
  };
  const formentAcmount = (amount) => {
    return `${Number(amount).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`
  }

  useEffect(()=>{},[orderDetails])

  if (supportTicketData?.orderStatusForm?.opportunityId) {
    return (<section>
      {!orderDetails?.Id? <Loading />:
      <>
      <ModalPage
        open={confirm || false}
        content={
          <div className="d-flex flex-column gap-3">
            <h2>
              Confirm
            </h2>
            <p>
              Are you sure you want to generate a ticket?<br /> This action cannot be undone.<br /> You will be redirected to the ticket page after the ticket is generated.
            </p>
            <div className="d-flex justify-content-around ">
              <button className={styles.btn} onClick={() => onSubmitHandler(confirm)}>
                Submit
              </button>
              <button className={styles.btn} onClick={() => setConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        }
        onClose={() => {
          setConfirm(false);
        }}
      />
      <Formik initialValues={initialValues} validationSchema={OrderStatusSchema} onSubmit={(values) => { setConfirm(values) }}>
        <Form>
          <h2 className={stylesV2.TitleHolder}><b>Support For</b> {supportTicketData?.orderStatusForm?.reason}</h2>
          <div className={`${stylesV2.dFlex} ${stylesV2.spaceBetween}`}>
            <div className={`${stylesV2.orderDetailsHolder} ${stylesV2.dFlex} ${stylesV2.widthOneHalfR} ${stylesV2.formHolder} mt-4 p-0`}>
              <div className={`${stylesV2.widthHalf} p-3 pt-0`}>
                <h2 className={`${stylesV2.TitleHolder} mt-2 ${stylesV2.borderBottom} ${stylesV2.bgWhite}`}>
                  <b>
                    Order Details
                  </b>
                </h2>
                <div className={`${stylesV2.dFlex} ${stylesV2.noWarp} ${stylesV2.spaceBetween} pt-3`}>
                  <div className={`${stylesV2.detailsCardTitleHolder}`}>
                    <b>Order PO Number</b>
                    <p className="mb-2 mt-1">{orderDetails.PO_Number__c}</p>
                  </div>
                  <div className={`${stylesV2.detailsCardTitleHolder} text-end`}>
                    <b>Order Date</b>
                    <p className="mb-2 mt-1">{DateConvert(orderDetails.CreatedDate, true)}</p>
                  </div>
                </div>
                <div className={`${stylesV2.dFlex} ${stylesV2.noWarp} ${stylesV2.spaceBetween}`}>
                  <div className={stylesV2.detailsCardTitleHolder}>
                    <b>Store</b>
                    <p className="mb-2 mt-1">{orderDetails.Name}</p>
                  </div>
                  <div className={`${stylesV2.detailsCardTitleHolder} text-end`}>
                    <b>Brand</b>
                    <p className="mb-2 mt-1">{orderDetails.ManufacturerName__c}</p>
                  </div>
                </div>
                <div className={`${stylesV2.dFlex} ${stylesV2.noWarp} ${stylesV2.spaceBetween}`}>
                  <div className={stylesV2.detailsCardTitleHolder}>
                    <b>Total</b>
                    <p className="mb-2 mt-1">${formentAcmount(orderDetails.Amount)}</p>
                  </div>
                  <div className={`${stylesV2.detailsCardTitleHolder} text-end`}>
                    <b>Products</b>
                    <p className="mb-2 mt-1">{orderDetails.OpportunityLineItems.reduce((acc, current) => acc + current.Quantity, 0)}</p>
                  </div>
                </div>
                <div className={`${stylesV2.dFlex} ${stylesV2.noWarp} ${stylesV2.spaceBetween}`}>
                  <div className={stylesV2.detailsCardTitleHolder}>
                    <b>Shipping Address</b>
                    <p className="mb-2 mt-1">{orderDetails.Shipping_Street__c},<br />{orderDetails.Shipping_City__c},{orderDetails.Shipping_State__c}, {orderDetails.Shipping_Country__c}<br /> {orderDetails.Shipping_Zip__c}</p>
                  </div>
                  <div className={`${stylesV2.detailsCardTitleHolder} text-end`}>
                    <b>Notes</b>
                    <p className="mb-2 mt-1">{orderDetails.Description ?? "NA"}</p>
                  </div>
                </div>
              </div>
              <div className={`${stylesV2.widthHalf} ${stylesV2.formBgHolder} p-3 pt-0`}>
                <h2 className={`${stylesV2.TitleHolder} mt-2 ${stylesV2.borderBottom}`}>
                  <b>
                    Required Attention
                  </b>
                </h2>
                <div className={`${stylesV2.detailsCardTitleHolder} pt-3`}>
                  <b>Contact</b>
                  <p className="mb-2 mt-1"> <Field name="contact.value" className="contact" options={contactList.map((contact) => ({ label: contact.Name, value: contact.Id }))} component={SearchableSelect} />
                    <p className="mt-1">
                      <ErrorMessage component={TextError} name="contact" />
                    </p>
                  </p>
                </div>
                <div className={stylesV2.detailsCardTitleHolder}>
                  <b>Description</b>
                  <p className="mb-2 mt-1"> <Field component="textarea" rows={6} style={{ width: '100%' }} name="description" defaultValue={initialValues.description} />
                    <p className="mt-1">
                      <ErrorMessage component={TextError} name="description" />
                    </p>
                  </p>
                </div>
                <div className={`${stylesV2.dFlex} ${stylesV2.widthFull} justify-content-center align-items-center mt-4`}>
                  <Link to={"/orderStatus"} className={`${styles.btn} mr-2`}>
                    Cancel
                  </Link>
                  <input type="submit" className={`${styles.btn} ml-2`} value={"Submit"} disabled={activeBtn} />
                </div>
              </div>
            </div>
          </div>
        </Form>
      </Formik>
      </>}
    </section>)
  } 
};
export default OrderStatusFormSection;

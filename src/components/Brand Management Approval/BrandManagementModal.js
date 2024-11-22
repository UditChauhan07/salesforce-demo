import React, { useEffect, useState } from "react";
import Styles from "./style.module.css";
import { useNavigate } from "react-router-dom";
import { CloseButton, UploadFileIcon } from "../../lib/svg";
import { DestoryAuth, GetAuthData, getAllAccount, getOrderList, getSupportFormRaw, postSupportAny, supportDriveBeg, supportShare } from "../../lib/store";
import Select from "react-select";
import ModalPage from "../Modal UI";
import styles from "../Modal UI/Styles.module.css";

const BrandManagementModal = ({ onClose, recordType }) => {
  const reasons = {
    "RTV Request": "RTV Request",
    Other: "Other",
  };
  const navigate = useNavigate();
  const [accountList, setAccountList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reason, setReason] = useState(null);
  const [reasonName, setReasonName] = useState(null);
  const [reasonChangeModalOpen, setReasonChangeModalOpen] = useState(false);
  const [step, setStep] = useState(0);
  useEffect(() => {
    GetAuthData()
      .then((response) => {
        getOrderList({
          user: {
            key: response.x_access_token,
            Sales_Rep__c: false ? "00530000005AdvsAAC" : response.Sales_Rep__c,
          },
          month: "",
        })
          .then((order) => {
            setOrders(order);
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
  const [formData, setFormData] = useState({
    reason: null,
    contact: null,
    account: null,
    subject: null,
    attachment: null,
    description: null,
    sendViaEmail: false,
  });
  useEffect(() => {
    const filteredContacts = accountList.filter((ele) => ele.Id == formData.account)[0]?.["contact"];
    setContactList(filteredContacts);
  }, [formData.account]);
  const handleCaseReason = (e) => {
    if (reason == null) {
      setReason(e.target.value);
      setReasonName(e.target.value);
      setFormData((prev) => {
        return { ...prev, reason: e.target.value };
      });
      setStep(1);
    } else {
      setReasonChangeModalOpen(true);
      setReasonName(e.target.value);
    }
  };
  const handleContact = (value) => {
    setFormData((prev) => {
      return { ...prev, contact: value };
    });
    if (formData.account !== null) setStep(2);
  };
  const handleAccount = (value) => {
    setFormData((prev) => {
      return { ...prev, account: value };
    });
    if (formData.contact !== null) setStep(2);
  };
  const submitForm = () => {
    GetAuthData()
      .then((user) => {
        if (user) {
          let rawData = {
            orderStatusForm: {
              typeId: recordType.id,
              salesRepId: user.Sales_Rep__c,
              reason: formData.reason,
              accountId: formData.account,
              contactId: formData.contact,
              desc: formData.description,
              priority: "Medium",
              sendEmail: formData.sendViaEmail,
              subject: formData.subject,
            },
            key: user.x_access_token,
          };
          postSupportAny({ rawData })
            .then((response) => {
              if (response) {
                if (response) {
                  navigate("/CustomerSupportDetails?id=" + response);
                }
              }
            })
            .catch((err) => {
              console.error({ err });
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  console.log({attachment:formData.attachment});
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
                      setFormData((prev) => {
                        return { ...prev, account: null, contact: null, subject: "", attachment: "", description: "", sendViaEmail: false };
                      });
                      setStep(1);
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
      <div className={`  ${Styles.ModalLast} ${Styles.delaycontent} `} style={{ minWidth: "50vw" }}>
        <div className="d-flex align-items-center justify-content-between">
          <h1 className="font-[Montserrat-500] text-[22px] tracking-[2.20px] m-0 p-0">{recordType.name}</h1>
          <button type="button" onClick={onClose}>
            <CloseButton />
          </button>
        </div>
        <hr />
        {/* select case reason */}
        <section className={` ${Styles.fadeInUp} `}>
          <div className={Styles.BrandInRadio}>
            <p className={Styles.CaseReason}>
              <span className="text-danger">*</span>Select Case Reason
            </p>
            <div className={Styles.ModalResponsive}>
              {Object.values(reasons)?.map((reasonName, index) => {
                return (
                  <div className={Styles.BrandName} key={index}>
                    <input type="radio" name="reason_name" value={reasonName} onChange={handleCaseReason} id={reasonName} checked={reasonName === reason} />
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
                <div style={{ textAlign: "left", margin: "10px 0px" }} className="">
                  {/* Select Account */}
                  <div className={`w-100`}>
                    <p className={Styles.CaseReason}>
                      <span className="text-danger">*</span>Select Account
                    </p>
                    <Select
                      options={accountList.map((element) => {
                        return { value: element.Id, label: element.Name };
                      })}
                      onChange={(option) => handleAccount(option.value)}
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                      menuPortalTarget={document.body}
                      isSearchable
                      menuPosition={"fixed"}
                      menuShouldScrollIntoView={false}
                      defaultValue={{
                        value: "Search Account",
                        label: "Search Account",
                      }}
                      value={{
                        value: accountList.filter((element) => element.Id == formData.account)[0]?.["Id"] || "Search Account",
                        label: accountList.filter((element) => element.Id == formData.account)[0]?.["Name"] || "Search Account",
                      }}
                    />
                  </div>
                  {/* select contact on basis of account */}
                  {formData.account && (
                    <div className="w-100 mt-[20px] ">
                      <p className={Styles.CaseReason}>
                        <span className="text-danger">*</span>Select Contact
                      </p>
                      <Select
                        options={contactList?.map((ele) => {
                          return {
                            value: ele.Id,
                            label: ele.Name,
                          };
                        })}
                        defaultValue={{
                          value: "Search Contact Name",
                          label: "Search Contact Name",
                        }}
                        value={{
                          value: contactList?.filter((ele) => ele.Id == formData.contact)[0]?.["Id"] || "Search Contact Name",
                          label: contactList?.filter((ele) => ele.Id == formData.contact)[0]?.["Name"] || "Search Contact Name",
                        }}
                        onChange={(option) => handleContact(option.value)}
                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                        menuPortalTarget={document.body}
                        isSearchable
                        menuPosition={"fixed"}
                        menuShouldScrollIntoView={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {step == 2 && (
            <div className={Styles.fadeInUp}>
              <div style={{ width: "100%" }}>
                <>
                  <div>
                    <input
                      className={Styles.input}
                      type="text"
                      placeholder="Provide One line Subject"
                      onChange={(e) => {
                        setFormData((prev) => {
                          return { ...prev, subject: e.target.value };
                        });
                      }}
                      value={formData.subject}
                    />
                  </div>
                  <div className={`${Styles.input} position-relative min-h-[85px]`}>
                    <span className={`${Styles.label} position-absolute top-[10px] left-[20px]`}>Attachment</span>
                    <input
                      id="chooseFile"
                      type="file"
                      className={`${Styles.chooseFile} position-absolute top-[40px] left-[20px] w-[100%]`}
                      onChange={(e) => {
                        setFormData((prev) => {
                          return { ...prev, attachment: e.target.files[1] };
                        });
                      }}
                      // value={formData.attachment}
                    />
                    <span className={`${Styles.label} position-absolute top-[30px] right-[20px]`}>
                      <UploadFileIcon />
                    </span>
                  </div>
                  <div>
                    <textarea
                      className={Styles.input}
                      rows={3}
                      placeholder="Description"
                      onChange={(e) => {
                        setFormData((prev) => {
                          return { ...prev, description: e.target.value };
                        });
                      }}
                      value={formData.description}
                    ></textarea>
                  </div>
                </>
              </div>
              <p className={`${Styles.CaseReason} d-flex gap-2 justify-start align-center`}>
                <input
                  type="checkbox"
                  id="email"
                  onChange={(e) => {
                    setFormData((prev) => {
                      return { ...prev, sendViaEmail: e.target.checked };
                    });
                  }}
                  checked={formData.sendViaEmail}
                />
                <label htmlFor="email"> Send Updates via email</label>
              </p>
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

export default BrandManagementModal;

import { ErrorMessage, Field, Form, Formik } from "formik";
import TextError from "../../validation schema/TextError";
import Select from "react-select";
import styles from "../OrderStatusFormSection/style.module.css";
import { AccountInfoValidation } from "../../validation schema/AccountInfoValidation";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BiUpload } from "react-icons/bi";
import { uploadFileSupport } from "../../lib/store";
import ModalPage from "../Modal UI";
const AccountInfo = ({ reason, typeId, Accounts, postSupportAny, GetAuthData, setSubmitForm,salesRepId }) => {
    const navigate = useNavigate();
    const [contactList, setContactList] = useState([]);
    const [brandList, setBrandList] = useState([]);
    const [confirm, setConfirm] = useState(false);
    let [files, setFile] = useState([])
    useEffect(()=>{},[salesRepId])

    const initialValues = {
        description: "",
        account: null,
        contact: null,
        manufacturerId:null
    };
    if (!typeId) return null;
    const SearchableSelect = (FieldProps) => {
        return (
            <Select
                type="text"
                options={FieldProps.options}
                {...FieldProps.field}
                onChange={(option) => {
                    Accounts.map((a) => {
                        if (a.Id == option.value) {
                            setContactList(a.contact)
                            setBrandList(a.Brands??[])
                        }
                    })
                    FieldProps.form.setFieldValue(FieldProps.field.name, option);
                    FieldProps.form.setFieldValue("contact", null);
                    FieldProps.form.setFieldValue("manufacturer", null);
                }}
                value={FieldProps.options ? FieldProps.options.find((option) => option.value === FieldProps.field.value?.value) : ""}
            />
        );
    };
    const SearchableSelect1 = (FieldProps) => {
        return (
            <Select
                type="text"
                options={FieldProps.options}
                {...FieldProps.field}
                onChange={(option) => {
                    FieldProps.form.setFieldValue(FieldProps.field.name, option);
                }}
                value={FieldProps.options ? FieldProps.options.find((option) => option.value === FieldProps.field.value?.value) : ""}
            />
        );
    };
    let typeName = {
        "0123b0000007z9pAAA": "Customer Service",
        "0123b000000GfOEAA0": "Brand Management Approval"
    }
    const onSubmitHandler = (values) => {
        let subject = `${typeName[typeId]} for ${reason}`;
        setSubmitForm(true)
        GetAuthData()
            .then((user) => {
                if (user) {
                    let rawData = {
                        orderStatusForm: {
                            typeId,
                            reason,
                            salesRepId: salesRepId??user.Sales_Rep__c,
                            accountId: values.account?.value,
                            contactId: values.contact?.value,
                            manufacturerId:values.manufacturer.value,
                            desc: values.description,
                            priority: "Medium",
                            subject,
                            sendEmail: true
                        },
                        key: user.x_access_token,
                    };
                    postSupportAny({ rawData })
                        .then((response) => {
                            if (response) {
                                if (response) {
                                    if (files.length > 0) {

                                        uploadFileSupport({ key: user.x_access_token, supportId: response, files }).then((fileUploader) => {
                                            if (fileUploader) {
                                                navigate("/CustomerSupportDetails?id=" + response);
                                            }
                                        }).catch((fileErr) => {
                                            console.log({ fileErr });
                                        })
                                    } else {
                                        navigate("/CustomerSupportDetails?id=" + response);
                                    }
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
    }
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

    return (
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
                        <button className={styles.btn} onClick={()=>{onSubmitHandler(confirm)}}>
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
 
        <Formik initialValues={initialValues} validationSchema={AccountInfoValidation} onSubmit={(value)=>setConfirm(value)}>
            {(formProps) => (
                <div className={styles.container}>
                    <Form className={styles.formContainer}>
                        <b className={styles.containerTitle}>{reason}</b>

                        <label className={styles.labelHolder}>
                            Store Name
                            <Field name="account" className="account" options={Accounts.map((account) => ({ label: account.Name, value: account.Id }))} component={SearchableSelect} />
                        </label>
                        <ErrorMessage component={TextError} name="account" />
                        <label className={styles.labelHolder}>
                            Brand Name
                            <Field name="manufacturer" className="manufacturer" options={brandList.map((brand) => ({ label: brand.Name, value: brand.Id }))} component={SearchableSelect1} />
                        </label>
                        <ErrorMessage component={TextError} name="manufacturer" />
                        <label className={styles.labelHolder}>
                            Contact Name
                            <Field name="contact" className="contact" options={contactList.map((contact) => ({ label: contact.Name, value: contact.Id }))} component={SearchableSelect1} />
                        </label>
                        <ErrorMessage component={TextError} name="contact" />

                        <label className={styles.labelHolder}>
                            Describe your details that want to update
                            <Field component="textarea" placeholder="Description" rows={4} name="description" defaultValue={initialValues.description}></Field>
                        </label>
                        <ErrorMessage component={TextError} name="description" />
                        <div className={styles.attachHolder}>
                            <p className={styles.subTitle}>upload some attachments</p>
                            <label className={styles.attachLabel} for="attachement"><div><div className={styles.attachLabelDiv}><BiUpload /></div></div></label>
                            <input type="file" style={{ width: 0, height: 0 }} id="attachement" onChange={handleChange} multiple accept="image/*" />
                            <div className={styles.imgHolder}>
                                {files.map((file, index) => (
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', right: '5px', top: '-5px', color: '#000', zIndex: 1, cursor: 'pointer', fontSize: '18px' }} onClick={() => { fileRemoveHandler(index) }}>x</span>
                                        <a href={file?.preview} target="_blank" title="Click to Download">
                                            <img src={file?.preview} key={index} alt={file?.preview} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.dFlex}>
                            {" "}
                            <Link to={"/customer-support"} className={styles.btn}>
                                Cancel
                            </Link>
                            <input type="submit" className={styles.btn} value={"Submit"} />
                        </div>
                    </Form>
                </div>
            )}
        </Formik>
        </>
    );
}
export default AccountInfo
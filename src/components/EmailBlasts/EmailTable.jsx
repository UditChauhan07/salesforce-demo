import { useEffect, useMemo, useState } from "react"
import { DateConvert, GetAuthData, admins, deleteEmailBlast, getEmailBlast, getEmailBody, months, resentEmailBlast, resetEmailBlast, sortArrayHandler } from "../../lib/store"
import Styles from "./index.module.css"
import { BiAddToQueue, BiEraser, BiExport, BiLeftArrow, BiMailSend, BiRefresh, BiTrash } from "react-icons/bi"
import ModalPage from "../Modal UI"
import { getPermissions } from "../../lib/permission"
import Pagination from "../Pagination/Pagination"
import { useNavigate } from "react-router-dom";
import Loading from "../Loading"
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { BackArrow } from "../../lib/svg"
import dataStore from "../../lib/dataStore"

let PageSize = 10;
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";

const EmailTable = ({ month, day, year, setFilter, setMonthList, setDayList, newsletter }) => {
    const navigate = useNavigate();
    const [contactList, setContactList] = useState({ isLoaded: false, data: [] })
    const [alert, setAlert] = useState(false)
    const [user, setUser] = useState([]);
    const [emailHtml, setEmailHtml] = useState(null);
    const [mailSend, setMailSend] = useState(false)
    const [showBrands, setShowBrands] = useState();
    const [confirm, setConfirm] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [checkId, setCheckId] = useState([])
    const [searchValue, setSearchValue] = useState();
    const [checked, setChecked] = useState(false)
    const [checkAll, setCheckedAll] = useState(false);
    const [permissions, setPermissions] = useState()
    useEffect(() => {
        async function fetchPermissions() {
            try {
                const user = await GetAuthData(); // Fetch user data
                const userPermissions = await getPermissions(); // Fetch permissions
                setPermissions(userPermissions); // Set permissions in state
            } catch (err) {
                console.error("Error fetching permissions", err);
            }
        }

        fetchPermissions(); // Fetch permissions on mount
    }, []);

    const reportReady = (data) => {
        console.log({data});
        
        let contactList = JSON.parse(data || "[]")
        // let contactList = sortArrayHandler(JSON.parse(list || "[]") || [], g => g?.updatedAt, 'desc')
        setContactList((prevState) => ({ ...prevState, data: contactList }));
        setTimeout(() => {
            setContactList((prevState) => ({ ...prevState, isLoaded: true }));
        }, 3500); // Adjust time as needed
    }
    useEffect(() => {
        dataStore.subscribe("/report" + month + day + year, reportReady);
        getDataHandler();
        return () => dataStore.unsubscribe("/report" + month + day + year, reportReady);
    }, [day, month, year])
    
    const resentHandler = () => {
        if (checkId.length) {
            setContactList({ isLoaded: false, data: [] })
            resetEmailBlast({ key: "8XoSdoqMZ2dAiqh", ids: JSON.stringify(checkId) }).then((res) => {
                resentEmailBlast({ key: "8XoSdoqMZ2dAiqh", ids: JSON.stringify(checkId) }).then((result) => {
                    setMailSend(true);
                    getDataHandler()
                }).catch((err1) => {
                    console.log({ err1 });
                })
            }).catch((err) => {
                console.log({ err });
            })
        } else {
            setAlert(true)
        }
    }

    const { isLoaded, data } = contactList || false
    const mailList = useMemo(() => {
        return (
            data
                ?.filter((contact) => {
                    return (
                        !searchValue?.length ||
                        [
                            contact.Account,
                            contact.Brands,
                            contact.ContactEmail,
                            contact.ContactName,
                            DateConvert(contact.Date, true)
                        ].some(property => {
                            const propertyValue = property?.toLowerCase();
                            return propertyValue.includes(searchValue);
                        })
                    );
                })
        )
    }, [data, searchValue]);

    function checkedAll(value) {
        setChecked(!checked)
        let temp = []
        if (value) {
            mailList.map((contact, index) => {
                temp.push(contact.id)
            })
        }
        if (temp.length == mailList.length) {
            setCheckedAll(true);
        }
        setCheckId(temp)
    }
    const getDataHandler = () => {
        setSearchValue(null)
        setCheckId([])
        GetAuthData().then((user) => {
            let userPermisson = JSON.parse(user?.permission)
            if (userPermisson?.modules?.godLevel) {
                setUser(user)
                dataStore.getPageData("/report" + month + day + year, () => getEmailBlast({ key: user.access_token, Id: user.Sales_Rep__c, month, day, year, newsletter })).then((list) => {
                    console.log({list});
                    
                    reportReady(list);


                }).catch((conErr) => {
                    console.log({ conErr });
                })
            } else {
                navigate('/dashboard')
            }
        }).catch((err) => {
            console.log({ err });
        })
    }
    const deleteHandler = () => {
        if (checkId.length) {
            setContactList({ isLoaded: false, data: [] })
            deleteEmailBlast({ key: "8XoSdoqMZ2dAiqh", ids: JSON.stringify(checkId) }).then((res) => {
                getDataHandler()
            }).catch((err) => {
                console.log({ err });
            })
        } else {
            setAlert(true)
        }
    }

    const addtoqueue = () => {
        if (checkId.length) {
            setContactList({ isLoaded: false, data: [] })
            resetEmailBlast({ key: "8XoSdoqMZ2dAiqh", ids: JSON.stringify(checkId) }).then((res) => {
                getDataHandler()
            }).catch((err) => {
                console.log({ err });
            })
        } else {
            setAlert(true)
        }
    }

    useEffect(() => {
        if (emailHtml) {
            let temp = emailHtml?.replaceAll("{{token}}", user.x_access_token); // the-quick-brown-fox
            setEmailHtml(temp)
        }

    }, [emailHtml])

    useEffect(() => {
        if (mailList.length != 0 && checkId.length == mailList.length) {
            setCheckedAll(true);
        } else {
            setCheckedAll(false);
        }
    }, [checkId])
    const confirmHandler = () => {
        if (confirm == 1) {
            deleteHandler()
        } else if (confirm == 2) {
            addtoqueue()
        } else if (confirm == 3) {
            resentHandler()
        } else if (confirm == 4) {
            excelExportHandler()
        } else { }
        setConfirm(false)
    }
    const resetHandler = () => {
        let contactSearch = document.getElementById("contactSearch");
        if (contactSearch) {
            contactSearch.value = null
        }
        setSearchValue(null); setCurrentPage(1)
        setCheckId([])
    }
    const getEmailBodyHandler = (id) => {
        getEmailBody({ key: "8XoSdoqMZ2dAiqh", id: id }).then((result) => {
            setEmailHtml(result.body)
        }).catch((err) => {
            console.log({ err });
        })
    }

    const csvData = () => {
        let exportData = [];
        data.map(element => {
            if (checkId.includes(element.id)) {
                let temp = {
                    "Store Name": element.Account,
                    "Brands Name": element.Brands,
                    "Subscriber Name": element.ContactName,
                    "Subscriber Email": element.ContactEmail,
                    "Publish On": DateConvert(element.Date, true),
                    "Status": element.mailStatus == 1 ? "Send" : element.mailSend == 2 ? "Failed" : "Not Sent",
                }
                exportData.push(temp)
            }
        })
        return exportData;
    }
    const excelExportHandler = () => {
        const ws = XLSX.utils.json_to_sheet(csvData());
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, `Subscribers List for ${months[month - 1]} ${day}, ${year}'s NewLetter ${new Date().toDateString()}` + fileExtension);
    }
    
    return (
        <div>
            <ModalPage
                open={confirm}
                content={<div className="d-flex flex-column gap-3" style={{ maxWidth: '700px' }}>
                    <h2 className={`${Styles.warning} `}>Confirm</h2>
                    <p className={`${Styles.warningContent} `}>
                        Are you sure you want to {confirm == 1 ? <b>Delete</b> : confirm == 2 ? <b>Add to Queue</b> : confirm == 3 ? <b>Re-send mail to</b> : confirm == 4 ? <b>Export</b> : null} selected Subscriber?<br /> This action cannot be undone.
                    </p>
                    <div className="d-flex justify-content-around ">
                        <button style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '100px' }} onClick={() => confirmHandler()}>
                            Yes
                        </button>
                        <button style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '100px' }} onClick={() => setConfirm(false)}>
                            No
                        </button>
                    </div>
                </div>}
                onClose={() => setConfirm(false)}
            />
            <ModalPage
                open={alert}
                content={
                    <div className="d-flex flex-column gap-3" style={{ maxWidth: '700px' }}>
                        <h2 className={`${Styles.warning} `}>Empty Selection</h2>
                        <p className={`${Styles.warningContent} `} style={{ lineHeight: '22px' }}>
                            Please select any Subscriber.
                        </p>
                        <div className="d-flex justify-content-around ">
                            <button style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '100px' }} onClick={() => setAlert(false)}>
                                Ok
                            </button>
                        </div>
                    </div>
                }
                onClose={() => {
                    setAlert(false);
                }}
            />
            <ModalPage
                open={mailSend}
                content={
                    <div className="d-flex flex-column gap-3" style={{ maxWidth: '700px' }}>
                        <h2 className={`${Styles.warning} `}>Mail Send.</h2>
                        <p className={`${Styles.warningContent} `} style={{ lineHeight: '22px' }}>
                            Mail Send to Selected Contact. Please refresh list to get queue data.
                        </p>
                        <div className="d-flex justify-content-around ">
                            <button style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '100px' }} onClick={() => setMailSend(false)}>
                                Ok
                            </button>
                        </div>
                    </div>
                }
                onClose={() => {
                    setMailSend(false);
                }}
            />
            <ModalPage
                open={emailHtml ? true : false}
                content={
                    <div className="d-flex flex-column gap-3">
                        <h2 className={`${Styles.warning} `}>Email Content</h2>
                        <p className={`${Styles.warningContent} `} style={{ lineHeight: '22px' }}>
                            <div dangerouslySetInnerHTML={{ __html: emailHtml }} />
                        </p>
                        <div className="d-flex justify-content-around ">
                            <button style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '100px' }} onClick={() => setEmailHtml(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                }
                onClose={() => {
                    setEmailHtml(null);
                }}
            />
            <div style={{ position: 'sticky', top: '150px', background: '#ffffff', padding: '2px 0', zIndex: 1 }}>
                <div className={Styles.titleHolder} style={{ marginBottom: '0px' }}>
                    <h2 className="d-flex justify-content-center align-items-center"><span style={{ cursor: 'pointer' }} onClick={() => { navigate('/newsletter') }}><BackArrow /></span><p>Subscribers List for {months[month - 1]} {day}, {year}`s Newsletter</p></h2>
                    <div className="d-flex">
                        {checkId.length ?
                            <>
                                <div className={`${Styles.settingButton} ${Styles.settingButton1}  d-flex  justify-content-center align-items-center`} style={{ width: '300px' }} onClick={() => { setConfirm(2) }}>
                                    <BiAddToQueue size={23} title="Add to queue" />&nbsp;Add to Next Schedule
                                </div>   &nbsp;
                                <div className={`${Styles.settingButton} ${Styles.settingButton2} d-flex  justify-content-center align-items-center`} style={{ width: '200px' }} onClick={() => { setConfirm(3) }}>
                                    <BiMailSend title="Resend mail to selected" size={23} />&nbsp;Resend Now
                                </div>
                            </> : null}
                    </div>
                </div>
                <div className="d-flex justify-content-between align-items-center" style={{ margin: '4px 0 27px 0' }}>
                    <div className="d-flex">
                        <label for="ALL" className={Styles.checkAllHolder} title="Click to select All"><input type="checkbox" onClick={(e) => { checkedAll(!checked) }} id="ALL" checked={checkAll} /></label>
                        <div className={Styles.checkAllHolder} onClick={() => { setContactList({ isLoaded: false, data: [] }); getDataHandler() }}>
                            <BiRefresh size={23} title="Refersh list" />
                        </div>
                        <div className={Styles.checkAllHolder} onClick={() => { resetHandler() }}>
                            <BiEraser size={23} title={'Reset'} />
                        </div>
                        <div className={Styles.checkAllHolder} onClick={() => { checkId.length ? setConfirm(4) : setAlert(true) }}>
                            <BiExport size={23} title={'Export Selected rows'} />
                        </div>
                        <div className={Styles.checkAllHolder} onClick={() => { checkId.length ? setConfirm(1) : setAlert(true) }}>
                            <BiTrash size={23} title={'Delete selected rows'} />
                        </div>
                    </div>
                    <input type="text" autoComplete="off" id="SubscribesSearch" title="search for Subscribers" placeholder="Search Subscribers" className={Styles.searchBox} onKeyUp={(e) => { setSearchValue(e.target.value); setCurrentPage(1) }} />
                </div>
            </div>
            {isLoaded ?
                <>
                    <table style={{ width: '100%' }}>
                        <thead className={Styles.table} style={{ position: 'sticky', top: '285px', zIndex: 11 }}>
                            <tr>
                                <th style={{ width: '200px' }}>Store Name</th>
                                <th style={{ width: '200px' }}>Brand Name</th>
                                <th>Subscriber Name</th>
                                <th>Subscriber Email</th>
                                <th>Publish On</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mailList.length > 0 ? mailList.slice(
                                (currentPage - 1) * PageSize,
                                currentPage * PageSize

                            ).map((contact, index) => {
                                return (
                                    <tr key={index} className={Styles.tableRow}>
                                        <td style={{ width: '200px' }}>
                                            <label for={contact.id} style={{ cursor: "pointer" }} title="Click to select">
                                                <input type="checkbox" checked={checkId.includes(contact.id) ? true : false} className={checkId.includes(contact.id) ? Styles.checked : Styles.unChecked} onChange={() => { checkId.includes(contact.id) ? setCheckId(checkId.filter((value) => value !== contact.id)) : setCheckId([...checkId, contact.id]); }} name="contact" id={contact.id} />
                                                &nbsp;{contact.Account}
                                            </label>
                                        </td>
                                        <td style={{ width: '200px' }} onMouseEnter={() => setShowBrands(index)} onMouseLeave={() => setShowBrands(null)} dangerouslySetInnerHTML={{ __html: (contact.Brands.length < 50 || showBrands == index) ? contact.Brands : contact.Brands.slice(0, 50) + "..." }}></td>
                                        <td>{contact.ContactName}</td>
                                        <td>{contact.ContactEmail}</td>
                                        <td>{DateConvert(contact.Date, true)}</td>
                                        <td>{contact.mailStatus == 1 ? <p onClick={() => { getEmailBodyHandler(contact.id) }} className="bg-[#90EE90] text-center rounded-lg text-[#ffffff] text-sm cursor-pointer p-1">Send</p> : contact.mailStatus == 2 ? <p onClick={() => { getEmailBodyHandler(contact.id) }} className="bg-[#FF474C] text-center rounded-lg text-[#ffffff] text-sm cursor-pointer p-1">Failed</p> : <p onClick={() => { getEmailBodyHandler(contact.id) }} className="bg-[#efef68] text-center rounded-lg text-[#000] text-sm cursor-pointer p-1" title={`No action is needed\n our system is processing your emails in chunks to ensure smooth delivery.`}>Not Sent</p>}</td>
                                    </tr>
                                )
                            }) : <tr className="text-center" style={{ height: '200px' }}><td colSpan={6}>No data found.</td></tr>}
                        </tbody>
                    </table>
                    <Pagination
                        className="pagination-bar"
                        currentPage={currentPage}
                        totalCount={mailList.length}
                        pageSize={PageSize}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </> : <Loading height={'50vh'} />}
        </div>)

}
export default EmailTable
import React, { useState , useEffect } from 'react'
import Detail from './Detail.module.css'
import { BackArrow, SupportStatusGreen, SupportStatusRed, SupportStatusYellow, UserChecked } from '../../lib/svg'
import { DateConvert, GetAuthData, getStrCode, postSupportComment ,  DownloadAttachment} from '../../lib/store'

import { Link } from 'react-router-dom';
import ModalPage from '../Modal UI';
import Loading from '../Loading';
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
function FullQuearyDetail({ data, setRest ,  attachmentUrls=[] }) {
    const [orderStatus, setorderStatus] = useState({ status: false, message: "" })
    const date = new Date(data.Date_Opened__c);
    const [comment, setComment] = useState('');
    const [btnAct, setBtnAct] = useState(true)
    const [token, setUsertoken] = useState(null);
    function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }
    const CommentPostHandler = () => {
        setComment('');
        if (comment.trim() != '') {
            setBtnAct(false)
            GetAuthData().then((user) => {
              

                let rawData = {
                    key: user.x_access_token,
                    comment: {
                        ParentId: data.Id,
                        CommentBody: `${comment}`
                    }
                }
                postSupportComment({ rawData }).then((response) => {
                    if (response?.success) {
                        // window.location.reload()
                        setRest(true);
                        setBtnAct(true)
                    } else {
                        if (response.length) {
                            setorderStatus({ status: true, message: response[0].message })
                        } else {
                            alert("something went wrong")
                        }
                    }
                }).catch((err) => {
                    console.error({ err });
                })
            }).catch((error) => {
                console.error({ error });
            })
        }
    }
    useEffect(() => {
      GetAuthData()
        .then((user) => {
       
          setUsertoken(user?.x_access_token);
        })
        .catch((error) => {
          console.error({ error });
        });
    }, [comment])
    const downloadFile = async (attachmentId, attachmentName) => {
      try {
        const response = await DownloadAttachment(token, attachmentId);
  
        if (!response) {
          throw new Error("Failed to download file");
        }
        const blob = await response.blob();
        const fileURL = window.URL.createObjectURL(blob);
        const isJFIF = attachmentName.toLowerCase().endsWith(".jfif");
        const fileName = isJFIF
          ? attachmentName.replace(/\.jfif$/i, ".jpg")
          : attachmentName;
  
        const downloadLink = document.createElement("a");
        downloadLink.href = fileURL;
        downloadLink.download = fileName;
        downloadLink.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(fileURL);
        }, 1000);
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    };
    return (
        <div>
            {orderStatus?.status ? (
                <ModalPage
                    open
                    content={
                        <div className="d-flex flex-column gap-3" style={{ maxWidth: '700px' }}>
                            <h2 className={`${Detail.warning} `}>SalesForce Error</h2>
                            <p className={`${Detail.warningContent} `} style={{ lineHeight: '22px' }}>
                                {orderStatus.message}
                            </p>
                            <div className="d-flex justify-content-around ">
                                <button style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '100px' }} onClick={() => setorderStatus({ status: false, message: "" })}>
                                    OK
                                </button>
                            </div>
                        </div>
                    }
                    onClose={() => {
                        setorderStatus({ status: false, message: "" });
                    }}
                />
            ) : null}
            <div className={Detail.FullQuearyDetailMain}>
                <h2 className={Detail.FullQuearyDetailH2}>
                    <Link to={'/customer-support'}>
                        <BackArrow/>
                    </Link>
                    <span>CUSTOMER Support </span> - My Support Tickets Status detail</h2>
                <h4 className={Detail.FullQuearyDetailH4}>{data.RecordType?.Name} for Case Reason <span>- {data.Reason}</span> </h4>
                <div className={`row ${Detail.FlexReverse}`}>
                    <div className='col-lg-9 col-md-9 col-sm-12'>
                        <div className={Detail.LeftMainDiv}>
                            <div className={Detail.LeftMainTopBox}>
                                <p>
                                    <UserChecked />
                                    <span>{data.Account?.Name}</span>&nbsp; raised this on {DateConvert(data.Date_Opened__c)}
                                </p>
                            </div>
                            <p style={{ marginTop: "1rem" }}>{data.Description}</p>

                            <h6>Activity</h6>
                            <div className={Detail.HeightGiven}>
                                {data.CaseComments && data.CaseComments.records.length > 0 && <>
                                    {data.CaseComments.records.sort(
                                        (objA, objB) => new Date(objA.CreatedDate) - new Date(objB.CreatedDate),
                                    ).map((activity, index) => {
                                        const itemDate = new Date(activity.CreatedDate);
                                        let desc = activity?.CommentBody?.split("Wrote:\n");
                                        return (<div className={Detail.ActivityBox}>
                                            <div className={`${Detail.ActivityProfile} ${activity?.CreatedById != data.salesRepId && Detail.ActiDark}`}>
                                                <h6>{getStrCode(activity?.CreatedByname)}</h6>
                                            </div>
                                            <div className={Detail.ActivityContentImform}>
                                                <h2>{activity?.CreatedByname}</h2>
                                                {desc?.length > 1 ? <><p>{desc[0]} Wrote:</p>
                                                    <p className={Detail.Para2} dangerouslySetInnerHTML={{ __html: desc[1] }} /></> : <p className={Detail.Para2} dangerouslySetInnerHTML={{ __html: activity?.CommentBody }} />}
                                            </div>
                                            <div className={Detail.ActivityDate}>
                                                <p>{DateConvert(activity.CreatedDate, true)} {formatAMPM(itemDate)}</p>
                                            </div>
                                        </div>)
                                    })}
                                </>}
                                {data.ActivityHistories && data.ActivityHistories.records.length > 0 && <>
                                    {data.ActivityHistories.records.map((activity, index) => {
                                        const itemDate = new Date(activity.StartDateTime);
                                        return (<div className={Detail.ActivityBox}>
                                            <div className={`${Detail.ActivityProfile} ${activity?.OwnerId != data?.salesRepId && Detail.ActiDark}`}>
                                                <h6>{activity?.OwnerId == data?.salesRepId ? getStrCode(data.salesRepName) : "CS"}</h6>
                                            </div>
                                            <div className={Detail.ActivityContentImform}>
                                                <h2>{activity?.OwnerId == data?.salesRepId ? data.salesRepName : "Customer Support"}</h2>
                                                <p>Hi, {activity?.OwnerId != data?.salesRepId ? data.salesRepName : "Customer Support"},</p>
                                                <p className={Detail.Para2} dangerouslySetInnerHTML={{ __html: activity?.Description }} />
                                            </div>
                                            <div className={Detail.ActivityDate}>
                                                <p>{itemDate.getDate()}/{monthNames[itemDate.getMonth()]}/{itemDate.getFullYear()} {formatAMPM(itemDate)}</p>
                                            </div>
                                        </div>)
                                    })}
                                </>}
                            </div>
                            {/* Active Comment Box STARTING */}
                            <div className={Detail.CommentBox}>
                                {data.Status != "closed" && <div className={Detail.ActivityBox}>
                                    <div className={Detail.ActivityProfile}>
                                        <h6>{getStrCode(data.salesRepName)}</h6>
                                    </div>
                                    <div className={`${Detail.ActivityContentImform} ${Detail.SendFlex}`}>
                                        <textarea placeholder='Add a comment...' rows="4" cols="50" value={comment} onChange={(e) => { setComment(e.target.value) }}></textarea>
                                        <div className={Detail.SendButtonChat} style={{ cursor: "pointer" }} onClick={() => { if (btnAct) { CommentPostHandler() } }}>
                                            {!btnAct ? <Loading /> :
                                                <svg xmlns="http://www.w3.org/2000/svg" width="58" height="58" viewBox="0 0 58 58" fill="none">
                                                    <path d="M40.5327 21.9402C40.7375 21.6765 40.8382 21.3451 40.8151 21.0105C40.7921 20.6758 40.647 20.3618 40.408 20.1293C40.1691 19.8968 39.8532 19.7624 39.5219 19.7523C39.1905 19.7421 38.8672 19.8568 38.6147 20.0743L14.6397 40.712L1.97907 35.7578C1.42832 35.5445 0.949652 35.1758 0.599955 34.6953C0.250258 34.2149 0.0442326 33.643 0.00635955 33.0476C-0.0315135 32.4522 0.100358 31.8582 0.386305 31.3364C0.672252 30.8146 1.10025 30.3868 1.61945 30.1039L54.18 0.313574C54.5931 0.088433 55.0588 -0.0189959 55.5276 0.00275323C55.9963 0.0245024 56.4503 0.174613 56.8413 0.437064C57.2323 0.699515 57.5455 1.06446 57.7475 1.49294C57.9496 1.92142 58.0328 2.39736 57.9884 2.86996L53.3778 51.4973C53.3316 51.996 53.171 52.477 52.9088 52.9019C52.6466 53.3268 52.29 53.6839 51.8674 53.9448C51.4447 54.2057 50.9678 54.3632 50.4744 54.4048C49.981 54.4464 49.4849 54.3709 49.0254 54.1843L33.6168 48.1479L23.9439 57.3191C23.5869 57.6566 23.1399 57.8808 22.6583 57.964C22.1767 58.0471 21.6816 57.9856 21.2342 57.7871C20.7867 57.5885 20.4066 57.2616 20.1409 56.8468C19.8752 56.432 19.7354 55.9475 19.739 55.4532V48.2505L40.5327 21.9402Z" fill="black" />
                                                </svg>}
                                        </div>
                                    </div>
                                </div>}
                            </div>
                        </div>
                    </div>
                    <div className='col-lg-3 col-md-3 col-sm-12'>
                        <div className={Detail.RightMainDiv}>
                            <div className={Detail.RightControlStatus}>
                                <h3>Status</h3>
                                <p>{data.Status}</p>
                            </div>
                            {/* <div className={Detail.ControlPriority}>
                                <h3>Priority</h3>
                                <p>
                                    {data.Priority == "High" ? <SupportStatusRed /> : data.Priority == "Medium" ? <SupportStatusYellow /> : <SupportStatusGreen />}
                                    {data.Priority} Priority
                                </p>
                            </div> */}
                            {data.ManufacturerName__c && <div className={Detail.ManufactureID}>
                                <h3>Manufacture ID</h3>
                                <p>{data.ManufacturerName__c}</p>
                            </div>}
                            <div className={Detail.CaseNumber}>
                                <h3>Case Number</h3>
                                <p>{data.CaseNumber}</p>
                            </div>
                            {data.Associated_PO_Number__c && <div className={Detail.PONumber}>
                                <h3>PO Number</h3>
                                {data.Opportunity__c ?
                                    <Link to={'/orderDetails'}>
                                        <p onClick={() => localStorage.setItem("OpportunityId", JSON.stringify(data.Opportunity__c))} style={{textDecoration:'underline'}}>#{data.Associated_PO_Number__c}</p>
                                    </Link> :
                                    <p>#{data.Associated_PO_Number__c}</p>}
                            </div>}
                            <div className={Detail.RecordType}>
                                <h3>Record Type</h3>
                                <p>{data.RecordType.Name}</p>
                            </div>
                            {attachmentUrls && attachmentUrls?.length > 0 && (
                <div className={Detail.RecordType}>
                  <h3>Attachments</h3>

                  <ul
                    style={{
                      listStyleType: "disc",
                      paddingLeft: "20px",
                      maxHeight: "280px",
                      overflowY:
                        attachmentUrls && attachmentUrls.length > 8
                          ? "auto"
                          : "visible",
                      overflowX: "hidden",
                    }}
                  >
                    {attachmentUrls.map((attachment, index) => (
                      <li key={index}>
                        <a
                          style={{
                            color: "black",
                            textDecoration: "none",
                            fontSize: "14px",
                            wordWrap: "break-word",
                          }}
                          className={Detail.DownloadLink}
                          onClick={() =>
                            downloadFile(attachment.id, attachment.name)
                          }
                        >
                          {attachment.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FullQuearyDetail
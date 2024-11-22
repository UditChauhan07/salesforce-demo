import React, { useEffect, useMemo, useState } from 'react'
import Styles from './Styles.module.css'
import ModalPage from '../../Modal UI';
import { DateConvert } from '../../../lib/store';
import { Link } from 'react-router-dom';

function TrackingStatus({ data, onClose = null }) {
    useEffect(() => { }, [data])
    if (!data?.Id) return null;
    return (
        <ModalPage
            open
            content={
                <div style={{ minWidth: '700px' }}>
                    <section>
                        <div className={Styles.mainTop}>
                            <h2>View Tracking</h2>
                            <div className={Styles.mainControl}>

                                <div className={Styles.ProtuctInnerBox}>
                                    <div className={Styles.BoxBlack}>
                                        <div className={Styles.Boxwhite}>
                                            <h1>{data?.ProductCount} <span>Products</span></h1>
                                        </div>
                                    </div>
                                </div>


                                <div className={Styles.ProtuctInnerBoxPara}>
                                    <div className={Styles.ProtuctInnerBoxInner}>
                                        <h4 style={{ marginBottom: '30px', textAlign: 'start' }}>
                                            {data?.AccountName}
                                        </h4>
                                        <p><b className={Styles.Span1}>PO Number :</b>   <span className={Styles.Span2}>{data.PO_Number__c}</span></p>
                                        <p><b className={Styles.Span1}>Brand :</b>   <span className={Styles.Span2}>{data.ManufacturerName__c}</span></p>
                                        <p><b className={Styles.Span1}>Order Placed :</b>   <span className={Styles.Span2}>{DateConvert(data.CreatedDate, true)}</span></p>
                                        <p><b className={Styles.Span1}>Tracking Id :</b>   <span className={Styles.Span2}>{data.Tracking_URL__c ? <Link to={data.Tracking_URL__c} target='_blank' className={Styles.linkHolder}>{data.Tracking__c}</Link> : data.Tracking__c}</span></p>
                                        {data?.Shipping_method__c?
                                        <p><b className={Styles.Span1}>Shipment Method :</b>   <span className={Styles.Span2}>{data?.Shipping_method__c}</span></p>:null}

                                    </div>

                                </div>

                            </div>

                            <div className={Styles.ShippedBar}>
                                <h3>Tracking Status :  <span>{data.Status__c ? data.Status__c : 'Not Shipped'}</span></h3>
                                <div className={Styles.BtnGroup}>
                                    {/* button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> */}
                                    <button type="submit" onClick={onClose} >CANCEL</button>
                                </div>

                            </div>


                        </div>
                    </section>
                </div>
            }
            onClose={onClose}
        />
    )
}

export default TrackingStatus
import React, { useEffect, useMemo, useState } from 'react';
import Styles from './Style.module.css'
import ModalPage from '../../Modal UI';
import { DateConvert } from '../../../lib/store';

function Orderstatus({ data,onClose=null }) {
    useEffect(() => { }, [data])
    if(!data?.Id) return null;
    return (
        <ModalPage
            open
            content={
                <div style={{minWidth:'700px'}}>
                    <section>
                        <div className={Styles.mainTop}>
                            <h2>View Order Status</h2>
                            <div className={Styles.mainControl}>
                                <div className={Styles.ProtuctInnerBox}>
                                    <div className={Styles.BoxBlack}>
                                        <div className={Styles.Boxwhite}>
                                            <h1>{data?.ProductCount}</h1>
                                        </div>
                                    </div>
                                </div>

                                <div className={Styles.ProtuctInnerBoxPara}>
                                    <div className={Styles.ProtuctInnerBoxInner}>
                                        <h4 style={{ marginBottom: '30px',textAlign:'start' }}>
                                            {
                                                data?.AccountName
                                            }

                                        </h4>
                                        <p>
                                            <b className={Styles.Span1}>PO Number :</b>
                                            <span className={Styles.Span2}>{data.PO_Number__c}</span>
                                        </p>
                                        <p>
                                            <b className={Styles.Span1}>Brand :</b>
                                            <span className={Styles.Span2}>{data.ManufacturerName__c}</span>
                                        </p>
                                        <p>
                                            <b className={Styles.Span1}>Order Placed :</b>
                                            <span className={Styles.Span2}>{DateConvert(data.CreatedDate, true)}</span>
                                        </p>
                                        <p>
                                            <b className={Styles.Span1}>Order Type :</b>
                                            <span className={Styles.Span2}>{data.Type}</span>
                                        </p>
                                        <p>
                                            <b className={Styles.Span1}>Order Number :</b>
                                            <span className={Styles.Span2}>{data.Order_Number__c}</span>
                                        </p>


                                    </div>

                                </div>
                            </div>
                            <div className={Styles.ShippedBar}>
                                <h3>Order Status :  <span>{data.Status__c ? data.Status__c : "Order Released"}</span></h3>
                                <div className={Styles.BtnGroup}>
                                    <button type="submit" onClick={onClose} >CANCEL</button>
                                </div>

                            </div>
                        </div>
                    </section>
                </div>
            }
            onClose={onClose}
        />
    );
}

export default Orderstatus;

import { DateConvert } from "../../lib/store"
import styles from "./table.module.css";

const AuditReportTable = ({auditReport}) => {
    const formatAmount =(amount)=>{
        return `${Number(amount).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`
      }
    return (
        <div className={`d-flex p-3 ${styles.tableBoundary} mb-5`}>
            <div className={`${styles.WidthTable} table-responsive overflow-scroll `} style={{ maxHeight: "67vh", minHeight: "40vh" }}>
    <table id="auditReportTable" className="table table-responsive">
        <thead>
            <tr>
                <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Account Name</th>
                <th className={`${styles.th} ${styles.stickySecondColumnHeading}`} style={{ minWidth: "200px" }}>Account Shipping City</th>
                <th className={`${styles.th} ${styles.stickyThirdColumnHeading1}`} style={{ minWidth: "200px" }}>Account Shipping State</th>
                <th className={`${styles.th} ${styles.stickyThirdColumnHeading2}`}>Brand Name</th>
                <th className={`${styles.month} ${styles.stickyMonth}`}>Sales</th>
                <th className={`${styles.month} ${styles.stickyMonth}`}>Retail Number</th>
                <th className={`${styles.month} ${styles.stickyMonth}`}>Retail Type</th>
                <th className={`${styles.month} ${styles.stickyMonth}`}>Date Open</th>
                <th className={`${styles.month} ${styles.stickyMonth}`}>Top Brands</th>
                <th className={`${styles.month} ${styles.stickyMonth}`}>Tier</th>
                <th className={`${styles.month} ${styles.stickyMonth}`}>Up to date on Launches</th>
                <th className={`${styles.month} ${styles.stickyMonth}`}>Sales Promotions</th>
                <th className={`${styles.month} ${styles.stickyMonth}`}>Store Events</th>
                <th className={`${styles.month} ${styles.stickyMonth}`}>Floor image</th>
                <th className={`${styles.month} ${styles.stickyMonth}`}>Merchandising</th>
                <th className={`${styles.month} ${styles.stickyMonth}`}>Products</th>
            </tr>
        </thead>
        <tbody>
            {auditReport.length?auditReport.map((item, index) => {
                if (item.Brands.length) {
                    return (
                        item.Brands.map((element,i) => {
                            
                            return (
                                <tr key={index+i}>
                                    <td className={`${styles.td} ${styles.stickyFirstColumn}`}>{item.Name}<br /><small>{item?.Owner?.Name}</small></td>
                                    <td className={`${styles.td} ${styles.stickySecondColumn}`}>{item?.BillingAddress?.street ?? 'NO'}</td>
                                    <td className={`${styles.td} ${styles.stickyThirdColumn1}`}>{item?.BillingAddress?.city ?? 'NO'}</td>
                                    <td className={`${styles.td} ${styles.stickyThirdColumn2}`}>{element.ManufacturerName__c}</td>
                                    <td className={styles.td}>{element.salesNumber[new Date().getFullYear()] ? formatAmount(element.salesNumber[new Date().getFullYear()]):'NO'}</td>
                                    <td className={styles.td}>{element.retailNumber[new Date().getFullYear()] ? formatAmount(element.retailNumber[new Date().getFullYear()]):'NO'}</td>
                                    <td className={styles.td}>{item.Type_of_Business__c ?? 'No'}</td>
                                    <td className={styles.td}>{DateConvert(element.Date_Opened__c)}</td>
                                    <td className={styles.td}>{element.Top_Brands__c ? element.Top_Brands__c : 'NO'}</td>
                                    <td className={styles.td}>{element.Tier__c ? element.Tier__c : 'NO'}</td>
                                    <td className={styles.td}>{element.Up_to_date_on_New_Launches__c ? 'Yes' : 'NO'}</td>
                                    <td className={styles.td}>{element.Sales_Promotions__c ? element.Sales_Promotions__c : 'NO'}</td>
                                    <td className={styles.td}>{element.Store_hosted_Events_date__c ? DateConvert(element.Store_hosted_Events_date__c) : 'NO'}</td>
                                    <td className={styles.td} dangerouslySetInnerHTML={{ __html: element.Sales_Floor_Image__c ? 'Yes' : 'NO' }} />
                                    <td className={styles.td} dangerouslySetInnerHTML={{ __html: element.Merchandising_Image__c ? 'Yes' : 'NO' }} />
                                    <td className={styles.td}>{element.Assortment_Product ? 'Yes' : 'NO'}</td>
                                </tr>
                            )
                        })
                    )
                }
            }):<div class="table_NodataText__l-5kN flex justify-center items-center py-4 w-full lg:min-h-[300px] xl:min-h-[380px]"><p>No data found</p></div>}
        </tbody>
    </table>
    </div></div>)
}
export default AuditReportTable
import { useEffect } from "react";
import { originAPi } from "../../lib/store"
import LoaderV2 from "../loader/v2"

const ErrorProductCard = ({ Styles1, productErrorHandler, errorList, setProductDetailId, product, productImage, reason, setErrorList, ErrorProductQtyHandler, AccountName = null, readOnly = false, style = {}, showQTyHandler = true }) => {
    return (<tr className={Styles1.errorCardHolder} style={{ ...style?.cardHolder }}>
        <td style={{ width: '200px', display: 'flex', paddingLeft: '5px',...style?.nameHolder }}className={Styles1.productImageHolder}>
            {!readOnly && <input type="checkbox" id={product.Id} onChange={() => productErrorHandler(product)} checked={errorList?.[product.Id]?.Id ? true : false} readOnly={readOnly} />}
            {
                !productImage.isLoaded ? <LoaderV2 /> :
                    productImage.images?.[product.ProductCode] ?
                        productImage.images[product.ProductCode]?.ContentDownloadUrl ?
                            <img onClick={() => { setProductDetailId(product?.Product2Id) }} src={productImage.images[product.ProductCode]?.ContentDownloadUrl} className={`${Styles1.imgHolder} zoomInEffect`} alt="img" />
                            : <img onClick={() => { setProductDetailId(product?.Product2Id) }} src={productImage.images[product.ProductCode]} className={`${Styles1.imgHolder} zoomInEffect`} alt="img" />
                        : <img onClick={() => { setProductDetailId(product?.Product2Id) }} src={originAPi + "/dummy.png"} className={`${Styles1.imgHolder} zoomInEffect`} alt="img" />
            }
             <label className={Styles1.productNameHolder} for={product.Id}>{product.Name.split(AccountName).length ==2 ?product.Name.split(AccountName)[1]:<><b style={{fontWeight:'600',textTransform:'capitalize',textAlign:'start'}}>{product.Name}</b><br /><small style={{ fontSize: '12px', color: '#000000' }}>( Not contains in order );</small></>}</label></td>
        <td>{product.ProductCode}</td>
        <td>{product.Quantity??0}</td>
        <td>${parseFloat(product.TotalPrice).toFixed(2)}</td>
        {showQTyHandler &&
            <>
        {(reason && reason != "Charges" && errorList?.[product.Id]?.Id) ? <td>
            <input type="text" max={product.Quantity} className={Styles1.productErrorQtyHolder} id={`oP${product.Id}`} value1={errorList?.[product.Id]?.issue ? errorList?.[product.Id]?.issue : null} onKeyUp={(e) => {
                if(!Number(e.target.value)){
                    console.log({e:errorList?.[product.Id]});
                    e.target.value = null;
                    ErrorProductQtyHandler(errorList?.[product.Id]?.Id, 0)
                    return;
                }
                ErrorProductQtyHandler(errorList?.[product.Id]?.Id, e.target.value)
            }} readOnly={readOnly}  placeholder="Enter Qty"/></td>: <td></td>}
            </>}
    </tr>)
}
export default ErrorProductCard;
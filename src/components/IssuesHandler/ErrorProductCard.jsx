import { useEffect } from "react";
import { originAPi } from "../../lib/store"
import LoaderV2 from "../loader/v2"

import Swal from "sweetalert2"; // Import Swal for the alert

const ErrorProductCard = ({ 
    Styles1, 
    productErrorHandler, 
    errorList, 
    setProductDetailId, 
    product, 
    productImage, 
    reason, 
    setErrorList, 
    ErrorProductQtyHandler, 
    AccountName = null, 
    readOnly = false, 
    style = {}, 
    showQTyHandler = true 
}) => {
    console.log({ product });

    return (
        <tr className={Styles1.errorCardHolder} style={{ ...style?.cardHolder }}>
            <td 
                style={{ width: '200px', display: 'flex', paddingLeft: '5px', ...style?.nameHolder }}
                className={Styles1.productImageHolder}
            >
                {!readOnly && 
                    <input 
                        type="checkbox" 
                        id={product.Id} 
                        onChange={() => productErrorHandler(product)} 
                        checked={errorList?.[product.Id]?.Id ? true : false} 
                        readOnly={readOnly} 
                    />}
                {!productImage.isLoaded ? (
                    <LoaderV2 />
                ) : productImage.images?.[product.ProductCode] ? (
                    productImage.images[product.ProductCode]?.ContentDownloadUrl ? (
                        <img 
                            onClick={() => { setProductDetailId(product?.Product2Id); }} 
                            src={productImage.images[product.ProductCode]?.ContentDownloadUrl} 
                            className={`${Styles1.imgHolder} zoomInEffect`} 
                            alt="img" 
                        />
                    ) : (
                        <img 
                            onClick={() => { setProductDetailId(product?.Product2Id); }} 
                            src={productImage.images[product.ProductCode]} 
                            className={`${Styles1.imgHolder} zoomInEffect`} 
                            alt="img" 
                        />
                    )
                ) : (
                    <img 
                        onClick={() => { setProductDetailId(product?.Product2Id); }} 
                        src={originAPi + "/dummy.png"} 
                        className={`${Styles1.imgHolder} zoomInEffect`} 
                        alt="img" 
                    />
                )}
                <label 
                    className={Styles1.productNameHolder} 
                    htmlFor={product.Id}
                >
                    {product.Name.split(AccountName).length === 2 
                        ? product.Name.split(AccountName)[1]
                        : <>
                            <b style={{ fontWeight: '600', textTransform: 'capitalize', textAlign: 'start' }}>
                                {product.Name}
                            </b>
                            <br />
                            <small style={{ fontSize: '12px', color: '#000000' }}>
                                ( Not contains in order )
                            </small>
                        </>
                    }
                </label>
            </td>
            <td>{product.ProductCode}</td>
            <td>{product.Quantity ?? 0}</td>
            <td>${parseFloat(product.TotalPrice).toFixed(2)}</td>
            {showQTyHandler && (
                <>
                    {(reason && reason !== "Charges" && errorList?.[product.Id]?.Id) ? (
                        <td>
                            <input 
                                type="text" 
                                max={product.Quantity} 
                                className={Styles1.productErrorQtyHolder} 
                                id={`oP${product.Id}`} 
                                defaultValue={errorList?.[product.Id]?.issue ? errorList?.[product.Id]?.issue : ''} 
                                onKeyUp={(e) => {
                                    const enteredValue = Number(e.target.value);
                                    if (!enteredValue) {
                                        e.target.value = null;
                                        ErrorProductQtyHandler(errorList?.[product.Id]?.Id, 0);
                                        return;
                                    }else{
                                    // if (enteredValue > product.Quantity) {
                                    //     Swal.fire({
                                    //         title: `${reason}!`,
                                    //         text: `You have entered more than the allowed quantity`,
                                    //         icon: 'error',
                                    //         confirmButtonText: 'Ok',
                                    //         confirmButtonColor: '#000',
                                    //     });
                                    //     e.target.value = errorList?.[product.Id]?.issue || 0; // Reset to previous value
                                    // } else {
                                        ErrorProductQtyHandler(errorList?.[product.Id]?.Id, enteredValue);
                                    }
                                }} 
                                readOnly={readOnly}  
                                placeholder="Enter Qty"
                            />
                        </td>
                    ) : (
                        <td></td>
                    )}
                </>
            )}
        </tr>
    );
};
export default ErrorProductCard;
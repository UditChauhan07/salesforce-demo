import Styles from "./Styles.module.css";
import { DeleteIcon } from "../../lib/svg";
import QuantitySelector from "../BrandDetails/Accordion/QuantitySelector";
import Slider from "../../utilities/Slider";
import { useState } from "react";
import { DateConvert, isDateEqualOrGreaterThanToday } from "../../lib/store";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import ModalPage from "../Modal UI";
import ImageHandler from "../loader/ImageHandler";

const ProductDetailCard = ({ product, orders, onQuantityChange = null,publicView=false }) => {
  const { updateProductQty, removeProduct } = useCart();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState();
  const [modalShow,setModalShow]= useState(false);
  if (!product) {
    return null;
  }
  if (!product?.data?.Id) {
    return null;
  }
  // console.log({product});


  if (!product?.data?.ManufacturerId__c) {
    console.warn('Manufacturer ID is missing in the product data');
  }

  let discount = 0;
  let selAccount = {};
 
  let listPrice = Number(product?.data?.usdRetail__c?.replace("$", "")?.replace(",", ""));
  let salesPrice = 0;
  let listOfAccounts = Object.keys(product?.discount||{});
  if (listOfAccounts.length) {
    if (listOfAccounts.length == 1) {
      selAccount = product?.discount?.[listOfAccounts[0]];
     
      if (product?.Category__c === "TESTER") {
        discount = selAccount?.Discount?.testerMargin || 0;
      } else if (product?.Category__c === "Samples") {
        discount = selAccount?.Discount?.sample || 0;
      } else {
        discount = selAccount?.Discount?.margin || 0;
      }
    }
  }
  salesPrice = (+listPrice - ((discount || 0) / 100) * +listPrice).toFixed(2);
 
  return (
    <div className="container mt-4 product-card-element">
      <ModalPage
          open={modalShow}
          content={
            <>
              <div style={{ maxWidth: "309px" }}>
                <h1 className={`fs-5 ${Styles.ModalHeader}`}>Bag</h1>
                <p className={` ${Styles.ModalContent}`}>This product will be available soon. Please check back later</p>
                <div className="d-flex justify-content-center">
                  <button
                    className={`${Styles.button}`}
                    onClick={() => {
                      setModalShow(false);
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </>
          }
          onClose={() => {
            setModalShow(false);
          }}
        />
      <div className="d-flex">
        <div className={`${Styles.productimage} col-4`} style={{ flex: '40% 1' }}>
          <ImageHandler Id={product?.data?.Id} showAll/>
        </div>
        <div className="col-8 ml-4 product-card-element-holder" style={{ flex: '60% 1' }}>
          <p style={{ textAlign: "start" }}>
            <b>BY</b>, <Link to={'/Brand/' + product.data.ManufacturerId__c} className={Styles.brandHolder}><b>{product?.data?.ManufacturerName__c}</b></Link>
          </p>
          <h2 className={Styles.nameHolder}>
            {product?.data?.Name}
          </h2>
          {product?.data?.Description && (
            <p className={Styles.descHolder}>
              {product.data.Description.length > 750 ? (
                isDescriptionExpanded ? (
                  product.data.Description
                ) : (
                  product.data.Description.substring(0, 750) + "..."
                )
              ) : (
                product.data.Description
              )}
              {product.data.Description.length > 750 && (
                <button style={{ textDecoration: 'underline' }} onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                  {isDescriptionExpanded ? 'Learn Less' : 'Learn More'}
                </button>
              )}
            </p>
          )}
          <div className="text-start">
            {!publicView ? selAccount?.Name ? <small>Price for <b>{selAccount?.Name}</b></small> : (orders) ? <small>Price for <b>{orders?.Account?.name}</b></small> : null:null}
          </div>
          <p className={`${Styles.priceHolder} d-flex mt-2`}>
            {!publicView ?(!isNaN(salesPrice) && !isNaN(listPrice)) ? salesPrice != listPrice ? <p className={Styles.crossed}>${listPrice.toFixed(2)}&nbsp;</p> : orders ? <p className={Styles.crossed}>{!isNaN(listPrice) ? "$"+listPrice.toFixed(2):listPrice}&nbsp;</p> : null:null:null}
            <b>{!publicView ?orders ? <Link to={"/my-bag"}>${Number(orders?.items?.price).toFixed(2)}</Link> : !isNaN(salesPrice)?'$'+salesPrice:product.data.usdRetail__c??"NA":product.data.usdRetail__c}</b>
          </p>
          {!publicView?!product.data.ProductUPC__c || !product.data.ProductCode || !product.data.IsActive || (!product.data?.PricebookEntries?.length || !product?.data?.PricebookEntries?.[0]?.IsActive && (!isNaN(salesPrice) && !isNaN(listPrice)) || !isDateEqualOrGreaterThanToday(product.data.Launch_Date__c)) ? <button
            className={`${Styles.button}`}
            onClick={()=>setModalShow(true)}
          >
            Add to Bag
            <small className={Styles.soonHolder}>coming soon</small>
          </button> :
            <>
              {orders ? (
                <div className="d-flex flex-column  h-[5rem]">
                  <div className="d-flex gap-1">
                    <QuantitySelector
                      min={product?.data?.Min_Order_QTY__c || 0}
                      value={orders?.items?.qty}
                      onChange={(quantity) => {
                        updateProductQty(product?.data.Id, quantity);
                      }}
                    />
                    <button
                      className="ml-4"
                      onClick={() => removeProduct?.(product?.data.Id, 0)}
                    >
                      <DeleteIcon fill="red" />
                    </button>
                  </div>
                  <p className="mt-3" style={{ textAlign: "start" }}>
                    {/* Total: <b>{(inputPrice * orders[product?.data?.Id]?.quantity).toFixed(2)}</b> */}
                  </p>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-4 h-[5rem] ">
                  <button
                    className={`${Styles.button}`}
                    onClick={() =>
                      onQuantityChange(
                        product.data,
                        product?.data?.Min_Order_QTY__c || 1,
                      )
                    }
                  >
                    Add to Bag
                  </button>
                </div>
              )}
            </>:null}
          {/* {product?.data?.Description && <p style={{ textAlign: 'start', color: "#898989" }}>{product?.data?.Description}</p>} */}
          <hr className="mt-5" style={{ borderTop: "3px dashed #000", fontSize: "20px", color: "black" }}></hr>
          {product?.data?.ProductCode && <p className={Styles.descHolder}>
            Product Code: <span >{product?.data?.ProductCode}</span>
          </p>}
          {product?.data?.ProductUPC__c && <p className={Styles.descHolder}>
            Product UPC: <span >{product?.data?.ProductUPC__c}</span>
          </p>}
          {product?.data?.Min_Order_QTY__c &&
            <p className={Styles.descHolder}>
              Min Order QTY: <span >{product?.data?.Min_Order_QTY__c}</span>
            </p>}
          {product?.data?.Category__c && (
            <p className={Styles.descHolder}>
              Category: <span >{product?.data?.Category__c}</span>
            </p>
          )}
          {product.data?.Collection__c && (
            <p className={Styles.descHolder}>
              Collection: <span >{product.data?.Collection__c}</span>
            </p>
          )}
        </div>
      </div>
      <hr></hr>
      {product.data?.Full_Product_Description__c && product.data?.Full_Product_Description__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span >Full Product Description:</span> {product.data?.Full_Product_Description__c}
        </p>
      )}
      {product.data?.Desired_Result__c && product.data?.Desired_Result__c != "N/A" && (
        <div
          className={Styles.descHolder}
          dangerouslySetInnerHTML={{ __html: `<span>Desired Result:</span> ${product.data?.Desired_Result__c}` }}
        />
      )}
      {product.data?.Key_Ingredients__c && product.data?.Key_Ingredients__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span>Key Ingredients:</span> {product.data?.Key_Ingredients__c}
        </p>
      )}
      {product.data?.Full_Ingredients_List__c && product.data?.Full_Ingredients_List__c != "N/A" && (
        <p className={Styles.descHolder}>
          {" "}
          <span >Ingredients List:</span> {product.data?.Full_Ingredients_List__c}
        </p>
      )}
      {product.data?.Size_Volume_Weight__c && product.data?.Size_Volume_Weight__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span >Size (Volume/Weight):</span> {product.data?.Size_Volume_Weight__c}
        </p>
      )}
      {product.data?.Skin_Tone__c && product.data?.Skin_Tone__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span >Skin Tone:</span> {product.data?.Skin_Tone__c}
        </p>
      )}
      {product.data?.Skin_Type__c && product.data?.Skin_Type__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span >Skin Type:</span> {product.data?.Skin_Type__c}
        </p>
      )}
      {product.data?.Travel_or_Full_Size__c && product.data?.Travel_or_Full_Size__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span>Product Size:</span> {product.data?.Travel_or_Full_Size__c}
        </p>
      )}
      {product?.data?.Newness_Alias__c && product.data?.Newness_Alias__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span>Product Newness Name:</span> {product?.data?.Newness_Alias__c}
        </p>
      )}
      {product?.data?.Newness_Start_Date__c && product.data?.Newness_Start_Date__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span>Product Newness Start Date:</span> {product?.data?.Newness_Start_Date__c}
        </p>
      )}
      {product?.data?.Newness_Report_End_Date__c && product.data?.Newness_Report_End_Date__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span>Product Newness End Date:</span> {product?.data?.Newness_Report_End_Date__c}
        </p>
      )}
      {product?.data?.Season__c && product.data?.Season__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span>Season:</span> {product?.data?.Season__c},
        </p>
      )}
      {product?.data?.CreatedDate && product.data?.CreatedDate != "N/A" && (
        <p className={Styles.descHolder}>
          <span>Create Date:</span> {new Date(product?.data?.CreatedDate).toDateString()}
        </p>
      )}
      {product?.data?.Launch_Date__c && product.data?.Launch_Date__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span >Launch Date:</span> {DateConvert(product?.data?.Launch_Date__c)}
        </p>
      )}
      {product?.data?.Ship_Date__c && product.data?.Ship_Date__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span>Ship Date:</span> {DateConvert(product?.data?.Ship_Date__c)}
        </p>
      )}
      {/* <p style={{ textAlign: 'start' }}>Product Edit Date: {new Date(product?.data?.LastModifiedDate).toDateString()},</p> */}
      {(product.data?.Point_of_difference_1__c || product.data?.Point_of_difference_2__c || product.data?.Point_of_difference_3__c) && (
        <p className={Styles.descHolder}>
          <span>Point of difference:</span>
          <ol>
            {product.data?.Point_of_difference_1__c && <li><span>#1:</span> {product.data?.Point_of_difference_1__c}</li>}
            {product.data?.Point_of_difference_2__c && <li><span>#2:</span> {product.data?.Point_of_difference_2__c}</li>}
            {product.data?.Point_of_difference_3__c && <li><span>#3:</span> {product.data?.Point_of_difference_3__c}</li>}
          </ol>
        </p>
      )}
      {product.data?.Usage_and_Application_Tips__c && (
        <p className={Styles.descHolder}>
          <span>Usage and Application Tips:</span>
          {product.data?.Usage_and_Application_Tips__c}
          {product.data?.Use_it_with_Option_1__c || product.data?.Use_it_with_Option_2__c || product.data?.Use_it_with_Option_3__c ?
            <>
              <br />
              <br />
              <span>Use it with</span>
              <ol>
                {product.data?.Use_it_with_Option_1__c && <li><span>#1:</span> {product.data?.Use_it_with_Option_1__c}</li>}
                {product.data?.Use_it_with_Option_2__c && <li><span>#2:</span> {product.data?.Use_it_with_Option_2__c}</li>}
                {product.data?.Use_it_with_Option_3__c && <li><span>#3:</span> {product.data?.Use_it_with_Option_3__c}</li>}
              </ol>
            </>
            : <>{" "}</>}
        </p>
      )}
    </div>
  );
};
export default ProductDetailCard;

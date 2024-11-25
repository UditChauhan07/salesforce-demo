import Styles from "./Styles.module.css";
import { DeleteIcon } from "../../lib/svg";
import QuantitySelector from "../BrandDetails/Accordion/QuantitySelector";
import Slider from "../../utilities/Slider";
import { useState } from "react";
import { DateConvert, isDateEqualOrGreaterThanToday } from "../../lib/store";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import ModalPage from "../Modal UI";

const ProductDetailCard = ({ product, orders, onQuantityChange = null }) => {
  const { updateProductQty, removeProduct } = useCart();
  console.log({product})
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

  let fakeProductSlider = [
    {
      icon: "<svg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 122.88 114.58'><title>product</title><path d='M118.13,9.54a3.25,3.25,0,0,1,2.2.41,3.28,3.28,0,0,1,2,3l.57,78.83a3.29,3.29,0,0,1-1.59,3L89.12,113.93a3.29,3.29,0,0,1-2,.65,3.07,3.07,0,0,1-.53,0L3.11,105.25A3.28,3.28,0,0,1,0,102V21.78H0A3.28,3.28,0,0,1,2,18.7L43.89.27h0A3.19,3.19,0,0,1,45.63,0l72.5,9.51Zm-37.26,1.7-24.67,14,30.38,3.88,22.5-14.18-28.21-3.7Zm-29,20L50.75,64.62,38.23,56.09,25.72,63.17l2.53-34.91L6.55,25.49V99.05l77.33,8.6V35.36l-32-4.09Zm-19.7-9.09L56.12,8,45.7,6.62,15.24,20l16.95,2.17ZM90.44,34.41v71.12l25.9-15.44-.52-71.68-25.38,16Z'/></svg>",
    },
  ];

  let discount = 0;
  let selAccount = {};
  let listPrice = Number(product?.data?.usdRetail__c?.replace("$", "")?.replace(",", ""));
  let salesPrice = 0;
  let listOfAccounts = Object.keys(product?.discount);
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
          {product?.data?.imgSrc?.length > 0 ? <Slider data={product?.data?.imgSrc} /> : <Slider data={fakeProductSlider} />}
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
            {selAccount?.Name ? <small>Price for <b>{selAccount?.Name}</b></small> : orders ? <small>Price for <b>{orders.Account.name}</b></small> : null}
          </div>
          <p className={`${Styles.priceHolder} d-flex`}>
            {salesPrice != listPrice ? <p className={Styles.crossed}>${listPrice.toFixed(2)}&nbsp;</p> : orders ? <p className={Styles.crossed}>${listPrice.toFixed(2)}&nbsp;</p> : null}
            <b>${orders ? <Link to={"/my-bag"}>{Number(orders?.items?.price).toFixed(2)}</Link> : salesPrice}</b>
          </p>
          {!product.data.ProductUPC__c || !product.data.ProductCode || !product.data.IsActive || (!product.data?.PricebookEntries?.length || !product?.data?.PricebookEntries?.[0]?.IsActive && (!isNaN(salesPrice) && !isNaN(listPrice)) || !isDateEqualOrGreaterThanToday(product.data.Launch_Date__c)) ? <button
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
            </>}
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
  return (
    <div className="container mt-4 product-card-element">
      <div className="d-flex">
        <div className="col-4">
          {product?.data?.imgSrc?.length > 0 ? <Slider data={product?.data?.imgSrc} /> : <Slider data={fakeProductSlider} />}
        </div>
        <div className="col-8 ml-4 product-card-element-holder">
          <h2 style={{ textAlign: "start" }}>
            <b>{product?.data?.Name}</b>
          </h2>
          <p style={{ textAlign: "start" }}>
            <b>By</b>, <b>{product?.data?.ManufacturerName__c}</b>
          </p>
          {product?.discount == 0 ? (
            <p style={{ textAlign: "start" }}>
              <span className={Styles.crossed}>{product?.data?.usdRetail__c}</span>&nbsp;${salesPrice}
            </p>
          ) : (
            <p style={{ textAlign: "start" }}>
              <b>{product?.data?.usdRetail__c}</b>
            </p>
          )}
          {product?.data?.Description && (
            <p style={{ textAlign: "start", color: "#898989" }}>
              {product.data.Description.length > 750
                ? isDescriptionExpanded
                  ? product.data.Description
                  : product.data.Description.substring(0, 750) + "..."
                : product.data.Description}
              {product.data.Description.length > 750 && (
                <button style={{ textDecoration: "underline" }} onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                  {isDescriptionExpanded ? "Learn Less" : "Learn More"}
                </button>
              )}
            </p>
          )}
          <p style={{ textAlign: "start", color: "#898989" }}>
            Code Number: <b style={{ color: "black" }}>{product?.data?.ProductCode},</b>
          </p>
          <p style={{ textAlign: "start", color: "#898989" }}>
            UPC Number: <b style={{ color: "black" }}>{product?.data?.ProductUPC__c},</b>
          </p>
          <p style={{ textAlign: "start", color: "#898989" }}>
            Min Qty to buy: <b style={{ color: "black" }}>{product?.data?.Min_Order_QTY__c}</b>
          </p>
          {product?.data?.Category__c && (
            <p style={{ textAlign: "start", color: "#898989" }}>
              Category: <b style={{ color: "black" }}>{product?.data?.Category__c}</b>
            </p>
          )}
          {product.data?.Collection__c && (
            <p style={{ textAlign: "start", color: "#898989" }}>
              Collection: <b style={{ color: "black" }}>{product.data?.Collection__c}</b>
            </p>
          )}

        </div>
      </div>
      {product.data?.Full_Product_Description__c && (
        <p style={{ textAlign: "start", color: "#898989" }}>
          <b style={{ color: "black" }}>Product Full Description:</b> {product.data?.Full_Product_Description__c}
        </p>
      )}
      {product.data?.Desired_Result__c && (
        <div
          style={{ textAlign: "start", color: "#898989" }}
          dangerouslySetInnerHTML={{ __html: `Product Desired Result: ${product.data?.Desired_Result__c}` }}
        />
      )}
      {product.data?.Key_Ingredients__c && (
        <p style={{ textAlign: "start", color: "#898989" }}>
          <b style={{ color: "black" }}>Product Basic Ingredients List:</b> {product.data?.Key_Ingredients__c}
        </p>
      )}
      {product.data?.Full_Ingredients_List__c && (
        <p style={{ textAlign: "start", color: "#898989" }}>
          <b style={{ color: "black" }}>Product Full Ingredients List:</b> {product.data?.Full_Ingredients_List__c}
        </p>
      )}
      {product.data?.Size_Volume_Weight__c && (
        <p style={{ textAlign: "start", color: "#898989" }}>
          <b style={{ color: "black" }}>Product Weight:</b> {product.data?.Size_Volume_Weight__c}
        </p>
      )}
      {product.data?.Skin_Tone__c && (
        <p style={{ textAlign: "start", color: "#898989" }}>
          <b style={{ color: "black" }}>Product Tone:</b> {product.data?.Skin_Tone__c}
        </p>
      )}
      {product.data?.Skin_Type__c && (
        <p style={{ textAlign: "start", color: "#898989" }}>
          <b style={{ color: "black" }}>Product Type:</b> {product.data?.Skin_Type__c}
        </p>
      )}
      {product.data?.Travel_or_Full_Size__c && (
        <p style={{ textAlign: "start", color: "#898989" }}>
          <b style={{ color: "black" }}>Product Size: </b>
          {product.data?.Travel_or_Full_Size__c}
        </p>
      )}
      {product?.data?.Newness_Alias__c && (
        <p style={{ textAlign: "start", color: "#898989" }}>
          <b style={{ color: "black" }}>Product Newness Name:</b> {product?.data?.Newness_Alias__c},
        </p>
      )}
      <p style={{ textAlign: "start", color: "#898989" }}>
        <b style={{ color: "black" }}>Product Season: </b>
        {product?.data?.Season__c},
      </p>
      {product?.data?.Launch_Date__c &&
        <p style={{ textAlign: "start", color: "#898989" }}>
          <b style={{ color: "black" }}> Product Launch Date:</b> {DateConvert(product?.data?.Launch_Date__c)}
        </p>}
      {product?.data?.Ship_Date__c &&
        <p style={{ textAlign: "start", color: "#898989" }}>
          <b style={{ color: "black" }}>Product Ship Date:</b> {DateConvert(product?.data?.Ship_Date__c)}
        </p>}
      <p style={{ textAlign: "start", color: "#898989" }}>
        <b style={{ color: "black" }}>Product Create Date:</b> {DateConvert(product?.data?.CreatedDate, true)}
      </p>
      {/* <p style={{ textAlign: 'start' }}>Product Edit Date: {new Date(product?.data?.LastModifiedDate).toDateString()},</p> */}
      {(product.data?.Point_of_difference_1__c || product.data?.Point_of_difference_2__c || product.data?.Point_of_difference_3__c) && (
        <p style={{ textAlign: "start", color: "#898989" }}>
          <b style={{ color: "black" }}>Point of Difference:</b>{" "}
          <ol>
            {product.data?.Point_of_difference_1__c && <li>{product.data?.Point_of_difference_1__c}</li>}
            {product.data?.Point_of_difference_2__c && <li>{product.data?.Point_of_difference_2__c}</li>}
            {product.data?.Point_of_difference_3__c && <li>{product.data?.Point_of_difference_3__c}</li>}
          </ol>
        </p>
      )}
      {product.data?.Usage_and_Application_Tips__c && (
        <p style={{ textAlign: "start", color: "#898989" }}>
          <b style={{ color: "black" }}>Usages Tups:</b> {product.data?.Usage_and_Application_Tips__c}
          <ol>
            {product.data?.Use_it_with_Option_1__c && <li>{product.data?.Use_it_with_Option_1__c}</li>}
            {product.data?.Use_it_with_Option_2__c && <li>{product.data?.Use_it_with_Option_2__c}</li>}
            {product.data?.Use_it_with_Option_3__c && <li>{product.data?.Use_it_with_Option_3__c}</li>}
          </ol>
        </p>
      )}
    </div>
  );
};
export default ProductDetailCard;

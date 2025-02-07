import React, { useEffect, useMemo, useState } from "react";
import "./Style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import ProductDetails from "../../pages/productDetails";
import { Link } from "react-router-dom";
import LoaderV2 from "../loader/v2";
import ImageHandler from "../loader/ImageHandler";
import { originAPi } from "../../lib/store";
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function LaunchCalendar({ productList, brand, month }) {
  const products = productList;
  const [productDetailId, setProductDetailId] = useState();

  // const filterData = useMemo(() => {
  //   if (!month || month === "") {
  //     return products; // Return all products if no month is selected
  //   }

  //   return products?.map((months) => {
  //     const filteredContent = months.content?.filter((item) => {
  //       const shipDateParts = item.Ship_Date__c.split("-");
  //       const shipMonth = parseInt(shipDateParts[1]) - 1; // Get month index (0-11)
  //       const shipDay = parseInt(shipDateParts[2]);

  //       if (brand) {
  //         if (brand !== item.ManufacturerId__c) {
  //           return false; // Filter out items that don't match the brand
  //         }
  //       }

  //       if (month === "TBD") {
  //         return shipDay === 15; // Special case for "TBD"
  //       } else {
  //         return monthNames[shipMonth].toLowerCase() === month.toLowerCase();
  //       }
  //     });
  //     console.log({filteredContent,months});
      

  //     // Create a new object with filtered content
  //     return { ...months, content: filteredContent };
  //   });
  // }, [products, month, brand]); // Dependencies for useMemo

  const filterData = useMemo(() => {
    return products?.map((months) => {
      const filteredContent = months.content?.filter((item) => {
        const shipDateParts = item.Ship_Date__c.split("-");
        const shipMonth = parseInt(shipDateParts[1]) - 1; // Get month index (0-11)
        const shipDay = parseInt(shipDateParts[2]);
        const monthName = monthNames[shipMonth].toLowerCase();
  
        // Check if the month matches
        const monthMatches = month ? monthName === month.toLowerCase() : true;
  
        // Check if the brand matches
        const brandMatches = brand ? brand === item.ManufacturerId__c : true;
  
        // Return true if both month and brand match
        return monthMatches && brandMatches;
      });
  
      // Create a new object with filtered content
      return { ...months, content: filteredContent };
    });
  }, [products, month, brand]); // Dependencies for useMemo

  const allOrdersEmpty = filterData?.every((item) => item.content.length <= 0);


  return (
    <div id="Calendar">
      <div className="container">
        <h1 className="TopHeading">Marketing Calendar</h1>
        <div className="row">
          <div className="col-xl-9 col-lg-9 col-md-12 col-sm-12 marketing-card">
            <ul className="timeline mt-4 mr-4" id="CalenerContainer">
              {allOrdersEmpty ? (
                <div className="NodataContent">No data found</div>
              ) : (
                filterData?.map((month, index) => {
                  if (month.content.length) {
                    return (
                      <li key={index}>
                        <span className={`timelineHolder0${(index % 3) + 1}`} id={month.month}>{month.month}</span>
                        {month.content.map((product, productIndex) => {
                          if (!brand || brand == product.brand || brand == product.ManufacturerId__c) {
                            let price = 'TBD';
                            if (product.usdRetail__c) {
                              if (product.usdRetail__c != "TBD") {
                                if (product.usdRetail__c.includes("$")) {
                                  let priceSplit = product.usdRetail__c.split('$')
                                  if (priceSplit.length == 2) {
                                    priceSplit = priceSplit[1].trim();
                                    price = "$" + parseFloat(priceSplit).toFixed(2);
                                  } else {
                                    price = product.usdRetail__c;
                                  }
                                } else {
                                  price = "$" + parseFloat(product.usdRetail__c).toFixed(2);
                                }
                              }
                            }
                            return (
                              <>
                                <div className="timeline-content cardHover" key={productIndex}>
                                  <div className="ProductInfo">
                                    <div className="BothDateTopFlex">
                                      <div className="ShipDate">
                                        <span >Ship Date</span>
                                        {/* style={{backgroundColor:hexabrand[product.ManufacturerId__c],color:hexabrandText[product.ManufacturerId__c]}}*/}
                                        <div className={`DateCurrent0${(index % 3) + 1}`} >{product.Ship_Date__c ? (product.Ship_Date__c.split("-")[2] == 27 ? 'TBD' : product.Ship_Date__c.split("-")[2]) + '/' + monthNames[parseInt(product.Ship_Date__c.split("-")[1]) - 1].toUpperCase() + '/' + product.Ship_Date__c.split("-")[0] : 'TBD'}</div>
                                      </div>
                                      <div className="ShipDate EDate">
                                        <span>OCD</span>
                                        <div className="DateEod">{product.Launch_Date__c ? product.Launch_Date__c.split("-")[2] + '/' + monthNames[parseInt(product.Launch_Date__c.split("-")[1]) - 1].toUpperCase() + '/' + product.Launch_Date__c.split("-")[0] : 'TBD'}</div>
                                      </div>
                                    </div>
                                    <div className="d-flex mt-2">
                                      <div className="m-auto ProductImg">
                                        <ImageHandler image={{src:product?.ProductImage,alt:product.Name}} onClick={() => {
                                          setProductDetailId(product.Id);
                                        }}/>
                                      </div>
                                      <div className="LaunchProductDetail " style={{ position: 'relative' }}>
                                        <h3 onClick={() => {
                                          setProductDetailId(product.Id);
                                        }} style={{ cursor: 'pointer', marginBottom: '10px' }} className="linkEffect">{product.Name}</h3>
                                        <div className="size">
                                          <span>Size <span className="ProductQty">{product.Size_Volume_Weight__c ?? "NA"}</span></span>
                                          <span>Price <span className="ProductQty">{price}</span></span>
                                        </div>
                                        <p>{product.Description}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="launchBrand" style={{ maxWidth: '200px', height: 'auto',margin:'auto' }}>
                                    <Link to={'/Brand/' + product.ManufacturerId__c}>
                                    <ImageHandler image={{src:originAPi+"/brandImage/" + product.ManufacturerId__c + ".png",alt:`${product?.ManufacturerName__c} logo`}} />
                                    </Link>
                                  </div>
                                </div>
                              </>
                            );
                          }
                        })}
                      </li>
                    );
                  }
                })
              )}
            </ul>
          </div>

          <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 ">
            <div className="GrayBg">
              <div className="PlusBtn">
                <div className="AddNewInner">
                  <button className="btn btn-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="86" height="86" viewBox="0 0 86 86" fill="none">
                      <path d="M43 21.5L43 64.5" stroke="#D5D9D9" strokeWidth="5" strokeLinecap="square" strokeLinejoin="round" />
                      <path d="M64.5 43L21.5 43" stroke="#D5D9D9" strokeWidth="5" strokeLinecap="square" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <p> Unleashed feature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {productDetailId?<ProductDetails productId={productDetailId} setProductDetailId={setProductDetailId} isAddtoCart={false} />:null}
    </div>
  );
}
export default LaunchCalendar;

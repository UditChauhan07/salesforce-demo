import React, { useEffect, useState } from "react";
import "./Style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import ProductDetails from "../../pages/productDetails";
import { Link } from "react-router-dom";
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function LaunchCalendar({ productList, brand, month }) {
  const products = productList;
 
  const [productDetailId, setProductDetailId] = useState();
  const [isEmpty, setIsEmpty] = useState(false);
  useEffect(() => {

    let temp = true;
    products.map((month) => {
      month.content.map((item) => {
        if (!brand || brand == item.brand) {
          temp = false;
        }
      });
      setIsEmpty(temp);
    });
  }, [brand]);

  const [filterData, setFilterData] = useState();
  const allOrdersEmpty = filterData?.every((item) => item.content.length <= 0);
  useEffect(() => {
    if (!month || month == "") {
      setFilterData(products);
    }
    const newValues = products?.map((months) => {
      const filterData = months.content?.filter((item) => {
        // let match = item.OCDDate.split("/")
        // console.log(match)
        if (month) {
          if (brand) {
            if (brand == item.ManufacturerName__c) {
              if (month == "TBD") {
                return parseInt(item.Ship_Date__c.split("-")[2]) == 15;
              } else {
                return monthNames[parseInt(item.Ship_Date__c.split("-")[1]) - 1].toLowerCase() == month.toLowerCase();
              }
            }
          } else {
            if (month == "TBD") {
              return parseInt(item.Ship_Date__c.split("-")[2]) == 15;
            } else {
              return monthNames[parseInt(item.Ship_Date__c.split("-")[1]) - 1].toLowerCase() == month.toLowerCase();
            }
          }
          // return match.includes(month.toUpperCase() )
        } else {
          if (brand) {
            if (brand == item.ManufacturerName__c) {
              return true;
            }
          } else {
            return true;
          }
          // If month is not provided, return all items
        }
      });
      // Create a new object with filtered content
      return { ...months, content: filterData };
    });
    setFilterData(newValues);
  }, [month, brand]);

  //   if(!ShipDate){
  // setFilterData(products)
  //   }
  //   const newValues = products?.map((Date) => {
  //     const filterData = Date.content?.filter((item) => {
  //       // let match = item.OCDDate.split("/")
  //       // console.log(match)
  //       if (ShipDate) {
  //         // return match.includes(month.toUpperCase() )
  //         return item.date.toLowerCase().includes(ShipDate.toLowerCase() )
  //       } else {
  //         // If month is not provided, return all items
  //         return true;
  //       }
  //     });
  //     // Create a new object with filtered content
  //     return { ...Date, content: filterData };
  //   });
  //  console.log(newValues);
  //   setFilterData(newValues);
  // }, [ShipDate]);

  const ImageWithFallback = ({ src, alt, fallback,className,style }) => {
    // State to manage the current image source
    const [imgSrc, setImgSrc] = useState(src);

    // Function to handle image loading errors
    const handleError = () => {
        setImgSrc(fallback); // Set fallback image on error
    };

    return (
        <img
            src={imgSrc}
            alt={alt}
            onError={handleError}
            style={style}
            className={className}
        />
    );
};

  return (
    <div id="Calendar">
      <div className="container">
        <h1 className="TopHeading">Marketing Calendar</h1>
        <div className="row">
          <div className="col-xl-9 col-lg-9 col-md-12 col-sm-12 ">
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
                          if (!brand || brand == product.brand || brand == product.ManufacturerName__c) {
                            let price = 'TBD';
                            if (product.usdRetail__c) {
                              if(product.usdRetail__c !="TBD"){
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
                                        <div className={`DateCurrent0${(index % 3) + 1}`} >{product.Ship_Date__c ? (product.Ship_Date__c.split("-")[2] == 15 ? 'TBD' : product.Ship_Date__c.split("-")[2]) + '/' + monthNames[parseInt(product.Ship_Date__c.split("-")[1]) - 1].toUpperCase() + '/' + product.Ship_Date__c.split("-")[0] : 'NA'}</div>
                                      </div>
                                      <div className="ShipDate EDate">
                                        <span>OCD</span>
                                        <div className="DateEod">{product.Launch_Date__c ? product.Launch_Date__c.split("-")[2] + '/' + monthNames[parseInt(product.Launch_Date__c.split("-")[1]) - 1].toUpperCase() + '/' + product.Launch_Date__c.split("-")[0] : 'NA'}</div>
                                      </div>
                                    </div>
                                    <div className="d-flex mt-2">
                                      <div className="m-auto ProductImg">
                                        <img className="zoomInEffect" src={product?.ProductImage ?? "\\assets\\images\\dummy.png"} alt={product.Name} onClick={() => {
                                          setProductDetailId(product.Id);
                                        }} style={{ cursor: 'pointer' }} />
                                      </div>
                                      <div className="LaunchProductDetail " style={{ position: 'relative' }}>
                                        <h3 onClick={() => {
                                          setProductDetailId(product.Id);
                                        }} style={{ cursor: 'pointer', marginBottom: '10px' }} className="linkEffect">{product.Name}</h3>
                                        <div className="size">
                                          <span>Size <span className="ProductQty">{product.Size_Volume_Weight__c??"NA"}</span></span>
                                          <span>Price <span className="ProductQty">{price}</span></span>
                                        </div>
                                        <p>{product.Description}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="launchBrand">
                                    <Link to={'/Brand/'+product.ManufacturerId__c}>
                                    <ImageWithFallback className="img-fluid" src={"\\assets\\images\\brandImage\\" + product.ManufacturerId__c + ".png"} alt={`${product.name} logo`} fallback={"\\assets\\images\\dummy.png"} style={{maxWidth:'200px',height:'auto'}} />
                                    {/* {console.log(product.ManufacturerId__c)} */}
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
      <ProductDetails productId={productDetailId} setProductDetailId={setProductDetailId} isAddtoCart={false} />
    </div>
  );
}
function LaunchCalendar1({ productList, brand, month }) {
  const [products, setProducts] = useState(productList);

  const [isEmpty, setIsEmpty] = useState(false);
  useEffect(() => {
    let temp = true;
    products.map((month) => {
      month.content.map((item) => {
        if (!brand || brand == item.brand) {
          temp = false;
        }
      });
      setIsEmpty(temp);
    });
  }, [brand]);

  const [filterData, setFilterData] = useState();
  const allOrdersEmpty = filterData?.every((item) => item.content.length <= 0);
  useEffect(() => {
    if (!month) {
      setFilterData(products);
    }
    const newValues = products?.map((months) => {
      const filterData = months.content?.filter((item) => {
        // let match = item.OCDDate.split("/")
        // console.log(match)
        if (month) {
          if (brand) {
            if (brand == item.brand) {
              return item.date.toLowerCase().includes(month.toLowerCase());
            }
          } else {
            return item.date.toLowerCase().includes(month.toLowerCase());
          }
          // return match.includes(month.toUpperCase() )
        } else {
          if (brand) {
            if (brand == item.brand) {
              return true;
            }
          } else {
            return true;
          }
          // If month is not provided, return all items
        }
      });
      // Create a new object with filtered content
      return { ...months, content: filterData };
    });
    setFilterData(newValues);
  }, [month, brand]);

  console.log({ filterData });

  //   if(!ShipDate){
  // setFilterData(products)
  //   }
  //   const newValues = products?.map((Date) => {
  //     const filterData = Date.content?.filter((item) => {
  //       // let match = item.OCDDate.split("/")
  //       // console.log(match)
  //       if (ShipDate) {
  //         // return match.includes(month.toUpperCase() )
  //         return item.date.toLowerCase().includes(ShipDate.toLowerCase() )
  //       } else {
  //         // If month is not provided, return all items
  //         return true;
  //       }
  //     });
  //     // Create a new object with filtered content
  //     return { ...Date, content: filterData };
  //   });
  //  console.log(newValues);
  //   setFilterData(newValues);
  // }, [ShipDate]);

  return (
    <div id="Calendar">
      <div className="container">
        <h1 className="TopHeading">Marketing Calendar</h1>
        <div className="row">
          <div className="col-xl-9 col-lg-9 col-md-12 col-sm-12 ">
            <ul className="timeline mt-4 mr-4" id="CalenerContainer">
              {allOrdersEmpty ? (
                <div className="NodataContent">No data found</div>
              ) :
                filterData?.map((month, index) => {
                  if (month.content.length) {
                    return (
                      <li key={index}>
                        <span className={`timelineHolder0${(index % 3) + 1}`}>{month.month}</span>
                        {month.content.map((product, productIndex) => {
                          if (!brand || brand == product.brand || brand == product.ManufacturerName__c) {
                            return (
                              <>
                                <div className="timeline-content" key={productIndex}>
                                  <div className="ProductInfo">
                                    <div className="BothDateTopFlex">
                                      <div className="ShipDate">
                                        <span>Ship Date</span>
                                        <div className={`DateCurrent0${(index % 3) + 1}`}>{product.date}</div>
                                      </div>
                                      <div className="ShipDate EDate">
                                        <span>OCD</span>
                                        <div className="DateEod">{product.OCDDate}</div>
                                      </div>
                                    </div>
                                    <div className="d-flex mt-2">
                                      <div className="m-auto ProductImg">
                                        <img src={product.image} alt={product.name} />
                                      </div>
                                      <div className="LaunchProductDetail">
                                        <h3>{product.name}</h3>
                                        <div className="size">
                                          Size <span className="ProductQty">{product.size}</span>
                                        </div>
                                        <p>{product.description}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="launchBrand">
                                    <img className="img-fluid" src={product.brandLogo} alt={`${product.name} logo`} />
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
              }
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
    </div>
  );
}
export default LaunchCalendar;

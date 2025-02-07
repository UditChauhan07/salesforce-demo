import { useState } from "react";
import styles from "../styles.module.css";
import Accordion from "react-bootstrap/Accordion";
import CollapsibleRow from "../../CollapsibleRow";
import classNames from "classnames";

function FilterPage({ data, formattedData, setCategoryFilters, categoryFilters, productTypeFilter, setProductTypeFilter, setSortBy, sortBy }) {
  const [activeIndex1, setActiveIndex1] = useState(0);
  // console.log(productTypeFilter);
  const onTitleClick1 = (index) => {
    setActiveIndex1(index === activeIndex1 ? null : index);
  };

  const [showCat, setShowCat] = useState(true);

  return (
    <div>
      <div className={styles.BrandLeft}>
        <h2>
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="17" viewBox="0 0 19 17" fill="none">
            <path
              d="M8.46138 16.9962V9.61826C8.46138 9.48892 8.57073 9.38409 8.70564 9.38409H10.7875C10.9224 9.38409 11.0318 9.48876 11.0318 9.61826V17C15.3985 16.3966 18.6599 12.8092 18.6599 8.54682C18.6599 3.83426 14.6624 0 9.74887 0C4.8331 0 0.833496 3.83422 0.833496 8.54682C0.833496 12.8071 4.09409 16.3926 8.4616 16.9962H8.46138ZM9.74659 3.76445C10.7751 3.76445 11.6118 4.56671 11.6118 5.5527C11.6118 6.53868 10.7751 7.34078 9.74659 7.34078C8.71813 7.34078 7.88141 6.53881 7.88141 5.55282C7.88141 4.56667 8.71813 3.76441 9.74659 3.76441V3.76445Z"
              fill="white"
            />
          </svg>
          Minimum order Amount: ${data?.discount?.MinOrderAmount || 0}
        </h2>

        {data?.discount?.applyDiscount ? <h2>
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="17" viewBox="0 0 19 17" fill="none">
            <path
              d="M8.46138 16.9962V9.61826C8.46138 9.48892 8.57073 9.38409 8.70564 9.38409H10.7875C10.9224 9.38409 11.0318 9.48876 11.0318 9.61826V17C15.3985 16.3966 18.6599 12.8092 18.6599 8.54682C18.6599 3.83426 14.6624 0 9.74887 0C4.8331 0 0.833496 3.83422 0.833496 8.54682C0.833496 12.8071 4.09409 16.3926 8.4616 16.9962H8.46138ZM9.74659 3.76445C10.7751 3.76445 11.6118 4.56671 11.6118 5.5527C11.6118 6.53868 10.7751 7.34078 9.74659 7.34078C8.71813 7.34078 7.88141 6.53881 7.88141 5.55282C7.88141 4.56667 8.71813 3.76441 9.74659 3.76441V3.76445Z"
              fill="white"
            />
          </svg>
          Discount Offer: {data?.discount?.margin || 0}%
        </h2> : null}
        {productTypeFilter == "Wholesale" ?
          <div className="mt-4">
            <div className="pt-1 pb-1">
              <input type="radio" name="catType" checked={productTypeFilter == "Wholesale" ? categoryFilters?.length == 0 ? true : false : false} onClick={(e) => { setCategoryFilters([]) }} id="catType1" /><label for="catType1" className="ml-2 text-uppercase cursor-pointer">All</label>
            </div>
            <div className="pt-1 pb-1">
              <input type="radio" name="catType" checked={productTypeFilter == "Wholesale" ? categoryFilters?.includes("Samples") ? true : false : false} onClick={(e) => { setCategoryFilters(["Samples"]) }} id="catType2" /><label for="catType2" className="ml-2 text-uppercase cursor-pointer">Samples</label>
            </div>
            <div className="pt-1 pb-1">
              <input type="radio" name="catType" checked={productTypeFilter == "Wholesale" ? categoryFilters?.includes("TESTER") ? true : false : false} onClick={(e) => { setCategoryFilters(["TESTER"]) }} id="catType3" /><label for="catType3" className="ml-2 text-uppercase cursor-pointer">Testers</label>
            </div>
          </div> : null}
        {/* dropDown */}


        <div className={styles.Lastfilter}>
          <div className={styles.AcciIten} eventKey="cat">
            <div className={`${styles.HeaderAccor} d-flex justify-content-between`} style={{
              fontFamily: 'inherit', fontSize: 'inherit',
              lineHeight: 'inherit', fontWeight: 'inherit'
            }} onClick={() => { setShowCat(!showCat) }}>Category <svg
              xmlns="http://www.w3.org/2000/svg"
              width="29"
              height="28"
              viewBox="0 0 29 28"
              fill="none"
              className={classNames("ml-4", {
                "rotate-180": showCat,
              })}
            >
                <path d="M7.71484 10.8534L14.8098 17.7119L21.9048 10.8534" stroke="#403A35" strokeWidth={"2"} />
              </svg></div>
            <div className={` overflow-x-auto ${styles.bodyAccor}`} style={{ height: "44vh" }}>
              {showCat ? categoryFilters?.includes("Samples") || categoryFilters?.includes("TESTER") ? <>
                <div className={`${styles.title} ${styles.borderRad} text-uppercase text-[11px]`}> No Category</div>
              </> : <>

                {Object.keys(formattedData)
                  // ?.filter((category) => category !== "PREORDER")
                  ?.filter((category) => {
                    if (productTypeFilter === 'Pre-order') {
                      // Return only categories that include 'PREORDER'
                      return category.includes('EVENT') || category.includes('PREORDER');
                      // } else if (productTypeFilter === 'TESTER') {
                      //   // Return only categories that include 'TESTER'
                      //   return category.includes('TESTER');
                      // }
                      // else if (productTypeFilter === 'Samples') {
                      //   // Return only categories that include 'EVENT'
                      //   return category.includes('Samples');
                    }
                    else if (productTypeFilter === 'Wholesale') {
                      // Remove categories that include 'PREORDER', 'TESTER', or 'EVENT'
                      if (!category.includes('PREORDER') && !category.includes('EVENT') && !category.includes('Samples') && !category.includes('TESTER')) {
                        return true;
                      }
                    }
                  })
                  ?.map((key, index) => (
                    <div className={styles.accordion} key={index}>
                      <div className={styles.Content}>
                        <div className={styles.accordion}>
                          <div className={`${styles.title} ${styles.borderRad} `} onClick={() => onTitleClick1(0)}>
                            <input
                              type="checkbox"
                              checked={categoryFilters?.includes(key)}
                              readOnly
                              value={key}
                              onChange={(e) => {
                                console.log({ key });

                                setCategoryFilters((prev) => {
                                  let newFilters = [...prev];
                                  if (e.target.checked) {
                                    newFilters.push(key);
                                  } else {
                                    newFilters = newFilters?.filter((val) => val !== key);
                                  }
                                  return newFilters;
                                });
                              }}
                              id={`category-${key}`}
                            />
                            <label htmlFor={`category-${key}`} style={{ width: '84%', wordWrap: 'break-word' }} className="text-uppercase">{key != "null" ? key : "No Category"}</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterPage;

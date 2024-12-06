import React, { useState, useEffect, useRef } from "react";
import Loading from "../../components/Loading";

const DynamicTable = ({ mainData=[], itemsPerPage = 100, children, head = null, foot = null, ...props }) => {
  const [items, setItems] = useState([]);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(1);

  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);
  function fetchMoreItems() {

    let newItems = mainData.slice((currentIndex - 1) * itemsPerPage, currentIndex * itemsPerPage);


    setItems(pre => [...pre, ...newItems]);
    if (mainData.length == 0) {
      setHasMoreData(false);
    } else {
      if((currentIndex * itemsPerPage)>mainData.length){
        setHasMoreData(false);
      }
      setCurrentIndex(pre => pre + 1);
    }
  }
  function onIntersecton(entries) {
    const firstEntry = entries[0];
    if (firstEntry.isIntersecting && hasMoreData) {
      fetchMoreItems();
    }
  }

  useEffect(()=>{
    setItems([]);
    setCurrentIndex(1);
    setHasMoreData(mainData.length > 0);
  },[mainData]);

  useEffect(() => {
    const observer = new IntersectionObserver(onIntersecton);
    if (observer && loaderRef.current) {

      observer.observe(loaderRef.current);
    }
    return () => {
      if (observer && observer) {
        observer.disconnect();
      }
    }
  }, [items])
;
  
  

  return (
    <div style={{ height: "75vh", overflowY: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse",position:'relative',height:'98%' }} {...props}>
        {head ? head : null}
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              {children(item)}
            </tr>
          ))
          }
          {(hasMoreData) && (
            <tr ref={loaderRef}>
              <td colSpan={100}><Loading /></td>
            </tr>
          )}
          {!hasMoreData && items.length > 0 && (
            <tr>
              <td colSpan={100} className="text-center" style={{height:'20px'}}>No more data to load.</td>
            </tr>
          )}
        </tbody>
        {foot ? foot : null}
      </table>
    </div>
  );
};

export default DynamicTable;

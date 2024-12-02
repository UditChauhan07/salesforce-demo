import React, { useState, useEffect, useRef } from "react";
import Loading from "../../components/Loading";

const DynamicTableBody = ({ mainData, itemsPerPage = 10, children, head = null, ...props }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true); // Flag to check if more data is available
  const loaderRef = useRef(null);

  useEffect(() => {
    loadMoreItems();
  }, [mainData]);

  const loadMoreItems = () => {
    if (loading || !hasMoreData) return; // Prevent loading if already loading or no more data

    setLoading(true);
    const nextItems = mainData.slice(currentIndex, currentIndex + itemsPerPage);
    setItems((prevItems) => [...prevItems, ...nextItems]);
    
    // Update the current index and check if there are more items
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + itemsPerPage;
      setHasMoreData(newIndex < mainData.length); // Update the flag
      return newIndex;
    });
    
    setLoading(false);
  };

  const handleScroll = () => {
    if (loaderRef.current) {
      const { scrollTop, clientHeight, scrollHeight } = loaderRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10 && !loading && hasMoreData) {
        loadMoreItems();
      }
    }
  };

  useEffect(() => {
    const currentLoader = loaderRef.current;
    if (currentLoader) {
      currentLoader.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (currentLoader) {
        currentLoader.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading, hasMoreData]); // Add hasMoreData to dependencies

  return (
    <div style={{ maxHeight: "400px", overflowY: "auto" }} ref={loaderRef}>
      <table style={{ width: "100%", borderCollapse: "collapse" }} {...props}>
        {head && <thead>{head}</thead>}
        <tbody>
          {items.length === 0 && currentIndex === 0 ? (
            <tr>
              <td colSpan={100}>
                <div className="table_NodataText__l-5kN flex justify-center items-center py-4 w-full lg:min-h-[300px] xl:min-h-[380px]">
                  <p>No data found</p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={index}>
                {children(item)}
              </tr>
            ))
          )}
          {loading && (
            <tr>
              <td colSpan={100}><Loading /></td>
            </tr>
          )}
          {!hasMoreData && items.length > 0 && (
            <tr>
              <td colSpan={100}>No more data to load.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTableBody;
import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MyRetailerCard from "./MyRetailerCard";
import Loading from "../Loading";

const MyRetailers = ({ pageData, filterBy, sortBy, searchBy, isLoading,selectedSalesRepId }) => {
  const navigate = useNavigate();
  // console.log("pageData",pageData);
  useEffect(() => {
    const userData = localStorage.getItem("Name");
    if (!userData) {
      navigate("/");
    }
  }, []);
  const filteredPageData = useMemo(() => {
    let newValues = pageData?.filter((data) => (filterBy ? data.data?.some((d) => d.ManufacturerId__c === filterBy.Id) : true));

    if (searchBy) {
      newValues = newValues?.filter((value) => value.Name?.toLowerCase().includes(searchBy?.toLowerCase()));
    }

    if (sortBy) {
      if (sortBy === "a-z") {
        newValues = newValues?.sort((a, b) => a.Name?.localeCompare(b.Name));
      } else if (sortBy === "z-a") {
        newValues = newValues?.sort((a, b) => b.Name?.localeCompare(a.Name));
      }
    }
    return newValues;
  }, [pageData, filterBy, sortBy, searchBy]);

  return (
    <>
      <div className="lg:min-h-[300px] xl:min-h-[380px]">
        {filteredPageData?.length ? (
          <section>
            <div className="grid px-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPageData?.map((data) => {
                return <MyRetailerCard key={data.Name} accountId={data.Id} placeName={data.City} title={data.Name} brands={data?.data} address={data.ShippingAddress} selectedSalesRepId={selectedSalesRepId}/>;
              })}
            </div>
          </section>
        ) : null}
        {!filteredPageData?.length && !isLoading && <div className="flex justify-center items-center py-4 w-full lg:min-h-[300px] xl:min-h-[380px]">No data found</div>}
        {isLoading ? <div className="flex justify-center items-center py-4 w-full lg:min-h-[300px] xl:min-h-[380px]"><Loading height={"40vh"} /></div> : null}
      </div>
    </>
  );
};

export default MyRetailers;

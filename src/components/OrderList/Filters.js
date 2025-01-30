import React, { useEffect, useState } from "react";
import { FilterItem } from "../FilterItem";
import { useManufacturer } from "../../api/useManufacturer";
import FilterSearch from "../FilterSearch";
import { CloseButton } from "../../lib/svg";
import dataStore from "../../lib/dataStore";

const Filters = ({ value, onChange, resetFilter,monthHide=true }) => {
  const { data: manufacturers } = useManufacturer();
  const [manufacturerList,setManufacturerList] = useState([]);
  useEffect(()=>{
    dataStore.subscribe("/brands",(data)=>setManufacturerList(data));
    if(manufacturers?.data?.length){
      dataStore.updateData("/brands",manufacturers.data);
      setManufacturerList(manufacturers.data)
    }
    return ()=>dataStore.unsubscribe("/brands",(data)=>setManufacturerList(data));
  },[manufacturers?.data])
  const handleMonthFilter = (v) => onChange("month", v);
  const handleManufacturerFilter = (v) => onChange("manufacturer", v);
  const handleSearchFilter = (v) => onChange("search", v);

  return (
    <>
      {monthHide&&<FilterItem
        label= "Last 6 Months"
        name="Last 6 Months"
        monthHide={false}
        value={value.month}
        options={[
          {
          
            label: "Current Year",
            value: `${new Date().getFullYear()}`,
          },
          {
            label: "Last 6 Months",
            value: "last-6-months",
          },
          {
            label: `Previous Year`,
            value: `${new Date().getFullYear() - 1}`,
          },
        ]}
        onChange={handleMonthFilter}
      />}
      <FilterItem
        label="MANUFACTURER"
        name="MANUFACTURER"
          minWidth="220px"
        value={value.manufacturer}
        options={
          Array.isArray(manufacturerList)
            ? manufacturerList?.map((manufacturer) => ({
                label: manufacturer.Name,
                value: manufacturer.Id,
              }))
            : []
        }
        onChange={handleManufacturerFilter}
      />
      <FilterSearch
        onChange={(e) => handleSearchFilter(e.target.value)}
        value={value.search}
        placeholder="Search By Account"
        minWidth="167px"
      />
      <button
        className="border px-2 py-1 leading-tight d-grid"
        onClick={resetFilter}
      >
        <CloseButton crossFill={'#fff'} height={20} width={20} />
        <small style={{ fontSize: '6px',letterSpacing: '0.5px',textTransform:'uppercase'}}>clear</small>
      </button>
    </>
  );
};

export default Filters;

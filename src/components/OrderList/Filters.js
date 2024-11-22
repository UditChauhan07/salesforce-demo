import React from "react";
import { FilterItem } from "../FilterItem";
import { useManufacturer } from "../../api/useManufacturer";
import FilterSearch from "../FilterSearch";
import { CloseButton } from "../../lib/svg";

const Filters = ({ value, onChange, resetFilter,monthHide=true }) => {
  const { data: manufacturerData } = useManufacturer();
  const handleMonthFilter = (v) => onChange("month", v);
  const handleManufacturerFilter = (v) => onChange("manufacturer", v);
  const handleSearchFilter = (v) => onChange("search", v);

  return (
    <>
      {monthHide&&<FilterItem
        label="Months"
        name="Months"
        monthHide={false}
        value={value.month}
        options={[
          {
            label: "Last 6 Months",
            value: "last-6-months",
          },
          {
            label: "Current Year",
            value: `${new Date().getFullYear()}`,
          },
          {
            label: `${new Date().getFullYear() - 1}`,
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
          Array.isArray(manufacturerData?.data)
            ? manufacturerData?.data?.map((manufacturer) => ({
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

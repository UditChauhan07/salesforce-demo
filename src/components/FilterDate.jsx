import React, { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalenderIcon } from "../lib/svg";
const FilterDate = ({ label, onChange, value, minWidth }) => {
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <button onClick={onClick} ref={ref}>
      {label} {value}
      <CalenderIcon />
    </button>
  ));
  return (
    <div className="flex">
      {/* <label htmlFor={label}>{label}</label>
      <input
        type="date"
        className="bg-black placeholder:text-white focus:outline-none leading-tight placeholder:font-[Montserrat-500] font-[Montserrat-500] placeholder:tracking-[1.2px] outline-none tracking-[1.2px] appearance-auto dark:text-white flex justify-center items-center ms-1"
        onChange={onChange}
        style={{ width: minWidth || "100px", colorScheme: "dark" }}
        id={label}
        defaultValue={value}
        value={value}
      /> */}
      <DatePicker selected={new Date(value)} onChange={onChange} dateFormat="MMM/dd/yyyy" customInput={<ExampleCustomInput />} />
    </div>
  );
};

export default FilterDate;

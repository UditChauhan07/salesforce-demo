import React from "react";
const FilterSearch = ({ onChange, value, placeholder, minWidth,name="input1" }) => {
  return (
    <div className="flex align-self-center">
      <input
        placeholder={placeholder}
        className="bg-transparent placeholder:uppercase placeholder:text-white placeholder:underline placeholder:underline-offset-2 focus:outline-none leading-tight placeholder:font-[Montserrat-500] font-[Montserrat-500] placeholder:tracking-[1.2px]"
        onChange={onChange}
        name={name}
        value={value}
        style={{ width: minWidth || "120px" }}
      />
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="8.24951" cy="8.25" r="4.5" stroke="white" />
        <path
          d="M10.4995 8.25C10.4995 7.95453 10.4413 7.66194 10.3282 7.38896C10.2152 7.11598 10.0494 6.86794 9.8405 6.65901C9.63157 6.45008 9.38353 6.28434 9.11055 6.17127C8.83757 6.0582 8.54499 6 8.24951 6"
          stroke="white"
          stroke-linecap="round"
        />
        <path d="M14.9995 15L12.7495 12.75" stroke="white" stroke-linecap="round" />
      </svg>
    </div>
  );
};

export default FilterSearch;

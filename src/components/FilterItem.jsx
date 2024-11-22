import React, { useEffect, useState } from "react";
import Page from "../pages/page.module.css";

export const FilterItem = ({ label, options, onChange, minWidth, value, name = 'drop-down1', containNullValue = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const onMouseEnter = () => {
      setIsOpen(true)
    };

    const onMouseLeave = () => {
      setIsOpen(false)
    };
    document.getElementById(name)?.addEventListener("mouseenter", onMouseEnter);
    document.getElementById(name)?.addEventListener("mouseleave", onMouseLeave);
  }, [])
  return (
    <div className={`relative filterItem ${Page.FilterNoneClass} d-flex align-self-center`} style={{ position: 'relative' }} id={name}>
      <div
        className="flex justify-center items-center gap-1 leading-tight cursor-pointer select-none"
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
      >
        {value || containNullValue ? options?.find((option) => option.value === value)?.label : label}
        <img src={"/assets/images/downArrowWhite.svg"} style={isOpen ? { transform: 'rotate(35deg)', transition: 'all 750ms ease-out' } : { transition: 'all 300ms ease-out' }} alt="img" />
      </div>
      {isOpen ? (
        <div className="absolute" style={{ minWidth: minWidth || "120px", maxHeight: "450px", top: "5px" }}>
          <div className={Page.upArrow}></div>
          <ul
            className="bg-white z-10 rounded-[5px] shadow-sm text-black absolute py-2 pr-2 flex flex-col list-disc"
            style={{maxHeight:'350px',overflowY:'scroll'}}
          >
            {options?.map((option, index) => (
              <li
                key={index}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`cursor-pointer hover:bg-[#eeeeef] p-1 hover:rounded-lg ${option.value === value ? `bg-[lightgrey] rounded` : null}`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

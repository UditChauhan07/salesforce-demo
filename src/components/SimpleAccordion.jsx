import { useState } from "react";
import classNames from "classnames";

const SimpleAccordion = ({ children, title, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <input
        id="expandCollapse"
        checked={open}
        type="checkbox"
        className="peer sr-only"
      />
      <label
        htmlFor="expandCollapse"
        className={classNames(
          "h-[56px] top-0 left-0 bg-[#f8fafb] border border-solid border-[#f7f7f7] w-full",
          "[font-family:'Montserrat-500'] font-medium text-[#1d1d1d] text-[20px] tracking-[2.00px] leading-[normal] whitespace-nowrap uppercase flex items-center px-[23px] justify-between"
        )}
        onClick={() => {
          onChange?.(!open);
          setOpen((prev) => !prev);
        }}
      >
        {title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="29"
          height="28"
          viewBox="0 0 29 28"
          fill="none"
          className={classNames("ml-4", {
            "rotate-180": open,
          })}
        >
          <path
            d="M21.2847 17.1456L14.1897 10.2871L7.09467 17.1456"
            stroke="#403A35"
            strokeWidth="2"
          />
        </svg>
      </label>
      <div
        className={classNames(
          "overflow-hidden h-0 bg-white",
          "peer-checked:h-full"
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default SimpleAccordion;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import Styles from "./style.module.css";
import { CloseButton } from "../../../lib/svg";

const SelectBrandModel = ({ brands, onClose = null, onChange = null }) => {
  const [selectedBrand, setSelectedBrand] = useState(null); // State to store selected brand
  const navigate = useNavigate(); // Initialize navigate function

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand); // Set selected brand when a brand is chosen
    if (onChange) { onChange(brand) }
   
  };

  return (
    <>
      <div className="px-[10px] pb-[10px] pt-[10px] max-w-[900px]">
        <section>
          <div className="d-flex align-items-center justify-content-between gap-5 mb-4">
            <h1 className="font-[Montserrat-500] text-[22px] tracking-[2.20px] text-center">
              Choose the Manufacturer
            </h1>
            <button type="button" onClick={onClose}>
              <CloseButton />
            </button>
          </div>

          <div className={Styles.BrandInRadio}>
            <div className={Styles.ModalResponsive}>
              {brands?.map((brand, index) => (
                <div className={Styles.BrandName} key={index}>
                  <input
                    type="radio"
                    name="brand_names"
                    onChange={() => handleBrandChange(brand)} // Change brand and navigate
                    id={brand.ManufacturerName__c || brand.Name}
                    checked={selectedBrand === brand} // Mark the selected brand as checked
                  />
                  <label
                    htmlFor={brand.ManufacturerName__c || brand.Name}
                    onClick={() => handleBrandChange(brand)} // Handle click on label to navigate
                  >
                    {brand.ManufacturerName__c || brand.Name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SelectBrandModel;

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Page from "../pages/page.module.css";
import { ArrowRightInBrands } from "../lib/svg";
import ImageHandler from "./loader/ImageHandler";
const BrandCard = ({ brand, image, createOrder }) => {
  const navigate = useNavigate();
  return (
    <div className={`w-full last:mb-0 mb-4 ${Page.HoverArrow} cardHover`}>
      <div className={`border-b-[0.5px] border-[#D0CFCF] flex flex-col gap-4 h-full  ${Page.ImgHover1}`}>
        {image ? (
          <Link to={'/Brand/' + brand.Id}>
            <div className={`border-[0.5px] d-grid place-content-center  relative  border-[#D0CFCF] m-auto ${Page.ImgHover}`}>
              <ImageHandler image={{ src: image ? `/assets/images/${image}` : "dummy.png" }} className={"object-scale-down max-h-[200px] h-full w-full"} />
            </div>
          </Link>
        ) : null}

        <div
          className="flex justify-between items-start h-full px-[10px]"
          onClick={() => {
            if (brand?.Accounds) navigate(`/my-retailers?manufacturerId=${brand.Id}`);
          }}
        >
          <div className="flex flex-col justify-between h-full">
            <div className="font-medium text-black text-[20px] tracking-[1.12px] leading-[20px] [font-family:'Arial-500'] text-ellipsis overflow-hidden whitespace-nowrap" style={{ whiteSpace: 'pre-wrap' }}>{brand.Name}</div>

            <button
              className="flex items-center gap-2"
            // onClick={() => {
            //   if (brand?.Accounds) navigate(`/my-retailers?manufacturerId=${brand.Id}`);
            // }}
            >{createOrder ?
              <><div className="[font-family:'Montserrat-400'] font-normal text-black text-[12px] tracking-[0] leading-[32px] whitespace-nowrap">SHOW RETAILERS</div>
                {/* <img src={"/assets/images/ArrowRight.svg"} alt="img" /> */}
                <ArrowRightInBrands /></> : <p>&nbsp;</p>}
            </button>
          </div>
          <div className="bg-black rounded-full w-[40px] h-[40px] flex justify-center items-center">
            <div className="font-medium text-white text-[20px] whitespace-nowrap h-[40px] w-[40px] flex justify-center items-center" >{brand?.Accounds}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandCard;

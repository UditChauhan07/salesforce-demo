import React, { useState } from "react";
import Styles from "./Styles.module.css";
import SelectBrandModel from "./SelectBrandModel/SelectBrandModel";
import { useNavigate } from "react-router-dom";
import ModalPage from "../Modal UI";
import { Link } from "react-router-dom";
import { salesRepIdKey } from "../../lib/store";

const bgColors = {
  "Kevyn Aucoin Cosmetics": "KevynAucoinCosmeticsBg",
  "Bumble and Bumble": "BumbleandBumbleBg",
  "BY TERRY": "BYTERRYBg",
  "Bobbi Brown": "BobbiBrownBg",
  "ReVive": "ReViveBg",
  "Maison Margiela": "MaisonMargielaBg",
  "Smashbox": "SmashboxBg",
  "RMS Beauty": "RMSBeautyBg",
  "ESTEE LAUDER": "esteeLauderBg",
};

const MyRetailerCard = ({ placeName, title, brands, accountId, address,selectedSalesRepId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const showProductHandler=(brand)=>{
    localStorage.setItem("manufacturer", brand.ManufacturerName__c?? brand.Name);
    localStorage.setItem("ManufacturerId__c", brand.ManufacturerId__c??  brand.Id);
    localStorage.setItem(salesRepIdKey, selectedSalesRepId);
    localStorage.setItem("shippingMethod", JSON.stringify({number:brand.Shipping_Account_Number__c,method:brand.Shipping_Method__c}));
    navigate(`/product`);
  }
  return (
    <>
      <ModalPage open={modalOpen} onClose={() => setModalOpen(false)} content={<SelectBrandModel brands={brands} onChange={showProductHandler} onClose={() => setModalOpen(false)} />} />
      <div
        className={`${Styles.Retailer} cursor-pointer flex`}
      >
        <div className={`${Styles.mainRetailer} flex flex-col justify-between cardHover`}>
          <Link to={'/store/'+accountId} style={{color:'#000'}}><h2 className="leading-normal">{title}</h2></Link>
          <div>
            <div>
              <div className={Styles.RetailerImg}>
                {/* <img
                  className="position-absolute w-100"
                  src={require("./Image/MapLocation.png")}
                  alt="img"
                  style={{
                    zIndex: 0,
                  }}
                /> */}
                <Link style={{color:'#000',zIndex: 1}} className="d-flex ps-2 gap-2">
                  <img className={Styles.ControlerImg} src={"/assets/images/LocationPin.svg"} alt="img" />
                  <p
                    className="w-100 mb-0"
                    style={{
                      fontFamily: "Arial",
                      fontWeight: 500,
                      fontSize: "14px",
                      color: "black",
                    }}
                  >
                    {placeName || "No Location"}
                  </p>
                </Link>
              </div>
            </div>
            <div className={Styles.BrandName}>
              <div className={Styles.Brandspan}>
                {brands?.map((brand, index) => {
                  return (
                    <span className={`${Styles[bgColors[brand.ManufacturerName__c]]}`}         onClick={() => {
                      setModalOpen(true);
                      localStorage.setItem("Account", title);
                      localStorage.setItem("AccountId__c", accountId);
                      localStorage.setItem("address", JSON.stringify(address));
                    }} style={{ height: "fit-content" }} key={index}>
                      {brand.ManufacturerName__c}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </>
  );
};

export default MyRetailerCard;

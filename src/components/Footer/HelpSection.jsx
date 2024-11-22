import React from "react";
import footerStyle from "./index.module.css";
import topNavStyle from "../All Headers/topNav/index.module.css";
import { Link } from "react-router-dom";
const HelpSection = () => {
  return (
    <div className="mt-3 d-none-print">
      <div style={{ backgroundColor: "#F3E8E0" }}>
        <div className="  justify-content-center  align-items-center ">
          <div className={footerStyle.ControlHelp}>
            <p className={`m-0  ${footerStyle.textLarge}`}>Help us Improve</p>
            <p className={`m-0 ${topNavStyle.language}`}>Take a brief survey about today's visit</p>
            <p className={`m-0  ${topNavStyle.language} ${footerStyle.underline}`}>Begin Survey</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSection;
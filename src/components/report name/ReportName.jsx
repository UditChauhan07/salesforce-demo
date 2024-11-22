import React from "react";
import styles from "./report.module.css";
const ReportName = ({name}) => {
  return (
    <div className="d-flex align-items-center justify-content-start gap-2 my-4">
      <img src={"/assets/images/backArrow.svg"} alt="img" />
      <p className={`m-0 ${styles.reportNameText}`}>{name}</p>
    </div>
  );
};

export default ReportName;

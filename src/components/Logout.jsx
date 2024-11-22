import React, { useEffect } from "react";
import AppLayout from "./AppLayout";
import Loading from "./Loading";

const Logout = () => {
  useEffect(() => {
    // Remove specific items
    localStorage.removeItem("Name");
    localStorage.removeItem("Api Data");
    localStorage.removeItem("response");
    localStorage.removeItem("manufacturer");
    localStorage.removeItem("AccountId__c");
    localStorage.removeItem("ManufacturerId__c");
    localStorage.removeItem("Account");
    localStorage.removeItem("address");

    // Remove all other items except "passwordB2B" and "emailB2B"
    Object.keys(localStorage).forEach((key) => {
        if (key !== "passwordB2B" && key !== "emailB2B") {
            localStorage.removeItem(key);
        }
    });
    let data = localStorage.getItem("lCpFhWZtGKKejSX");
    if (data) {
      localStorage.removeItem("lCpFhWZtGKKejSX");
    }

    // Navigate to the homepage after clearing localStorage
    window.location.href = "/";
}, []);
  return <AppLayout><Loading height={'50vh'}/></AppLayout>;
};

export default Logout;

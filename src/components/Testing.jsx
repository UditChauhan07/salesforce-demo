import React from "react";
import TopNav from "./All Headers/topNav/TopNav";
import LogoHeader from "./All Headers/logoHeader/LogoHeader";
import Header from "./All Headers/header/Header";
import HelpSection from "./Footer/HelpSection";
import Footer from "./Footer/Footer";
import MobileHeader from "./All Headers/mobileHeader/MobileHeader";
import ModalPage from "./Modal UI";

const Testing = () => {
  return (
    <div className="container-fluid">
      <div className="row d-flex flex-column justify-content-around align-items-center">
        <div className="col-10">
          <TopNav />
        </div>
        <hr className="hrBgColor"></hr>
        <div className="col-12">
          <MobileHeader />
        </div>
        <div className="col-10">
          <LogoHeader />
          <Header />
          <div className="m-5 p-5"></div>
        </div>
        <div className="col-10">
        {/* <ModalPage open={true} content={"Enter Valid Credentials"} />; */}

          <HelpSection />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Testing;

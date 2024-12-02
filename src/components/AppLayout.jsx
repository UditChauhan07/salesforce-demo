import React from "react";
import TopNav from "./All Headers/topNav/TopNav";
import LogoHeader from "./All Headers/logoHeader/LogoHeader";
import Header from "./All Headers/header/Header";
import MobileHeader from "./All Headers/mobileHeader/MobileHeader";
import Footer from "./Footer/Footer";
import { motion, AnimatePresence } from 'framer-motion';
const AppLayout = ({ children, filterNodes }) => {
  return (
    <div className="col-12">
      <div className="container p-0">
        <TopNav />
        <hr className="hrBgColor" />
        <div className="sticky-top">
          <LogoHeader />
          <Header />
          <MobileHeader />
          <div className="filter-container">{filterNodes}</div>
        </div>
        <main>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} // Custom ease-in curve
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;

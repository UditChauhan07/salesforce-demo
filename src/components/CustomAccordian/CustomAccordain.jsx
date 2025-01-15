import React from 'react';

import './style.css'; // Import your custom styles
import { CiLock } from "react-icons/ci";
import { CiUnlock } from "react-icons/ci";
import { IoMdKey } from "react-icons/io";
const CustomAccordion = ({ title, children, isOpen, onToggle, isModalOpen = false }) => {
    return (
        <>
            <div className="accordion-container">
                <div className="accordion-header">
                    <h2 className="text-black font-montserrat text-lg font-medium leading-8 tracking-[1.12px] uppercase font-normal">
                        {title}
                    </h2>
                    {isOpen ? (
                        <h3>  <CiLock />  </h3>

                    ) : (
                        <h3 className='key-lock'>   <CiUnlock /> </h3>

                    )}
                </div>
                {isOpen && <div className="accordion-content">{children}</div>}
            </div>

        </>
    );
};

export default CustomAccordion;

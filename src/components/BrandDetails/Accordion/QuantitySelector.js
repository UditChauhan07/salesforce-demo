import React, { useEffect, useState } from "react";
import Styles from "./Style.module.css";
import ModalPage from "../../Modal UI";

const padWithZero = (value) => {
  return String(value).padStart("2", "0");
};
// new functionality for min qty is added
const QuantitySelector = ({ onChange, value = 0, min = 0 }) => {
  const [qtyErrorModalOpen, setQtyErrorModalOpen] = useState(false);
  const [newQtyInput, setNewQtyInput] = useState(value);
  const [limitInput, setLimitInput] = useState("");
  useEffect(() => {
    if (value !== 0 && value < min) {
      onChange?.(min);
    }
  }, [value, min]);
  const qtyChangeHandler = ({ previous, newQty = 0 }) => {
    if (newQty) {
      if (newQty < min) {
        setNewQtyInput(null)
        setLimitInput('')
        setQtyErrorModalOpen(true)
      } else {
        if ((min>0 &&newQty % min == 0)||min==0) {
          onChange?.(newQty);
          setQtyErrorModalOpen(false)
        } else {
          setNewQtyInput(null)
          setLimitInput('')
          setQtyErrorModalOpen(true)
        }
      }
    } else {
      onChange?.(newQty);
      setQtyErrorModalOpen(false)
    }
  };
  const customHandler = (value) => {
    setNewQtyInput(parseInt(value))
  }
  const handleNameChange = (event) => {
    const limit = 4;
    setLimitInput(event.target.value.slice(0, limit));
  };
  console.log(limitInput);
  return (
    <div className={`${Styles.ButtonControl}w-[85px] h-[27px] flex `}>
      {qtyErrorModalOpen ? (
        <ModalPage
          open
          content={
            <div className="d-flex flex-column gap-3">
              <h2 className={`${Styles.warning} `}>Warning</h2>
              <p className={`${Styles.warningContent} `}>
              Please add quantities in multiples of three to proceed with adding products to your cart.
                <p className="mt-4">
                  <input type="number" className={`${Styles.customPriceInput} ms-1`} onKeyUp={(e) => customHandler(e.target.value || 0)} maxLength={5} max={5}
                    id="limit_input"
                    name="limit_input"
                    value={limitInput}
                    style={{ maxWidth: '100px', border: '1px solid rgb(204, 204, 204)', borderRadius: '5px', padding: '1px 5px' }}
                    onChange={handleNameChange} /><br />
                  {limitInput.length >= 4 && (
                    <span className="form-error text-danger ps-1 m-0 fs-10 w-100">This field can not contain more than 4 characters.</span>
                  )}
                  {newQtyInput % min != 0 && <p style={{ color: 'red', fontSize: '11px', textAlign: '' }}>* invalid</p>}
                </p>
              </p>
              <div className="d-flex justify-content-around ">
                <button style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '100px' }} onClick={() => { newQtyInput % min === 0 && qtyChangeHandler({ newQty: parseInt(newQtyInput || 0), previous: padWithZero(value) }) }}>
                  Submit
                </button>
                <button style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '100px' }} onClick={() => setQtyErrorModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          }
          onClose={() => {
            setQtyErrorModalOpen(false);
          }}
        />
      ) : null}
      <button
        onClick={() => {
          let newValue = value;
          if (newValue > min) {
            // newValue = newValue - 1;
            // new functionality
            if (min === 0) {
              newValue -= 1;
            }
            else {
              newValue -= min
            }
          } else {
            newValue = 0;
          }
          onChange?.(newValue);
        }}
        className="px-[8px] h-full bg-[#f8fafb] border border-solid border-black"
      >
        -
      </button>

      <input type="number" value={padWithZero(value)} className="w-[25px] text-center text-[12px] leading-tight appearance-none border-t-[1px] border-b-[1px] border-solid border-black" onChange={(e) => { (parseInt(e.target.value) >= 0 && parseInt(e.target.value) <= 1000) && qtyChangeHandler({ newQty: parseInt(e.target.value || 0), previous: padWithZero(value) }) }} />
      <button
        onClick={() => {
          // functionality for 1 addition
          // let newValue = value + 1;
          // onChange?.(newValue);
          // new functionality
          let newValue;
          if (min === 0) {
            newValue = value + 1;
          } else {
            newValue = value + min;
          }
          onChange?.(newValue);
        }}
        className="px-[8px] h-full bg-[#f8fafb] border border-solid border-black"
      >
        +
      </button>
    </div>
  );
};

export default QuantitySelector;

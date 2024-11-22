import React from "react";

const TextError = (props) => {
  return <div className="text-danger w-100 ps-1 form-error m-0 fs-6" style={{fontFamily:"Montserrat-500"}}>{props.children}</div>;
};

export default TextError;

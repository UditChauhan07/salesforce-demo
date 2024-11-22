import React from "react";

const Loading = ({height}) => {
  let minHeight=height??"100px"
  // console.log(minHeight);
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: `${minHeight}`  }}
    >
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default Loading;

import React, { useState,useEffect } from "react";
import "./styles.module.css";
import Style from"./index.module.css";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useMatchMedia } from "../Hooks/useMatchMedia";

const Slider = ({ data }) => {
  const [isDesktop] = useMatchMedia('(min-width: 520px)', true)
  const [windowWidth, setWindowWidth] = useState(false)
  useEffect(() => {
      setWindowWidth(window.innerWidth - 50)
  }, [windowWidth])
  const [style, setStyle] = useState({
    backgroundPosition: "0% 0%",
    position: "absolute",
    height: "500px",
    width: "500px",
    zIndex: 11,
    left: "40%",
    top: "15%",
  });

  const handleMouseMove = (image, event) => {
    const { left, top, width, height } = event.target.getBoundingClientRect();
    const x = ((event.pageX - left) / width) * 100;
    const y = ((event.pageY - top) / height) * 100;
    console.log({ backgroundPosition: `${x}% ${y}%` });
    setStyle({
      ...style,
      backgroundPosition: `${x}% ${y}%`,
      display: "block",
      backgroundImage: `url(${image})`,
    });
  };

  const handleMouveOut = (e) => {
    setStyle({ ...style, display: "none" });
  };
  return (
    <section onmouseout={handleMouveOut} style={isDesktop ? {maxWidth:'500px'}:{maxWidth:`${windowWidth}px`}}>
      {/* <div style={style}></div> */}
      <div className="carousel-wrapper">
        <Carousel
          infiniteLoop
          useKeyboardArrows
          autoPlay
          showArrows
          showIndicators={true}
          showStatus={false}
          // showThumbs={false}
        >
          {data?.length &&
            data.map((e,i) => {
              return (
                <div
                  key={i}
                  className={Style.carouselWrapperElement}
                >
                  {e.ContentDownloadUrl ?<img src={e.ContentDownloadUrl} alt={e.ContentDownloadUrl} height={500} width={'auto'}/>:<img src={e.src} alt={e.src} height={500} width={'auto'}/>}
                </div>
              );
            })}
        </Carousel>
      </div>
    </section>
  );
};
export default Slider;

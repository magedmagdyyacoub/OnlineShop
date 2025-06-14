import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React from "react";
import Slider from "react-slick";
import "../styles/carousel.css"; // Custom styles for the carousel

const Carousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll:1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <Slider {...settings}>
      <div><img src="/slide1.jpg" alt="Slide 1" /></div>
      <div><img src="/slide2.jpg" alt="Slide 2" /></div>
      <div><img src="/slide3.jpg" alt="Slide 3" /></div>
      <div><img src="/slide4.jpg" alt="Slide 4" /></div>
    </Slider>
  );
};

export default Carousel;

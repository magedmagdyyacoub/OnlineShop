// src/pages/Home.js
import React from 'react';
import Categories from '../components/Categories';
import Brands from '../components/Brands';
import Carousel from '../components/Carousel';
import Products from '../components/Products';

export default function Home() {
  return (
    <div>
      <Categories />
      <Brands />
      <Carousel />
      <Products />
    
    </div>
  );
}

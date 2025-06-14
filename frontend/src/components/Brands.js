import React, { useEffect, useState } from 'react';
import '../styles/brands.css';  // Create this CSS file for styles

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/brands')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => setBrands(data))
      .catch(err => {
        console.error('Failed to load brands.', err);
        setError('Failed to load brands.');
      });
  }, []);

  return (
    <div className="container">
      {error && <p className="error">{error}</p>}
      <div style={{ overflow: 'hidden' }}>
        <div className="brandsLine">
          {[...brands, ...brands].map((brand, i) => (
            <React.Fragment key={i}>
              <img
  src={`http://localhost:5000/uploads/brands/${brand.image_url.split('/').pop()}`}
  alt={brand.name}
  className="brandImage"
/>

              {/* Optional separator */}
              {i !== (brands.length * 2) - 1 && <span className="separator">|</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

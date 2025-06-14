import React, { useEffect, useState } from 'react';
import '../styles/category.css';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => setCategories(data))
      .catch(err => {
        console.error('Failed to load categories.', err);
        setError('Failed to load categories.');
      });
  }, []);

  return (
    <div className="container">
      {error && <p className="error">{error}</p>}
      {/* Wrapper to clip overflowing content */}
    <div style={{ overflow: 'hidden' }}>
  <div className="newsLine">
    {[...categories, ...categories].map((cat, i) => (
      <React.Fragment key={i}>
        <span className="categoryName">{cat.name}</span>
        {/* Add separator except after last item of the duplicated list */}
        {i !== (categories.length * 2) - 1 && <span className="separator">|</span>}
      </React.Fragment>
    ))}
  </div>
</div>

    </div>
  );
}

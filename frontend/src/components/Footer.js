import React from 'react';
import '../styles/Footer.css'; // Import your CSS file for styling
export default function Footer() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} OnlineShop. All rights reserved.</p>
    </footer>
  );
}

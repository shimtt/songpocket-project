import React from 'react';
import './CategoryCard.css';
import { Link } from 'react-router-dom'

const CategoryCard = ({ children, color, to }) => {
  return (
    <Link to={to} className="category-card-link">
      <div className="category-card" style={{ backgroundColor: color}}>
        {children}
      </div>
    </Link>
  );
};

export default CategoryCard;
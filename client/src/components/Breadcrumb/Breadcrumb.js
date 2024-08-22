import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumb.scss';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <nav className="breadcrumb">
      <ul>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          return (
            <li key={to}>
              <Link to={to}>{capitalize(value)}</Link>
              {index < pathnames.length - 1 && ' > '}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
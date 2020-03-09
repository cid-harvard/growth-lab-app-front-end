import React from 'react';
import { Link } from 'react-router-dom';
import { Routes } from '../../routing/routes';

const AlbaniaTool = () => {
  return (
    <>
      <h1>Landing Page</h1>
      <Link to={Routes.AlbaniaTool}>Albania Tool</Link>
    </>
  );
};

export default AlbaniaTool;
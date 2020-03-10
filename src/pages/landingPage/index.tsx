import React from 'react';
import { Link } from 'react-router-dom';
import { Routes } from '../../routing/routes';
import { Header, ContentFull} from '../../styling/Grid';

const AlbaniaTool = () => {
  return (
    <>
      <Header>
        <h1>Landing Page</h1>
      </Header>
      <ContentFull>
        <Link to={Routes.AlbaniaTool}>Albania Tool</Link>
      </ContentFull>
    </>
  );
};

export default AlbaniaTool;
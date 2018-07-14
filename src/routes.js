import React from 'react';
import { Route } from 'react-router';

import { BASE_PATH } from 'config';
import App from 'layout/App';
import MainLayout from 'layout/MainLayout';
import ErrorPage from 'pages/ErrorPage';
import Index from 'pages/Index';

export default (
  <Route path="" component={ App } layout={ MainLayout }>
    <Route
      path={ BASE_PATH }
      component={ Index }
      breadcrumbTitle="Intro"
    />
    <Route
      path={ `${BASE_PATH}index.html` }
      component={ Index }
      breadcrumbTitle="Intro"
    />
    <Route path={ `${BASE_PATH}404.html` } component={ ErrorPage } />
    <Route path="*" component={ ErrorPage } />
  </Route>
);

/* eslint-enable  */

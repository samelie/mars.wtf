import React from 'react';
import { Route, IndexRoute } from 'react-router';

import HomePage from '../containers/home-page/home-page';

export default function configureRoutes() {
  return (
    <Route path={`/mars.wtf/`} component={HomePage}>
      <IndexRoute component={HomePage}/>
    </Route>
  );
}

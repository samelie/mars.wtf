import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';
import createLogger from 'redux-logger';
import { routerMiddleware } from 'react-router-redux';
import { responsiveStoreEnhancer } from 'redux-responsive';
import promiseMiddleware from 'redux-promise-middleware';

// TODO check this is only imported for development


const USE_DEV_TOOLS =
  process.env.DEV

/* http://redux.js.org/docs/api/applyMiddleware.html */

export default function configureStore(options = {}) {
  const {
    initialState = {},
    browserHistory = {},
  } = options;

  const middlewares = [];

  middlewares.push(
    thunk,
    promiseMiddleware({
      promiseTypeSuffixes: ['START', 'SUCCESS', 'ERROR'],
    }),
    routerMiddleware(browserHistory)
  );

  if (USE_DEV_TOOLS) {
    middlewares.push(createLogger());
  }

  const createReduxStore = USE_DEV_TOOLS
    ? compose(responsiveStoreEnhancer, applyMiddleware(...middlewares), window.devToolsExtension())
    : compose(responsiveStoreEnhancer, applyMiddleware(...middlewares));

  const store = createReduxStore(createStore)(rootReducer, initialState);
  // Enable hot reload where available.
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers.
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}

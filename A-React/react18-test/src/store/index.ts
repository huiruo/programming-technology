import { createStore, combineReducers, applyMiddleware } from 'redux';
// import logger from 'redux-logger';
import thunk from 'redux-thunk';
import userStore from './user.store';
// import { composeWithDevTools } from 'redux-devtools-extension';

const reducer = combineReducers({
  userStore,
});

// const enhancers = process.env.APP_ENV === 'dev' ? composeWithDevTools(
//   applyMiddleware(thunk, logger)
// ) : applyMiddleware(thunk);

const enhancers = applyMiddleware(thunk)

const store: any = createStore(reducer, enhancers);

export default store;

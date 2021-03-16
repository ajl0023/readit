import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "../reducers/reducer";
import { loadState } from "../localStorage";
import { alwaysReturnHelloMiddleware } from "../middleware/middleware";
export default function configureStore(preloadedState) {
  const persistedState = loadState();
  const composeEnhancers = composeWithDevTools({ trace: true });
  return createStore(
    rootReducer,
    persistedState,
    composeEnhancers(
      applyMiddleware(thunkMiddleware)
    )
  );
  
}

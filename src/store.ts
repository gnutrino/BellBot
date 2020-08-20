import { createStore, combineReducers, applyMiddleware, AnyAction } from "redux";
import { createEpicMiddleware } from "redux-observable";
import bell_state, { bellEpic } from "./ducks/bells";
import assigned_bells from "./ducks/assign";
import method_state from "./ducks/method";
import { State } from "./state";

const middleware = createEpicMiddleware<AnyAction, AnyAction, State>();
const rootReducer = combineReducers({
    bell_state, 
    assigned_bells,
    method_state
});

export const store = createStore(rootReducer, applyMiddleware(middleware));
middleware.run(bellEpic);
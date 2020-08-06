import { createStore, combineReducers, applyMiddleware, AnyAction } from "redux";
import { createEpicMiddleware } from "redux-observable";
import bells, { bellEpic } from "./ducks/bells";
import assigned_bells from "./ducks/assign";
import { State } from "./state";

const middleware = createEpicMiddleware<AnyAction, AnyAction, State>();
export const store = createStore(combineReducers({bells, assigned_bells}), applyMiddleware(middleware));
middleware.run(bellEpic);
import { AnyAction } from "redux";
import { Observable, empty, interval } from "rxjs";
import { filter, switchMap, delay, map, tap } from "rxjs/operators";
import { StateObservable } from "redux-observable";

import { BELL_STATE, State } from "../state";
import { socket, tower_id } from "../socket";

const LOOK_TO = "bell-bot/bells/LOOK_TO";
const STAND = "bell-bot/bells/STAND";
const STROKE = "bell-bot/bells/STROKE";
const NOOP = "bell-bot/bells/NOOP";

const initialState: {[bell: number]: BELL_STATE} = {
    1: "Hand",
    2: "Hand",
    3: "Hand",
    4: "Hand",
    5: "Hand",
    6: "Hand"
};

export default function reducer(state: {[bell: number]: BELL_STATE} = initialState, action: AnyAction): {[bell: number]: BELL_STATE}
{
    switch(action.type){
        case STROKE:
            const who_rang = action.payload;
            return {...state, [who_rang]: state[who_rang] === "Hand" ? "Back" : "Hand"};
        default:
            return state;
    }
}

const method = [
    [1, 2, 3, 4, 5, 6],
    [2, 1, 4, 3, 5, 6],
    [2, 4, 1, 5, 3, 6],
    [4, 2, 5, 1, 3, 6],
    [4, 5, 2, 3, 1, 6],
    [5, 4, 3, 2, 1, 6],
    [5, 3, 4, 1, 2, 6],
    [3, 5, 1, 4, 2, 6],
    [3, 1, 5, 2, 4, 6],
    [1, 3, 2, 5, 4, 6]
];

export function bellEpic(action$: Observable<AnyAction>, state$: StateObservable<State>): Observable<AnyAction>
{
    function start(): Observable<AnyAction>
    {
        return interval( 2000 / 6).pipe(
            delay(3500),
            map(i => {
                const row_num = Math.trunc(i / 6);
                const row = method[row_num % method.length];
                const bell = row[i % 6];
                if(!state$.value.assigned_bells.contains(bell)){
                    return { type: NOOP};
                }
                socket.emit("c_bell_rung", {
                    bell,
                    tower_id,
                    stroke: state$.value.bells[bell] === "Hand"
                })
                return { type: NOOP };
            })
        )
    }

    return action$.pipe(
        filter(action => [LOOK_TO, STAND].includes(action.type)),
        switchMap(action => action.type == LOOK_TO ? start() : empty())
    );
}

export const LookTo = () => ({ type: LOOK_TO});
export const Stand = () => ({type: STAND});
export const Ring = (bell: number) => ({type: STROKE, payload: bell});
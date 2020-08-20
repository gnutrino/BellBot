import { AnyAction } from "redux";
import { Observable, empty, interval, of, timer } from "rxjs";
import { filter, switchMap, map, withLatestFrom, take, delay, tap, delayWhen, concat, repeat, concatMap } from "rxjs/operators";
import { StateObservable } from "redux-observable";
import { range, fromPairs } from "lodash";

import { State, BellState } from "../state";
import { rowStart } from "./method";
import { socket, tower_id } from "../socket";

const LOOK_TO = "bell-bot/bells/LOOK_TO";
const STAND = "bell-bot/bells/STAND";
const STROKE = "bell-bot/bells/STROKE";

const initialState: BellState = {
    stroke: fromPairs(range(1, 7).map(i => [i, "Hand"])),
    current_bell: 0
};

export default function reducer(state: BellState = initialState, action: AnyAction):  BellState
{
    switch(action.type){
        case STROKE:
            const who_rang = action.payload;
            const next_bell = (state.current_bell + 1) % 6
            return {
                stroke: {...state.stroke, [who_rang]: state.stroke[who_rang] === "Hand" ? "Back" : "Hand"},
                current_bell: next_bell
            };
        case STAND:
            return {
                ...state,
                current_bell: 0
            }
        default:
            return state;
    }
}

// time periods in milliseconds
const START_DELAY = 800;
const ROW_PERIOD = 2200;
const BELL_TICK = ROW_PERIOD / 6;

export function bellEpic(action$: Observable<AnyAction>, state$: StateObservable<State>): Observable<AnyAction>
{
    function start(): Observable<AnyAction>
    {
        return of(null).pipe(
            withLatestFrom(state$, (_, state) => state),
            switchMap(state => {
                const row_number = state.method_state.row_number;
                return timer(ROW_PERIOD + (row_number % 2 === 0 ? 0 : BELL_TICK))
            }),
            repeat(),
            delay(START_DELAY),
            tap(() => {
                interval(BELL_TICK).pipe(
                    withLatestFrom(state$, (_, state) => state),
                    take(6)
                ).subscribe(state => {             
                    const row = state.method_state.row;
                    const {current_bell, stroke } = state.bell_state;
                    const bell = row[current_bell];
                    if(state.assigned_bells.contains(bell)){
                        socket.emit("c_bell_rung", {
                            bell,
                            tower_id,
                            stroke: stroke[bell] === "Hand"
                        });
                    }
                });
            }),
            map(rowStart)
        );
    }

    return action$.pipe(
        filter(action => [LOOK_TO, STAND].includes(action.type)),
        switchMap(action => action.type == LOOK_TO && state$.value.assigned_bells.size ? start() : empty())
    );
}

export const LookTo = () => ({ type: LOOK_TO});
export const Stand = () => ({type: STAND});
export const Ring = (bell: number) => ({type: STROKE, payload: bell});
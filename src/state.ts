import { Set } from "immutable";

export type BELL_STROKE = "Hand" | "Back";

export interface BellState
{
    stroke: {[bell: number]: BELL_STROKE},
    current_bell: number;
}

export interface MethodState
{
    method: number[][];
    row_number: number;
    row: number[];
}

export interface State 
{
    bell_state: BellState;
    assigned_bells: Set<number>;
    method_state: MethodState;
}
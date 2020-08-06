import { Set } from "immutable";

export type BELL_STATE = "Hand" | "Back";

export interface State 
{
    bells: {[bell: number]: BELL_STATE};
    assigned_bells: Set<number>;
}
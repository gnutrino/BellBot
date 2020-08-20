import { AnyAction } from "redux"

import { MethodState } from "../state"

const ROW_START = "bell-bot/method/ROW_START";
const RESET = "bell-bot/method/RESET"

const initialState: MethodState = {
    method: [[1,2,3,4,5,6]],
    row_number: 0,
    row: [1,2,3,4,5,6]
}

export default function reducer(state: MethodState = initialState, action: AnyAction):  MethodState
{
    switch(action.type)
    {
        case ROW_START:
            return {...state, row_number: state.row_number + 1};
        default:
            return state;
    }   
}

export const rowStart = () => ({type: ROW_START});
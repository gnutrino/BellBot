import { AnyAction } from "redux";
import { Set } from "immutable"

//Actions
const ASSIGN_USER = "bell-bot/assign/ASSIGN_USER";

export default function reducer(state: Set<number> = Set(), action: AnyAction): Set<number>
{
    switch(action.type){
        case ASSIGN_USER:
            const {bell, user} = action.payload;
            return user == "BellBot" ? state.add(bell) : state.remove(bell);
        default:
            return state;
    }
}

export const AssignUser = (payload: {bell: number, user: string}) => ({type: ASSIGN_USER, payload});
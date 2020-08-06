import io from "socket.io-client"
import { store } from "./store"

export const socket = io("https://rr3.ringingroom.com");
export const user_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjcyMDYifQ.N8u_rwG2SU_BMkGM_SXo3X2d0yfx5o_n_7YsuTZpzRk";
export const tower_id = 863942157;

interface ChatMessage
{
    email: string
    msg: string
    time: string
    tower_id: number
    user: string
}

function handleCommand(command: string, args: string[])
{
    switch(command){
        case "dumpState":
            socket.emit("c_msg_sent", {
                email: "gnutrino@gmail.com",
                msg: JSON.stringify(store.getState()),
                time: new Date().toISOString(),
                tower_id,
                user: "BellBot"
            });
    }
}

import { LookTo, Stand, Ring } from "./ducks/bells";
import { AssignUser } from "./ducks/assign"; 

export function init(){
    socket.emit('c_join',{
        tower_id,
        user_token,
        anonymous_user: false
    }, () => console.log("Bot running, press ctrl+c to exit..."));

    socket.on("s_msg_sent", ({msg}: ChatMessage)  => {
        if(msg.startsWith("@BellBot") || msg.startsWith("!")){
            const parts = msg.split(/\s/);
            handleCommand(parts[1], parts.slice(2));
        }
    })

    socket.on("s_call", ({call}: {call: string}) => {
        switch(call){
            case "Look to":
                store.dispatch(LookTo());
                break;
            case "Stand next":
                store.dispatch(Stand());
                break;
        }
    });

    socket.on("s_bell_rung", ({who_rang}: {who_rang: number}) => {
        store.dispatch(Ring(who_rang));
    });

    socket.on("s_assign_user", (payload: {bell: number, user: string}) => {
        store.dispatch(AssignUser(payload));
    });

    
    process.on("SIGINT", () => socket.emit('c_user_left',{
            user_name: "BellBot",
            user_token,
            anonymous_user: false,
            tower_id
        }, () => process.exit(0))
    );
}
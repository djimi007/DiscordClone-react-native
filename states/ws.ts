import { create } from "zustand";
import {io} from "socket.io-client"


interface WSProp {
    srverHost : string 
    
}


const useWS = create()
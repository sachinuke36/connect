import { login, register } from "./auth.types"

export enum requestType{
    login = "LOGIN",
    registration = "REGISTER"
}


export type requestAction = {
    type: requestType.login,
    payload : login
} | {
    type: requestType.registration,
    payload: register
}

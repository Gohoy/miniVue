import { isObject } from "../shared/index";
import { mutableHandlers, readonlyHandlers,shallowReadonlyHandlers } from "./baseHandlers";

export const enum ReactiveFlags{
    IS_REACTIVE="__v_isReactive",
    IS_READONLY="__v_isReadonly"
}

export function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers)
}

export function shallowReadonly(raw){
    return createReactiveObject(raw, shallowReadonlyHandlers)    
}
function createReactiveObject(raw,baseHandlers){
    if(!isObject(raw)){
        console.warn("target"+raw+"必须是一个对象")
        return raw 
    }
    return new Proxy(raw, baseHandlers);
}
export function isReactive(value){
    return !!value[ReactiveFlags.IS_REACTIVE]
}
export function isReadOnly(value){
    return !!value[ReactiveFlags.IS_READONLY]
}
export function isProxy(value){
    return isReactive(value) || isReadOnly(value)
}
import { track,trigger } from "./effect";
import { ReactiveFlags, reactive,readonly } from "./reactive";
import { extend, isObject } from "../shared/index";
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true,true)
function createGetter(isReadOnly = false,shallow = false) {
    return function get(target, key) {  
        if(key === ReactiveFlags.IS_REACTIVE){
            return !isReadOnly
        }else if(key === ReactiveFlags.IS_READONLY){
            return isReadOnly
        }
        const res = Reflect.get(target, key)
        //
        
        if(!shallow){
            if(isObject(res)){
            return isReadOnly ? readonly(res) : reactive(res)
        }
        }

        if (!isReadOnly) {
            track(target, key)
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    }
}

export const mutableHandlers={
    get,
    set
}

export const readonlyHandlers = {
    // 这里要指定get是什么方法,直接写的话,readonly是调用不到这个get的
    get: readonlyGet,
    set(target,key,value){
        console.warn(`key:${key} set 失败,因为target是readonly类型`)
        return true
    }
}

export const shallowReadonlyHandlers = extend({},readonlyHandlers,{
    get:shallowReadonlyGet
})
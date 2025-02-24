import { hasChanged, isObject } from '../shared/index'
import { isTracking, trackEffect, triggerEfffects } from './effect'
import { reactive } from './reactive'

export class RefImpl {
    private _value: any
    private dep
    private rawValue: any
    public __v_isRef = true
    constructor(value) {
        this.rawValue = value
        this._value = convert(value)
        this.dep = new Set()
    }
    get value() {
        trackRefValue(this)
        return this._value
    }
    set value(newValue) {
        if (hasChanged(this.rawValue, newValue)) {
            this._value = convert(newValue)
            this.rawValue = newValue
            triggerEfffects(this.dep)
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffect(ref.dep)
    }
}
export function ref(value) {
    return new RefImpl(value)
}
export function isRef(ref) {
    return !!ref.__v_isRef
}

export function unRef(ref) {
    return isRef(ref) ? ref.value : ref
}
export function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key))
        },

        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value)
            } else {
                return Reflect.set(target, key, value)
            }
        },
    })
}

import { extend } from "../shared/index";
let activeEffect;
let shouldTrack;
export class ReactiveEffect {
    private _fn: any;
    deps = [];
    active = true
    onStop?: () => void
    constructor(fn, public scheduler?) {
        this._fn = fn;
    }
    run() {
        if (!this.active) {
            //  这里是stop之后状态,不收集 effect 
            return this._fn();
        }
        // 否则的话 收集effect
        activeEffect = this
        shouldTrack = true
        const result = this._fn()
        // 关闭收集effect
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            this.active = false;
            if (this.onStop) {
                this.onStop()
            }
            cleanupEffect(this)
        }
    }

}
function cleanupEffect(effect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    });
    effect.deps.length = 0
}
// 这里面存放着所有的reactive对象
const targetMap = new Map()
export function track(target, key) {
    if (!isTracking()) return
    // depsMap存放是这个对象的属性 
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }
    // dep表示的是对象中的key对应的属性
    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set()
        // dep 存储的
        depsMap.set(key, dep)
    }
    // 这一个dep中存放多个 函数
    trackEffect(dep)
};
export function trackEffect(dep) {
    if(dep.has(activeEffect)) return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep)
}
export function isTracking() {
    return (shouldTrack && activeEffect !== undefined)
}
export function trigger(target, key) {
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)
    triggerEfffects(dep)
}
export function triggerEfffects(dep){
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
    }
}



export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // extend
    extend(_effect, options)
    _effect.run()
    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

export function stop(runner) {
    runner.effect.stop()
}


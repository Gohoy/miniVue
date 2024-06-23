import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { PublicInstanceProxyHandler } from './componentPublicInstace'
import { initSlots } from './componentSlots'
import { proxyRefs } from '../reactivity/ref'
export function createComponentInstance(vnode, parent) {
    const component = {
        subTree: null,
        isMounted: false,
        vnode,
        type: vnode.type,
        setupState: [],
        el: null,
        props: {},
        emit: () => {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        next: null,
    }
    component.emit = emit.bind(null, component) as any
    return component
}

let currentInstance = null
export function setupComponent(instance) {
    // initProps
    initProps(instance, instance.vnode.props)
    // initSlots
    initSlots(instance, instance.vnode.children)
    setupStatefulComponent(instance)
}
function setupStatefulComponent(instance: any) {
    const component = instance.type
    // ctx
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandler)
    const { setup } = component
    if (setup) {
        setCurrentInstance(instance)
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        })
        setCurrentInstance(null)
        handleSetUpResult(instance, setupResult)
    }
}

function handleSetUpResult(instance, setupResult: any) {
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult)
    }

    finishComponentSetUp(instance)
}

function finishComponentSetUp(instance: any) {
    const component = instance.type
    if (compiler && !component.render) {
        component.render = compiler(component.template)
    }
    instance.render = component.render
}

export function getCurrentInstance() {
    return currentInstance
}

export function setCurrentInstance(instance) {
    currentInstance = instance
}

let compiler
export function registerRuntimeCompile(_compiler) {
    compiler = _compiler
}

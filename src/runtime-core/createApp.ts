import { createVNode } from './vnode'
export function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 先转化成vnode 然后后续操作都基于虚拟节点操作
                // componenet->vnode
                const vnode = createVNode(rootComponent)
                render(vnode, rootContainer)
            },
        }
    }
}

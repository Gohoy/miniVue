import { effect } from '../reactivity/effect'
import { isObject } from '../shared/index'
import { createComponentInstance, setupComponent } from './component'
import { createAppApi } from './createApp'
import { Fragment } from './vnode'
import { EMPTY_OBJ } from '../shared/index'
import { ShapeFlags } from '../shared/shapeFlags'
import { shouldUpdateComponent } from './componentUpdateUtils'
import { queueJobs } from './scheduler'
export function createRender(options) {
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText,
    } = options

    function render(vnode, container, parentComponent) {
        // patch
        patch(null, vnode, container, null, null)
    }

    // n1 老的
    // n2 新的
    function patch(n1, n2, container, parentComponent, anchor) {
        const { type } = n2
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor)
                break
            case Text:
                processText(n1, n2, container)
            default:
                if (typeof n2.type === 'string') {
                    processElement(n1, n2, container, parentComponent, anchor)
                } else if (isObject(n2.type)) {
                    processComponent(n1, n2, container, parentComponent, anchor)
                }
        }
    }

    function processText(n1, n2, container) {
        const { children } = n2
        const textNode = (n2.el = document.createTextNode(children))
        container.append(textNode)
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor)
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountComponent(n2, container, parentComponent, anchor)
        } else {
            updateComponent(n1, n2)
        }
    }
    function updateComponent(n1, n2) {
        const instance = (n2.component = n1.component)
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2
            instance.update()
        } else {
            n2.el = n1.el
            instance.vode = n2
        }
    }

    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor)
        } else {
            patchElement(n1, n2, container, parentComponent, anchor)
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        // 对比 n1 和 n2 的改动
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ
        const el = (n2.el = n1.el)
        patchProps(el, oldProps, newProps)
        patchChildren(n1, n2, el, parentComponent, anchor)
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapeFlag = n1.shapeFlag
        const { shapeFlag } = n2
        const c1 = n1.children
        const c2 = n2.children
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 删除老的children
                // 设置新的text
                unmountChildren(n1.children)
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2)
            }
        } else {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, '')
                mountChildren(c2, container, parentComponent, anchor)
            } else {
                // array diff 要进行性能优化
                // 双端对比算法 锁定其中的乱序部分
                patchKeyedChildren(c1, c2, container, parentComponent, anchor)
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, anchor) {
        let l2 = c2.length
        let i = 0
        let e1 = c1.length - 1
        let e2 = l2 - 1
        function isSomeVNodeType(n1, n2) {
            // type
            // key
            return n1.type === n2.type && n1.key === n2.key
        }
        // 左侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, anchor)
            } else {
                break
            }
            i++
        }
        // 右侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, anchor)
            } else {
                break
            }
            e1--
            e2--
        }

        // 新的比老的多
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1
                const anchor = nextPos < l2 ? c2[nextPos].el : null
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor)
                    i++
                }
            }
        } else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el)
                i++
            }
        } else {
            let s1 = i
            let s2 = i
            let toBePatched = e2 - s2 + 1
            let patched = 0
            const keyToNewIndexMap = new Map()
            const newIndexToOldIndexMap = new Array(toBePatched)
            let moved = false
            let maxNewIndexSoFar = 0
            for (let i = 0; i < toBePatched; i++) {
                newIndexToOldIndexMap[i] = 0
            }
            for (let i = s2; i <= e2; i++) {
                const nextChildren = c2[i]
                keyToNewIndexMap.set(nextChildren.key, i)
            }
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i]
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el)
                    continue
                }
                let newIndex
                if (prevChild.key !== null) {
                    debugger
                    newIndex = keyToNewIndexMap.get(prevChild.key)
                } else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSomeVNodeType(prevChild, c2[j])) {
                            newIndex = j
                            break
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild.el)
                } else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex
                    } else {
                        moved = true
                    }
                    newIndexToOldIndexMap[newIndex - s2] = i + 1
                    patch(
                        prevChild,
                        c2[newIndex],
                        container,
                        parentComponent,
                        null
                    )
                    patched++
                }
            }
            const increasingNewIndexSequence = moved
                ? getSequence(newIndexToOldIndexMap)
                : []
            let j = increasingNewIndexSequence.length - 1
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2
                const nextChild = c2[nextIndex]
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor)
                } else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        // 移动
                        hostInsert(nextChild.el, container, anchor)
                    } else {
                        j--
                    }
                }
            }
        }
    }
    function getSequence(arr: number[]): number[] {
        const p = arr.slice()
        const result = [0]
        let i, j, u, v, c
        const len = arr.length
        for (i = 0; i < len; i++) {
            const arrI = arr[i]
            if (arrI !== 0) {
                j = result[result.length - 1]
                if (arr[j] < arrI) {
                    p[i] = j
                    result.push(i)
                    continue
                }
                u = 0
                v = result.length - 1
                while (u < v) {
                    c = (u + v) >> 1
                    if (arr[result[c]] < arrI) {
                        u = c + 1
                    } else {
                        v = c
                    }
                }
                if (arrI < arr[result[u]]) {
                    if (u > 0) {
                        p[i] = result[u - 1]
                    }
                    result[u] = i
                }
            }
        }
        u = result.length
        v = result[u - 1]
        while (u-- > 0) {
            result[u] = v
            v = p[v]
        }
        return result
    }

    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el
            // remove
            hostRemove(el)
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key]
                const nextProp = newProps[key]
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp)
                }
            }
            if (oldProps != EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null)
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        // const el = document.createElement(vnode.type)
        const el = (vnode.el = hostCreateElement(vnode.type))
        const { children, props } = vnode
        if (typeof children === 'string') {
            el.textContent = children
        } else if (Array.isArray(children)) {
            mountChildren(vnode.children, el, parentComponent, anchor)
        }
        for (const key in props) {
            const val = props[key]
            //
            // const isOn = (key: string) => /^on[A-Z]/.test(key)
            // if (isOn(key)) {
            //     const event = key.slice(2).toLowerCase()
            //     el.addEventListener(event, val)
            // } else {
            //     el.setAttribute(key, val)
            // }
            hostPatchProp(el, key, null, val)
        }
        // container.append(el)
        hostInsert(el, container, anchor)
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach((child) => {
            patch(null, child, container, parentComponent, anchor)
        })
    }
    function mountComponent(
        initialVnode: any,
        container,
        parentComponent,
        anchor
    ) {
        const instance = (initialVnode.component = createComponentInstance(
            initialVnode,
            parentComponent
        ))
        setupComponent(instance)
        setupRenderEffect(instance, initialVnode, container, anchor)
    }
    function setupRenderEffect(instance, initialVnode, container, anchor) {
        instance.update = effect(
            () => {
                if (!instance.isMounted) {
                    const { proxy } = instance
                    const subTree = (instance.subTree =
                        instance.render.call(proxy,proxy))
                    patch(null, subTree, container, instance, anchor)
                    initialVnode.el = subTree.el
                    instance.isMounted = true
                } else {
                    const { next, vnode } = instance
                    if (next) {
                        next.el = vnode.el
                        updateComponentPreRender(instance, next)
                    }
                    const { proxy } = instance
                    const subTree = instance.render.call(proxy,proxy)
                    const prevSubTree = instance.subTree
                    instance.subTree = subTree
                    patch(prevSubTree, subTree, container, instance, anchor)
                }
            },
            {
                scheduler() {
                    console.log('scheduler')
                    queueJobs(instance.update)
                },
            }
        )
    }

    function updateComponentPreRender(instance, nextVNode) {
        instance.vnode = nextVNode
        instance.props = nextVNode.props
        instance.next = null
    }
    return {
        createApp: createAppApi(render),
    }
}

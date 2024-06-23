import { createTextVNode, getCurrentInstance, h } from '../../../lib/guide-min-vue.esm.js'
import { Foo } from './foo.js'
export const App = {
    name: 'App',
    render() {
        return h('div', {}, [h('p', {}, 'currentinstance demo '), h(Foo)])
    },

    setup() {
        const instance = getCurrentInstance()
        // console.log('APP', instance)
    },
}

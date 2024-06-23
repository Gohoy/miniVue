import { createTextVNode, h } from '../../../lib/guide-min-vue.esm.js'
import { Foo } from './foo.js'
window.self = null
export const App = {
    name: 'App',
    // .vue
    render() {
        // window.self = this
        // return h(
        //     'div',
        //     {
        //         id: 'root',
        //         class: ['red', 'root'],
        //         onClick() {
        //             // console.log('click')
        //         },
        //         onMousedown() {
        //             // console.log('mousedown')
        //         },
        //     },
        //     [
        //         h('div', {}, 'hi ' + this.msg),
        //         h(Foo, {
        //             onAdd(a,b) {
        //                 console.log("onAdd",a,b);
        //             },
        //             onAddFoo(a,b){
        //                 console.log("addfoo")
        //             }
        //         }),
        //     ]
        // "hi,"+this.msg
        // [
        //     h("p", {
        //         class: "red"
        //     }, "hi"),
        //     h("p", {
        //         class: "blue"
        //     }, "min-vue"),
        // ]
        // )
        const app = h('div', {}, 'App')
        const foo = h(
            Foo,
            {},
            {
                header: ({age})=>[h('p', {}, 'header' + age),
                createTextVNode("你好"),],
                footer: ()=> h('p', {}, 'footer'),
            }
        )
        // const foo = h(Foo,{},h("p",{},"789"))
        return h('div', {}, [app, foo])
    },

    setup() {
        return {
            msg: 'mini-vue,haha',
        }
    },
}

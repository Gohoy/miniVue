import { h, renderSlots } from '../../../lib/guide-min-vue.esm.js'
export const Foo = {
    setup(props, { emit }) {
        // const emitAdd = () => {
        //     // console.log("emit add")
        //     emit("add",1,2)
        //     emit("add-foo",1,2)
        // };
        // return{
        //     emitAdd
        // }
        return {}
    },

    render() {
        // const btn = h(
        //     'button',
        //     {
        //         onClick: this.emitAdd,
        //     },
        //     'emitAdd'
        // )
        const foo = h('p', {}, 'foo')
        // console.log(this.$slots)

        const age = 18
        // 具名插槽 
        // 作用域插槽
        return h('div', {}, [
            renderSlots(this.$slots, 'header',{
                age,
            }),
            foo,
            renderSlots(this.$slots, 'footer'),
        ])
    },
}

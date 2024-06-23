// 在 render 中可以通过 this.xxx 访问到 setup 返回的对象
import { ref, h } from '../../../lib/guide-min-vue.esm.js'
export const App = {
    name: 'App',
    setup() {
        const count = ref(0)
        const handleClick = () => {
            count.value++
        }

        const props = ref({
            foo: 'foo',
            bar: 'bar',
        })
        const onChangePropsDemo1 = () => {
            props.value.foo = 'new-foo'
        }
        const onChangePropsDemo2 = () => {
            props.value.foo = undefined
        }
        const onChangePropsDemo3 = () => {
            props.value = {
                foo: 'foo',
            }
        }
        return {
            count,
            handleClick,
            onChangePropsDemo1,
            onChangePropsDemo2,
            onChangePropsDemo3,
            props,
        }
    },

    render() {
        return h('div', { id: 'root', ...this.props }, [
            h('div', {}, "count:" + this.count),
            h('button', { onClick: this.handleClick }, 'click'),
            h("button",{onClick: this.onChangePropsDemo1}, "changeProps - 值改变-修改"),
            h("button",{onClick: this.onChangePropsDemo2}, "删除props的foo"),
            h("button",{onClick: this.onChangePropsDemo3}, "恢复foo为foo")
        ])
    },
}

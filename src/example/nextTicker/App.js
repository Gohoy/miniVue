import {
    h,
    ref,
    getCurrentInstance,
    nextTick,
} from '../../../lib/guide-min-vue.esm.js'
import NextTicker from './NextTicker.js'

export default {
    name: 'App',
    setup() {
        const count = ref(1)
        const instance = getCurrentInstance()
        function onclick() {
            for (let i = 0; i < 100; i++) {
                count.value = i
            }
            console.log(instance)
            nextTick(() => {
                console.log(instance)
            })
        }
        return {
          count,
          onclick
        }
    },

    render() {
        return h('div', { tId: 1 }, [h('p', {}, '主页'), h(NextTicker),h('button',{onClick: this.onclick},`button${this.count}`)])
    },
}

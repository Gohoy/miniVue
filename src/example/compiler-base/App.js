import { ref } from '../../../lib/guide-min-vue.esm.js'
export default {
    name: 'App',
    template: `<div>hi,{{count}}</div>`,
    setup() {
        const count = (window.count = ref(1))
        return {
            count,
        }
    },
}

// 复杂一点
// template 包含 element 和 interpolation
// export default {
//     template: `<p>{{msg}}</p>`,
//     setup() {
//         return {
//             msg: 'vue3 - compiler',
//         }
//     },
// }

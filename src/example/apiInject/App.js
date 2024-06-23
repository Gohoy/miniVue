import { h, inject, provide } from "../../../lib/guide-min-vue.esm.js";

const Provider = {
    name : "Provider",
    setup(){
        provide("foo","fooval")
        provide("bar","barval") 
    },
    render(){
        return h("div",{},[h("p",{},"Provider"),h(Provider1)]);
    }
}

const Provider1 = {
    name : "Provider",
    setup(){
        provide("foo","foo2val") 
        const foo = inject("foo")
        return{
            foo
        }
    },
    render(){
        return h("div",{},[h("p",{},`Provider1 foo:${this.foo}`),h(Consumer)]);
    }
}

const Consumer = {
    name:  "Consumer",
    setup(){
        const foo = inject("foo")
        const bar = inject("bar")
        // const foo2 = inject("foo2","foodefault")
        const foo2 = inject("foo2",()=> "fooDefault")
        return {
            foo,
            bar,
            foo2
        }
    },
    render(){
        return  h("div",{},`Consumer: -${this.foo} - ${this.bar} - ${this.foo2}` )
    }
}


export const App =  {
    name : "App",
    setup(){},
    render(){
        return h("div",{},[h("p",{},"apiInject"),h(Provider)])
    }
}
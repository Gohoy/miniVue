import { reactive } from "../reactive";
import { effect, stop } from "../effect"
describe('effect', () => {
    it('happy path', () => {
        const user = reactive({
            age: 10
        });
        let nextAge;
        // 创建的时候fn就会调用一次
        effect(() => {
            nextAge = user.age + 1
        })
        expect(nextAge).toBe(11);
        // update
        // 这里会调用set方法
        user.age++
        expect(nextAge).toBe(12)
    })


    it('should return runner while effect', () => {
        // effect传入的函数可以被参数接收
        let foo = 10
        const runner = effect(() => {
            foo++
            return "foo"
        })
        expect(foo).toBe(11)
        const r = runner()
        expect(foo).toBe(12)
        expect(r).toBe("foo")

    })
    // 1. 通过effect的第二个参数传递一个scheduler函数
    // 2. effect第一次执行的时候,会执行fn
    // 3. 当响应式对象 set update 的时候,不会执行fn 而是会执行scheduler
    // 4. 当执行effect返回的函数的时候,仍然会执行fn
    it('', () => {
        let dummy;
        let run: any;
        const scheduler = jest.fn(() => {
            run = runner;
        });
        const obj = reactive({ foo: 1 });
        const runner = effect(
            () => {
                dummy = obj.foo;
            },
            { scheduler }
        );
        expect(scheduler).not.toHaveBeenCalled();
        expect(dummy).toBe(1)
        obj.foo++
        expect(scheduler).toHaveBeenCalledTimes(1)
        expect(dummy).toBe(1)
        run()
        expect(dummy).toBe(2)
    });

    it('stop', () => {
        let dummy;
        const obj = reactive({ prop: 1 })
        const runner = effect(() => {
            dummy = obj.prop
        })
        obj.prop = 2
        expect(dummy).toBe(2)
        stop(runner)
        // obj.prop = 3
        obj.prop++
        expect(dummy).toBe(2)

        runner()
        expect(dummy).toBe(3)
    })

    it('onStop', () => {
        let dummy
        const obj = reactive({
            foo: 1
        })
        const onStop = jest.fn();
        const runner = effect(
            () => {
                dummy = obj.foo
            },
            {
                onStop,
            }
        )
        stop(runner)
        expect(onStop).toHaveBeenCalledTimes(1)
    })

})

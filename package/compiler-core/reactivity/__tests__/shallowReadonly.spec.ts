import { isReadOnly, shallowReadonly } from "../reactive"

describe("shallowReadonly", () => {
    test("should not make non-reactive properties reactive ", () => {
        const props = shallowReadonly({ n: { foo: 1 } })
        expect(isReadOnly(props)).toBe(true)
        expect(isReadOnly(props.n)).toBe(false)
        console.warn = jest.fn()
        const user = shallowReadonly({ age: 10 })
        user.age = 11
        expect(console.warn).toHaveBeenCalled()
    })
})
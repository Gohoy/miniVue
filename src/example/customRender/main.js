import { createRender } from '../../../lib/guide-min-vue.esm.js'
import { App } from './App.js'
const game = new PIXI.Application()
await game.init({
    width: 500,
    height: 500,
})
document.body.append(game.canvas)
const renderer = createRender({
    createElement(type) {
        if (type === 'rect') {
            const rect = new PIXI.Graphics()
            rect.beginFill(0xff0000)
            rect.drawRect(0, 0, 100, 100)
            rect.endFill()
            return rect
        }
    },

    patchProp(el, key, val) {
        el[key] = val
    },
    insert(el, parent) {
        parent.addChild(el)
    },
})
renderer.createApp(App).mount(game.stage)
// const rootContainer = document.querySelector("#app")
// createApp(App).mount(rootContainer)

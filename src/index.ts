export * from './runtime-dom'
import { baseCompile } from './compiler-core/src/transforms'
import * as runtimeDom from './runtime-dom'
import { registerRuntimeCompile } from './runtime-dom'
function compileToFunction(template) {
    const { code } = baseCompile(template)
    const render = new Function('Vue', code)(runtimeDom)
    return render
}

registerRuntimeCompile(compileToFunction)

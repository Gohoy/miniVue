import { NodeTypes } from './ast'

const enum TagType {
    Start,
    End,
}
export function baseParse(content: String) {
    const context = createParserContext(content)
    return createRoot(parseChildren(context, []))
}

function createRoot(children) {
    return {
        children,
        type: NodeTypes.ROOT,
    }
}
function createParserContext(content) {
    return {
        source: content,
    }
}
function parseChildren(context, ancestors) {
    const nodes: any = []
    while (!isEnd(context, ancestors)) {
        let node
        const s = context.source
        if (s.startsWith('{{')) {
            node = parseInterpation(context)
        } else if (s[0] === '<') {
            if (/[a-z]/i.test(s[1])) {
                node = parseElement(context, ancestors)
            }
        }
        // 默认是text 文本信息
        if (!node) {
            node = parseText(context)
        }
        nodes.push(node)
    }
    return nodes
}
function isEnd(context, ancestors) {
    const s = context.source
    if (s.startsWith(`</`)) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag
            if (startsWithEndTagOpen(s, tag)) {
                return true
            }
        }
    }
    return !s
}
function parseTextData(context, length) {
    const content = context.source.slice(0, length)
    // 2.推进
    advanceBy(context, length)
    return content
}
function parseText(context) {
    let endIndex = context.source.length
    let endTokens = ['{{', '<']
    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i])
        if (index !== -1 && endIndex > index) {
            endIndex = index
        }
    }

    const content = parseTextData(context, endIndex)
    return {
        type: NodeTypes.TEXT,
        content: content,
    }
}
function parseElement(context, ancestors) {
    const element: any = parseTag(context, TagType.Start)
    ancestors.push(element)
    element.children = parseChildren(context, ancestors)
    ancestors.pop()
    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, TagType.End)
    } else {
        throw new Error(`缺少结束标签:${element.tag}`)
    }
    return element
}
function startsWithEndTagOpen(source, tag) {
    return (
        source.startsWith('</') &&
        source.slice(2, 2 + tag.length).toLowerCase() === tag
    )
}
function parseTag(context: any, type: TagType) {
    const match: any = /^<\/?([a-z]*)/i.exec(context.source)
    const tag = match[1]
    advanceBy(context, match[0].length)
    advanceBy(context, 1)
    if (type === TagType.End) return
    return {
        type: NodeTypes.ELEMENT,
        tag,
    }
}

function parseInterpation(context) {
    const openDelimiter = '{{'
    const closeDelimiter = '}}'
    const closeIndex = context.source.indexOf(
        closeDelimiter,
        openDelimiter.length
    )
    advanceBy(context, openDelimiter.length)
    const rawContentLength = closeIndex - openDelimiter.length
    const rawContent = parseTextData(context, rawContentLength)
    const content = rawContent.trim()
    advanceBy(context, closeDelimiter.length)
    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content,
        },
    }
}

function advanceBy(context, length) {
    context.source = context.source.slice(length)
}

const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; //匹配标签名 形如 abc-123
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //匹配特殊标签 形如 abc:234 前面的abc:可有可无
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配标签开始 形如 <abc-123 捕获里面的标签名
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束  >
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾 如 </abc-123> 捕获里面的标签名
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性  形如 id="app"

let root, currentParent

let stack = []

const ELEMENT_TYPE = 1
const TEXT_TYPE = 3

function createASTElement(tagName, attrs) {
    return {
        tag: tagName,
        type: ELEMENT_TYPE,
        children: [],
        attrs,
        parent: null
    }
}

// 对开始标签处理
function handleStartTag({ tagName, attrs }) {
    let element = createASTElement(tagName, attrs)
    if (!root) {
        root = element
    }
    currentParent = element
    stack.push(element)
}

// 对结束标签进行处理
function handleEndTag() {
    // 比如 <div><span></span></div> 当遇到第一个结束标签</span>时 会匹配到栈顶<span>元素对应的ast 并取出来
    let element = stack.pop()
    // 当前父元素就是栈顶的上一个元素 在这里就类似div
    currentParent = stack[stack.length - 1]
    if (currentParent) {
        element.parent = currentParent
        currentParent.children.push(element)
    }
}

// 对文本进行处理
function handleChars(text) {
    // 去掉空格
    text = text.replace(/\s/g, "");
    if (text) {
        currentParent.children.push({
            type: TEXT_TYPE,
            text,
        });
    }
}

export function parse(html) {
    while (html) {
        let textEnd = html.indexOf('<')
        // 如果<在第一个，那么肯定是一个标签
        if (textEnd === 0) {
            // 匹配是否是开始标签
            const startTagMatch = parseStartTag()
            if (startTagMatch) {
                handleStartTag(startTagMatch);
                continue;
            }

            // 匹配是否是结束标签
            const endTagMatch = html.match(endTag)
            if (endTagMatch) {
                advance(endTagMatch[0].length)
                handleEndTag(endTagMatch[1])
                continue;
            }
        }

        let text
        if (textEnd >= 0) {
            text = html.substring(0, textEnd)
        }
        if (text) {
            advance(text.length)
            handleChars(text)
        }
    }

    function parseStartTag() {
        const start = html.match(startTagOpen)

        if (start) {
            const match = {
                tagName: start[1],
                attrs: []
            }

            advance(start[0].length)

            let end, attr;
            while (
                !(end = html.match(startTagClose)) &&
                (attr = html.match(attribute))
            ) {
                advance(attr[0].length)
                attr = {
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5], //这里是因为正则捕获支持双引号 单引号 和无引号的属性值
                }
                match.attrs.push(attr)
            }

            if (end) {
                advance(1)
                return match
            }
        }
    }


    function advance(n) {
        html = html.substring(n);
    }

    return root
}


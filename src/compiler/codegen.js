const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配花括号 {{  }} 捕获花括号里面的内容

function gen(node) {
    if (node.type === 1) {
        return generate(node)
    } else {
        // 文本节点 
        let text = node.text
        // 不存在花括号变量表达式
        if (!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`
        }
        let lastIndex = (defaultTagRE.lastIndex = 0);
        let tokens = [];
        let match, index;

        while ((match = defaultTagRE.exec(text))) {
            // index代表匹配到的位置
            index = match.index;
            if (index > lastIndex) {
                //   匹配到的{{位置  在tokens里面放入普通文本
                tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }
            //   放入捕获到的变量内容
            tokens.push(`_s(${match[1].trim()})`);
            //   匹配指针后移
            lastIndex = index + match[0].length;
        }
        // 如果匹配完了花括号  text里面还有剩余的普通文本 那么继续push
        if (lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        // _v表示创建文本
        return `_v(${tokens.join("+")})`;
    }
}

function genProps(attrs) {
    let str = ""
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]
        // 对attrs属性里面的style做特殊处理
        if (attr.name === 'style') {
            let obj = {};
            attr.value.split(";").forEach((item) => {
                let [key, value] = item.split(":");
                obj[key] = value;
            });
            attr.value = obj;
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`;
    }
    return `{${str.slice(0, -1)}}`;
}

function getChildren(el) {
    const children = el.children
    if (children) {
        return `${children.map((c) => gen(c)).join(',')}`
    }
}

export function generate(el) {
    let children = getChildren(el)
    let code = `_c('${el.tag}',${el.attrs.length ? `${genProps(el.attrs)}` : "undefined"
        }${children ? `,${children}` : ''})`;
    return code
}
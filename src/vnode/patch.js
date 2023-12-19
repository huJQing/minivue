export function patch(oldVnode, vnode) {
    const isRealElement = oldVnode.nodeType
    if (isRealElement) {
        const oldElm = oldVnode
        const parentElm = oldElm.parentNode;
        let el = createElm(vnode)
        parentElm.insertBefore(el, oldElm.nextSibling)
        parentElm.removeChild(oldVnode)
        return el
    }
}

function createElement(vnode) {
    let { tag, data, key, children, text } = vnode
    if (typeof tag === 'string') {
        vnode.el = document.createElement(tag)
        updateProperties(vnode);
        children.forEach(child => {
            return vnode.el.appendChild(createElm(child));
        })
    } else {
        vnode.el = document.createTextNode(text);
    }
    return vnode.el
}

function updateProperties(vnode) {
    let newProps = vnode.data || {}
    let el = vnode.el
    for (let key of newProps) {
        if (key === 'style') {
            for (let styleName in newProps.style) {
                el.style[styleName] = newProps.style[styleName];
            }
        } else {
            el.setAttribute(key, newProps[key]);
        }
    }
}
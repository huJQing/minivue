export function patch(oldVnode, vnode) {
    const isRealElement = oldVnode.nodeType
    if (isRealElement) {
        const oldElm = oldVnode
        const parentElm = oldElm.parentNode;
        let el = createElm(vnode)
        parentElm.insertBefore(el, oldElm.nextSibling)
        parentElm.removeChild(oldVnode)
        return el
    } else {
        if (oldVnode.tag !== vnode.tag) {
            // 如果新旧标签不一致 用新的替换旧的 oldVnode.el代表的是真实dom节点   --同级比较
            oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
        }
        // 旧节点是文本节点
        if (!oldVnode.tag) {
            if (oldVnode.text !== vnode.text) {
                oldVnode.el.textContent = vnode.text
            }
        }
        // 以上两种都不是代表的是标签一致且不是文本节点
        // 此时复用节点 但是需要更新节点上的propeties，并继续对比子节点
        const el = (vnode.el = oldVnode.el)
        updateProperties(vnode, oldVnode.data)
        const oldCh = oldVnode.children || []
        const newCh = vnode.children || []
        if (oldCh.length > 0 && newCh.length > 0) {
            // 新老节点都存在子节点的时候，对比子节点
            updateChildren(el, oldCh, newCh)
        } else if (oldCh.length) {
            // 老节点有儿子节点 新节点没有儿子节点
            el.innerHTML = ''
        } else if (newCh.length) {
            // 老节点没有儿子节点 新节点有儿子节点 此时直接床架节点
            for (let i = 0; i < newCh.length; i++) {
                const child = newCh[i]
                el.appendChild(createElm(child))
            }
        }
    }

}

function createElm(vnode) {
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

function updateProperties(vnode, oldProps = {}) {
    let newProps = vnode.data || {}
    let el = vnode.el
    // 如果旧的属性在新节点中不存在，移除
    for (const k in oldProps) {
        if (!newProps[k]) {
            el.removeAttribute(k)
        }
    }
    // style特殊处理 如果旧的style在新的节点中没有，需要强行重置为空
    const newStyle = newProps.style || {}
    const oldStyle = oldProps.style || {}
    for (const key in oldStyle) {
        if (!newStyle[key]) {
            el.style[key] = ''
        }
    }

    for (let key in newProps) {
        if (key === 'style') {
            for (let styleName in newProps.style) {
                el.style[styleName] = newProps.style[styleName];
            }
        } else if (key === 'class') {
            el.className = newProps.class
        } else {
            el.setAttribute(key, newProps[key]);
        }
    }
}

function isSameVnode(oldVnode, newVnode) {
    return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key
}

function updateChildren(parent, oldCh, newCh) {
    let oldStartIndex = 0
    let oldStartVnode = oldCh[0]
    let oldEndIndex = oldCh.length - 1
    let oldEndVnode = oldCh[oldEndIndex]

    let newStartIndex = 0
    let newStartVnode = newCh[0]
    let newEndIndex = newCh.length - 1
    let newEndVnode = newCh[newEndIndex]

    // 根据key来创建老的儿子的index映射表  类似 {'a':0,'b':1} 代表key为'a'的节点在第一个位置 key为'b'的节点在第二个位置
    function makIndexByKey(children) {
        let map = {}
        children.forEach((item, index) => {
            map[item.key] = index
        })
        return map
    }

    let map = makIndexByKey[oldCh]

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        if (!oldStartVnode) {
            oldStartVnode = oldCh[++oldStartIndex]
        } else if (!oldEndVnode) {
            oldEndVnode = oldCh[--oldEndIndex]
        } else if (isSameVnode(oldStartVnode, newStartVnode)) {
            // 头和头是相同节点，直接比较
            patch(oldStartVnode, newStartVnode); // 递归
            oldStartVnode = oldCh[++oldStartIndex]
            newStartVnode = oldCh[++newStartIndex]
        } else if (isSameVnode(oldEndVnode, newEndVnode)) {
            // 尾和尾是相同节点，直接比较
            patch(oldEndVnode, newEndVnode);
            oldEndVnode = oldCh[--oldEndIndex]
            newEndVnode = oldCh[--newEndIndex]
        } else if (isSameVnode(oldStartVnode, newEndVnode)) {
            // 老的头和新的尾比较，如果是相同的node，交换位置，把老的头部移动到尾部
            patch(oldStartVnode, newEndVnode);
            parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
            oldStartVnode = oldCh[++oldStartIndex]
            newEndVnode = oldCh[--newEndVnode]
        } else if (isSameVnode(oldEndVnode, newStartVnode)) {
            // 老的尾和新的头比较，如果是相同的node，交换位置，把老的尾部移动到头部
            patch(oldEndVnode, newStartVnode);
            parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
            oldEndVnode = oldCh[--oldEndIndex]
            newStartVnode = oldCh[++newStartIndex]
        } else {
            // 如果以上四种情况都不满足 暴力对比
            // 根据老的子节点的key和index的映射表 从新的开始子节点进行查找，如果找到一样的key的node就直接移动，如果找不到就直接进行插入
            let moveIndex = map[newStartVnode.key]
            if (!moveIndex) {
                // 找不到时代表是新节点直接插入
                parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
            } else {
                let moveVnode = oldCh[moveIndex]
                oldCh[moveIndex] = undefined
                parent.insertBefore(moveVnode.el, oldStartVnode.el)
                patch(moveVnode, newStartVnode)
            }
        }
    }

    // 如果老节点循环完了 但是新节点还有 新节点直接加入头部或者尾部
    if (newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            // 这是一个优化写法 insertBefore的第一个参数是null等同于appendChild作用
            const ele = newCh[newEndIndex + 1] === null ? null : newCh[newEndIndex + 1].el
            parent.insertBefore(createElm(newCh[i], ele))
        }
    }
    // 如果新节点循环完毕 老节点还有  证明老的节点需要直接被删除
    if (oldStartIndex <= oldEndIndex) {
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            let child = oldCh[i];
            if (child != undefined) {
                parent.removeChild(child.el);
            }
        }
    }
}
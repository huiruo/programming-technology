function render(_ctx, _cache) {
  with (_ctx) {
    const { createElementVNode: _createElementVNode, toDisplayString: _toDisplayString,
      createCommentVNode: _createCommentVNode, openBlock: _openBlock, createElementBlock: _createElementBlock } = _Vue

    return (_openBlock(), _createElementBlock("div", null, [
      _createElementVNode("button", {
        onClick: onClickText,
        class: "btn"
      }, "Hello world,Click me", 8 /* PROPS */, _hoisted_1),
      _createElementVNode("span", null, "ruo-" + _toDisplayString(msg), 1 /* TEXT */),
      _createCommentVNode(" <div v-if=\"showDiv\">\n        被你发现了\n      </div> ")
    ]))
  }
}
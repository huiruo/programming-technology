
## document.write 和 innerHTML 的区别
* document.write 是重写整个 document, 写入内容是字符串的 html；innerHTML 是 HTMLElement 的属性，是一个元素的内部 html 内容


* innerHTML innerHTML 则是 DOM 页面元素的一个属性，代表该元素的 html 内容。将内容写入某个 DOM 节点，不会导致页面全部重绘。
innerHTML 很多情况下都优于 document.write，其原因在于其允许更精确的控制要刷新页面的那一个部分。
```
你可以精确到某一个具体的元素来进行更改。如果想修改 document 的内容，则需要修改 document.documentElement.innerElement。
```
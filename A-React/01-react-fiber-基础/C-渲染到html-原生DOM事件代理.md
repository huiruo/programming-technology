### react 17之前原生DOM事件代理
有关虚拟DOM的事件机制，我曾专门写过一篇文章，有兴趣可以👇【React深入】React事件机制: https://juejin.im/post/6844903790198571021

`React`的所有事件都通过 `document`进行统一分发。当真实 `Dom`触发事件后冒泡到 `document`后才会对 `React`事件进行处理。
所以原生的事件会先执行，然后执行 `React`合成事件，最后执行真正在 `document`上挂载的事件
`React`事件和原生事件最好不要混用。原生事件中如果执行了 `stopPropagation`方法，则会导致其他 `React`事件失效。因为所有元素的事件将无法冒泡到 `document`上，导致所有的 `React`事件都将无法被触发。。

## react 17之后：合成事件:ReactDOMEventListeners.js
```
核心是dispatchEvent进行事件的分发，17之后不再将事件全部冒泡到document去代理，这和浏览器的改进有关，不再需要代理绑定，浏览器可以对更细粒度的区域进行监听
```

### 4.渲染html
```
在mountComponentIntoNode函数中调用将上一步生成的markup插入container容器。
在首次渲染时，_mountImageIntoNode会清空container的子节点后调用DOMLazyTree.insertTreeBefore：
```
```javaScript
var insertTreeBefore = function(parentNode,tree,referenceNode){
	//判断是否为fragment节点或者<object>插件：
	if(tree.node.nodeType===DOCUMENT_FRAGMENT_NODE_TYPE||tree.node.nodeType===ELEMENT_NODE_TYPE&&tree.node.nodeName.toLowerCase()==='object'
		&&(tree.node.namespaceURI==null||tree.node.namespaceURI===DOMNamespaces.html)){
		insertTreeChildren(tree)
		parentNode.insertBefore(tree.node,referenceNode)
	}else{
		parentNode.insertBefore(tree.node,referenceNode)
	}
}

/*
判断是否为fragment节点或者<object>插件：
+ 如果是以上两种，首先调用insertTreeChildren将此节点的孩子节点渲染到当前节点上，再将渲染完的节点插入到html

+ 如果是其他节点，先将节点插入到插入到html，再调用insertTreeChildren将孩子节点插入到html。

+ 若当前不是IE或Edge，则不需要再递归插入子节点，只需要插入一次当前节点。
*/
function insertTreeChildren(tree){
	if(!enableLazy){
		//不是ie/bEdge
		return
	}
	var node = tree.node
	var children = tree.children
	if(children.length){
		//递归渲染子节点
		for(var i= 0;i<children.length;i++){
			insertTreeChildren(node,children[i],null)
		}
	}else if(tree.html!=null){
		//渲染html节点
		setInnerHTML(node,tree.html)
	}else if(tree.text!=null){
		//渲染文本节点
		setTextContext(node,tree.text)
	}
}
/*
+ 判断不是IE或bEdge时return
+ 若children不为空，递归insertTreeBefore进行插入
+ 渲染html节点
+ 渲染文本节点
*/
```
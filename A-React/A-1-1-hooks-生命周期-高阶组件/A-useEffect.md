## 1.effect 的执行时机
请记得 React 会等待浏览器完成画面渲染之后才会延迟调用 `useEffect`，因此会使得额外操作很方便
```
与 `componentDidMount` 或 `componentDidUpdate` 不同，使用 `useEffect` 调度的 effect 不会阻塞浏览器更新屏幕，这让你的应用看起来响应更快。大多数情况下，effect 不需要同步地执行。在个别情况下（例如测量布局），有单独的 [`useLayoutEffect`]
```

## 2.useEffect 优点和缺点:useEffect 的回调函数是【异步宏任务】，在下一轮事件循环才会执行
根据 JS 线程与 GUI 渲染线程互斥原则，在 JS 中页面的渲染线程需要当前事件循环的宏任务与微任务都执行完，才会执行渲染线程，渲染页面后，退出渲染线程，控制权交给 JS 线程，再执行下一轮事件循环。

* 优点：这使得它适用于许多常见的副作用场景，比如设置订阅和事件处理等情况，因为绝大多数操作不应阻塞浏览器对屏幕的渲染更新。


* 缺点：产生二次渲染问题，第一次渲染的是旧的状态，接着下一个事件循环中，执行改变状态的函数，组件又携带新的状态渲染，在视觉上，就是二次渲染。

## 3.useLayoutEffect 优缺点:useLayoutEffect发生在页面渲染到屏幕(用户可见)之前，useEffect发生在那之后
useLayoutEffect 与 componentDidMount、componentDidUpdate 生命周期钩子是【异步微任务】，在渲染线程被调用之前就执行。这意味着回调内部执行完才会更新渲染页面，没有二次渲染问题。
* 优点：
```
没有二次渲染问题，页面视觉行为一致。
```
* 缺点:
```
在回调内部有一些运行耗时很长的代码或者循环时，页面因为需要等 JS 执行完之后才会交给渲染线程绘制页面，等待时期就是白屏效果，即阻塞了渲染。
```

## 扩展:useEffect是如何模拟生命周期的。你都会不假思索的回答出
```javaScript
第二个参数传递一个空数组, 模拟componentDidMount


第二个参数传递依赖项，模拟componentDidUpdate


第二个参数传递一个空数组，并且里面通过return的形式去调用一个方法，模拟componentWillUnmount
```

## 问题1：useEffect的执行顺序问题，如果父组件和子组件同时存在useEffect究竟是谁先走？
答：子组件的useEffect先走
```
useEffect的执行是在commit之后，React的commit阶段是干什么的？简单来说，就是将DOM渲染到页面上。那么我们是否可以想到，useEffect其实是在页面已经渲染结束后，再触发的？
```

### 问题1-解析：按照这个执行逻辑来看的话：
* 父组件进入commit阶段，发现有Son组件需要渲染。

* 开始进行Son的生命周期, Son进入commit阶段，执行子组件的useEffect，Son渲染结束

* 父组件进行commit阶段，渲染完成，执行useEffect

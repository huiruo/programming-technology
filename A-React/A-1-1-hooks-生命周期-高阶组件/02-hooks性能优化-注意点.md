## 1.2.Hooks 优点
* 比 HOC 更优雅的逻辑复用方式。HOC 可能会带来嵌套地狱，而 Hooks 可以让你在无需修改组件结构的情况下复用状态逻辑更加函数式。

可以控制组件更加细粒度，函数组件逻辑的复用性或适用性更强，让组件内部的状态变得更易于编写和维护等。
* Hooks 可以更方便的让相关代码写在一起（可阅读性，可维护性更高）。Class Component 则会让相关代码分布在不同的声明周期中，不方便后续的代码维护以及阅读
* 没有 this 上下文的问题
* 更方便的依赖执行（useEffect, useMemo）。class component 需要在shouldComponentUpdate, componentDidUpdate... 这些生命周期中各种判断


## 1-2.常用hooks
+ useContext()，共享钩子。该钩子的作用是，在组件之间共享状态。 可以解决react逐层通过Porps传递数据，它接受React.createContext()的返回结果作为参数，使用useContext将不再需要Provider 和 Consumer。

+ useReducer()，Action 钩子。useReducer() 提供了状态管理，其基本原理是通过用户在页面中发起action, 从而通过reducer方法来改变state, 从而实现页面和状态的通信。使用很像redux

+ useEffect()，副作用钩子。它接收两个参数， 第一个是进行的异步操作， 第二个是数组，用来给出Effect的依赖项

+ useRef()，获取组件的实例；渲染周期之间共享数据的存储(state不能存储跨渲染周期的数据，因为state的保存会触发组件重渲染）
useRef传入一个参数initValue，并创建一个对象{ current: initValue }给函数组件使用，在整个生命周期中该对象保持不变。

+ useMemo和useCallback：可缓存函数的引用或值，useMemo用在计算值的缓存，注意不用滥用。经常用在下面两种场景（要保持引用相等；对于组件内部用到的 object、array、函数等，如果用在了其他 Hook 的依赖数组中，或者作为 props 传递给了下游组件，应该使用 useMemo/useCallback）

+ useLayoutEffect：会在所有的 DOM 变更之后同步调用 effect，可以使用它来读取 DOM 布局并同步触发重渲染

## 1.通过 Effect 进行性能优化
在某些情况下，每次渲染后都执行清理或者执行 effect 可能会导致性能问题。在 class 组件中，我们可以通过在 `componentDidUpdate` 中添加对 `prevProps` 或 `prevState` 的比较逻辑解决：

```js
componentDidUpdate(prevProps, prevState) {
  if (prevState.count !== this.state.count) {
    document.title = `You clicked ${this.state.count} times`;
  }
}
```

- hook 解决方案
这是很常见的需求，所以它被内置到了 `useEffect` 的 Hook API 中。如果某些特定值在两次重渲染之间没有发生变化，你可以通知 React **跳过**对 effect 的调用，只要传递数组作为 `useEffect` 的第二个可选参数即可：
```js
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]);
```


## 2.如果你在渲染期间执行了高开销的计算，则可以使用 `useMemo` 来进行优化。


## 3-1.注意1:更新数组
```js
/*
使用useState时候，使用push，pop，splice等直接更改数组对象的坑，demo中使用push直接更改数组无法获取到新值，应该采用析构方式，但是在class里面不会有这个问题。(这个的原因是push，pop，splice是直接修改原数组，react会认为state并没有发生变化，无法更新)
*/

const [firstData, setFirstData]:any = useState([])
const handleFirstAdd = () => {
 	// let temp = firstData // 不要这么写，直接修改原数组相当于没有更新
    let temp = [...firstData]  // 必须这么写，多层数组也要这么写
    temp.push({
        value: '',
    })
    setFirstData(temp)
}
```

## 3-2.闭包带来的坑,不能读取到最新的值
因为每次 render 都有一份新的状态，因此上述代码中的 setTimeout 使用产生了一个闭包，捕获了每次 render 后的 state，也就导致了输出了 0、1、2。如果你希望输出的内容是最新的 state 的话，可以通过 useRef 来保存 state。前文讲过 ref 在组件中只存在一份，无论何时使用它的引用都不会产生变化，因此可以来解决闭包引发的问题。

## 3-3. 旧值处理
如果新的 state 需要通过使用先前的 state 计算得出，那么可以将函数传递给 `setState`。该函数将接收先前的 state，并返回一个更新后的值
```js
setState(prevState => {
  // 也可以使用 Object.assign
  return {...prevState, ...updatedValues};
});
```
`useReducer` 是另一种可选方案，它更适合用于管理包含多个子值的 state 对象。


## 4.useState中的第二个参数更新状态和class中的this.setState区别？

### `在正常的react的事件流里（如onClick等）`
+ setState和useState中的set函数是异步执行的（不会立即更新state的结果）
+ 多次执行setState和useState的set函数，组件只会重新渲染一次

+ 不同的是，setState会更新当前作用域下的状态，但是set函数不会更新，只能在新渲染的组件作用域中访问到
+ 同时setState会进行state的合并，但是useState中的set函数做的操作相当于是直接替换，只不过内部有个防抖的优化才导致组件不会立即被重新渲染

### `在setTimeout，Promise.then等异步事件或者原生事件中`
+ setState和useState的set函数是同步执行的（立即重新渲染组件）
+ 多次执行setState和useState的set函数，每一次的执行都会调用一次render
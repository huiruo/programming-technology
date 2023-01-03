# 前言
如果重渲染组件的开销较大，你可以 [通过使用 memoization 来优化]

* 没有 this 上下文的问题
* 更方便的依赖执行（useEffect, useMemo）。class component 需要在shouldComponentUpdate, componentDidUpdate
* Hooks 可以更方便的让相关代码写在一起

## 不同类型hook的memoizedState保存不同类型数据，具体如下：
比对是依赖项是否一致的时候，用的是Object.is：

Object.is() 与 === 不相同。差别是它们对待有符号的零和 NaN 不同，例如，=== 运算符（也包括 == 运算符）将数字 -0 和 +0 视为相等，而将 Number.NaN 与 NaN 视为不相等。

# hooks性能优化-注意点

## 2.如果你在渲染期间执行了高开销的计算，则可以使用 `useMemo` 来进行优化。

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

## 3-1.注意1:更新数组
使用useState时候，使用push，pop，splice等直接更改数组对象的坑，demo中使用push直接更改数组无法获取到新值，应该采用析构方式，但是在class里面不会有这个问题。(这个的原因是push，pop，splice是直接修改原数组，react会认为state并没有发生变化，无法更新)
```js
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

# useState
对于const [state, updateState] = useState(initialState)，memoizedState保存state的值

* mount 时：把传进来的 value 包装成一个含有 current 属性的对象，然后放在 memorizedState 属性上。
```
mount 时：将初始值存放在memoizedState 中，queue.pending用来存调用 setValue（即 dispath）时创建的最后一个 update ，是个环状链表，最终返回一个数组，包含初始值和一个由dispatchState创建的函数。
```
* update 时：可以看到，其实调用的是 updateReducer，只是 reducer 是固定好的，作用就是用来直接执行 setValue（即 dispath） 函数传进来的 action，即 useState 其实是对 useReducer 的一个封装，只是 reducer 函数是预置好的。


updateReducer 主要工作：
1. 将 baseQueue 和  pendingQueue 首尾合并形成新的链表

2. baseQueue 为之前因为某些原因导致更新中断从而剩下的 update 链表，pendingQueue 则是本次产生的 update链表。会把 baseQueue 接在 pendingQueue 前面。
3. 从 baseQueue.next 开始遍历整个链表执行 update，每次循环产生的 newState，作为下一次的参数，直到遍历完整个链表。即整个合并的链表是先执行上一次更新后再执行新的更新，以此保证更新的先后顺序。
4. 最后更新 hook 上的参数，返回 state 和 dispatch。

## useStae同步还是异步
### 01.关于17 的性能优化:React17根据情况而采用不同的更新策略
React17 和 React18 批量更新的策略是不同的。
* React17根据情况而采用不同的更新策略，
```
1. 只要进入了 react 的调度流程，那就是异步的；只要你没有进入 react 的调度流程，那就是同步的。
2. 什么东西不会进入 react 的调度流程？ setTimeout、 setInterval 、直接在 DOM 上绑定原生事件、Promise 的回调等，这些都不会走 React 的调度流程。在这种情况下调用 setState ，那这次 setState 就是同步的。 否则就是异步的。
3. setState 同步执行的情况下， DOM也会被同步更新，也就意味着如果多次 setState ，会导致多次更新，这是毫无意义并且浪费性能的。
```

在react17中提供了 unstable_batchedUpdates 函数，用来合并批量操作。在请求后台接口，返回数据时使用unstable_batchedUpdates函数来减少渲染次数，优化,
```javaScript
const btn2 = () => {
  setTimeout(() => {
    unstable_batchedUpdates(() => {
      setCount(prev => prev + 1)
      setCount(prev => prev + 2)
    })
  }, 0)
}
```

* React18就统一的采用更新策略，可以不用考虑render渲染次数，带来的性能问题。

### 前言：legacy 模式和 concurrent 模式(并发，Concurrent)
### concurrent 模式
通过ReactDOM.unstable_createRoot(rootNode).render(<App />)方式创建的应用，则为concurrent模式，这个模式目前只是一个实验阶段的产物

* createRoot调用createRootImpl创建fiberRootNode和rootNode
* 创建完Fiber节点后，调用ReactDOMRoot.prototype.render执行updateContainer，然后scheduleUpdateOnFiber异步调度performConcurrentWorkOnRoot进入render阶段和commit阶段

### legacy 模式
通过ReactDOM.render(<App />, rootNode)方式创建应用，则为 legacy 模式

legacy 模式在合成事件中有自动批处理的功能，但仅限于一个浏览器任务。非 React 事件想使用这个功能必须使用 unstable_batchedUpdates

legacy模式是我们常用的，它构建dom的过程是同步的，所以在render的reconciler中，如果diff的过程特别耗时，那么导致的结果就是js一直阻塞高优先级的任务(例如用户的点击事件)，表现为页面的卡顿，无法响应

* render调用legacyRenderSubtreeIntoContainer，最后createRootImpl会调用到createFiberRoot创建fiberRootNode,然后调用createHostRootFiber创建rootFiber，其中fiberRootNode是整个项目的的根节点，rootFiber是当前应用挂在的节点，也就是ReactDOM.render调用后的根节点

* 创建完Fiber节点后，legacyRenderSubtreeIntoContainer调用updateContainer创建创建Update对象挂载到updateQueue的环形链表上，然后执行scheduleUpdateOnFiber调用performSyncWorkOnRoot进入render阶段和commit阶段

### 类组件中的 this.setState 结论：
在legacy模式中，更新可能为同步，也可能为异步；
在concurrent模式中，一定是异步。

* 1.当直接调用时this.setState时，为异步更新；
```javaScript
const [count, setCount] = useState(0)

如果我们在同步函数或者在异步回调中调用 setCount 后，打印 count，都是旧值。此时，setState 是异步的。
```

* 2.当在异步函数的回调中调用this.setState，则为同步更新；
* 3.当放在自定义 DOM 事件的处理函数中时，也是同步更新。


### 为什么是异步？
setState 里的逻辑其实是同步的，但是，调用 setState 时，react 会对这一系列的 setter 做合并处理，异步更新该函数式组件对应的 hooks 链表里面的值，然后触发重渲染（re-renders），从这个角度上来说，setState 确实是一个"异步"操作；

# useEffect
memoizedState保存包含useEffect回调函数、依赖项等的链表数据结构effect。effect链表同时会保存在fiber.updateQueue中。

mount 时和 update 时涉及的主要方法都是 pushEffect，update 时判断依赖是否变化的原理和useCallback 一致。像上面提到的 memoizedState 存的是创建的 effect 对象的环状链表。

pushEffect 的作用：是创建 effect 对象，并将组件内的 effect 对象串成环状单向链表，放到fiber.updateQueue上面。即 effect 除了保存在 fiber.memoizedState 对应的 hook 中，还会保存在 fiber 的 updateQueue 中。

hook 内部的 effect 主要是作为上次更新的 effect，为本次创建 effect 对象提供参照（对比依赖项数组），updateQueue 的 effect 链表会作为最终被执行的主体，带到 commit 阶段处理。即 fiber.updateQueue 会在本次更新的 commit 阶段中被处理，其中 useEffect 是异步调度的，而 useLayoutEffect 的 effect 会在 commit 的 layout 阶段同步处理。等到 commit 阶段完成，更新应用到页面上之后，开始处理 useEffect 产生的 effect，简单说：

* useEffect 是异步调度，等页面渲染完成后再去执行，不会阻塞页面渲染。
* uselayoutEffect 是在 commit 阶段新的 DOM 准备完成，但还未渲染到屏幕前，同步执行。

## useEffect模拟生命周期的

第二个参数传递一个空数组, 模拟 componentDidMount

第二个参数传递依赖项，模拟 componentDidUpdate

第二个参数传递一个空数组，并且里面通过return的形式去调用一个方法，模拟 componentWillUnmount

```javaScript
// 1. componentDidMount 和 componentWillUnmount
// 通过使用 Hook，你可以把组件内相关的副作用组织在一起（例如创建订阅及取消订阅），而不要把它们拆分到不同的生命周期函数里
useEffect(()=>{
    console.log('componentDidMount')
    return () => {
        console.log('will unmount');
    }
}, [])

// 2. componentDidUpdate 1
useEffect(()=>{
  document.title = `You clicked ${count} times`;
  return()=>{
    // componentWillUnmount 执行的内容       
  }
}, [count])

// 3. componentDidUpdate 2
useEffect(() => console.log('mounted or updated'));

// shouldComponentUpdate, 只有 Parent 组件中的 count state 更新了，Child 才会重新渲染，否则不会。
/*
* React.memo 包裹一个组件来对它的 props 进行浅比较,但这不是一个 hooks，因为它的写法和 hooks 不同,其实React.memo 等效于 PureComponent，但它只比较 props。
* */ 
function Parent() {
  	const [count,setCount] = useState(0);
  	const child = useMemo(()=> <Child count={count} />, [count]);

  	return <>{count}</>
}

function Child(props) {
    return <div>Count:{props.count}</div>
}
```

### React 16.8 +
- 挂载
  1. `constructor`构造函数
  2. `getDerivedStateFromProps`
  3. `render`
  4. `componentDidMount`
- 更新
  1. `getDerivedStateFromProps`
  2. `shouldComponentUpdate`
  3. `render`
  4. `getSnapshotBeforeUpdate`
  5. `componentDidUpdate`
- 卸载
  1. `componentWillUnmount`

React从v16.3开始废弃 componentWillMount componentWillReceiveProps componentWillUpdate 三个钩子函数
```
shouldComponentUpdate(nextProps, nextState),有两个参数nextProps和nextState，表示新的属性和变化之后的state，返回一个布尔值，true表示会触发重新渲染，false表示不会触发重新渲染，默认返回true,我们通常利用此生命周期来优化React程序性能

getDerivedStateFromProps:static getDerivedStateFromProps(nextProps, prevState),这是个静态方法,当我们接收到新的属性想去修改我们state，可以使用getDerivedStateFromProps
```


## 1.effect 的执行时机
useEffect 需要先调度，在Layout 阶段完成后再异步执行。
请记得 React 会等待浏览器完成画面渲染之后才会延迟调用 `useEffect`，因此会使得额外操作很方便

与 `componentDidMount` 或 `componentDidUpdate` 不同，使用 `useEffect` 调度的 effect 不会阻塞浏览器更新屏幕，这让你的应用看起来响应更快。大多数情况下，effect 不需要同步地执行。在个别情况下（例如测量布局），有单独的 [`useLayoutEffect`]

###  useEffect 优点和缺点:useEffect 的回调函数是【异步宏任务】，在下一轮事件循环才会执行

根据 JS 线程与 GUI 渲染线程互斥原则，在 JS 中页面的渲染线程需要当前事件循环的宏任务与微任务都执行完，才会执行渲染线程，渲染页面后，退出渲染线程，控制权交给 JS 线程，再执行下一轮事件循环。

* 优点：这使得它适用于许多常见的副作用场景，比如设置订阅和事件处理等情况，因为绝大多数操作不应阻塞浏览器对屏幕的渲染更新。

* 缺点：产生二次渲染问题，第一次渲染的是旧的状态，接着下一个事件循环中，执行改变状态的函数，组件又携带新的状态渲染，在视觉上，就是二次渲染。

## useEffect的执行顺序问题，如果父组件和子组件同时存在useEffect究竟是谁先走？
答：子组件的useEffect先走
```
useEffect的执行是在commit之后，React的commit阶段是干什么的？简单来说，就是将DOM渲染到页面上。那么我们是否可以想到，useEffect其实是在页面已经渲染结束后，再触发的？
```

问题1-解析：按照这个执行逻辑来看的话：
* 父组件进入commit阶段，发现有Son组件需要渲染。

* 开始进行Son的生命周期, Son进入commit阶段，执行子组件的useEffect，Son渲染结束

* 父组件进行commit阶段，渲染完成，执行useEffect


# useLayoutEffect
其函数签名与 useEffect 相同，但它会在所有的 DOM 变更之后同步调用 effect。

渲染前执行的useLayoutEffect,在commit阶段的layout阶段同步执行

## useLayoutEffect 优缺点:useLayoutEffect发生在页面渲染到屏幕(用户可见)之前，useEffect发生在那之后
useLayoutEffect 与 componentDidMount、componentDidUpdate 生命周期钩子是【异步微任务】，在渲染线程被调用之前就执行。这意味着回调内部执行完才会更新渲染页面，没有二次渲染问题。
* 优点： 没有二次渲染问题，页面视觉行为一致。
* 缺点: 在回调内部有一些运行耗时很长的代码或者循环时，页面因为需要等 JS 执行完之后才会交给渲染线程绘制页面，等待时期就是白屏效果，即阻塞了渲染。

所以不要在useLayoutEffect做太多事情，阻塞渲染


# useRef
对于useRef(1)，memoizedState保存{current: 1}。

* mount 时：把传进来的 value 包装成一个含有 current 属性的对象，然后放在 memorizedState 属性上。

* update 时：直接返回，没做特殊处理

对于设置了 ref 的节点，什么时候 ref 值会更新？
组件在 commit 阶段的 mutation 阶段执行 DOM 操作，所以对应 ref 的更新也是发生在 mutation 阶段。

当 ref 对象内容发生变化时，`useRef` 并不会通知你。变更 `.current` 属性不会引发组件重新渲染。

`useRef` 返回一个可变的 ref 对象，其 `.current` 属性被初始化为传入的参数（`initialValue`）。返回的 ref 对象在组件的整个生命周期内保持不变。


一个常见的用例便是命令式地访问子组件：
```js
function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  const onButtonClick = () => {
    // `current` 指向已挂载到 DOM 上的文本输入元素
    inputEl.current.focus();
  };
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
```

# useMemo
对于useMemo(callback, [depA])，memoizedState保存[callback(), depA]

* mount 时：在 memorizedState 上放了一个数组，第一个元素是传入的回调函数，第二个是传入的 deps。
* update 时：更新的时候把之前的那个 memorizedState 取出来，和新传入的 deps 做下对比，如果没变，那就返回之前的回调函数，否则返回新传入的函数。


会在组件第一次渲染的时候执行，之后会在其依赖的变量发生改变时再次执行。
可以把它理解成vue里面的computed，是一种数据的缓存，而这个缓存依赖后面的第二个参数数组，如果这个数组里面传入的数据不变，那么这个useMemo返回的数据是之前里面return的数据。
返回对象： 使用 useMemo 对对象属性包一层。

两个参数：
第一个参数是个函数，返回的对象指向同一个引用，不会创建新对象；
第二个参数是个数组，只有数组中的变量改变时，第一个参数的函数才会返回一个新的对象。
```js
// count 作为依赖值传递进去，此时仅当 count 变化时才会重新执行 getNum 。
function Example() {
    const [count, setCount] = useState(1);
    const [val, setValue] = useState('');
 
    const getNum = useMemo(() => {
        return Array.from({length: count * 100}, (v, i) => i).reduce((a, b) => a+b)
    }, [count])

    return <div>
        <h4>总和：{getNum()}</h4>
        <div>
            <button onClick={() => setCount(count + 1)}>+1</button>
            <input value={val} onChange={event => setValue(event.target.value)}/>
        </div>
    </div>;
}
```

## useMemo和useCallback相同点和区别
useMemo和useCallback都会在组件第一次渲染的时候执行，之后会在其依赖的变量发生改变时再次执行；

并且这两个hooks都返回缓存的值，useMemo返回缓存的变量，useCallback返回缓存的函数。
相同点：
* useCallback 和 useMemo 参数相同，第一个参数是函数，第二个参数是依赖项的数组。
* useMemo、useCallback 都是使参数（函数）不会因为其他不相关的参数变化而重新渲染。
* 与 useEffect 类似，[] 内可以放入你改变数值就重新渲染参数（函数）的对象。如果 [] 为空就是只渲染一次，之后都不会渲染

主要区别是:
* React.useMemo 将调用 fn 函数并返回其结果，而 React.useCallback 将返回 fn 函数而不调用它。

## usecallback和usememo是不是值得大量使用？
我的意见是看 rerender 次数，是不是高频渲染简单组件，是的话一定加上，对于其他场景：

高频复杂组件：说明你设计的有问题，应该解耦一些逻辑，变成简单组件
低频复杂组件：随意
低频简单组件：随意

```
首先题主已经很明确了，useCallback，useMemo以及React.memo都是为了性能优化而存在的。这一点是正确的。稍微详细展开来讲，React.memo（和之前class API中提供的ShouldComponentUpdate基本一致）主要是为了在父组件渲染时防止对没有状态变化的子组件进行不必要的渲染，可以参考官方文档中的此例。

useMemo则是为了缓存在渲染过程中比较繁重的计算过程，官方文档的例子中也用了computeExpensiveValue这个命名来隐喻这个用法。

useCallback稍微有点特殊，虽说这就是一个useMemo的语法糖，但是一般js上创建一个函数需要的时间并不至于要缓存的程度，那为什么要专门给缓存函数的创建做一个语法糖呢？这就跟React.memo有关系了。

React.memo的默认第二参数是浅对比（shallow compare）上次渲染的props和这次渲染的props，如果你的组件的props中包含一个回调函数，并且这个函数是在父组件渲染的过程中创建的（见下例），那么每次父组件（下例中的MyComponent）渲染时，React是认为你的子组件（下例中的Button）props是有变化的，不管你是否对这个子组件用了React.memo，都无法阻止重复渲染。这时就只能用useCallback来缓存这个回调函数，才会让React（或者说js）认为这个prop和上次是相同的。
```

# useCallback
对于useCallback(callback, [depA])，memoizedState保存[callback, depA]。与useMemo的区别是，useCallback保存的是callback函数本身，而useMemo保存的是callback函数的执行结果。

* mount 时：在 memorizedState 上放了一个数组，第一个元素是传入的回调函数，第二个是传入的 deps。
* update 时：更新的时候把之前的那个 memorizedState 取出来，和新传入的 deps 做下对比，如果没变，那就返回之前的回调函数，否则返回新传入的函数。

useCallback() 起到了缓存的作用，即便父组件渲染了，useCallback() 包裹的函数也不会重新生成，会返回上一次的函数引用。

通过源码不难发现，useCallback 实现是通过暂存定义的函数，根据前后依赖比较是否更新暂存的函数，最后返回这个函数，从而产生闭包达到记忆化的目的。 这就直接导致了我想使用 useCallback 获取最新 state 则必须要将这个 state 加入依赖，从而产生新的函数。
```javaScript
// 装载阶段
function mountCallback(callback, deps) {
  // 获取对应的 hook 节点
  var hook = mountWorkInProgressHook();
  // 依赖为 undefiend，则设置为 null
  var nextDeps = deps === undefined ? null : deps;
  // 将当前的函数和依赖暂存
  hook.memoizedState = [callback, nextDeps];
  return callback;
}

// 更新阶段
function updateCallback(callback, deps) {
  var hook = updateWorkInProgressHook();
  var nextDeps = deps === undefined ? null : deps;
  // 获取上次暂存的 callback 和依赖
  var prevState = hook.memoizedState;

  if (prevState !== null) {
    if (nextDeps !== null) {
      var prevDeps = prevState[1];
      // 将上次依赖和当前依赖进行浅层比较，相同的话则返回上次暂存的函数
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }
    }
  }

  // 否则则返回最新的函数
  hook.memoizedState = [callback, nextDeps];
  return callback;
}

function areHookInputsEqual(nextDeps, prevDeps) {
  {
    if (ignorePreviousDependencies) {
      // Only true when this component is being hot reloaded.
      return false;
    }
  }

  if (prevDeps === null) {
    {
      error('%s received a final argument during this render, but not during ' + 'the previous render. Even though the final argument is optional, ' + 'its type cannot change between renders.', currentHookNameInDev);
    }

    return false;
  }

  {
    // Don't bother comparing lengths in prod because these arrays should be
    // passed inline.
    if (nextDeps.length !== prevDeps.length) {
      error('The final argument passed to %s changed size between renders. The ' + 'order and size of this array must remain constant.\n\n' + 'Previous: %s\n' + 'Incoming: %s', currentHookNameInDev, "[" + prevDeps.join(', ') + "]", "[" + nextDeps.join(', ') + "]");
    }
  }

  for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (objectIs(nextDeps[i], prevDeps[i])) {
      continue;
    }

    return false;
  }

  return true;
}
```


## useCallback的使用场景1：
父组件包含子组件，子组件接收一个函数作为 props ；通常而言，如果父组件更新了，子组件也会执行更新；但是大多数场景下，更新是没有必要的，我们可以借助 useCallback 来返回函数，然后把这个函数作为 props 传递给子组件；这样，子组件就能避免不必要的更新。
```js
//使用useCallback之后，仅当 count 发生变化时Child组件才会重新渲染，而val变化时，Child 组件是不会重新渲染的
function Parent() {
    const [count, setCount] = useState(1);
    const [val, setValue] = useState('');
 
    const getNum = useCallback(() => {
        return Array.from({length: count * 100}, (v, i) => i).reduce((a, b) => a+b)
    }, [count])
 
    return <div>
        <Child getNum={getNum} />
        <div>
            <button onClick={() => setCount(count + 1)}>+1</button>
            <input value={val} onChange={event => setValue(event.target.value)}/>
        </div>
    </div>;
}
 
const Child = React.memo(function ({ getNum }: any) {
    return <h4>总和：{getNum()}</h4>
})
```

## useCallback的使用场景2：
当 DemoComponent 组件自身或跟随父组件触发 render 时，handleClick 函数会被重新创建。 每次 render 时 ChildComponent 参数中会接受一个新的 onClick 参数，这会直接击穿 React.memo，导致性能优化失效，并联动一起 render。

当然，官方文档指出，在组件内部中每次跟随 render 而重新创建函数的开销几乎可以忽略不计。若不将函数传给自组件，完全没有任何问题，而且开销更小。
```js
const ChildComponent = React.memo(() => {
  // ...
  return <div>Child</div>;
});

function DemoComponent() {
  const [count, setCount] = React.useState(0);
  function handleClick() {
    // 业务逻辑
  }
  return <ChildComponent onClick={handleClick} />;
}
```

`用useCallback包裹：`
如果去除依赖，这时内部逻辑取得的 count 的值永远为初始值即 0，也就是拿不到最新的值。
如果将内部的逻辑作为 function 提取出来作为依赖，这会导致 useCallback 失效。
```js
const ChildComponent = React.memo(() => {
  // ...
  return <div>Child</div>;
});

function DemoComponent() {
  const [count, setCount] = React.useState(0);
  
  const handleClick = React.useCallback(() => {
    // 业务逻辑
    doSomething(count);
  }, []);

  return <ChildComponent onClick={handleClick} />;
}
```

### useCallback配合memo()使用
momo()一般配合useCallback() 或则：useMemo()起到了缓存的作用，即便父组件渲染了，useCallback() 包裹的函数也不会重新生成，会返回上一次的函数引用。
```javaScript
// 父组件
import React, { useCallback } from 'react'
 
function ParentComp () {
  const [ name, setName ] = useState('hi~')
  // 每次父组件渲染，返回的是同一个函数引用
  const changeName = useCallback((newName) => setName(newName), [])  
 
  return (
    <div>
      <button onClick={increment}>点击次数：{count}</button>
      <ChildComp name={name} onClick={changeName}/>
    </div>
  );
}


// 子
import React, { memo } from 'react'
  const ChildComp = memo(function ({ name, onClick }) {

  return <>
    <div>Child Comp ... {name}</div>
    <button onClick={() => onClick('hello')}>改变 name 值</button>
  </>
})
```


# React.memo() 和 shouldComponentUpdate
React.memo(type, compare)是一个高阶组件，接收两个参数，第一个参数是需要优化的组件，第二个是非必填的自定义的compare函数，如果不传则会使用默认的compare函数。通过compare比较新旧props是否“相同”，选择是重新渲染组件还是跳过渲染组件的操作并直接复用最近一次渲染的结果。

组件默认情况下其只会对 props 做浅层对比，遇到层级比较深的复杂对象时，表示力不从心了。对于特定的业务场景，可能需要类似 shouldComponentUpdate 这样的 API，这时通过 memo 的第二个参数来实现：

`注意：`
* shouldComponentUpdate return true 就会render。
```javaScript
// 在render函数调用前判断：如果前后state中Number不变，通过return false阻止render调用
shouldComponentUpdate(nextProps,nextState){
    if(nextState.Number == this.state.Number){
      return false
    }
}
```
* memo 返回 true 时，不会触发render
```javaScript
import React from "react";

function Child({seconds}){
    console.log('I am rendering');
    return (
        <div>I am update every {seconds} seconds</div>
    )
};

function isEqual(prevProps, nextProps) {
    if(prevProps.seconds===nextProps.seconds){
        // isEqual 返回 true 时，不会触发 render
        return true
    }else {
        // false render
        return false
    }

}

export default React.memo(Child,isEqual)
```

# forwardRef
ref必须指向dom元素而不是React组件
```javaScript
// 下面就是应用到React组件的错误示例：
const A=React.forwardRef((props,ref)=><B {...props} ref={ref}/>)


// 前面提到ref必须指向dom元素，那么正确方法就应用而生：
const  A=React.forwardRef((props,ref)=>(
<div ref={ref}>
	<B {...props} />
</div>
))
```


React.forwardRef 接受 渲染函数 作为参数。React 将使用 props 和 ref 作为参数来调用此函数。此函数应返回 React 节点。

用于将父组件创建的 ref 引用关联到子组件中的任意元素上，也可以理解为子组件向父组件暴露 DOM 引用。

除此之外，因为 ref 是为了获取某个节点的实例，但是函数式组件是没有实例的，不存在 this 的，这种时候是拿不到函数式组件的 ref 的，而 React.forwardRef 也能解决这个问题。

应用场景：
- 获取深层次子孙组件的 DOM 元素
- 获取直接 ref 引用的子组件为非 class 声明的函数式组件
- 传递 refs 到高阶组件

### forwardRef 获取子组件的Dom
父组件：
```javaScript
export function TemplateModal(props: TemplateModalProps) {
  const formRef: any = useRef()
	// 调用子组件的方法
  const handleCancel = () => {
    formRef.current.resetForm()
    onClose()
    cleanModalCache()
  }

  return (
		<AddForm ref={formRef} formValues={formValues} />
	)
}
```

子组件
```javaScript
export function AddForm(props: AddFormPrps, ref: any) {
  const [form] = Form.useForm()

	// 暴露组件的方法
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      const values = form.getFieldsValue()
      return values
    },
    resetForm: () => {
      form.resetFields()
    }
  }))

	return (
	      <Form
        form={form}
        name='template_form'
        layout='inline'
        onFinish={onFinish}
        initialValues={{ title: '', type: 0, tags: [] }}
      />
  )
}

const WrappedAddForm = forwardRef(AddForm)

export default WrappedAddForm
```

### 实战
父组件
```javaScript
import React, { useEffect, useRef } from 'react'
import Zoom from './zoom'

// 封装的Hooks⽤用use开头
const useChangeTitle = (title) => {
  useEffect(() => {
    document.title = title
  }, [title])
}

const App = ((props) => {
  useChangeTitle("⾃自定义修改标题Hooks")

  const zoomComRef = useRef<any>(null)

  const onGetRef = () => {
    const zoomImgRef = zoomComRef.current.getZoomImg()
  }

  return (
    <>
      <div>
        测试图片放大
      </div>
      <div onClick={() => onGetRef()}>获取子组件</div>
      <div>
        <Zoom ref={zoomComRef} />
      </div>
    </>
  );
})

export default App;
```

子组件
```javaScript
import React, { useRef, useImperativeHandle,forwardRef } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const ZoomImg = forwardRef((props, ref) => {

	const zoomImgRef = useRef<any>('');

	useImperativeHandle(ref, () => ({
		getZoomImg: () => {
			return zoomImgRef.current
		}
	}));

	return (
		<>
			<TransformWrapper
				onZoom={function noRefCheck() {
					console.log("ref:", zoomImgRef.current)
				}}
				initialScale={0.5}
				centerOnInit={true}
				maxScale={2}
				minScale={0.5}
				doubleClick={{ step: 0.7, disabled: false, excluded: [], }}
				panning={{ disabled: false, excluded: [] }}
				wheel={{ disabled: false, step: 0.2, activationKeys: [], excluded: [], touchPadDisabled: false, }}
			>
				<TransformComponent wrapperStyle={{ background: "rgba(0, 0, 0, 0.3)", maxWidth: '80vw', maxHeight: '80vh' }}>
					<img ref={zoomImgRef} src="https://prc5.github.io/react-zoom-pan-pinch/static/media/medium-image.12ec4e94.jpg" alt="test" />
				</TransformComponent>
			</TransformWrapper>
		</>
	);
})
export default ZoomImg;
```


# useReducer
useState的替代方案。它接收一个形如 `(state, action) => newState` 的 reducer，并返回当前的 state 以及与其配套的 `dispatch` 方法。（如果你熟悉 Redux 的话，就已经知道它如何工作了。）

在某些场景下，`useReducer` 会比 `useState` 更适用，例如 state 逻辑较复杂且包含多个子值，或者下一个 state 依赖于之前的 state 等。并且，使用 `useReducer` 还能给那些会触发深更新的组件做性能优化，因为你可以向子组件传递 `dispatch` 而不是回调函数

### 第一种初始化，将初始 state 作为第二个参数传入 `useReducer` 是最简单的方法：
```js
const initialState = {count: 0};

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
    </>
  );
}
/*
注意
React 会确保 dispatch 函数的标识是稳定的，并且不会在组件重新渲染时改变。这就是为什么可以安全地从 useEffect 或 useCallback 的依赖列表中省略 dispatch。
*/
```

### 第二种初始化,惰性初始化
你可以选择惰性地创建初始 state。为此，需要将 `init` 函数作为 `useReducer` 的第三个参数传入,这么做可以将用于计算 state 的逻辑提取到 reducer 外部，这也为将来对重置 state 的 action 做处理提供了便利：

```javaScript
function init(initialCount) {
  return {count: initialCount};
}

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    case 'reset':
      return init(action.payload);
    default:
      throw new Error();
  }
}

function Counter({initialCount}) {
  const [state, dispatch] = useReducer(reducer, initialCount, init);
  return (
    <>
      Count: {state.count}
      <button
        onClick={() => dispatch({type: 'reset', payload: initialCount})}>
        Reset
      </button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
    </>
  );
}
```

# useContext
任意一个后代元素都可以直接取到上下文的内容 不需要层层传递

很多优秀的React组件都通过Context来完成自己的功能，

比如react-redux的`<Provider />`，就是通过`Context`提供一个全局态的`store`，拖拽组件react-dnd，通过`Context`在组件中分发DOM的Drag和Drop事件。

路由组件react-router通过`Context`管理路由状态等等。在React组件开发中，如果用好`Context`，可以让你的组件变得强大，而且灵活。


调用了 `useContext` 的组件总会在 context 值变化时重新渲染。
当组件上层最近的 <MyContext.Provider> 更新时，该 Hook 会触发重渲染，并使用最新传递给 MyContext provider 的 context value 值。

即使祖先使用 React.memo 或 shouldComponentUpdate，也会在组件本身使用 useContext 时重新渲染。

如果重渲染组件的开销较大，你可以 [通过使用 memoization 来优化]

接收一个 context 对象（`React.createContext` 的返回值）并返回该 context 的当前值。

别忘记 `useContext` 的参数必须是 *context 对象本身*：

- **正确：** `useContext(MyContext)`
- **错误：** `useContext(MyContext.Consumer)`
- **错误：** `useContext(MyContext.Provider)`
```javaScript
const value = useContext(MyContext);
```

## 案例：在孙子组件中使用爷爷组件中定义的变量n,并且进行+1操作
```js
import React, { createContext, useContext, useReducer, useState } from 'react'
import ReactDOM from 'react-dom'

// 创造一个上下文
const C = createContext(null);

function App(){

  const [n,setN] = useState(0)

  return(
    // 指定上下文使用范围，使用provider,并传入读数据和写入据
    <C.Provider value={{n,setN}}>
      这是爷爷
      <Baba></Baba>
    </C.Provider>
  )
}

function Baba(){

  return(
    <div>
      这是爸爸
      <Child></Child>
    </div>
  )
}

function Child(){
  // 使用上下文，因为传入的是对象，则接受也应该是对象
  const {n,setN} = useContext(C)

  const add=()=>{
    setN(n=>n+1)
  };

  return(
    <div>
      这是儿子:n:{n}
      <button onClick={add}>+1</button>
    </div>
  )
}

ReactDOM.render(<App />,document.getElementById('root'));
```


## 使用 Context、useContext 和 useReducer 来管理状态
Context是 React 官方提供的一个管理数据的方法，他可以让我们避免一级一级地把数据沿着组件树传下来，详情可以参考官方文档
useReducer 则是 hooks 提供的一个类似于 redux 的 api，让我们可以通过 action 的方式来管理 context，或者 state

### 1-1.reducer.js
```js
import React, { useReducer } from "react";

const initialState = 0;
const myContext = React.createContext();

function reducer(state, action) {
  switch (action.type) {
    case "reset":
      return initialState;
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default:
      return state;
  }
}

const ContextProvider = props => {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <myContext.Provider value={{ state, dispatch }}>
      {props.children}
    </myContext.Provider>
  );
};

export { reducer, myContext, ContextProvider }; 
```
我们将所有需要用到 context 的组件放入到Context.Provider的子元素中，这样就可以获取到状态 state 和方法 dispatch。 

### 1-2.Counter.js
子组件中只需要通过useContext API获取这个状态
```js
import React, { useContext } from "react";
import { myContext } from "./reducer";

function Counter() {

  const { state, dispatch } = useContext(myContext);

  return (
    <div>
      Counter Count: {state.count}
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
    </div>
  );
}

export default Counter;
```

### 1-3.CounterTest.js 
```js
import React, { useContext } from "react";
import { myContext } from "./reducer";

function CounterTest() {
  const { state, dispatch } = useContext(myContext);
  return (
    <div>
      CounterTest Count: {state.count}
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
    </div>
  );
}

export default CounterTest;
```
 
### 1-4.index.js 
```js
import React from "react";
import { ContextProvider } from "./reducer";
import Counter from "./Counter";
import CounterTest from "./CounterTest";

const App = () => {
  return (
    <div className="App">
      <ContextProvider>
        <Counter />
        <CounterTest />
      </ContextProvider>
    </div>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

# 自定义hooks
有时候我们会想要在组件之间重用一些状态逻辑。目前为止，有两种主流方案来解决这个问题：[高阶组件]

自定义 Hook 可以让你在不增加组件的情况下达到同样的目的。

例如：
我们介绍了一个叫 `FriendStatus` 的组件，它通过调用 `useState` 和 `useEffect` 的 Hook 来订阅一个好友的在线状态。假设我们想在另一个组件里重用这个订阅逻辑。

首先，我们把这个逻辑抽取到一个叫做 `useFriendStatus` 的自定义 Hook 里：


### 场景
这两个组件的 state 是完全独立的。Hook 是一种复用*状态逻辑*的方式，它不复用 state 本身。事实上 Hook 的每次*调用*都有一个完全独立的 state —— 因此你可以在单个组件中多次调用同一个自定义 Hook。

自定义 Hook 更像是一种约定而不是功能。如果函数的名字以 “`use`” 开头并调用其他 Hook，我们就说这是一个自定义 Hook。 `useSomething` 的命名约定可以让我们的 linter 插件在使用 Hook 的代码中找到 bug。

你可以创建涵盖各种场景的自定义 Hook，如表单处理、动画、订阅声明、计时器，甚至可能还有更多我们没想到的场景
```js
import React, { useState, useEffect } from 'react';

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}

//它将 friendID 作为参数，并返回该好友是否在线：
```

现在我们可以在两个组件中使用它：
```js
function FriendStatus(props) {
  const isOnline = useFriendStatus(props.friend.id);

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}
```

```js
function FriendListItem(props) {
  const isOnline = useFriendStatus(props.friend.id);

  return (
    <li style={{ color: isOnline ? 'green' : 'black' }}>
      {props.friend.name}
    </li>
  );
}
```

## 2.定义你的 React Hook
还是上面的例子，我们把取数据的逻辑抽出来：
```javaScript
// useFetch.tsx
import { useState, useEffect } from "react";

export default function useFetch(url) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(data => setData(data));
  }, [] );

  return data;
}
```

在其他组件中引用：

```javaScript
import React from "react";
import useFetch from "./useFetch";

export default function DataLoader(props) {

  const data = useFetch("http://localhost:3001/links/");

  return (
    <div>
      <ul>
        {data.map(el => (
          <li key={el.id}>{el.title}</li>
        ))}
      </ul>
    </div>
  );
}
```
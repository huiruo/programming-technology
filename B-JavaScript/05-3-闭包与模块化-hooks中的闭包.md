## 闭包与模块化
本质上，JavaScript中并没有自己的模块概念，我们只能使用函数/自执行函数来模拟模块。
现在的前端工程中（ES6的模块语法规范），使用的模块，本质上都是函数或者自执行函数。
webpack等打包工具会帮助我们将其打包成为函数。

### 闭包跟模块之间的关系
根据闭包的生成条件与实践场景，模块中，非常容易生成闭包。
每一个JS模块都可以认为是一个独立的作用域，当代码执行时，该词法作用域创建执行上下文，如果在模块内部，创建了可供外部引用访问的函数时，就为闭包的产生提供了条件，只要该函数在外部执行访问了模块内部的其他变量，闭包就会产生。

<br />

## 定义一个React组件，并且在其他模块中使用，这和闭包有关系吗？来个简单的例子分析试试看。
在模块Counter.jsx中定义一个Counter组件
```javaScript
// Counter.jsx
export default function Counter() {}

// 然后在App模块中使用Counter组件
// App.jsx
import Counter from './Counter';
export default function App() {
 // todo
   return (
    <Counter />
  )
}
```

### 1-1.手动转换成伪代码
我们将上面闭包定义的A，B用本例中的名称替换一下：
自执行函数AppModule以及在AppModule中创建的函数App。

当App在render中执行时，访问了AppModule中的变量对象(定义了变量Counter)，那么闭包就会产生。
```javaScript
const CounterModule = (function() {
  return function Counter() {}
})()

const AppModule = (function() {
  const Counter = CounterModule;
  return function App() {
    return Counter();
  }
})()
```

## 例子2
定义一个名为State的模块
```javaScript
// state.js
let state = null;

export const useState = (value: number) => {
  // 第一次调用时没有初始值，因此使用传入的初始值赋值
  state = state || value;

  function dispatch(newValue) {
    state = newValue;
    // 假设此方法能触发页面渲染
    render();
  }

  return [state, dispatch];
}
```

### 2-1.在其他模块中引入并使用。这就是React Hooks能够让函数组件拥有内部状态的基本原理。

当useState在Demo中执行时，访问了state中的变量对象，那么闭包就会产生。
根据闭包的特性，state模块中的state变量，会持久存在。因此当Demo函数再次执行时，我们也能获取到上一次Demo函数执行结束时state的值。
```javaScript
import React from 'react';
import {useState} from './state';

function Demo() {
  // 使用数组解构的方式，定义变量
  const [counter, setCounter] = useState(0);

  return (
    <div onClick={() => setCounter(counter + 1)}>hello world, {counter}</div>
  )
}

export default Demo();
```

### 2-2.ReactHooks.js模块中发现useState的实现非常简单
到这里，其实基本上就对上号了。当然具体原理还要结合Fiber调度来理解，这里不继续深入。我们本文关注的重点仍然在闭包。

从上代码中知道，在某种条件下（更新时），ReactCurrentDispatcher.current就是HooksDispatcherOnUpdateInDEV，这个方法在ReactFiberHooks模块中声明。

继续阅读源码，发现HooksDispatcherOnUpdateInDEV是在该模块中定义的一个变量。

这个时候，我们就应该很自然的想到，奥，这里利用了闭包。

继续通过关键字，发现该变量被赋予了具体值。这些，就全是ReactHooks支持的api。
```javaScript
export function useState<S>(initialState: (() => S) | S) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}

function resolveDispatcher() {
  const dispatcher = ReactCurrentDispatcher.current;
  return dispatcher;
}
```

我们暂时只关注useState，去看看它是如何实现的。
```javaScript
useState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  currentHookNameInDev = 'useState';
  updateHookTypesDev();
  const prevDispatcher = ReactCurrentDispatcher.current;
  ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
  try {
    return updateState(initialState);
  } finally {
    ReactCurrentDispatcher.current = prevDispatcher;
  }
},
```

这里的关键是updateState(initialState)
```javaScript
function updateState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  return updateReducer(basicStateReducer, (initialState: any));
}
```

继续找到updateReducer，updateReducer的逻辑比较复杂。不过我们基于上面提到过的两个思路，看他修改了什么，与返回了什么，就能很快理清它。
```javaScript
function updateReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: I => S,
): [S, Dispatch<A>] {
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;
  // ...
  queue.lastRenderedReducer = reducer;

  if (numberOfReRenders > 0) {
    // This is a re-render. Apply the new render phase updates to the previous
    // work-in-progress hook.
    const dispatch: Dispatch<A> = (queue.dispatch: any);
    if (renderPhaseUpdates !== null) {
      // ...
    return [hook.memoizedState, dispatch];
  }

  // The last update in the entire queue
  const last = queue.last;
  // The last update that is part of the base state.
  const baseUpdate = hook.baseUpdate;
  const baseState = hook.baseState;

  // Find the first unprocessed update.
  let first;
  if (baseUpdate !== null) {
    if (last !== null) {
      // For the first update, the queue is a circular linked list where
      // `queue.last.next = queue.first`. Once the first update commits, and
      // the `baseUpdate` is no longer empty, we can unravel the list.
      last.next = null;
    }
    first = baseUpdate.next;
  } else {
    first = last !== null ? last.next : null;
  }
  if (first !== null) {
    // ...

    hook.memoizedState = newState;
    hook.baseUpdate = newBaseUpdate;
    hook.baseState = newBaseState;

    queue.lastRenderedState = newState;
  }

  const dispatch: Dispatch<A> = (queue.dispatch: any);
  return [hook.memoizedState, dispatch];
}
```

```
简化一下源代码，发现逻辑虽然复杂，但是核心的两个东西，还是在于修改了一个叫做hook的变量，以及返回了[hook.memoizedState, dispatch]。

这个hook是什么呢？在updateWorkInProgressHook方法中发现，hook是包含了memoizedState, baseState, queue, baseUpdate, next属性的一个对象。
```

```javaScript
function updateWorkInProgressHook(): Hook {
  if (nextWorkInProgressHook !== null) {
    workInProgressHook = nextWorkInProgressHook;
    nextWorkInProgressHook = workInProgressHook.next;

    currentHook = nextCurrentHook;
    nextCurrentHook = currentHook !== null ? currentHook.next : null;
  } else {
    invariant(
      nextCurrentHook !== null,
      'Rendered more hooks than during the previous render.',
    );
    currentHook = nextCurrentHook;

    const newHook: Hook = {
      memoizedState: currentHook.memoizedState,

      baseState: currentHook.baseState,
      queue: currentHook.queue,
      baseUpdate: currentHook.baseUpdate,

      next: null,
    };

    if (workInProgressHook === null) {
      workInProgressHook = firstWorkInProgressHook = newHook;
    } else {
      workInProgressHook = workInProgressHook.next = newHook;
    }
    nextCurrentHook = currentHook.next;
  }
  return workInProgressHook;
}
```

```
updateReducer返回的数组中，第一个值就是memoizedState。

因此可以得出结论，其实我们的状态，就缓存在hook.memoizedState这个值里。

继续观察updateWorkInProgressHook方法，发现该方法在内部修改了很多外部的变量，workInProgressHook，nextWorkInProgressHook，currentHook等。而memoizedState: currentHook.memoizedState。

因此，最终我们的状态，在update时，其实就是存在于currentHook。这也是利用了闭包。

OK，按照这个思路，React Hooks的源码逻辑很快就能分析出来，不过我们这里的重点是关注闭包在React Hooks中是如何扮演角色的。如果你已经体会到了闭包的作用，本文的目的就基本达到了。

需要注意的是，在更新时，调用的是updateReducer，但是在初始化时，调用的方法却不一样
```

# 流程图
```mermaid
flowchart TD
d1("ReactDOMRoot.prototype.render")-->d2(updateContainer)-->d3(scheduleUpdateOnFiber)-->d4("ensureRootIsScheduled")-->d5

d5("scheduleCallback$1(schedulerPriorityLevel,performConcurrentWorkOnRoot.bind(null, root))")--这个函数在render结束会开启commit阶段-->c2

c2("performConcurrentWorkOnRoot")--1-->e1

c2--2-->c3("flushPassiveEffects()")

%% begin work
e1(renderRootSync)-->e2("workLoopSync()")--循环-->e3("performUnitOfWork()")--1-->e4("beginWork$1()")
e3--2-->e5("completeUnitOfWork")-->e6("completeWork")

%% commit work
c2--3commit-->c4("finishConcurrentRender")-->c5("commitRoot")
```

## useState 挂载hooks函数;生成dispatch;挂载链表
接上面beginWork
```mermaid
flowchart TD
a1(beginWork)--case_IndeterminateComponent-->a2("return mountIndeterminateComponent()")-->a3(renderWithHooks)

a3-->a4("children=Component(props,secondArg)")--执行函数组件-->A1

A1("dev.useState(initialState)")-->A2("return dev.dispatcher.useState(initialState)")

A2-->b1("dom.useState(initialState)<br>return mountState(initialState)")-->b2("mountState(initialState)")


b2--1处理链表-->b5("hook=mountWorkInProgressHook()")
b2--2绑定dispatch-->b4("dispatchSetState.bind(null,currentlyRenderingFiber$1,queue)")
b2--3-->b3("返回[hook.memoizedState,dispatch]")
```

## setState 更新,重点在dispatchSetState
```mermaid
flowchart TD
A1("setData('努力哦')")-->a1(dispatchSetState)


a1--1update添加到环形链表-->a1a("enqueueUpdate$1")
a1--2对比新旧若无更新return-->a2a("objectIs(eagerState, currentState)")
a1--3调度更新-->a2("scheduleUpdateOnFiber()")-->a3("performSyncWorkOnRoot()")--暂时省略步骤-->b1

b1("beginWork(current,workInProgress,renderLanes)")--case_FunctionComponent-->b2("return updateFunctionComponent(current,workInProgress,..")
b2--1-->b3("renderWithHooks(current,workInProgress,Component,..")

b2--2-->b4("reconcileChildren")

b3--重点执行函数组件获取新值-->b5("children=Component(props,secondArg)")

b5--重新运行函数组件-->b6(useState)-->b7("updateState(initialState)")-->b8("retuen updateReducer")-->b9("return updateReducer(basicStateReducer)")

b9-->b10("updateReducer(reducer)返回最新[hook.memoizedState, dispatch]")
b10--1-->b11("hook=updateWorkInProgressHook(),hook:最新状态值和setState()")-->b13("拿到拷贝后的hook，可以计算新状态值了")
b10--2-->b12("读取队列,计算出最新状态，更新hook的状态")
```

# 前言
### 一些全局变量,在讲解源码之前，先认识一些 重要的全局变量：
* currentlyRenderingFiber：正在处理的函数组件对应 fiber。在执行 useState 等 hook 时，需要通过它知道当前 hook 对应哪个 fiber。

* workInProgressHook：挂载时正在处理的 hook 对象。我们会沿着 workInProcess.memoizedState 链表一个个往下走，这个 workInProgressHook 就是该链表的指针。

* currentHook：旧的 fiber 的 hooks 链表（current.memorizedState）指针。

* ReactCurrentDispatcher：全局对象，是一个 hook 调度器对象，其下有 useState、useEffect 等方法，是我们业务代码中 hook 底层调用的方法。ReactCurrentDispatcher 有三种：
  * ContextOnlyDispatcher：所有方法都会抛出错误，用于防止开发者在调用函数组件的其他时机调用 React Hook；
  * HooksDispatcherOnMount：挂载阶段用。比如它的 useState 要将初始值保存起来；
  * HooksDispatcherOnUpdate：更新阶段用。比如它的 useState 会无视传入的初始值，而是从链表中取出值。

### Fiber 数据结构:
主要分下面几块：
* 节点基础信息的描述
* 描述与其它 fiber 节点连接的属性
* 状态更新相关的信息:hook
```
hook 关联比较大的主要是 memoizedState 和 updateQueue 属性。函数组件会将内部用到的所有的 hook 通过单向链表的形式，保存在组件对应 fiber 节点的 memoizedState 属性上。

useEffect：memoizedState保存包含useEffect回调函数、依赖项等的链表数据结构effect。effect链表同时会保存在fiber.updateQueue中。

updateQueue 是 useEffect 产生的 effect 连接成的环状单向链表。
```
* 优先级调度相关

```javaScript
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {
  // 作为静态数据结构的属性
  this.tag = tag;      // Fiber对应组件的类型 Function/Class/Host...
  this.key = key;      // key属性
  this.elementType = null; // 大部分情况同type，某些情况不同，比如FunctionComponent使用React.memo包裹
  this.type = null;     // 对于 FunctionComponent，指函数本身，对于ClassComponent，指class，对于HostComponent，指DOM节点tagName
  this.stateNode = null;  // Fiber对应的真实DOM节点

  // 用于连接其他Fiber节点形成Fiber树
  this.return = null;  // 指向父级Fiber节点
  this.child = null;  // 指向子Fiber节点
  this.sibling = null; // 指向右边第一个兄弟Fiber节点
  this.index = 0;

  this.ref = null;

  // 作为动态的工作单元的属性 —— 保存本次更新造成的状态改变相关信息
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;  // class 组件 Fiber 节点上的多个 Update 会组成链表并被包含在 fiber.updateQueue 中。 函数组件则是存储 useEffect 的 effect 的环状链表。
  this.memoizedState = null; // hook 组成单向链表挂载的位置
  this.dependencies = null;

  this.mode = mode;

  // Effects
  this.flags = NoFlags;
  this.subtreeFlags = NoFlags;
  this.deletions = null;

  // 调度优先级相关
  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  // 指向该fiber在另一次更新时对应的fiber
  this.alternate = null;
}
```

### Hook 数据结构
hook 的 memoizedState 存的是当前 hook 自己的值。
```javaScript
const hook: Hook = {
  memoizedState: null, // 当前需要保存的值

  baseState: null,
  baseQueue: null, // 由于之前某些高优先级任务导致更新中断，baseQueue 记录的就是尚未处理的最后一个 update
  queue: null, // 内部存储调用 setValue 产生的 update 更新信息，是个环状单向链表

  next: null,  // 下一个hook
};
```

## 不同类型hook的memoizedState保存不同类型数据，具体如下：
比对是依赖项是否一致的时候，用的是Object.is：

Object.is() 与 === 不相同。差别是它们对待有符号的零和 NaN 不同，例如，=== 运算符（也包括 == 运算符）将数字 -0 和 +0 视为相等，而将 Number.NaN 与 NaN 视为不相等。

## 为什么要是环状链表？—— 在获取头部或者插入尾部的时候避免不必要的遍历操作
（上面提到的 fiber.updateQueue 、 useEffect 创建的 hook 对象中的 memoizedState 存的 effect 环状链表，以及 useState 的 queue.pending 上的 update 对象的环状链表，都是这个原因）

方便定位到链表的第一个元素。updateQueue 指向它的最后一个 update，updateQueue.next 指向它的第一个update。

若不使用环状链表，updateQueue 指向最后一个元素，需要遍历才能获取链表首部。即使将updateQueue指向第一个元素，那么新增update时仍然要遍历到尾部才能将新增的接入链表。

### useState
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

### useEffect
memoizedState保存包含useEffect回调函数、依赖项等的链表数据结构effect。effect链表同时会保存在fiber.updateQueue中。

mount 时和 update 时涉及的主要方法都是 pushEffect，update 时判断依赖是否变化的原理和useCallback 一致。像上面提到的 memoizedState 存的是创建的 effect 对象的环状链表。

pushEffect 的作用：是创建 effect 对象，并将组件内的 effect 对象串成环状单向链表，放到fiber.updateQueue上面。即 effect 除了保存在 fiber.memoizedState 对应的 hook 中，还会保存在 fiber 的 updateQueue 中。

hook 内部的 effect 主要是作为上次更新的 effect，为本次创建 effect 对象提供参照（对比依赖项数组），updateQueue 的 effect 链表会作为最终被执行的主体，带到 commit 阶段处理。即 fiber.updateQueue 会在本次更新的 commit 阶段中被处理，其中 useEffect 是异步调度的，而 useLayoutEffect 的 effect 会在 commit 的 layout 阶段同步处理。等到 commit 阶段完成，更新应用到页面上之后，开始处理 useEffect 产生的 effect，简单说：

* useEffect 是异步调度，等页面渲染完成后再去执行，不会阻塞页面渲染。
* uselayoutEffect 是在 commit 阶段新的 DOM 准备完成，但还未渲染到屏幕前，同步执行。

### useRef
对于useRef(1)，memoizedState保存{current: 1}。

* mount 时：把传进来的 value 包装成一个含有 current 属性的对象，然后放在 memorizedState 属性上。

* update 时：直接返回，没做特殊处理

对于设置了 ref 的节点，什么时候 ref 值会更新？
组件在 commit 阶段的 mutation 阶段执行 DOM 操作，所以对应 ref 的更新也是发生在 mutation 阶段。


### useMemo
对于useMemo(callback, [depA])，memoizedState保存[callback(), depA]

* mount 时：在 memorizedState 上放了一个数组，第一个元素是传入的回调函数，第二个是传入的 deps。
* update 时：更新的时候把之前的那个 memorizedState 取出来，和新传入的 deps 做下对比，如果没变，那就返回之前的回调函数，否则返回新传入的函数。

### useCallback
对于useCallback(callback, [depA])，memoizedState保存[callback, depA]。与useMemo的区别是，useCallback保存的是callback函数本身，而useMemo保存的是callback函数的执行结果。

* mount 时：在 memorizedState 上放了一个数组，第一个元素是传入的回调函数，第二个是传入的 deps。
* update 时：更新的时候把之前的那个 memorizedState 取出来，和新传入的 deps 做下对比，如果没变，那就返回之前的回调函数，否则返回新传入的函数。

### 例子1
```javaScript
function Test() {
  console.log('test-render')
  const [data, setData] = React.useState('改变我')
  const [showDiv, setShowDiv] = React.useState(false)

  const onClickText = () => {
    console.log('=useState=onClick');
    setData('努力哦')
    setShowDiv(!showDiv)
  }

  const onClickText2 = () => {
    console.log('=useState=onClick:', data);
  }

  React.useEffect(() => {
    console.log('=副作用-useEffect-->运行');
  }, [])

  React.useLayoutEffect(() => {
    console.log('=副作用-useLayoutEffect-->运行');
  }, [])

  return (
    <div id='div1' className='c1'>
      <button onClick={onClickText} className="btn">Hello world,Click me</button>
      <span>{data}</span>
      {showDiv && <div>被你发现了</div>}
      <div id='div2' className='c2'>
        <p>测试子节点</p>
      </div>
    </div>
  )
}
```
![](./img-react/hook连接成链表-实例.png)
圈起来1和2表示以下函数
```javaScript
React.useLayoutEffect(() => {
  console.log('=副作用-useLayoutEffect-->运行');
}, [])

React.useEffect(() => {
  console.log('=副作用-useEffect-->运行');
}, [])
```



### 示例2
```javaScript
function App() {
  const [value, setValue] = useState(0);
  const ref = useRef();
  ref.current = "some value";

  return (
    <div className="App">
      <h1>目前值：{value}</h1>
      <div>
        <button onClick={() => { 
          setValue(v => v + 1)
        }}>增加</button>
      </div>
    </div>
  );
}
```
可以从截图中看到，代码中使用的 useState 和 useRef 两个 hook 通过 next 连接成链表。另外 useState 的 hook 对象的 queue 中存储了调用 setValue 时用到的函数。

![](./img-react/hook连接成链表.png)


```javaScript
function App() {
  const [value, setValue] = useState(0);
  const ref = useRef();
  ref.current = "some value";

  return (
    <div className="App">
      <h1>目前值：{value}</h1>
      <div>
        <button onClick={() => { 
          setValue(v => v + 1)
        }}>增加</button>
      </div>
    </div>
  );
}
```

### Hooks 链表创建过程
每个 useXxx 的 hooks 都有 mountXxx 和 updateXxx 两个阶段。链表只创建一次，在 mountXxx 当中，后面都是 update。

以 useState 为例，mount 时会进入 HooksDispatcherOnMountInDEV 的 useState方法，最终执行 mountState

下面有详细解析

### 疑问
1、React Hooks 为什么不能写在条件语句中？

要保证 React Hooks 的顺序一致。

通过上面介绍已经知道各个 hook 在 mount 时会以链表的形式挂到 fiber.memoizedState上。
update 时会进入到 HooksDispatcherOnUpdateInDEV，执行不同 hook 的 updateXxx 方法。

最终会通过 updateWorkInProgressHook方法获取当前 hook 的对象，获取方式就是从当前 fiber.memoizedState上依次获取，遍历的是 mount 阶段创建的链表，故不能改变 hook 的执行顺序，否则会拿错。（updateWorkInProgressHook 也是个通用方法，updateXXX 都是走到这个地方）


函数组件的状态是保存在 fiber.memorizedState 中的。它是一个链表，保存调用 Hook 生成的 hook 对象，这些对象保存着状态值。当更新时，我们每调用一个 Hook，其实就是从 fiber.memorizedState 链表中读取下一个 hook，取出它的状态。

如果顺序不一致了或者数量不一致了，就会导致错误，取出了一个其他 Hook 对应的状态值。


# hooks基础
## 为什么hooks
主要是class组件比较冗余、生命周期函数写法不友好，functional组件更符合React编程思想
```javaScript
// hook的结构
export type Hook = {
  memoizedState: any, //上一次的state
  baseState: any,  // 当前state
  baseUpdate: Update<any, any> | null,  // update func
  next: Hook | null, // 链表
  queue: UpdateQueue<any, any> | null,  // 用于缓存多次action
};

const example ={
  baseQueue:null,
  baseState:"改变我",
  memoizedState:"改变我",
  next:{},
  queue:{},
}
```

```javaScript
import { useState, useEffect } from "react";
export default function App() {
  // 1. useState
  const [a, setA] = useState(1);
  // 2. useEffect
  useEffect(() => {
    console.log(`effect 1 created`);
  });
  // 3. useState
  const [b] = useState(2);
  // 4. useEffect
  useEffect(() => {
    console.log(`effect 2 created`);
  });
  return (
    <>
      <button onClick={() => setA(a + 1)}>{a}</button>
      <button>{b}</button>
    </>
  );
}
```

本示例中, function调用之后则会创建 4 个hook, 这时的内存结构如下:
![](./img-react/hooks链表结构.png)

状态Hook或副作用Hook都按照调用顺序存储在fiber.memoizedState链表中


## mountWorkInProgressHook作用:
给 memoizedState 链表加节点的逻辑,写过单链表的会比较理解，头节点要特殊处理
* 创建一个 hook
* 若无 hook 链，则创建一个 hook 链；若有，则将新建的 hook 加至末尾
* 将新建的这个 hook 挂载到 workInProgressHook 以及当前 fiber node 的 memoizedState 上

返回 workInProgressHook，也就是这个新建的 hook
```javaScript
function mountWorkInProgressHook() {
  var hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null
  };

  if (workInProgressHook === null) {
    // This is the first hook in the list
    console.log('=useState=dom=调用workInProgressHook 1:', { hook, workInProgressHook })
    // 链表中首个hook
    currentlyRenderingFiber$1.memoizedState = workInProgressHook = hook;
  } else {
    // Append to the end of the list
    // 将hook添加到链表末尾
    workInProgressHook = workInProgressHook.next = hook;
    console.log('=useState=dom=调用workInProgressHook 2:', { hook, workInProgressHook })
  }

  return workInProgressHook;
}
```


# setState 渲染

## 挂载useState

首先要注意的是，虽然 App 是一个 FunctionComponent，但是在 first paint 的时候，React 判断其为 IndeterminateComponent。
```javaScript
function beginWork(current, workInProgress, renderLanes) {
  // 省略代码
  console.log('%c=beginWork()===start1-初始化', 'color:magenta', { getFiberName: getFiberName(workInProgress), current, renderLanes, workInProgress })

  switch (workInProgress.tag) {
    case IndeterminateComponent:
      {
        console.log('%c=beginWork()==end 2 mountIndeterminateComponent', 'color:magenta')

        console.log(`%c=探究初始和hook=调用mountIndeterminateComponent`, 'color:blueviolet')
        return mountIndeterminateComponent(current, workInProgress, workInProgress.type, renderLanes);
  }
}

function mountIndeterminateComponent(_current, workInProgress, Component, renderLanes) {
  // 省略代码

  ReactCurrentOwner$1.current = workInProgress;

  console.log(`%c=探究初始和hook=mountIndeterminateComponent调用renderWithHooks 1`, 'color:blueviolet', { workInProgress, Component, props, context, renderLanes })

  value = renderWithHooks(null, workInProgress, Component, props, context, renderLanes);

  console.log(`%c=探究初始和hook=mountIndeterminateComponent调用renderWithHooks 返回值`, 'color:blueviolet', { value })

  // 省略代码
}
```

### renderWithHooks
1. workInProgress 赋值给全局变量 currentlyRenderingFiber，之后执行 hook 就能知道是给哪个组件更新状态了。
2. 选择 hook 调度器：根据是挂载还是更新阶段，ReactCurrentDispatcher 设置为对应 hook 调度器。
3. 调用函数组件，进行 render。函数组件内部会调用 Hook，并返回 ReactElement。
4. 重置全局变量，比如 currentlyRenderingFiber 设置回 null；ReactCurrentDispatcher 还原为 ContextOnlyDispatcher，防止在错误时机使用 Hook。

renderWithHooks 中，我们会根据组件处于不同的状态，给 ReactCurrentDispatcher.current 挂载不同的 dispatcher 。而在first paint 时，挂载的是ContextOnlyDispatcher
或则 HooksDispatcherOnMountInDEV
```javaScript
function renderWithHooks(current, workInProgress, Component, props, secondArg, nextRenderLanes) {
    renderLanes = nextRenderLanes;
    console.log(`%c=探究初始和hook=renderWithHooks挂载将workInProgress 赋值给全局变量 currentlyRenderingFiber,这样在调用 Hook 时就能知道对应的 fiber 是谁`, 'color:blueviolet')
    currentlyRenderingFiber$1 = workInProgress;

    {
      if (current !== null && current.memoizedState !== null) {
        ReactCurrentDispatcher$1.current = HooksDispatcherOnUpdateInDEV;
      } else if (hookTypesDev !== null) {
        // This dispatcher handles an edge case where a component is updating,
        // but no stateful hooks have been used.
        // We want to match the production code behavior (which will use HooksDispatcherOnMount),
        // but with the extra DEV validation to ensure hooks ordering hasn't changed.
        // This dispatcher does that.
        ReactCurrentDispatcher$1.current = HooksDispatcherOnMountWithHookTypesInDEV;
      } else {
        console.log(`%c=探究初始和hook=renderWithHooks dev挂载的是HooksDispatcherOnMountInDEV hook`, 'color:blueviolet', { current: HooksDispatcherOnMountInDEV })
        ReactCurrentDispatcher$1.current = HooksDispatcherOnMountInDEV;
      }
    }


    // 省略代码
    console.log(`%c=探究初始和hook=renderWithHooks挂载,将一些全局变量进行重置`, 'color:blueviolet')
    ReactCurrentDispatcher$1.current = ContextOnlyDispatcher;
    // 省略代码
}

HooksDispatcherOnMountInDEV = {
  readContext: function (context) {
    return readContext(context);
  },
  // 省略
  useState: function (initialState) {
    currentHookNameInDev = 'useState';
    mountHookTypesDev();
    var prevDispatcher = ReactCurrentDispatcher$1.current;
    ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnMountInDEV;

    try {
      console.log('=useState=dom=调用mountState', { initialState })
      return mountState(initialState);
    } finally {
      ReactCurrentDispatcher$1.current = prevDispatcher;
    }
  },
}
```

接下里走进我们的 App()，我们会调用 React.useState,这里的 dispatcher 就是上文挂载到 ReactCurrentDispatcher.current 的ContextOnlyDispatcher

## 分析1:dev里面的 useState
可见实际上执行的是 dispatcher.useState()，这里面会通过执行 resolveDispatcher() 得到一个 dispatcher，然后调用该对象上的 useState() 方法
```javaScript
function useState(initialState) {
  console.log('=useState=dev=调用mountState', { initialState })
  var dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}

function resolveDispatcher() {
  var dispatcher = ReactCurrentDispatcher.current;
  {
    if (dispatcher === null) {
      error('Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for' + ' one of the following reasons:\n' + '1. You might have mismatching versions of React and the renderer (such as React DOM)\n' + '2. You might be breaking the Rules of Hooks\n' + '3. You might have more than one copy of React in the same app\n' + 'See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.');
    }
  } // Will result in a null access error if accessed outside render phase. We
  // intentionally don't throw our own error because this is in a hot path.
  // Also helps ensure this is inlined.
  return dispatcher;
}
```

## dispatcher.useState就是dom里面的 useState()
可以见到结构：
```javaScript
hook.memoizedState = hook.baseState = initialState;
var queue = {
  pending: null,
  interleaved: null,
  lanes: NoLanes,
  dispatch: null,
  lastRenderedReducer: basicStateReducer,
  lastRenderedState: initialState
};
hook.queue = queue;
```

```javaScript
useState: function (initialState) {
  currentHookNameInDev = 'useState';
  mountHookTypesDev();
  var prevDispatcher = ReactCurrentDispatcher$1.current;
  ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnMountInDEV;

  try {
    console.log('=useState=调用mountState', { initialState })
    return mountState(initialState);
  } finally {
    ReactCurrentDispatcher$1.current = prevDispatcher;
  }
},
```

## 调用 mountState 函数
mountState 函数对 var hook = mountWorkInProgressHook()进行赋值:

### mountState 和 dispatchSetState.bind
1. 创建新的 hook 空对象，挂到 workInProcess.memorizedState 队列上（mountWorkInProgressHook 方法）。
2. dispatchSetState 绑定对应 fiber 和 queue，方便以后 setState 快速找到相关对象，最后返回状态值和更新状态方法。

dispatchSetState.bind(null, currentlyRenderingFiber$1, queue)

利用bind返回dispatch函数

这也是为什么虽然 dispatchSetState 本身需要三个参数，但我们使用的时候都是 setState(params)，只用传一个参数的原因。
```javaScript
function mountState(initialState) {
  var hook = mountWorkInProgressHook();

  if (typeof initialState === 'function') {
    // $FlowFixMe: Flow doesn't like mixed types
    initialState = initialState();
  }

  hook.memoizedState = hook.baseState = initialState;
  var queue = {
    pending: null,
    interleaved: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState
  };
  hook.queue = queue;

  var dispatch = queue.dispatch = dispatchSetState.bind(null, currentlyRenderingFiber$1, queue)
  console.log('=useState=dom=利用bind返回dispatch:', { dispatch })
  return [hook.memoizedState, dispatch];
}
```

# setState()-->dispatchSetState() 重点函数在这里触发组件更新
注意: 本示例中虽然同时执行了 2 次 dispatch, 会请求 3 次调度, 由于调度中心的节流优化, 最后只会执行一次渲染

之前 mountState 时，我们返回了一个绑定了 fiber、queue 参数的 dispatchSetState

第一个 setState 在被调用时会立即计算新状态，这是为了 做新旧 state 对比，决定是否更新组件。如果对比发现状态没变，继续计算下一个 setState 的新状态，直到找到为止。如果没找到，就不进行更新。

其后的 setState 则不会计算，等到组件重新 render 再计算。

为对比新旧状态计算出来的状态值，会保存到 update.eagerState，并将 update.hasEagerState 设置为 true，之后更新时通过它来直接拿到计算后的最新值。

dispatchSetState 会拿到对应的 fiber、queue（对应 hook 的 queue）、action（新的状态）。

创建一个 update 空对象；
1. 计算出最新状态，放入到 update.egerState。
2. 对比新旧状态是否相同（使用 Object.is 对比）。相同就不更新了，结束。不相同，进行后续的操作。
3. 将 update 放到 queue.interleaved 或 concurrentQueues 链表上（.new 和 .old 文件的逻辑差得有点多），之后更新阶段会搬到 queue.pending。
4. 将当前 fiber 的 lanes 设置为 SyncLane，这样后面的 setState 就不会立刻计算最新状态了，而是在更新阶段才计算。
5. 接着是调度更新（scheduleUpdateOnFiber），让调度器进行调度，执行更新操作
```javaScript
function dispatchSetState(fiber, queue, action) {
  {
    if (typeof arguments[3] === 'function') {
      error("State updates from the useState() and useReducer() Hooks don't support the " + 'second callback argument. To execute a side effect after ' + 'rendering, declare it in the component body with useEffect().');
    }
  }

  console.log('=useState=app=dispatchSetState:', { fiber, queue, action })

  var lane = requestUpdateLane(fiber);
  // 创建一个 update 更新对象
  var update = {
    lane: lane,
    action: action,
    hasEagerState: false,
    eagerState: null,
    next: null
  };

  if (isRenderPhaseUpdate(fiber)) {
    console.log('=useState=app=dispatchSetState调用enqueueRenderPhaseUpdate渲染阶段更新:')
    enqueueRenderPhaseUpdate(queue, update);
  } else {
    enqueueUpdate$1(fiber, queue, update);
    var alternate = fiber.alternate;

    if (fiber.lanes === NoLanes && (alternate === null || alternate.lanes === NoLanes)) {
      // The queue is currently empty, which means we can eagerly compute the
      // next state before entering the render phase. If the new state is the
      // same as the current state, we may be able to bail out entirely.

      var lastRenderedReducer = queue.lastRenderedReducer;
      console.log('=useState=app=dispatchSetState 计算新状态', { queue, lastRenderedReducer })

      if (lastRenderedReducer !== null) {
        var prevDispatcher;

        {
          prevDispatcher = ReactCurrentDispatcher$1.current;
          ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
        }

        try {
          // currentState 旧值
          var currentState = queue.lastRenderedState;
          // currentState 新值
          var eagerState = lastRenderedReducer(currentState, action); // Stash the eagerly computed state, and the reducer used to compute
          // it, on the update object. If the reducer hasn't changed by the
          // time we enter the render phase, then the eager state can be used
          // without calling the reducer again.

          update.hasEagerState = true;
          update.eagerState = eagerState;
          console.log('=useState=app=dispatchSetState 对比新旧状态是否不同', { eagerState, currentState, objectIs: objectIs(eagerState, currentState) })
          if (objectIs(eagerState, currentState)) {
            // Fast path. We can bail out without scheduling React to re-render.
            // It's still possible that we'll need to rebase this update later,
            // if the component re-renders for a different reason and by that
            // time the reducer has changed.
            return;
          }
        } catch (error) {// Suppress the error. It will throw again in the render phase.
        } finally {
          {
            ReactCurrentDispatcher$1.current = prevDispatcher;
          }
        }
      }
    }

    var eventTime = requestEventTime();
    console.log('=useState=app=dispatchSetState调用scheduleUpdateOnFiber调度fiber更新')
    var root = scheduleUpdateOnFiber(fiber, lane, eventTime);

    if (root !== null) {
      entangleTransitionUpdate(root, queue, lane);
    }
  }

  markUpdateInDevTools(fiber, lane);
}
```


### enqueueUpdate$1
1. 创建update对象, 其中update.lane代表优先级(可回顾fiber 树构造(基础准备)中的update优先级).

2. 将update对象添加到hook.queue.pending环形链表.
  * 环形链表的特征: 为了方便添加新元素和快速拿到队首元素(都是O(1)), 所以pending指针指向了链表中最后一个元素.
  * 链表的使用方式可以参考React 算法之链表操作
```javaScript
  function enqueueUpdate$1(fiber, queue, update, lane) {
    if (isInterleavedUpdate(fiber)) {
      var interleaved = queue.interleaved;

      if (interleaved === null) {
        // This is the first update. Create a circular list.
        update.next = update; // At the end of the current render, this queue's interleaved updates will
        // be transferred to the pending queue.

        pushInterleavedQueue(queue);
      } else {
        update.next = interleaved.next;
        interleaved.next = update;
      }

      queue.interleaved = update;
    } else {

      console.log('=useState=app=enqueueUpdate$1将update对象添加到hook.queue.pending队列')
      var pending = queue.pending;

      if (pending === null) {
        // This is the first update. Create a circular list.
        console.log('=useState=app=首个update, 创建一个环形链表')
        update.next = update;
      } else {
        update.next = pending.next;
        pending.next = update;
      }

      queue.pending = update;
    }
  }
```

## update会执行useState 获取最新状态
见流程图，children=Component(props,secondArg) 重新执行函数组件获取最新状态

fiber树构造(对比更新)阶段, 执行updateFunctionComponent->renderWithHooks时再次调用function

注意: 在renderWithHooks函数中已经设置了workInProgress.memoizedState = null, 等待调用function时重新设置.

接下来调用function, 同样依次调用useState, useEffect, useState, useEffect. 而useState, useEffect在fiber对比更新时分别对应updateState->updateReducer和updateEffect->updateEffectImpl

无论useState, useEffect, 内部调用updateWorkInProgressHook获取一个 hook.
```javaScript
HooksDispatcherOnUpdateInDEV = {
  // 省略代码
  useState: function (initialState) {
        currentHookNameInDev = 'useState';
        updateHookTypesDev();
        var prevDispatcher = ReactCurrentDispatcher$1.current;
        ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;

        try {
          console.log('=updateState=4', { initialState })
          return updateState(initialState);
        } finally {
          ReactCurrentDispatcher$1.current = prevDispatcher;
        }
  }
  // 省略代码
}

```

### updateState-->updateReducer作用:最后更新 hook 上的参数，返回 state 和 dispatch。
updateReducer 主要工作有两个：

从 current.memorizedState 拷贝 hook 到 workInProcess 下（updateWorkInProgressHook 方法）。
将 hook.queue.pending 队列合并到 currentHook.baseQueue 下，然后遍历队列中的 update 对象，使用 action 和 reducer 计算出最新的状态，更新到 hook 上，最后返回新状态和新 setState。

updateReducer，只是 reducer 是固定好的，作用就是用来直接执行 setValue（即 dispath） 函数传进来的 action，即 useState 其实是对 useReducer 的一个封装，只是 reducer 函数是预置好的。

useState 本质上在使用 useReducer，在 React 源码层提供了特殊的名为 basicStateReducer 的 reducer
```javaScript
function updateState(initialState) {
  console.log('=updateState调用updateReducer')
  return updateReducer(basicStateReducer);
}

// reducer 函数
function basicStateReducer(state, action) {
  // $FlowFixMe: Flow doesn't like mixed types
  return typeof action === 'function' ? action(state) : action;
}
```
```javaScript
// setReducer 更新阶段对应的 updateReducer
function updateReducer(reducer, initialArg, init) {
  // ----- 【1】 拷贝 hook（current -> workInProcess），并返回这个 hook -----
  const hook = updateWorkInProgressHook();
  
  // ----- 【2】 读取队列，计算出最新状态，更新 hook 的状态 -----
  // ...
}
```

### 继续看 updateWorkInProgressHook()
updateWorkInProgressHook函数逻辑简单: 目的是为了让currentHook和workInProgressHook两个指针同时向后移动.
1. 由于renderWithHooks函数设置了workInProgress.memoizedState=null, 所以workInProgressHook初始值必然为null, 只能从currentHook克隆.

2. 而从currentHook克隆而来的newHook.next=null, 进而导致workInProgressHook链表需要完全重建.

可以看到:
1. 以双缓冲技术为基础, 将current.memoizedState按照顺序克隆到了workInProgress.memoizedState中.
2. Hook经过了一次克隆, 内部的属性(hook.memoizedState等)都没有变动, 所以其状态并不会丢失.

总结：
renderWithHooks函数, 把Hook链表挂载到了fiber.memoizedState之上. 利用fiber树内部的双缓冲技术, 实现了Hook从current到workInProgress转移, 进而实现了Hook状态的持久化.

该方法中，currentHook 设置为 current.memoizedState 链表的下一个 hook，拷贝它到 currentlyRenderingFiber.memoizedState 链表上，返回这个 hook。


```javaScript
function updateWorkInProgressHook() {
  // 1. 移动 currentHook 指针
  //（来自 current.memoizedState 链表）
  var nextCurrentHook; 
  if (currentHook === null) {
    var current = currentlyRenderingFiber.alternate;
    if (current !== null) {
      nextCurrentHook = current.memoizedState;
    } else {
      nextCurrentHook = null;
    }
  } else {
    nextCurrentHook = currentHook.next;
  }

  // 2. 移动 workInProgressHook 指针
  //（来自 currentlyRenderingFiber.memoizedState 链表）
  var nextWorkInProgressHook;
  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
  } else {
    nextWorkInProgressHook = workInProgressHook.next;
  }

  if (nextWorkInProgressHook !== null) {
    // 这种情况为 “渲染时更新逻辑”（在 render 时调用了 setState）
    // 为了更聚焦普通情况，这里不讨论
    workInProgressHook = nextWorkInProgressHook;
    nextWorkInProgressHook = workInProgressHook.next;
    currentHook = nextCurrentHook;
  } else {
    // 3. 渲染时不更新，nextWorkInProgressHook 就一定是 null
    if (nextCurrentHook === null) {
      throw new Error('Rendered more hooks than during the previous render.');
    }

    currentHook = nextCurrentHook;
    var newHook = {
      memoizedState: currentHook.memoizedState,
      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,
      next: null // next 就不拷贝了
    };

    // 4. 经典单链表末尾加节点写法
    if (workInProgressHook === null) {
      currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
    } else {
      workInProgressHook = workInProgressHook.next = newHook;
    }
  }

  // 5. 返回拷贝 hook 对象
  return workInProgressHook;
}
```

拿到拷贝后的hook，可以计算新状态值了。

首先将 hook.queue.pending 队列合并到 currentHook.baseQueue 下。该队列包含了一系列 update 对象（因为可能调用了多次 setState），里面保存有 setState 传入的最新状态值（函数或其他值）。

然后遍历 update 计算出最新状态，保存回 hook，并返回最新状态值和 setState 方法。
```javaScript
function updateReducer(reducer, initialArg, init) {
  // ----- 【1】 拷贝 hook（current -> workInProcess），并返回这个 hook ----
  const hook = updateWorkInProgressHook();
  
  // ----- 【2】 读取队列，计算出最新状态，更新 hook 的状态 -----
  // 取出 hook.queue 链表，添加到 current.baseQueue 末尾
  const queue = hook.queue;
  queue.lastRenderedReducer = reducer;
  const current = currentHook;
  let baseQueue = current.baseQueue;
  const pendingQueue = queue.pending;
  if (pendingQueue !== null) {
    if (baseQueue !== null) {
      const baseFirst = baseQueue.next;
      const pendingFirst = pendingQueue.next;
      baseQueue.next = pendingFirst;
      pendingQueue.next = baseFirst;
    }
    current.baseQueue = baseQueue = pendingQueue;
    queue.pending = null;
  }

  // 处理更新队列
  if (baseQueue !== null) {
    const first = baseQueue.next;
    let newState = current.baseState;

    let newBaseState = null;
    let newBaseQueueFirst = null;
    let newBaseQueueLast = null;
    let update = first;
  
    // 循环，根据 baseQueue 链表下的 update 对象计算新状态
    do {   
      // 删掉了一些跳过更新的逻辑

      if (update.hasEagerState) {
        // 为了对比新旧状态来决定是否更新，所计算的新状态。
        // 如果不同，给 update.hasEagerState 设置为 true
        // 新状态赋值给 update.eagerState
        newState = update.eagerState;
      } else {
        // 计算新状态
        const action = update.action;
        newState = reducer(newState, action);
      }     
      update = update.next;
    } while (update !== null && update !== first);   
    if (newBaseQueueLast === null) {
      newBaseState = newState;
    } else {
      newBaseQueueLast.next = newBaseQueueFirst;
    }
    if (!is(newState, hook.memoizedState)) {
      markWorkInProgressReceivedUpdate();
    }
  // 更新 hook 状态
    hook.memoizedState = newState;
    hook.baseState = newBaseState;
    hook.baseQueue = newBaseQueueLast;
    queue.lastRenderedState = newState;
  }
  const dispatch = queue.dispatch;
  return [hook.memoizedState, dispatch];
}
```

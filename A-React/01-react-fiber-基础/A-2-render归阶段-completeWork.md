## render 阶段的工作可以分为递阶段和归阶段。
- 其中递阶段会执行 beginWork()
- 归阶段会执行 completeWork()

## 1.completeWork
源码发生在performUnitOfWork函数中, 这个函数发生在workLoopSync中, 这个函数将被循环调用。
```
如果没有子Fiber节点则返回null, 只有当next为null的时候才会进入completeWork;

当前Fiber节点没有子节点时就进入了completeWork, 可以理解为递归阶段的归阶段。 

completeUnitOfWork从源码中可以看到是一个do while循环, 终止条件有completeWork !== null或者循环内return前的几个终止条件, 我们可以看到有一个是siblingFiber不为null的情况. 即当前的节点存在兄弟节点时并且已经没有子节点, 当前节点会结束completeWork, 跳出调用栈, 执行下一次循环, 进入兄弟节点的beginWork.当兄弟节点为null的时候, 那么completeWork会被赋值为returnFiber, 这个时候注意并没有用return跳出调用栈, 因为父级节点的beginWork已经被执行, 因此会进入父级节点的completeWork, 由此向上, 当completeWork为null时意味着归到根节点
```

completeWork的目的就是为了创建好对应的dom节点插入对应的父级节点的dom节点, 为其添加副作用标识, 再commit阶段将对应的节点展示到页面上并执行对应的副作用.


### 1-1.流程概览
类似 beginWork，completeWork 也是针对不同 fiber.tag 调用不同的处理逻辑。
```javaScript
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  const newProps = workInProgress.pendingProps;

  switch (workInProgress.tag) {
    case IndeterminateComponent:
    case LazyComponent:
    case SimpleMemoComponent:
    case FunctionComponent:
    case ForwardRef:
    case Fragment:
    case Mode:
    case Profiler:
    case ContextConsumer:
    case MemoComponent:
      return null;
    case ClassComponent: {
      // ...省略
      return null;
    }
    case HostRoot: {
      // ...省略
      updateHostContainer(workInProgress);
      return null;
    }
    case HostComponent: {
      // ...省略
      return null;
    }
  // ...省略
```
我们重点关注页面渲染所必须的HostComponent（即原生 DOM 组件对应的 Fiber 节点），其他类型 Fiber 的处理留在具体功能实现时讲解。

同时针对 HostComponent，判断update时我们还需要考虑 workInProgress.stateNode != null ?（即该 Fiber 节点是否存在对应的 DOM 节点）。
```javaScript
case HostComponent: {
  popHostContext(workInProgress);
  const rootContainerInstance = getRootHostContainer();
  const type = workInProgress.type;

  if (current !== null && workInProgress.stateNode != null) {
    // update的情况
    // ...省略
  } else {
    // mount的情况
    // ...省略
  }
  return null;
}
```

<br />

### 1-2.mount 时
我们省略了不相关的逻辑。可以看到，mount 时的主要逻辑包括三个：
* 为 Fiber 节点生成对应的 DOM 节点；
* 将子孙 DOM 节点插入刚生成的 DOM 节点中；
* 与 update 逻辑中的 updateHostComponent 类似的处理 props 的过程。
```javaScript
// mount的情况

// ...省略服务端渲染相关逻辑

const currentHostContext = getHostContext();
// 为fiber创建对应DOM节点
const instance = createInstance(
    type,
    newProps,
    rootContainerInstance,
    currentHostContext,
    workInProgress,
  );
// 将子孙DOM节点插入刚生成的DOM节点中
appendAllChildren(instance, workInProgress, false, false);
// DOM节点赋值给fiber.stateNode
workInProgress.stateNode = instance;

// 与update逻辑中的updateHostComponent类似的处理props的过程
if (
  finalizeInitialChildren(
    instance,
    type,
    newProps,
    rootContainerInstance,
    currentHostContext,
  )
) {
  markUpdate(workInProgress);
}
```

<br />

### 1-2.update 时
当 update 时，Fiber 节点已经存在对应 DOM 节点，所以不需要生成 DOM 节点。需要做的主要是处理 props，比如：
* onClick、onChange 等回调函数的注册；
* 处理style prop；
* 处理DANGEROUSLY_SET_INNER_HTML prop；
* 处理children prop。

我们去掉一些当前不需要关注的功能（比如 ref）。可以看到最主要的逻辑是调用 updateHostComponent 方法。
```javaScript
if (current !== null && workInProgress.stateNode != null) {
  // update 的情况
  updateHostComponent(
    current,
    workInProgress,
    type,
    newProps,
    rootContainerInstance,
  );
}
```
你可以从这里看到updateHostComponent 方法定义。

在 updateHostComponent 内部，被处理完的 props 会被赋值给 workInProgress.updateQueue，并最终会在 commit 阶段被渲染在页面上。
```javaScript
workInProgress.updateQueue = (updatePayload: any);
```
其中updatePayload为数组形式，他的奇数索引的值为变化的 prop key，偶数索引的值为变化的 prop value。


### 1-3.总结
还记得我们讲到：mount 时只会在 rootFiber 存在 Placement effectTag。那么commit 阶段是如何通过一次插入 DOM 操作（对应一个Placement effectTag）将整棵 DOM 树插入页面的呢？

原因就在于 completeWork 中的appendAllChildren 方法。

由于 completeWork 属于“归”阶段调用的函数，每次调用 appendAllChildren 时都会将已生成的子孙 DOM 节点插入当前生成的 DOM 节点下。那么当“归”到 rootFiber 时，我们已经有一个构建好的离屏 DOM 树。

<br />

## 1-4.effectList
至此render 阶段的绝大部分工作就完成了

还有一个问题：作为 DOM 操作的依据，commit 阶段需要找到所有有 effectTag 的 Fiber 节点并依次执行 effectTag 对应操作。难道需要在commit 阶段再遍历一次 Fiber 树寻找 effectTag !== null的Fiber 节点么？

这显然是很低效的。

为了解决这个问题，在 completeWork 的上层函数 completeUnitOfWork 中，每个执行完 completeWork 且存在 effectTag 的 Fiber 节点会被保存在一条被称为effectList的单向链表中。

effectList 中第一个 Fiber 节点保存在 fiber.firstEffect ，最后一个元素保存在 fiber.lastEffect。

类似 appendAllChildren，在“归”阶段，所有有 effectTag 的 Fiber 节点都会被追加在 effectList 中，最终形成一条以rootFiber.firstEffect 为起点的单向链表。
```
                       nextEffect         nextEffect
rootFiber.firstEffect -----------> fiber -----------> fiber
```

这样，在commit 阶段只需要遍历 effectList 就能执行所有 effect 了。

你可以在这里看到这段代码逻辑。

借用 React 团队成员Dan Abramov的话：effectList 相较于 Fiber 树，就像圣诞树上挂的那一串彩灯。

### 1-5.流程结尾
至此，render 阶段全部工作完成。在 performSyncWorkOnRoot 函数中 fiberRootNode 被传递给 commitRoot 方法，开启commit 阶段工作流程。
```javaScript
commitRoot(root);
```

## update流程
update流程我们只需抓住与mount的不同：current不为null，由于二者的不同主要体现在render阶段，因为我们分别分析beginWork与completeWork的不同。

## 一.beginWork
beginWork的逻辑总体分两段，第一段会根据current的状态进入不同逻辑，
我们来分析第一段逻辑中current不为null的逻辑：

通过一系列判断逻辑判断当前节点是否可复用，用didReceiveUpdate来标记，
若可复用则走attemptEarlyBailoutIfNoScheduledUpdate。调用栈如下:
```
顾名思义，会直接克隆一个fiber节点并返回。
attemptEarlyBailoutIfNoScheduledUpdate =>bailoutOnAlreadyFinishedWork=>cloneChildFibers
```

```javascript
if (current !== null) {
  // 通过一系列判断逻辑判断当前节点是否可复用，用didReceiveUpdate来标记，
  // 若可复用则走attemptEarlyBailoutIfNoScheduledUpdate。
  var oldProps = current.memoizedProps;
  var newProps = workInProgress.pendingProps;

  if (oldProps !== newProps || hasContextChanged() || ( // Force a re-render if the implementation changed due to hot reload:
    workInProgress.type !== current.type)) {
    // If props or context changed, mark the fiber as having performed work.
    // This may be unset if the props are determined to be equal later (memo).
    didReceiveUpdate = true;
  } else {
    // Neither props nor legacy context changes. Check if there's a pending
    // update or context change.
    var hasScheduledUpdateOrContext = checkScheduledUpdateOrContext(current, renderLanes);

    if (!hasScheduledUpdateOrContext && // If this is the second pass of an error or suspense boundary, there
      // may not be work scheduled on `current`, so we check for this flag.
      (workInProgress.flags & DidCapture) === NoFlags) {
      // No pending updates or context. Bail out now.
      didReceiveUpdate = false;
      // bailoutOnAlreadyFinishedWork=> cloneChildFibers 顾名思义，会直接克隆一个fiber节点并返回。
      return attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes);
    }

    if ((current.flags & ForceUpdateForLegacySuspense) !== NoFlags) {
      // This is a special case that only exists for legacy mode.
      // See https://github.com/facebook/react/pull/19216.
      didReceiveUpdate = true;
    } else {
      // An update was scheduled on this fiber, but there are no new props
      // nor legacy context. Set this to false. If an update queue or context
      // consumer produces a changed value, it will set this to true. Otherwise,
      // the component will assume the children have not changed and bail out.
      didReceiveUpdate = false;
    }
  }
}
```

### 1-2. beginWork第二阶段
beginWork第二阶段的逻辑是mount与update共用的，当节点无法复用时会调用 reconcileChildren 生成子节点，
其内部会根据current是否存在进入 mountChildFibers（current为null）或 reconcileChildFibers（current不为null），

我们已经知道这两者的逻辑基本是相同的，只是 reconcileChildFibers 会为当前fiber打上 flags，它代表当前dom需要执行的操作（插入，更新，删除等），

以插入（Placement）为例，他会在 placeSingleChild 方法中为当前节点打上Placement的标记。
```javascript
function placeSingleChild(newFiber: Fiber): Fiber {
   // shouldTrackSideEffects代表需要追踪副作用，update时会将其标记为true
   // 当前fiber不存在dom实例时，才可标记Placement
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      newFiber.flags |= Placement;
    }
    return newFiber;
  }
```
另外，由于mount时current不存在，因此reconcileChildFibers不会有对比更新的逻辑，直接创建节点，而update时则会将current与当前的ReactElement
做对比生成WIP，也就是diff算法，具体实现细节这里不展开


## 二.complete阶段
我们已经知道，mount时completeWork会直接创建dom实例，而update会调用updateHostComponent，我们来分析其实现逻辑:
```javascript
updateHostComponent = function(
    current: Fiber,
    workInProgress: Fiber,
    type: Type,
    newProps: Props,
    rootContainerInstance: Container,
  ) {
    const oldProps = current.memoizedProps;
    if (oldProps === newProps) {
      return;
    }
    const instance: Instance = workInProgress.stateNode;
    const currentHostContext = getHostContext();
    // 对比props 生成updatePayload
    const updatePayload = prepareUpdate(
      instance,
      type,
      oldProps,
      newProps,
      rootContainerInstance,
      currentHostContext,
    );
    workInProgress.updateQueue = (updatePayload: any);
    if (updatePayload) {
      markUpdate(workInProgress);
    }
};
```

在新旧props不同时调用prepareUpdate，他会对比新旧props并生成updatePayload，其调用栈如下:
```
prepareUpdate =>
diffProperties
```

diffProperties内部主逻辑是对props进行两轮循环，分别处理属性删除与属性新增的情况，最终返回updatePayload，这是一个数组，
第i项和第i+1项分别是更新后的的key和value。他会在mutation阶段被用于更新节点属性。
updateHostComponent的最后调用进行markUpdate，赋值更新的flags（Update）。
```javascript
function diffProperties(
  domElement: Element,
  tag: string,
  lastRawProps: Object,
  nextRawProps: Object,
  rootContainerElement: Element | Document,
): null | Array<mixed> {
  let updatePayload: null | Array<any> = null;
  let lastProps: Object;
  let nextProps: Object;
  //处理新旧props 针对表单标签做特殊处理
  switch (tag) {
    case 'input':
      lastProps = ReactDOMInputGetHostProps(domElement, lastRawProps);
      nextProps = ReactDOMInputGetHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    case 'select':
      lastProps = ReactDOMSelectGetHostProps(domElement, lastRawProps);
      nextProps = ReactDOMSelectGetHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    case 'textarea':
      lastProps = ReactDOMTextareaGetHostProps(domElement, lastRawProps);
      nextProps = ReactDOMTextareaGetHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    default:
      lastProps = lastRawProps;
      nextProps = nextRawProps;
      if (
        typeof lastProps.onClick !== 'function' &&
        typeof nextProps.onClick === 'function'
      ) {
        // TODO: This cast may not be sound for SVG, MathML or custom elements.
        trapClickOnNonInteractiveElement(((domElement: any): HTMLElement));
      }
      break;
  }

  assertValidProps(tag, nextProps);

  let propKey;
  let styleName;
  let styleUpdates = null;
  for (propKey in lastProps) {
    if (
      nextProps.hasOwnProperty(propKey) ||
      !lastProps.hasOwnProperty(propKey) ||
      lastProps[propKey] == null
    ) {
      continue;
    }
    // 新无旧有时进入一下逻辑，即属性被删除
    if (propKey === STYLE) {
      const lastStyle = lastProps[propKey];
      // 将对应style属性置空
      for (styleName in lastStyle) {
        if (lastStyle.hasOwnProperty(styleName)) {
          if (!styleUpdates) {
            styleUpdates = {};
          }
          styleUpdates[styleName] = '';
        }
      }
    } else {
      // 将对应key及value（null）推入更新队列，
      (updatePayload = updatePayload || []).push(propKey, null);
    }
  }
  for (propKey in nextProps) {
    const nextProp = nextProps[propKey];
    const lastProp = lastProps != null ? lastProps[propKey] : undefined;
    if (
      !nextProps.hasOwnProperty(propKey) ||
      nextProp === lastProp ||
      (nextProp == null && lastProp == null)
    ) {
      continue;
    }
    // 新有旧无或新旧都有切不相等时进入以下逻辑

    // style属性特殊处理 总结如下
    // 新有旧无 推入style队列
    // 新旧都有 用新的
    // 新无旧有 将对应属性置空
    if (propKey === STYLE) {
      if (lastProp) {
        for (styleName in lastProp) {
          if (
            lastProp.hasOwnProperty(styleName) &&
            (!nextProp || !nextProp.hasOwnProperty(styleName))
          ) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = '';
          }
        }
        for (styleName in nextProp) {
          if (
            nextProp.hasOwnProperty(styleName) &&
            lastProp[styleName] !== nextProp[styleName]
          ) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = nextProp[styleName];
          }
        }
      } else {
        if (!styleUpdates) {
          if (!updatePayload) {
            updatePayload = [];
          }
          updatePayload.push(propKey, styleUpdates);
        }
        styleUpdates = nextProp;
      }
    } else {
      // 将对应key及value推入更新队列
      (updatePayload = updatePayload || []).push(propKey, nextProp);
    }
  }
  if (styleUpdates) {
    (updatePayload = updatePayload || []).push(STYLE, styleUpdates);
  }
  return updatePayload;
}
```

### 这个tag标识有什么用呢
```
render阶段组件更新会根据checkHasForceUpdateAfterProcessing，和checkShouldComponentUpdate来判断，

如果Update的tag是ForceUpdate，则 checkHasForceUpdateAfterProcessing 为true，当组件是PureComponent时;  checkShouldComponentUpdate 会浅比较state和props，所以当使用this.forceUpdate一定会更新.
```
```js
function resumeMountClassInstance(workInProgress, ctor, newProps, renderLanes) {
  var instance = workInProgress.stateNode;
  var oldProps = workInProgress.memoizedProps;
  instance.props = oldProps;
  var oldContext = instance.context;
  var contextType = ctor.contextType;
  var nextContext = emptyContextObject;
	...
  var shouldUpdate = checkHasForceUpdateAfterProcessing() || checkShouldComponentUpdate(workInProgress, ctor, oldProps, newProps, oldState, newState, nextContext);
  if (shouldUpdate) {
    // In order to support react-lifecycles-compat polyfilled components,
    // Unsafe lifecycles should not be invoked for components using the new APIs.
    if (!hasNewLifecycles && (typeof instance.UNSAFE_componentWillMount === 'function' || typeof instance.componentWillMount === 'function')) {
      if (typeof instance.componentWillMount === 'function') {
        instance.componentWillMount();
      }

      if (typeof instance.UNSAFE_componentWillMount === 'function') {
        instance.UNSAFE_componentWillMount();
      }
    }

    if (typeof instance.componentDidMount === 'function') {
      workInProgress.flags |= Update;
    }
  } else {
    // If an update was already in progress, we should schedule an Update
    // effect even though we're bailing out, so that cWU/cDU are called.
    if (typeof instance.componentDidMount === 'function') {
      workInProgress.flags |= Update;
    } // If shouldComponentUpdate returned false, we should still update the
    // memoized state to indicate that this work can be reused.


    workInProgress.memoizedProps = newProps;
    workInProgress.memoizedState = newState;
  } // Update the existing instance's state, props, and context pointers even

}
```
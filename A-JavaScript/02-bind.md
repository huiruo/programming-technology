### react 源码中的useState
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


## bind() 第一个参数为null

首先bind，第一个传null得话不改变this指向，而且可以在后续的调用中去传入参数
```javaScript
function multiply (x, y, z) {
    return x * y * z;
}
 
var double = multiply.bind(null, 2);
 
// Outputs: 24
console.log(double(3, 4));
```

例如这里第一次就传了x的值，那么yz的值就后续调用里面传入的。
call, apply, bind 都是用来改变this指向的。 
js是静态作用域，this语法可以看作动态作用域。
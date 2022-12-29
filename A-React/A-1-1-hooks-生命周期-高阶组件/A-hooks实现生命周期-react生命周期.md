### vue3
```javaScript
onBeforeMount(() => {
  console.log('组件挂载前onBeforeMount')
})
onMounted(() => {
  console.log('组件挂载后onMounted')
})

onBeforeUpdate(() => {
  console.log('组件更新前onBeforeUpdate')
})

onUpdated(() => {
  console.log('组件更新后onUpdated')
})

onBeforeUnmount(() => {
  console.log('组件销毁前onBeforeUnmount')
})
onUnmounted(() => {
  console.log('组件销毁后onUnmounted')
})
```

## 2-1.React 16.8 +
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

## 1.hooks下怎么模拟生命周期函数，模拟的生命周期和class中的生命周期有什么区别吗？
```javaScript
// componentDidMount 和 componentWillUnmount
// 通过使用 Hook，你可以把组件内相关的副作用组织在一起（例如创建订阅及取消订阅），而不要把它们拆分到不同的生命周期函数里
useEffect(()=>{
    console.log('componentDidMount')
    return () => {
        console.log('will unmount');
    }
}, [])

// componentDidUpdate 1
useEffect(()=>{
  document.title = `You clicked ${count} times`;
  return()=>{
    // 以及 componentWillUnmount 执行的内容       
  }
}, [count])

// componentDidUpdate 2
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

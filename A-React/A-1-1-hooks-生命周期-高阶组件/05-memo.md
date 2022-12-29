## React.memo()是一个高阶函数
它与 React.PureComponent类似，但是一个函数组件而非一个类
```
React.memo(type, compare?)是一个高阶组件，接收两个参数，第一个参数是需要优化的组件，第二个是非必填的自定义的compare函数，如果不传则会使用默认的compare函数。通过compare比较新旧props是否“相同”，选择是重新渲染组件还是跳过渲染组件的操作并直接复用最近一次渲染的结果。
```

```javaScript
import React from "react";

function Child({seconds}){
    console.log('I am rendering');
    return (
        <div>I am update every {seconds} seconds</div>
    )
};


/*默认情况下其只会对 props 做浅层对比，遇到层级比较深的复杂对象时，表示力不从心了。对于特定的业务场景，可能需要类似 shouldComponentUpdate 这样的 API，这时通过 memo 的第二个参数来实现：
注意：而 shouldComponentUpdate 刚好与其相反,true 就会渲染。
*/
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

## momo 一般配合useCallback() 或则：useMemo()起到了缓存的作用，即便父组件渲染了，useCallback() 包裹的函数也不会重新生成，会返回上一次的函数引用。
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

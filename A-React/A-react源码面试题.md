1.为什么hooks不能写在条件判断中
2.jsx和Fiber有什么关系
3.jsx文件为什么要声明import React from 'react';
4.setState是同步的还是异步的
5.componentWillMount、componentWillMount、componentWillUpdate为什么标记UNSAFE
6.点击Father组件的div，Child会打印Child吗
```js
function Child() {
  console.log('Child');
  return <div>Child</div>;
}


function Father(props) {
  const [num, setNum] = React.useState(0);
  return (
    <div onClick={() => {setNum(num + 1)}}>
      {num}
      {props.children}
    </div>
  );
}


function App() {
  return (
    <Father>
      <Child/>
    </Father>
  );
}

const rootEl = document.querySelector("#root");
ReactDOM.render(<App/>, rootEl);
```

7.打印顺序是什么
```javaScript
function Child() {
  useEffect(() => {
    console.log('Child');
  }, [])
  return <h1>child</h1>;
}

function Father() {
  useEffect(() => {
    console.log('Father');
  }, [])

  return <Child/>;
}

function App() {
  useEffect(() => {
    console.log('App');
  }, [])

  return <Father/>;
}
```
9.为什么string类型的ref prop将会被废弃？
10.简述diff算法
11.react16.4+的生命周期
12.Fiber是什么，它为什么能提高性能
13.react元素$$typeof属性什么
14.react怎么区分Class组件和Function组件
15.react有哪些优化手段
16.suspense组件是什么
17.如何解释demo_4 demo_7 demo_8出现的现象

18.那我们知道了JSX是什么，可是这跟我们这回要说的React.createElement()方法有什么关系呢？
```
见
01-虚拟dom和面试回答-vue异同.md
```


## 1.为何必须引用React
## 2.自定义的React组件为何必须大写
  注意：babel在编译时会判断JSX中组件的首字母，当首字母为小写时，其被认定为原生DOM标签，
	createElement的第一个变量被编译为字符串；当首字母为大写时，其被认定为自定义组件，
	createElement的第一个变量被编译为对象；
## 3.React如何防止XSS
```
ReactElement对象还有一个?typeof属性，它是一个Symbol类型的变量Symbol.for('react.element')，当环境不支持Symbol时，?typeof被赋值为0xeac7。

这个变量可以防止XSS。如果你的服务器有一个漏洞，允许用户存储任意JSON对象， 而客户端代码需要一个字符串，这可能为你的应用程序带来风险。JSON中不能存储Symbol类型的变量，而React渲染时会把没有?typeof标识的组件过滤掉
```
## 4.React的Diff算法和其他的Diff算法有何区别
## 5.key在React中的作用
key 用于识别唯一的 Virtual DOM 元素及其驱动 UI 的相应数据。它们通过回收 DOM 中当前所有的元素来帮助 React 优化渲染。这些 key 必须是唯一的数字或字符串，React 只是重新排序元素而不是重新渲染它们。这可以提高应用程序的性能。
## 5.如何写出高性能的React组件
## 总结
1. params传参:路由表配置：参数地址栏显示;动态路由,推荐使用

2. search传参：会暴露在url中，刷新页面不会消失，但取数据时，需处理

3. query传参:参数地址栏不显示，刷新地址栏，参数丢失

4. state传参
```
state传参：BrowserRouter(history)模式下，刷新页面不消失；

而HashRouter(hash)模式下，刷新页面会消失，但都不会暴露在url中
```

## 1
```js
import { useNavigate } from "react-router-dom";
let navigate = useNavigate();
function navigateToDetail(id){
    navigate(`detail/${id}`)
}


在detail页面需要使用useParams接收路由params参数

import {useParams} from "react-router-dom";
const {id} = useParams();
```

## 2.search参数
```
如果传递的是search参数（例如：detail?id=1&name=李四）需要使用useSearchParams获取search参数
```

```javaScript
import {useSearchParams} from "react-router-dom"
const [searchParams] = useSearchParams();
const id = searchParams.get("id");
```

1.直接拼接
```javaScript
const Pages = () => {
  const navigate = useNavigate();
  const id = "1";
  const grade = "2";
  const goTo = () => {
      navigate(`/class?id=${id}&grade=${grade}`)
  }
}

```

1.2 pathname + 拼接search
```javaScript
const Pages = () => {
  const navigate = useNavigate();
  const id = "1";
  const grade = "2";
  const goTo = () => {
      navigate({
        pathname: "/class",
        search: `?id=${id}&grade=${grade}`
    })
  }
}

```


1.3 pathname + 创建search (推荐)
```javaScript
const Pages = () => {
  const navigate = useNavigate();
  const params = { id: '1', grade: '2' };
  const goTo = () => {
      navigate({
        pathname: "/class",
        search: `?${createSearchParams(params)}`
    })
  }
}
```

## 接收页
```js
import { useSearchParams } from "react-router-dom";

const ToPages = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const grade = searchParams.get("grade");
  return (<h1>id : {id}, grade : {grade}</h1>)}
}
```



2、params传参 (restful格式)，需要在Route上显示写明 :params
```js
<BrowserRouter>
  <Routes>
      <Route path={'/class/:id/:grade'} element={<ToPage/>} />
  </Routes>
</BrowserRouter>
```
```js
import { useNavigate } from "react-router-dom";
const goTo = () => {
    navigate(`/class/${id}/${grade}`)
}


import { useParams } from "react-router-dom";

const ToPages = () => {
  const { id, grade } = useParams();
  return (<h1>id : {id}, grade : {grade}</h1>)}
}
```

## 3.state 传参
```
如果传递的是state参数需要使用useLocation获取参数
```

```js

import { useNavigate } from "react-router-dom";
const goTo = () => {
  navigate(`/class`, { state: {id, grade} } )
}


import {useLocation} from "react-router-dom";
 const location = useLocation();
 const {id} = location.state;
```

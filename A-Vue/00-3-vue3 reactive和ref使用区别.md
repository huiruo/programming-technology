
## 1. 定义数据角度对比：
* ref 用来定义：基本类型数据
* reactive 用来定义：引用类型，例如对象、或数组类型的数据

备注：ref也可以用来定义对象或数组类型数据，它内部会自动通过 reactive 转为代理对象

ref.value 返回的是一个 proxy 对象，他是通过代理 reactive 实现的，下面让我们看看源码:
```javaScript
// 
```


## 2. 原理角度对比：
* ref 通过 Class 的 get 与 set 来实现响应式的（数据劫持）
* reactive 通过使用 Proxy 来实现响应式（数据劫持），并通过Reflect 操作源对象内部的数据。

## 3. 使用角度对比：
* ref 定义的数据：操作数据需要 .value,读取数据时模版中直接读取不需要 .value
* reactive 定义的数据：操作数据与读取数据，均不需要 .value

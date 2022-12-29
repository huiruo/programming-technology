## forEach
* array：一个数组对象。
    * callbackfn：必需参数，最多可以接收三个参数的函数。forEach 将为数组中的每个元素调用 callbackfn 函数一次。
    * thisArg：可选参数，callbackfn 函数中的 this 可引用的对象。如果省略 thisArg，则 this 的值为 undefined。

```javaScript
const arr = ['a', 'b', 'c'];
arr.forEach((value, index, array) => {
  console.log("a[" + index + "] = " + value, 'arr:', array);
});
/*
a[0] = a arr: (3) ['a', 'b', 'c']
a[1] = b arr: (3) ['a', 'b', 'c']
a[2] = c arr: (3) ['a', 'b', 'c']
*/
```
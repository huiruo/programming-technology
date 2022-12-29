## 1.let、const
```
es6块级作用域原理.md
```

## ES6特性:Proxy
Proxy 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。

## 模块化
```
export：用于规定模块的对外接口，即通过 export 可以获取模块的内容。
import：用于导入模块，即通过 import 可以与其他模块建立起联系。
```

### 解构
### 默认参数
```javaScript
const params = [1, 6, 3]

function sum(x = 1, y = 2, z = 3) {
    return x + y + z;
}
console.log(sum(...params)); // ES2015
```

## 3.es6 数组的方法
1. map
2. find
3. findIndex
4. filter

5. every
6. some
7. reduce
8. reduceRight

9. forEach()
10. Array.prototype.includes() es7
```javaScript
['a', 'b', 'c'].includes('a')  // true
```

```javaScript
Array.from() 目的：将类数组对象和可遍历对象转化为数组．
Array.of() 目的：将一组值转化为数组．
find()和findIndex()
```

### 1.for of
```javaScript
for (const value of res) {
  const {
    orderId,
    price,
    qty,
    quoteQty,
    time,
    isBuyer,
    isMaker,
  } = value

  console.log('price:', price);
}
```

### 2.Object.assign()
```javaScript
Object.assign(target, source1, ...source2);
```

### 3.箭头函数：this
```
1.不需要 function 关键字来创建函数
2.省略 return 关键字
3.继承当前上下文的 this 关键字
箭头函数中，函数体内的`this`对象，就是定义时所在作用域的对象，而不是使用时所在的作用域的对象。
```

## 9.Promise es5 以及 async/await es7

## 6.修饰器Decorator ES8

## 3.Object.values() Object.entries() es8
entries()作用：将一个对象中可枚举属性的键名和键值按照二维数组的方式返回。
若对象是数组，则会将数组的下标作为键值返回。

values()只返回自己的键值对中属性的值。它返回的数组顺序，也跟Object.entries()保持一致

```javaScript
Object.entries({ one: 1, two: 2 })    //[['one', 1], ['two', 2]]
Object.entries([1, 2])                //[['0', 1], ['1', 2]]

Object.values({ one: 1, two: 2 })            //[1, 2]
Object.values({ 3: 'a', 4: 'b', 1: 'c' })    //['c', 'a', 'b']
```

## getOwnPropertyDescriptor es6
Object.getOwnPropertyDescriptors() es8

该方法会返回目标对象中所有属性的属性描述符，该属性必须是对象自己定义的，不能是从原型链继承来的。
```javaScript
// 与getOwnPropertyDescriptor()比较,两者的区别：一个是只返回属性名的描述对象,一个返回目标对象所有自身属性的描述对象
const obj = {
    id: 1,
    name: 'test',
    get gender() {
        console.log('gender')
    },
    set grad(d) {
        console.log(d)
    }
}
console.log(Object.getOwnPropertyDescriptor(obj, 'id'))
// {value: 1, writable: true, enumerable: true, configurable: true}
console.log(Object.getOwnPropertyDescriptors(obj))  // 打印所有属性
```

## 7.class 
extends 允许一个子类继承父类，需要注意的是，子类的constructor 函数中需要执行 super() 函数。
```javaScript
class Student {
  constructor() {
    console.log("I'm a student.");
  }
 
  study() {
    console.log('study!');
  }
 
  static read() {
    console.log("Reading Now.");
  }
}
 
console.log(typeof Student); // function

let stu = new Student(); // "I'm a student."

stu.study(); // "study!"
stu.read(); // "Reading Now."
```


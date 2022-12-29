## 1. 函数中的this是在运行时决定的，而不是函数定义时:
1. 函数作为构造函数，并用new来创建实例时，this为创建的实例，且构造函数中的原型链中的this也是创建的实例
```
在调用函数时使用 new 关键字，this 指向 new 出来的实例对象.(函数内的 this 是一个全新的对象)

1. 创建一个新的空的对象
2. 把这个对象链接到原型对象上
3. 这个对象被绑定为 this
4. 如果这个函数不返回任何东西，那么就会默认 return this
```
```javaScript
function Normal() {
  console.log(this); // => Normal {}
}
var normal = new Normal();
```

2. 作为某个对象方法调用时，this 指向该对象。

3. 函数作为普通函数（即不作为构造函数），然后在全局环境下进行调用时，this指的时window
```
浏览器环境下 this 的值指向 window 对象
```

4. 在事件中，this 指向触发这个事件的对象

5. 如果 apply、call 或 bind 方法用于调用、创建一个函数，函数内的 this 就是作为参数传入这些方法的对象。
call(obj,param,param)和bind传参都是参数列表,bind返回的是函数
而apply(obj,[param,param]) 传参是以参数数组
```javaScript
function foo(name1, name2) {
  console.log('this', this);
  if (name1 || name2) {
    console.log("apply和call得区别：", "name1:", name1, "name2:", name2);
  }
}

var fruit = "apple";

// this Window
foo(); // apple 注意：这是在浏览中运行结果，在node中为 undefined

var pack = {
  fruit: "orange",
  foo: foo,
};

// this {fruit: 'orange', foo: ƒ}
pack.foo(); // "orange"

// this {fruit: 'orange', foo: ƒ}
foo.apply(pack, ["name1", "name2"]); // orange

// this {fruit: 'orange', foo: ƒ}
foo.call(pack, "name3", "name3"); // orange
```

例子:apply改变了this,但是再次调用还是指向原本的作用域,即只有时效性
```javaScript
function FnA() {
  this.flag = "A";
  this.tip = function () {
    console.log("log1", this.flag);
  };
}

function FnB() {
  this.flag = "B";
}

const objA = new FnA();
const objB = new FnB();

objA.tip.apply(objB); // log1 B
objA.tip(); // log1 A,时效性，输出还是 A
```

### 1-1.箭头函数
- 没有自己的 this，arguments，super 或 new.target 等，也不能用作构造函数。
```
箭头函数本身是存在原型链的，它也有自己的构造函数，但原型链到箭头函数这一环就断了，因为它没有 prototype 属性，没办法连接它的实例的原型链，所以箭头函数就无法作为构造函数。
```

- 箭头函数的特征之一是它们不创建上下文，因此箭头函数的内部this与外部的this相同。
```
在JavaScript中，函数会创建自己的作用域。这意味着JavaScript函数会创建自己的上下文this，如果我们需要一个函数但是这个函数却没有自己的上下this，那么就可能会遇到问题。

箭头函数内部的this词法做用域由上下文肯定，因此，用call()或apply()调用箭头函数时，没法对this进行绑定，即传入的第一个参数被忽略。
```

```javaScript
/*
 * 由于箭头函数的this由外部非箭头函数的this决定，因此，若需要将一个函数作为回调函数去执行，
 * 并且不希望函数中的this发生改变，这时用箭头函数最适合不过。如果是普通函数，则需要用bind()进行this绑定。
 * */
class Contruct {
  constructor(name) {
    this.consName = name;
  }
  arrowLog = () => {
    console.log(this.consName);
  };
  normalLog() {
    console.log(this.consName);
  }
}
const construct = new Contruct("arrow");
setTimeout(construct.arrowLog, 1000); // 1s后 => 'arrow'
setTimeout(construct.normalLog, 1000); // 1s后 => 'undefined'
setTimeout(construct.normalLog.bind(construct), 1000); // 1s后 => 'arrow'
```


```javaScript
// 未解析 
const test1 = 'hello world'
const add = (a, b) => a + b

var add2 = function (a, b) {
  return a + b
}

function add3(a, b) {
  return a + b
}

// 经过babel 解析后
"use strict";
var test1 = 'hello world';
var add = function add(a, b) {
  return a + b;
};

var add2 = function add2(a, b) {
  return a + b;
};

function add3(a, b) {
  return a + b;
}
```

### 3.this的题目
```javaScript
var length = 10;

function fn() {
    console.log('1:', this, '-:', this.length)
}

var obj = {
    length: 5,
    callApi: function (fn) {
        console.log('2:', this.length) // test:  5 这里匿名函数作为对象的属性被调用，所以this为obj
        console.log('3:', arguments[0])

        fn()  // 这里等于fn()作为普通函数被调用，所以this为window,所以为10

        // 这里arguments为类数组，它的属性名为下标，可以理解为是一个以数字
        // 为属性名的对象，那么arguments[0]中的this就指向arguments,而arguments本身具有length属性，表示参数的个数
        arguments[0]()
    }
}

obj.callApi(fn, 3)
/*
2: 5

3: ƒ fn() {
    console.log('1:', this, '-:', this.length)
}

1: Window {window: Window, self: Window, document: document, name: '', location: Location, …} -: 10

1: Arguments(2) [ƒ, 3, callee: ƒ, Symbol(Symbol.iterator): ƒ]0: ƒ fn()1: 3callee: ƒ (fn)length: 2Symbol(Symbol.iterator): ƒ values()[[Prototype]]: Object -: 2
*/
```

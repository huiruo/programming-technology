## JavaScript 里有哪些数据类型
```
null 用来表示尚未存在的对象，常用来表示函数企图返回一个不存在的对象。 null 表示"没有对象"，即该处不应该有值。null 典型用法是：

作为函数的参数，表示该函数的参数不是对象。
作为对象原型链的终点。

当声明的变量还未被初始化时，变量的默认值为 undefined。undefined 表示"缺少值"，就是此处应该有一个值，但是还没有定义。

1. 变量被声明了，但没有赋值时，就等于 undefined。

2. 调用函数时，应该提供的参数没有提供，该参数等于 undefined。

3. 对象没有赋值的属性，该属性的值为 undefined。

4. 函数没有返回值时，默认返回 undefined。

未定义的值和定义未赋值的为 undefined，null 是一种特殊的 object，NaN 是一种特殊的 number。
```

## 原型链的理解
prototype 是函数对象上面预设的对象属性。


## new 操作符具体干了什么呢 ?
* 创建一个空对象，并且 this 变量引用该对象，同时还继承了该函数的原型。
* 属性和方法被加入到 this 引用的对象中。
* 新创建的对象由 this 所引用，并且最后隐式的返回 this 。

## apply 和 call 什么含义，什么区别 ？
因为属于 Function.prototype，所以每个 Function 对象实例(就是每个方法)都有 call，apply 属性

相同点：两个方法产生的作用是完全一样的。
不同点：方法传递的参数不同。


## 1.js 字符串两边截取空白的 trim 的原型方法的实现
js 中本身是没有 trim 函数的。
```javaScript
/*
删除左右两端的空格
删除左边的空格 /(^s*)/g
删除右边的空格 /(s*$)/g
*/
function trim(str){
 return str.replace(/(^s*)|(s*$)/g, "");
}
```

## 用js截取字符串 abcdefg 的 efg
方法1: substr方法接收两个参数：起始位置和截取的长度。
```javaScript
let str = 'abcdefg';
let result = str.substr(4, 3); // result = 'efg'
```

方法2: substring方法与substr方法的不同之处在于，substring方法的第二个参数表示的是结束位置，而不是截取的长度。
```javaScript
let str = 'abcdefg';
let result = str.substring(4, 7); // result = 'efg'
```

## 用js 判断一个字符串abaasdffggghhjjkkgfddsssss3444343出现次数最多的字符，统计这个次数
```javaScript
let str = 'abaasdffggghhjjkkgfddsssss3444343';
let count = {};

for (let i = 0; i < str.length; i++) {
  let c = str.charAt(i); // 字符串的指定长度赋值给c
  if (count[c]) { // 此处q[c]是判定q数组有没有c元素 有的话c元素+1
    count[c]++; 
  } else {
    count[c] = 1; // 没有c元素则创造个c元素+1
  }
}

console.log('count:', count)
// count = { a: 5, b: 2, d: 4, f: 3, g: 4, h: 2, j: 2, k: 2, s: 5, 3: 5, 4: 5 }
```





## 2. 实现一个方法，使得：add(2, 5) 和 add(2)(5) 的结果都为 7
```javaScript
var add = function (x, r) {
  console.log('arguments:',arguments)
  if (arguments.length == 1) {
    return function (y) { return x + y; };
  } else {
    return x + r;
  }
};

console.log(add(2)(5));  // 7
console.log(add(2, 5));  // 7
```

## 3. console.log(1 && 2) 和 console.log(1 || 0) 的结果是 ？
只要 “&&” 前面是 false，无论 “&&” 后面是 true 还是 false，结果都将返 “&&” 前面的值;
只要 “&&” 前面是 true，无论 “&&” 后面是 true 还是 false，结果都将返 “&&” 后面的值;

只要 “||” 前面为 false，不管 “||” 后面是 true 还是 false，都返回 “||” 后面的值。
只要 “||” 前面为 true，不管 “||” 后面是 true 还是 false，都返回 “||” 前面的值。
```javaScript
console.log('1 && 2:',1 && 2)
console.log('1 || 0:',1 || 0)
/*
2
1
*/
```


## 4. 输出
道题的考点分两个
1. 作用域
2. 运算符（赋值预算，逗号运算）
```javaScript
var out = 25
var inner = {
  out: 20,
  func: function () {
    var out = 30;
    return this.out;
  }
};

console.log((inner.func, inner.func)());
console.log(inner.func());
console.log((inner.func)());
console.log((inner.func = inner.func)());
/*
结果：25，20，20，25
*/
```
先看第一个输出：25，因为 ( inner.func, inner.func ) 是进行逗号运算符，逗号运算符就是运算前面的 ”,“ 返回最后一个，举个栗子
```javaScript
var i = 0, j = 1, k = 2;
console.log((i++, j++, k)) // 返回的是 k 的值 2 ，如果写成 k++ 的话  这里返回的就是 3

console.log(i); // 1
console.log(j); // 2
console.log(k); // 2
```

回到原题 ( inner.func, inner.func ) 就是返回 inner.func ，而 inner.func 只是一个匿名函数
```javaScript
function () {
    var out = 30;
    return this.out;
}
```
而且这个匿名函数是属于 window 的，则变成了
```javaScript
(function () {
    var out = 30;
    return this.out;
})()
```
此刻的 this => window,所以 out 是 25。

### 分析2：
第二和第三个 console.log 的作用域都是 inner，也就是他们执行的其实是 inner.func();inner 作用域中是有 out 变量的，所以结果是 20。

第四个 console.log 考查的是一个等号运算 inner.func = inner.func ，其实返回的是运算的结果，举个栗子
```javaScript
var a = 2, b = 3;
console.log(a = b) // 输出的是 3
```

所以 inner.func = inner.func 返回的也是一个匿名函数
```javaScript
function () {
    var out = 30;
    return this.out;
}
```
此刻，道理就和第一个 console.log 一样了，输出的结果是 25。

## 下面程序输出的结果是 ？
这个题目比较简单：即函数声明和变量声明的关系和影响，遇到同名的函数声明，不会重新定义。
```javaScript
function a(x) {
    return x * 2;
}
var a;
console.log(a);
/*
打印函数
*/
```


活动对象是在进入函数上下文时刻被创建的，它通过函数的 arguments 属性初始化。
```javaScript
function b(x, y, a) {
  console.log('arguments:',arguments)
  arguments[2] = 10;
  console.log(a);
}

b(1, 2, 3);
/*
结果为 10。
*/
```

## 三道判断输出的题都是经典的题
```javaScript
var a = 4;
function b() {
  a = 3;
  console.log(a);
  function a(){};
}

b();
/*
明显输出是 3，因为里面修改了 a 这个全局变量，那个 function a(){} 是用来干扰的，虽然函数声明会提升，就被 a 给覆盖掉了
*/
```

## 下面程序输出的结果是 ？
```javaScript
if (!("a" in window)) {
    var a = 1;
}
alert(a);

/*
你可能认为 alert 出来的结果是 1，然后实际结果是 “undefined”。
*/
```
要了解为什么，需要知道 JavaScript 里的 3 个概念。

首先，在 es6 之前，所有的全局变量都是 window 的属性，语句 var a = 1; 等价于 window.a = 1; 你可以用如下方式来检测全局变量是否声明："变量名称" in window。


第二，所有的变量声明都在范围作用域的顶部，看一下相似的例子：
```javaScript
alert("b" in window);
var b;
```
此时，尽管声明是在 alert 之后，alert 弹出的依然是 true，这是因为 JavaScript 引擎首先会扫描所有的变量声明，然后将这些变量声明移动到顶部，最终的代码效果是这样的：
```javaScript
var a;
alert("a" in window);
```
第三，你需要理解该题目的意思是，变量声明被提前了，但变量赋值没有，因为这行代码包括了变量声明和变量赋值。`提前这个词语显得有点迷惑了，你可以理解为：预编译。`




## JavaScript 判断一个变量是对象还是数组？
应用3-判断是否是数组.md


## ES5 的继承和 ES6 的继承有什么区别 ？
ES5 的继承时通过 prototype 或构造函数机制来实现。

ES5 的继承实质上是先创建子类的实例对象，然后再将父类的方法添加到 this 上（Parent.apply(this)）。
ES6 的继承机制完全不同，实质上是先创建父类的实例对象 this（所以必须先调用父类的 super()方法），然后再用子类的构造函数修改 this。


具体的：ES6 通过 class 关键字定义类，里面有构造方法，类之间通过 extends 关键字实现继承。子类必须在 constructor 方法中调用 super 方法，否则新建实例报错。因为子类没有自己的 this 对象，而是继承了父类的 this 对象，然后对其进行加工。如果不调用 super 方法，子类得不到 this 对象。

ps：super 关键字指代父类的实例，即父类的 this 对象。在子类构造函数中，调用 super 后，才可使用 this 关键字，否则报错。


## 每三位加逗号
```javaScript
function toThousands(num) {
  let numA = (num || 0).toString()
  let result = '';

  while (numA.length > 3) {
    result = ',' + numA.slice(-3) + result;
    numA = numA.slice(0, numA.length - 3);
  }

  if (numA) {
    result = numA + result;
  }

  return result;
}

console.log('test:', toThousands(12001900))
```
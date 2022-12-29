## 例子：面试题
```javaScript
async function async1() {
    console.log("1.async1 start");
    await async2();
    console.log("2.async1 end");
}

async function async2() {
    console.log("3.async2");
}

console.log("4.script start");

setTimeout(() => {
    console.log('5.setTimeout');
}, 0);

async1();

new Promise((reslove) => {
    console.log("6.promise1");
    reslove();
}).then(() => {
    console.log("7.promise2");
})

console.log("8.script end");



/*
4.script start
1.async1 start
3.async2
6.promise1
8.script end
2.async1 end
7.promise2
5.setTimeout
* */
```


<br />

```javaScript
const promise = new Promise((resolve, reject) => {
    console.log(1);
    resolve();
    console.log(2);
    reject('error');
})
promise.then(() => {
    console.log(3);
}).catch(e => console.log(e))
console.log(4);
/*
1
2
4
3
规则一，promise构造函数的代码会立即执行，then或者reject里面的代码会放入异步微任务队列，在宏任务结束后会立即执行。规则二：promise的状态一旦变更为成功或者失败，则不会再次改变，所以执行结果为：1,2,4,3。
*/
```

## async
这道题的坑就在于 async 中如果没有 await，那么它就是一个纯同步函数。
```js
async function async1() {
  console.log("AAAA");
  async2(); 
  console.log("BBBB");
}
async function async2() {
  console.log("CCCC");
}

console.log("DDDD");
setTimeout(function () {
  console.log("FFFF");
}, 0);
async1();
new Promise(function (resolve) {
  console.log("GGGG");
  resolve();
}).then(function () {
  console.log("HHHH");
});
console.log("IIII");
/*
DDDD

AAA

CCC
BBB

GGGG
IIII
HHHH
这道题的起始代码在第 9 行，输出DDDD
第 10 行计时器开启一个异步任务 t1（一个称呼），这个任务且为宏任务。
第 13 行函数async1执行，这个函数内没有 await 所以它其实就是一个纯同步函数，打印输出AAAA,
在async1中执行async2函数，因为async2的内部也没有 await，所以它也是个纯同步函数，打印输出CCCC
紧接着打印输出BBBB。
第 14 行 new Promise 执行里面的代码也是同步的,所以打印输出GGGG,resolve()调用的时候开启一个异步任务 t2（一个称呼），且这个任务 t2 是微任务，它的执行交给 then()中的第一个回调函数执行，且优先级高于宏任务（t1）执行。
第 20 行打印输出IIII,此时线程上的同步任务全部执行结束。
在执行任务队列中的异步任务时，微任务优先于宏任务执行，所以先执行微任务 t2 打印输出 HHHH,然后执行宏任务 t1 打印输出 FFFF
所以综上 结果输出是 DDDD AAAA CCCC BBBB GGGG IIII HHHH FFFF
*/
```


## 下面是道加强版的考题，大家可以试一试。
```js
async function async1() {
  await async2()
  console.log('1.async1 end')
}

async function async2() {
  console.log('2.async2 end')
}

async1()

setTimeout(function() {
  console.log('3.setTimeout')
}, 0)

new Promise(resolve => {
  console.log('4.Promise')
  resolve()
}).then(function() {
    console.log('5.promise1')
  }).then(function() {
    console.log('6.promise2')
  })

/*
2.async2 end
4.Promise
1.async1 end
5.promise1
6.promise2
3.setTimeout
*/
```

## 例子
```javaScript
//例子2：
console.log('打印' + 1);

setTimeout(function () {
  console.log('打印setTimeout' + 2);
})

new Promise(function (resolve, reject) {
  console.log('打印' + 3);
  resolve()
}).then(function () {
  console.log('打印then(' + 4)
});;

console.log('打印' + 10);

let promiseA = new Promise(function (resolve, reject) {
  setTimeout(function () {
    console.log('打印setTimeout' + 5);
  });
  resolve()
})

promiseA.then(() => {
  console.log('打印then(' + 6)
});

setTimeout(function () {
  new Promise(function (resolve, reject) {
    console.log('打印setTimeout' + 7);
  });
})

/*
打印1
打印3
打印10
打印then(4
打印then(6
打印setTimeout2
打印setTimeout5
打印setTimeout7
*/
```

## 例子1
```javaScript
console.log('打印' + 1);

setTimeout(function () {
  console.log('打印setTimeout' + 2);
})

new Promise(function (resolve, reject) {
  console.log('打印' + 3);
  resolve()
}).then(function () {
  console.log('打印then(' + 4)
});;

console.log('打印' + 10);

let promiseA = new Promise(function (resolve, reject) {
  setTimeout(function () {
    console.log('打印setTimeout' + 5);
  });
  resolve()
})

promiseA.then(() => {
  console.log('打印then(' + 6)
});

setTimeout(function () {
  new Promise(function (resolve, reject) {
    console.log('打印setTimeout' + 7);
  });
})
/*
打印1
打印3
打印10
打印then(4
打印then(6
打印setTimeout2
打印setTimeout5
打印setTimeout7
*/
```

## 例子2
```javaScript
// 因为Promise定义之后便会立即执行，其后的.then()是异步里面的微任务。
setTimeout(() => {
  console.log('1.我是宏任务')
}, 0);

let promise = new Promise(resolve => {
  resolve();
  console.log('2.新建promise')
});

promise.then(value => {
  console.log('3.我是微任务')
});

console.log('4.主流程');


/*
2.新建promise
4.主流程
3.我是微任务
1.我是宏任务
*/ 
```

## 例子3
```javaScript
setTimeout(() => {
  console.log("4");

  setTimeout(() => {
    console.log("8");
  }, 0);

  new Promise((r) => {
    console.log("5");//构造函数是同步的
    r();
  }).then(() => {
    console.log("7");//then()是异步的，这里已经入队
  });

  console.log("6");
}, 0);

new Promise((r) => {
  console.log("1");//构造函数是同步的
  r();
}).then(() => {
  console.log("3");//then()是异步的，这里已经入队
});

console.log("2");

/*
1
2
3
4
5
6
7
8
*/
```


## 小试牛刀
```javaScript
setTimeout(function () {
    console.log('1');
});

new Promise(function(resolve,reject){
    console.log('2:',2)
    resolve(3)
}).then(function(val){
    console.log('3:',val);
})

/*
2: 2
3: 3
1
*/
```


## 例子
```javaScript
setTimeout(function () {
  console.log("==a", a);
}, 0);

var a = 10;

console.log("===b", b);
console.log("=====fn", fn);

var b = 20;

function fn() {
  setTimeout(function () {
    console.log('setTImeout 10ms.');
  }, 10);
}

fn.toString = function () {
  return 30;
}

setTimeout(function () {
  console.log('setTimeout 20ms.');
}, 20);

fn();

/*打印：
fn();
===b undefined
=====fn ƒ fn() {
setTimeout(function () {
    console.log('setTImeout 10ms.');
  }, 10);
}

==a 10
setTImeout 10ms.
setTimeout 20ms.
*/
```
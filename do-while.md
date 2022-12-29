

```javaScript
let result = '';
let i = 0;
do {
   i += 1;
   result += i + ' ';
   console.log('result:',result)
} while (i < 5);
// } while (true); 造成无限循环
```

```javaScript
let result = '';
let i = 0;
do {
   i += 1;
   result += i + ' ';
   console.log('result:',result)
   break
} while (true); // 执行1次
```

## react 中的源码，可见是执行一次
```javaScript
do {
  try {
    console.log('renderRootSync--->', root);
    workLoopSync();
    break;
  } catch (thrownValue) {
    handleError(root, thrownValue);
  }
} while (true);
```


## 源码2
```javaScript
let workInProgress = 4
function workLoopSync() {
  console.log('performUnitOfWork 1:workLoopSync-->循环开始', workInProgress !== 1, 'workInProgress:', workInProgress);
  while (workInProgress !== 1) {
    console.log('performUnitOfWork 1:workLoopSync-->循环中', workInProgress !== null, 'workInProgress:', workInProgress);
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(num){
  workInProgress = workInProgress - 1
}

workLoopSync(workInProgress)
```
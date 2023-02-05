## 方法
​https://mikemcl.github.io/big.js/​
加
```javaScript
0.1 + 0.2                                // 0.30000000000000004
const x = new Big(0.1);
const y = x.plus(0.2);                   // 0.3
Big(0.7).plus(x).plus(y).toFixed(2);     // 1.1
```

减
```javaScript
0.3 - 0.1                                // 0.19999999999999998   
const x = new Big(0.3);
const y = x.minus(0.1)                   // 0.2
(Big(0.7).minus(x).minus(y).toFixed(2)   // 0.2
```

乘
```javaScript
0.6 * 3                    // 1.7999999999999998
x = new Big(0.6)
y = x.times(3)             // '1.8'
Big('7e+500').times(y)     // '1.26e+501'
```

除
```javaScript
x = new Big(355)
y = new Big(113)
x.div(y)                   // '3.14159292035398230088'
Big.DP = 2
x.div(y)                   // '3.14'
x.div(5)                   // '71'
```
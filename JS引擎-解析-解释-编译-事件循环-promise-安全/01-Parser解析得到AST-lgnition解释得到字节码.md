# 总结和基础
`解析和编译过程的性能非常重要，因为 V8 只有等编译完成后才能运行代码,`V8执行js过程：
* 第一步:首先解析器会把源码解析为抽象语法树（Abstract Syntax Tree），这是用来表示源码的树形结构的对象，这个过程称为解析（Parsing），主要由 V8 的 Parser 模块实现。

* 第二步:解释器（Ignotion）再将 AST 翻译为字节码，一边解释一边执行。
```
在此过程中，解释器会记特定代码片段的运行次数，如果代码运行次数超过某个阈值，那么该段代码就被标记为热代码（hot code），并将运行信息反馈给优化编译器（TurboFan）。

优化编译器根据反馈信息，优化并编译字节码，最终生成优化后的机器码，这样当该段代码再次执行时，解释器就直接使用优化机器码执行，不用再次解释，大大提高了代码运行效率。
```

### 流程图
```mermaid
flowchart TD

A1(Source)--unicode stream-->A2(Scanner词法分析)

A2--tokens-->B1("Pre-Parser语法分析器")--预解析-->B2
A2--tokens-->B2(Parser语法分析器)

B2--AST-->C1(lgnition解释器)

C1-->C2(ByteCode字节码)-->C3(编译器TurboFan)-->C4(机器码)
```

## window 系统里怎么使用 jsvu 工具快速调试 v8？
https://blog.csdn.net/kaimo313/article/details/125094742?spm=1001.2014.3001.5501

## 字节码
* 字节码是平台无关的，机器码针对不同的平台都是不一样的
```
我觉的主要还是：对 v8 的代码进行重构，降低 v8 的代码复杂,毕竟字节码实现软件环境、与硬件环境无关，更好地进行v8的开发
```
* 字节码占用空间小，二进制机器码占用空间大。使用字节码所以能增强首次启动速度
* 源码转换为字节码时间消耗较短，生成二进制码时间消耗较长。

解释执行：V8在执行JavaScript源码时，会先通过解析器Parser将源码解析成AST，解释器Ignition会将AST转化为字节码，编译TuiboFan一边解释一遍执行。

### Turbofan优化字节码解释慢
字节码缺点执行很慢，效率低。

在运行时编译代码的技术也被称为 JIT（即时编译），通过 JIT 可以极大提升 JavaScript 代码的执行性能。

即时编译：Ignition同时会记录某一代码片段的执行次数，如果执行次数超过了某个阈值，这段代码便会被标记为热点代码(HotSpot)，同时将运行信息反馈给优化编译器TurboFan，会将这部分热点代码的字节码优化并编译，生成机器码更高效地运行。

为了提高运行效率，v8提供了Object shapes和反馈向量槽功能，缓存函数中的对象类型。然后假设在对象类型不变的情况下将字节码编译成机器码加速执行。

## 基础
### 高级语言分为:
* 编译型语言：需要编译器进行一次编译，被编译过的文件可以多次执行。如 C++、C 语言。
* 解释型语言：不需要事先编译，通过解释器一边解释一边编译器编译执行。启动快，但执行慢。
JavaScript 没有像 C++那样可以事先提供足够的信息供编译器编译出更加低级的机器代码，它只能在运行阶段收集类型信息，然后根据这些信息进行编译再执行，所以 JavaScript 也是解释型语言。

从语言的角度分析JavaScript是动态语言，Java是静态语言。
对于静态语言，在编译时就已经知道数据类型而且在运行时类型不可变，就可以分配连续的内存空间给对象。而JavaScript运行过程中类型可变。 

JavaScript 要想被计算机执行，需要一个能够快速解析并且执行 JavaScript 脚本的引擎。

### 1.CPU 执行机器指令的流程?

### 2.编程语言是如何运行的? 解释器和编译器区别
处理器不能直接理解我们通过高级语言（如C++、Go、JavaScript等）编写的代码，只能理解机器码，所以在执行程序之前，需要经过一系列的步骤，将我们编写的代码翻译成机器语言。这个过程一般是由编译器（Compiler） 或者解释器（Interpreter） 来完成。

* 解释器:它将每个高级程序语句转换成机器代码。
* 编译器:把高级语言编写的程序转换成机器码，将人可读的代码转换成计算机可读的代码（0和1）。

机器语言:
一个机器语言程序是由一系列二进制模式组成的(例 110110) 它表示应该由计算机执行的简单操作。机器语言程序是可执行的，所以它们可以直接运行

区别：
两者都是将高级语言转换成机器码，
* 解释器在程序运行时将代码转换成机器码,编译的时候会把编译器会把文件都处理，生成一个目标文件
* 编译器在程序运行之前将代码转换成机器码,解析边处理源文件边执行

二者区别：
![](./img/1-解析器和编译器的区别.png)

# Parser语法分析器-->AST
![](./img/1编译流程.png)

在Chrome中开始下载Javascript文件后，Parser就会开始并行在单独的线程上解析代码。解析可以在下载完成后仅几毫秒内完成，并生成AST。

AST是把代码结构化成树状结构表示，这样做是为了更好的让编译器或者解释器理解。AST,比如Babel、ESLint，那么AST的生成过程是怎么样的呢？

## 步骤1.
执行 JavaScript 代码之前，V8 就准备好了代码的运行时环境。 这个环境包括了:
* 栈空间和堆空间,V8 初始化了基础的存储空间之后，接下来就需要初始化全局执行上下文和全局作用域了，这两个内容是V8执行后续流程的基础。
* 全局执行上下文
* 全局作用域
* 消息队列与事件循环系统
* 以及全局函数，WebAPI 等内置资源

### 1.空间
栈空间
栈空间主要是用来管理 JavaScript 函数调用的，栈是内存中连续的一块空间，同时栈结构是“先进后出”的策略。在函数调用过程中，涉及到上下文相关的内容都会存放在栈上，比如原生类型、引用到的对象的地址、函数的执行状态、this 值等都会存在在栈上。当一个函数执行结束，那么该函数的执行上下文便会被销毁掉。

栈空间的最大的特点是空间连续，所以在栈中每个元素的地址都是固定的，因此栈空间的查找效率非常高，但是通常在内存中，很难分配到一块很大的连续空间，因此，V8 对栈空间的大小做了限制，如果函数调用层过深，那么 V8 就有可能抛出栈溢出的错误。

栈空间用来管理 JavaScript 调用。每一段 JavaScript 代码（一段脚本，或一个函数），V8 在编译阶段会生成执行这段代码的执行环境，也叫做执行上下文。JavaScript 使用栈来管理执行上下文。编译代码时入栈，执行完成后出栈。
栈空间的最大特点是内存连续，因此栈空间的操作效率非常高。但因为内存中很难分配到一大段连续的空间，因此栈空间通常很小。

堆空间
如果有一些内存占用比较大的数据，或者不需要存储在连续空间中的数据，栈空间就不适合使用。于是 V8 使用了堆空间。
堆空间是一种树形的存储结构，用来存储对象类型的离散的数据。JavaScript 除了原生类型以外，其他的对象类型，诸如函数，数组，浏览器的 window 对象，document 对象等，都是存储在堆空间。


## 初始化3.构造事件循环与消息队列
V8 是寄生在宿主环境中的，本身没有自己的主线程，而是使用宿主环境提供的主线程，V8 自身，与 V8 执行的代码，都运行在宿主环境的主线程。
只有一个主线程是不够的，当一个线程的代码执行完成后，线程就自动退出了，下次使用时又要重新启动线程，初始化数据。严重影响运行效率。
因此，主线程需要一个消息队列，存放 V8 内部的，页面响应的，JavaScript 触发的各种任务；还需要一个事件循环，不断地从消息队列中取出任务来执行


# 惰性编译-对于不是立即执行的函数，只进行预解析
见：01-步骤1-预解析-变量提升.md

# 步骤2.初始环境准备好以后->解析阶段
整个解析过程可分为两部分: 词法分析->语法分析->生成语法树
* 词法分析: 用于将代码拆分为 “最小的，不可分割的单位”，它被叫做 “token”。比如关键字 for, if，和一些直接量，如 123 这样的数字。
* 语法分析: 语法分析用于将已经拆分后的 token ，生成抽象语法树（AST）。之后，再根据 AST `生成执行上下文和作用域。`

### 2-1.词法分析
将字符流转换为 tokens，字符流就是我们编写的一行行代码，token 是指语法上不能再分割的最小单位，可能是单个字符，也可能是字符串，图中的 Scanner 就是 V8 的词法分析器。

在 V8 中，Scanner 负责接收 Unicode 字符流，并将其解析为 tokens，提供给解析器使用。比如 var a = 1; 这行代码，经过词法分析后的 tokens 就是下面这样：

可以看到， var a = 1; 这样一行代码包括 5 个 tokens：
* 关键字 var
* 标识符 name
* 赋值运算符  =
* 分割符 ;
```javaScript
[
    {
        "type": "Keyword",
        "value": "var"
    },
        {
        "type": "Identifier",
        "value": "a"
    },
    {
        "type": "Punctuator",
        "value": "="
    },
    {
        "type": "Numeric",
        "value": "1"
    },
    {
        "type": "Punctuator",
        "value": ";"
    }
]
```

### 2-2.语法分析-->AST
将前面生成的token流根据语法规则，形成一个有元素层级嵌套的语法规则树，这个树就是AST。

根据语法规则，将 tokens 组成一个有嵌套层级的抽象语法结构树，这个树就是 AST，在此过程中，如果源码不符合语法规范，解析过程就会终止，并抛出语法错误。图中的 Parser 和 Pre-Parser 都是 V8 的语法分析器。

接下来， V8 的解析器会通过语法分析，根据 tokens 生成 AST， var a = 1; 这行代码生成的 AST 的 JSON 结构如下所示：
```json
{
  "type": "Program",
  "start": 0,
  "end": 10,
  "body": [
    {
      "type": "VariableDeclaration",
      "start": 0,
      "end": 10,
      "declarations": [
        {
          "type": "VariableDeclarator",
          "start": 4,
          "end": 9,
          "id": {
            "type": "Identifier",
            "start": 4,
            "end": 5,
            "name": "a"
          },
          "init": {
            "type": "Literal",
            "start": 8,
            "end": 9,
            "value": 1,
            "raw": "1"
          }
        }
      ],
      "kind": "var"
    }
  ],
  "sourceType": "module"
}
```
在astexplorer.net/中观察源码通过 Parser 转换后的 AST 的结构。

但是，对于一份 JavaScript 源码，如果所有源码在执行前都要完全经过解析才能执行，那必然会面临以下问题。

* 代码执行时间变长：一次性解析所有代码，必然会增加代码的运行时间。
* 消耗更多内存：解析完的 AST，以及根据 AST 编译后的字节码都会存放在内存中，必然会占用更多内存空间。
* 占用磁盘空间：编译后的代码会缓存在磁盘上，占用磁盘空间

所以，现在主流 JavaScript 引擎都实现了延迟解析（Lazy Parsing）。

# Ignition JS 字节码解释器 ->生成字节码
/iɡˈniSH(ə)n/
`有了 AST，执行上下文，作用域，就可以依据这些，由解释器生成字节码。`

解释器 Ignition 根据语法树生成字节码。TurboFan 是 V8 的优化编译器，TurboFan 将字节码生成优化的机器代码。

字节码是机器代码的抽象。如果字节码采用和物理 CPU 相同的计算模型进行设计，则将字节码编译为机器代码更容易。这就是为什么解释器（interpreter）常常是寄存器或堆栈。 Ignition 是具有累加器的寄存器。

您可以将 V8 的字节码看作是小型的构建块（bytecodes as small building blocks），这些构建块组合在一起构成任何 JavaScript 功能。V8 有数以百计的字节码。比如 Add 或 TypeOf 这样的操作符，或者像 LdaNamedProperty 这样的属性加载符，还有很多类似的字节码。 V8还有一些非常特殊的字节码，如 CreateObjectLiteral 或 SuspendGenerator。头文件 bytecodes.h 定义了 V8 字节码的完整列表。
https://github.com/v8/v8/blob/master/src/interpreter/bytecodes.h

每个字节码指定其输入和输出作为寄存器操作数。Ignition 使用寄存器 r0，r1，r2，... 和累加器寄存器（accumulator register）。几乎所有的字节码都使用累加器寄存器。它像一个常规寄存器，除了字节码没有指定。 例如，Add r1 将寄存器 r1 中的值和累加器中的值进行加法运算。这使得字节码更短，节省内存。

许多字节码以 Lda 或 Sta 开头。Lda 和 Stastands 中的 a 为累加器（accumulator）。例如，LdaSmi [42] 将小整数（Smi）42 加载到累加器寄存器中。Star r0 将当前在累加器中的值存储在寄存器 r0 中。

以现在掌握的基础知识，花点时间来看一个具有实际功能的字节码。
```javaScript
function incrementX(obj) {
  return 1 + obj.x;
}

incrementX({x: 42});
// V8 的编译器是惰性的，
// 如果一个函数没有运行，V8 将不会解释它
```

如果要查看 V8 的 JavaScript 字节码，可以使用在命令行参数中添加 --print-bytecode 运行 D8 或Node.js（8.3 或更高版本）来打印。对于 Chrome，请从命令行启动 Chrome，使用 --js-flags="--print-bytecode"
```
$ node --print-bytecode incrementX.js
...
[generating bytecode for function: incrementX]
Parameter count 2
Frame size 8
  12 E> 0x2ddf8802cf6e @    StackCheck
  19 S> 0x2ddf8802cf6f @    LdaSmi [1]
        0x2ddf8802cf71 @    Star r0
  34 E> 0x2ddf8802cf73 @    LdaNamedProperty a0, [0], [4]
  28 E> 0x2ddf8802cf77 @    Add r0, [6]
  36 S> 0x2ddf8802cf7a @    Return
Constant pool (size = 1)
0x2ddf8802cf21: [FixedArray] in OldSpace
 - map = 0x2ddfb2d02309 <Map(HOLEY_ELEMENTS)>
 - length: 1
           0: 0x2ddf8db91611 <String[1]: x>
Handler Table (size = 16)
```

这是每个字节码的意思，每一行：
* LdaSmi [1]  将常量 1 加载到累加器中。
* Star r0  将当前在累加器中的值 1 存储在寄存器 r0 中。
* LdaNamedProperty a0, [0], [4],LdaNamedProperty 将 a0 的命名属性加载到累加器中。ai 指向 incrementX() 的第 i 个参数。在这个例子中，我们在 a0 上查找一个命名属性，这是 incrementX() 的第一个参数。该属性名由常量 0 确定。LdaNamedProperty 使用 0 在单独的表中查找名称：
```
- length: 1
     0: 0x2ddf8db91611 <String[1]: x>
```
可以看到，0 映射到了 x。因此这行字节码的意思是加载 obj.x。

那么值为 4 的操作数是干什么的呢？ 它是函数 incrementX() 的反馈向量的索引。反馈向量包含用于性能优化的 runtime 信息。


* Return
Return 返回累加器中的值。返回语句是函数 incrementX() 的结束。此时 incrementX() 的调用者可以在累加器中获得值 43，并可以进一步处理此值。

乍一看，V8 的字节码看起来非常奇怪，特别是当我们打印出所有的额外信息。但是一旦你知道 Ignition 是一个带有累加器寄存器的寄存器，你就可以分析出大多数字节码都干了什么


# JavaScript 的常见报错类型
1. SyntaxError 很常见，当语法不符合 JS 规范时，就会报这种错误
`SyntaxError 最为特殊，因为它是 编译阶段 抛出来的错误，如果发生语法错误，JS 代码一行都不会执行。而其他类型的异常都是 执行阶段 的错误，就算报错，也会执行异常之前的脚本。`
```javaScript
const token = "ABC";
console.log(token);

//语法错误: Uncaught SyntaxError: Unexpected token '%'
const newToken = %((token);
```
2. ReferenceError 也很常见，打印一个不存在的值就是 ReferenceError,报错:编译错误
```javaScript
doSomething();

function doSomething(){
  var test = 1
	console.log("How you doing?",b); // Uncaught ReferenceError: b is not defined
}
console.log('test:',test)
```
3. TypeError 当一个基础类型当作函数来用时，就会报这个错误：
4. RangeError
```javaScript
// 这类错误很常见，例如栈溢出就是 RangeError；
function a () {
  b()
}
function b () {
  a()
}
a()

// out: 
// RangeError: Maximum call stack size exceeded
```


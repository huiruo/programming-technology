优点：
* Fiber架构和Scheduler出色的调度模式可以实现异步可中断的更新行为。
* 优先级机制贯穿更新的整个周期

# Fiber是什么
它是React的最小工作单元，在React的世界中，一切都可以是组件。在普通的HTML页面上，人为地将多个DOM元素整合在一起可以组成一个组件，HTML标签可以是组件（HostComponent），普通的文本节点也可以是组件（HostText）。每一个组件就对应着一个fiber节点，许多个fiber节点互相嵌套、关联，就组成了fiber树，正如下面表示的Fiber树和DOM的关系一样：
```
    Fiber树                    DOM树

   div#root                  div#root
      |                         |
    <App/>                     div
      |                       /   \
     div                     p     a
    /   ↖
   /      ↖
  p ----> <Child/>
             |
             a
```

一个DOM节点一定对应着一个Fiber节点，但一个Fiber节点却不一定有对应的DOM节点。



# render阶段
render阶段实际上是在内存中构建一棵新的fiber树（称为workInProgress树），构建过程是依照现有fiber树（current树）从root开始深度优先遍历再回溯到root的过程，这个过程中每个fiber节点都会经历两个阶段：beginWork和completeWork。

组件的状态计算、diff的操作以及render函数的执行，发生在beginWork阶段

effect链表的收集、被跳过的优先级的收集，发生在completeWork阶段。

构建workInProgress树的过程中会有一个workInProgress的指针记录下当前构建到哪个fiber节点，这是React更新任务可恢复的重要原因之一。

# commit阶段
在render阶段结束后，会进入commit阶段，该阶段不可中断:

主要是去依据workInProgress树中有变化的那些节点（render阶段的completeWork过程收集到的effect链表）,去完成DOM操作，将更新应用到页面上，除此之外，还会异步调度useEffect以及同步执行useLayoutEffect。

这两个阶段都是独立的React任务，最后会进入Scheduler被调度。

render阶段采取的调度优先级是依据本次更新的优先级来决定的，以便高优先级任务的介入可以打断低优先级任务的工作；

commit阶段的调度优先级采用的是最高优先级，以保证commit阶段同步执行不可被打断。

## Scheduler 的作用
Scheduler用来调度执行上面提到的React任务。

何为调度？依据任务优先级来决定哪个任务先被执行。调度的目标是保证高优先级任务最先被执行。

何为执行？Scheduler执行任务具备一个特点：即根据时间片去终止任务，并判断任务是否完成，若未完成则继续调用任务函数。它只是去做任务的中断和恢复，而任务是否已经完成则要依赖React告诉它。Scheduler和React相互配合的模式可以让React的任务执行具备异步可中断的特点。

## 双缓冲机制
双缓冲机制是React管理更新工作的一种手段，也是提升用户体验的重要机制。

当React开始更新工作之后，会有两个fiber树，一个current树，是当前显示在页面上内容对应的fiber树。另一个是workInProgress树，它是依据current树深度优先遍历构建出来的新的fiber树，所有的更新最终都会体现在workInProgress树上。当更新未完成的时候，页面上始终展示current树对应的内容，当更新结束时（commit阶段的最后），页面内容对应的fiber树会由current树切换到workInProgress树，此时workInProgress树即成为新的current树。

最终commit阶段完成时，两棵树会进行切换。
在未更新完成时依旧展示旧内容，保持交互，当更新完成立即切换到新内容，这样可以做到新内容和旧内容无缝切换。
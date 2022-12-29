## Update
```javascript
export type Update<State> = {
  // 本次更新任务的优先级(过期时间)
  expirationTime: ExpirationTime,
 
  // 这次更新的类型，比如this.setState()对应0，this.enqueueForceUpdate()对应2
  // export const UpdateState = 0;
  // export const ReplaceState = 1;
  // export const ForceUpdate = 2;
  // export const CaptureUpdate = 3;
  tag: 0 | 1 | 2 | 3,
  // 本次更新的内容，比如this.setState({ title: 'hello' })，这时payload为{ title: 'hello' }
  payload: any,
  // 这次更新的回调函数，比如this.setState({}, callback)
  callback: (() => mixed) | null,
  // 因为可以在一个组件上多次调用this.setState，这时会产生多个更新update，通过next连接
  next: Update<State> | null,
  // 用于记录更新完成后需要执行的副作用，比如上面的callback，这个也是一个链表的形式
  nextEffect: Update<State> | null,
};
```

当用户调用一些会产生更新的方法时，会创建一个update:
```javascript
this.setState({ title: 'hello' }, () => console.log('hello'));
this.setState(() => ({ title: 'world' }), () => console.log('world'));
 
const update1 = {
  expirationTime: 动态计算的一个时间值,
  tag: 0,
  payload: { title: 'hello' },
  callback: () => console.log('hello'),
  next: update2,
  nextEffect: update2
};
 
const update2 = {
  expirationTime: 动态计算的一个时间值,
  tag: 0,
  payload: () => ({ title: 'world' }),
  callback: () => console.log('world'),
  next: update1,
  nextEffect: update1
}
```
update形成的链表是一个循环链表，也就是最后一个的next会指向第一个
UpdateQueue
```javascript
export type UpdateQueue<State> = {
  // 上次更新完成后的state，用于本次更新使用
  baseState: State,
 
  // 记录update链表中的第一个update，也就是上面提到的update.next维护的链表
  firstUpdate: Update<State> | null,
  // 记录update链表中的最后一个update
  lastUpdate: Update<State> | null,
 
  // 更新过程中可能会出现异常，这时候react会尝试去更新，这时会创建一个用于更新异常的update
  // 这里就是维护异常更新的链表中的第一个和最后一个，每个update通过update.next连接
  firstCapturedUpdate: Update<State> | null,
  lastCapturedUpdate: Update<State> | null,
 
  // 记录update产生副作用的链表中的第一个和最后一个，通过update.nextEffect连接
  firstEffect: Update<State> | null,
  lastEffect: Update<State> | null,
 
  // 记录异常处理产生的update的副作用链表，通过update.nextEffect连接
  firstCapturedEffect: Update<State> | null,
  lastCapturedEffect: Update<State> | null,
};
```
这个updateQueue对应fiber里的updateQueue，每当组件调用会产生更新的函数时，比如setState，就是产生一个update，加入到组件对应的fiber中的
updateQueue中，在后续更新流程中就会遍历组件的updateQueue来计算出本次更新最终的state。
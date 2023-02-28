class StackArray {
  constructor() {
    this.items = [];
  }

  push(element) {
    this.items.push(element);
  }

  // 删除
  pop() {
    return this.items.pop();
  }

  // 查看栈顶
  peek() {
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  clear() {
    this.items = [];
  }

  toArray() {
    return this.items;
  }

  toString() {
    return this.items.toString();
  }
}

const stack = new StackArray();
stack.push(5)
stack.push(8)
console.log(stack.peek()) // 8
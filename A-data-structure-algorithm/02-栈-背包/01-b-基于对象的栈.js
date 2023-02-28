/**
在处理大量数据的时候（这在现实生活中的项目里很常见），我们同样需要评估如何操作数据是最高效的。
在使用数组时，大部分方法的时间复杂度是O(n)。

另外，数组是元素的一个有序集合，为了保证元素排列有序，它会占用更多的内存空间。
所以可以尝试使用一个JavaScript对象来存储所有的栈元素
 */
class Stack {
  constructor() {
    /*
    * 要向栈中添加元素，我们将使用count变量作为items对象的键名，插入的元素则是它的值。
    * 在向栈插入元素后，我们递增count变量。
    * */
    this.count = 0;
    this.items = {};
  }

  push(element) {
    this.items[this.count] = element;
    this.count++;
  }

  pop() {
    if (this.isEmpty()) {
      return undefined;
    }
    this.count--;
    const result = this.items[this.count];
    delete this.items[this.count];
    return result;
  }

  peek() {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items[this.count - 1];
  }

  isEmpty() {
    return this.count === 0;
  }

  size() {
    return this.count;
  }

  clear() {
    /* while (!this.isEmpty()) {
        this.pop();
      } */
    this.items = {};
    this.count = 0;
  }

  toString() {
    if (this.isEmpty()) {
      return '';
    }
    let objString = `${this.items[0]}`;
    for (let i = 1; i < this.count; i++) {
      objString = `${objString},${this.items[i]}`;
    }
    return objString;
  }
}

const stack = new Stack();
stack.push(5);
stack.push({ key: 'test' });
console.log(stack.peek()) // {key: 'test'}
/*
* 在内部，items包含的值和count属性如下所示。
* items = {   0: 5,   1: 8 }; count = 2;
* */

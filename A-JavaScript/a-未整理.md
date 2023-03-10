## 连续结构
```js
const obj = { a: 1, b: { c: 2 } };
const { a, b: { c: d } } = obj;
// Two variables are bound: `a` and `d`
```

## vue动态添加style样式
```
对象
:style="{ color: activeColor, fontSize: fontSize + 'px' }"

数组
:style="[{color:(index==0?conFontColor:'#000')},{fontSize:'20px'}]

三目
:style="{color:(index==0?conFontColor:'#000')}"
```

## class
https://www.cnblogs.com/lwming/p/10925318.html
```
对象
:class="{'p1' : true}"

数组
:class="[{'p1': false}, 'p2']"

三目
:class="[ 1 < 2 ? 'p1' : 'p' ]"
```


## Vue2中的语法糖.sync：
```
在父组件中的
<div :title.sync="visible" ></div>
等同于: / .sync将针对于title的监听事件缩写 /
<div :title="visible" @update:title="visible = $event" ></div>
在子组件的methods中使用如下将新的value传给父级：

handleClose() {
 this.$emit('update:title', newValue)
}
```

## Vue3中用v-model替代了.sync修饰符和组件的model选项 
```
<div v-model="visible" ></div>
没有参数但却实际上在父组件内传入modelValue，类似于：
v-model:modelValue="visible" @updata:modelValue="visible =$event"
在父组件里是运用visible,在子组件里传入的props里的是modelValue.
更改参数，传入父级也是用modelValue

this.$emit('update:modelValue', newValue)
```

## v-model的三个修饰符 
- lazy 加上.lazy后相当于 双向数据绑定不起作用了，实现懒加载，让其只在 change 事件中再加载输入框中的数据，即只有在输入框失去焦点或者按回车键时才会更新 Vue 实例中的值。
```
lazy：将触发input事件转为触发change事件，在某些场景下来降低数据同步频率提升性能。

使用lazy可以使数据不需要多次重写，减少消耗。
使模型绑定的数据只有在失去焦点或者是按下回车时才会更新
<input type="text" id="inp" v-model.lazy="message">
```
- number,自动将用户的输入值转为数值类型。
- trim去除首尾两端的空格

## 在 vue3 中支持自定义修饰符：
```
https://juejin.cn/post/6877745193097887751
```


## emit vue3
vue 2
```
<template>
<div>
  <button @click="onEmit"> 子组件透传事件 </button>
</div>
</template>
<script>
export default {
  methods: {
    onEmit() {
      this.$emit("on-change", "hi~");
    }
  }
}
</script>

父组件
<template>
<div>
  < child @on-change="onChildChange" />
</div>
</template>
<script>
import Child from "./Child.vue";
export default {
  components: {
    Child
  },
  methods: {
    onChildChange(v) {
      console.log(v); // hi~
    }
  }
}
</script>
```

vue3的emit($emit, emits-options)
子组件
```
<template>
  <div>
    <button @click="clickBtn" class="btn-item">hi~</button>
  </div>
</template>
<script>
import { defineComponent } from 'vue'
export default defineComponent({
  setup (props, ctx) {
    const clickBtn = () => {
      ctx.emit("on-change", "hi~");
    };
    return { clickBtn}
  }
})
</script>
```

父组件
```
<template>
  <div>
    <emit-child @on-change="emitFn" />
  </div>
</template>
```

## try...catch...finally三者的执行顺序
1. 如果try和catch模块中不存在return语句，那么运行完try和catch模块中的代码后再运行finally中的代码。
2. 如果try和catch模块中存在return语句，那么在运行return之前会运行finally中的代码
```
(1). 如果finally中存在return语句，则返回finally的return结果，代码运行结束。
(2). 如果finally不存在return语句，则返回try或catch中的return结果，代码运行结束。
```
3. 如果try和catch模块中存在throw语句，那么在catch运行throw之前会运行finally中的代码。
```
(1). 如果finally中存在return语句，则返回finally的return结果，代码运行结束。
(2). 如果finally不存在return语句，则运行catch中的throw语句，代码运行结束。
```

```js
    // 执行顺序test_try、test_finally
    function test() {
        try {
            console.log('test_try');
        } finally {
            console.log('test_finally'); 
        }
    }

    // 执行顺序test_1_try、test_1_finally、test_1_try_return
    function test1() {
        try {
            console.log('test_1_try');
            return 'test_1_try_return';
        } finally {
            console.log('test_1_finally'); 
        }
    }

	// 执行顺序test_2_try、test_2_finally、test_2_finally_return
    function test2() {
        try {
            console.log('test_2_try');
            return 'test_2_try_return';
        } finally {
            console.log('test_2_finally');
            return 'test_2_finally_return';
        }
    }

	// 执行顺序test_3_try、throw、test_3_finally、test_3_catch
    function test3() {
        try {
            console.log('test_3_try');
            throw new Error('throw');
        } catch (error) {
            console.log(error.message);
            return 'test_3_catch';
        } finally {
            console.log('test_3_finally');
        }
    }
    
        test();
        console.log(test1());
        console.log(test2());
        console.log(test3());
```






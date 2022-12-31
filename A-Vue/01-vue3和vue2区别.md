# 总结
1. vue2和vue3生命周期钩子不同 — 提供了类似react Hooks
```javaScript
setup-->onBeforeMount-->onMounted
beforeCreate-->created--> beforeMount-->mounted

// 见： 00-vue3-vue2生命周期-keep-alive.md
beforeCreate()    <--> setup()
created()         <--> setup()
beforeMount()     <--> onBeforeMount()
mounted()         <--> onMounted()

// 界面还没更新 但是data里面的数据是最新的。即页面尚未和最新的data里面的数据包同步
beforeUpdate()    <--> onBeforeUpdate()
// 表示页面和data里面的数据已经包吃同步了 都是最新的
updated()         <--> onUpdated()

// 当执行这个生命周期钩子的时候 vue的实例从运行阶段进入销毁阶段 此时实例身上的data 还有 methods处于可用的状态
beforeDestroy()   <--> onBeforeUnmount()
// 表示组件已经完全被销毁了 组件中所有的实例方法都是不能用了
destroyed()       <--> onUnmounted()
errorCaptured()   <--> onErrorCaptured()
```
2. 接收 Props 不同,setup,this
3. vue3 包含在一个反应状态（Reactive State）变量中
4. 按需引用的有了更细微的可控性，让项目的性能和打包大小有更好的控制。
5. vue3与vue2响应式的区别:使用 基于 Proxy 提升性能

## 1.vue3与vue2响应式的区别
###  1-1.基于 Proxy 的 Observation
目前，Vue 的响应式系统是使用带有 Object.defineProperty 的getter 和 setter。但是，Vue 3 将使用 ES2015 Proxy 作为其观察机制。这消除了以前存在的警告，使速度加倍，并使用了一半的内存。

PS:为了继续支持 IE11，Vue 3 将发布一个支持旧观察机制和新代理版本的构建。

## A-1.vue2 原理
```
A-Vue的响应式原理.md
```

<br />

## A-2.vue3 响应式
Object.defineProperty缺点，两个：
```
1.Object.defineProperty无法监控到数组下标的变化，导致直接通过数组的下标给数组设置值，不能实时响应。 为了解决这个问题，经过vue内部处理后可以使用以下几种方法来监听数组:
  push()
  pop()
  shift()
  unshift()
  splice()
  sort()
  reverse()
由于只针对了以上八种方法进行了hack处理,所以其他数组的属性也是检测不到的，还是具有一定的局限性。

2.Object.defineProperty只能劫持对象的属性,因此我们需要对每个对象的每个属性进行遍历。Vue 2.x里，是通过 递归 + 遍历 data 对象来实现对数据的监控的
Object.defineProperty只能劫持对象的属性,因此我们需要对每个对象的每个属性进行遍历
```

而要取代它的Proxy有以下两个优点;
```
1.可以劫持整个对象，并返回一个新对象,有13种劫持操作
2.利用reactive注册响应式对象，对函数返回值操作
3.利用Proxy劫持数据的get,set,deleteProperty,has,own
4.利用WeakMap,Map,Set来实现依赖收集

缺点：使用大量ES6新增特性，旧版本浏览器兼容性差。Proxy是es6提供的新特性，兼容性不好，最主要的是这个属性无法用polyfill来兼容
```

Proxy 和 Reflect是ES6新增的两个类，Proxy相比Object.defineProperty更加好用，解决了后者不能监听数组改变的缺点，并且还支持劫持整个对象,并返回一个新对象,不管是操作便利程度还是底层功能上都远强于Object.defineProperty，Reflect的作用是可以拿到Object内部的方法，并且在操作对象出错时返回false不会报错。

<br />

## 2.接收 Props 不同,setup,this
接收组件props参数传递这一块为我们带来了Vue2和Vue3之间最大的区别。
—this在vue3中与vue2代表着完全不一样的东西。

在 Vue2，this代表的是当前组件，不是某一个特定的属性。所以我们可以直接使用this访问prop属性值。就比如下面的例子在挂载完成后打印处当前传入组件的参数title。
```js
mounted () {
    console.log('title: ' + this.title)
}
```

但是在 Vue3 中，this无法直接拿到props属性，emit events（触发事件）和组件内的其他属性。不过全新的setup()方法可以接收两个参数：
1.props - 不可变的组件参数
2.context - Vue3 暴露出来的属性（emit，slots，attrs）
```js
 // 使用props 接收父组件传过来的值,是一个数组，多个参数可以使用逗号分开
props:["title","home"],
// 或则
props: {
  listSubProject: {
    type: Array,
    default: () => [],
  },
  isPm: {
    type: Boolean,
    default: false,
  },
},
methods:{
    getTitle(){
        // 方法中使用父组件传过来的参数，可以使用 this
        alert(this.title)
    }
},
setup (props) {
    // ...
    onMounted(() => {
      console.log('title: ' + props.title)
    })
    // ...
}
```

## 事件 - Emitting Events
在 Vue2 中自定义事件是非常直接的，但是在 Vue3 的话，我们会有更多的控制的自由度。
举例，现在我们想在点击提交按钮时触发一个login的事件。
在 Vue2 中我们会调用到this.$emit然后传入事件名和参数对象。
```js
login () {
      this.$emit('login', {
        username: this.username,
        password: this.password
      })
}
```

但是在 Vue3中，我们刚刚说过this已经不是和vue2代表着这个组件了，所以我们需要不一样的自定义事件的方式
在setup()中的第二个参数content对象中就有emit，这个是和this.$emit是一样的。那么我们只要在setup()接收第二个参数中使用分解对象法取出emit就可以在setup方法中随意使用了。
```js
setup (props, { emit }) {
    const login = () => {
      emit('login', {
        username: state.username,
        password: state.password
      })
    }
}
```

## 不同在于数据获取:Vue3中的反应数据:Reactive Data
```
Vue3 的设计模式给予开发者们按需引入需要使用的依赖包。这样一来就不需要多余的引用导致性能或者打包后太大的问题。
全新的合成式API（Composition API）可以提升代码的解耦程度 —— 特别是大型的前端应用，效果会更加明显。还有就是按需引用的有了更细微的可控性，让项目的性能和打包大小有更好的控制。
```

— 所以我们需要访问这个反应状态来获取数据值。

使用以下三步来建立反应性数据:

1.从vue引入reactive
2.使用reactive()方法来声名我们的数据为反应性数据
3.使用setup()方法来返回我们的反应性数据，从而我们的template可以获取这些反应性数据
```js
import { reactive } from 'vue'

export default {
  props: {
    title: String
  },
  setup () {
    const state = reactive({
      username: '',
      password: ''
    })

    return { state }
  }
}
```


## 路由方面,非重点
1.需要安装 router4

我们可以导入它并Vue.use(router)，但这在Vue3中不一样。
```js
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

vue2
```js
import Vue from 'vue'
import axios from 'axios'
import App from './App.vue'
import router from './router'
import store from './store'
import { initMutual } from "./utils/PCmutual.js";
import './index.less'

Vue.config.productionTip = false
Vue.prototype.axios = axios
initMutual();
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
```

vue3创建

createWebHashHistory hash 路由

createWebHistory history 路由

createMemoryHistory 带缓存 history 路由
```js
const router = createRouter({
  history: createWebHistory(),
  // history: createWebHashHistory(),
  routes
})
export default router
```
vue2
```js
import VueRouter from 'vue-router'
const router = new VueRouter({
  // mode: 'history',
  // base: process.env.BASE_URL,
  routes
})

export default router
```

## 优化 slots 的生成
目前在 Vue 中，当父组件重新渲染时，其子组件也必须重新渲染。使用Vue 3，可以单独重新渲染父级和子级
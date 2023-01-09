

## Vue3中的Provide和Inject 祖孙组件传值

```javaScript
// 父组件代码
<script>
import { provide } from "vue"
export default {
  setup(){
    provide('test',"val")
  }
}
</script>

// 子组件代码
<template>
 {{test}}
</template>
<script>
import { inject } from "vue"
export default {
  setup(){
    const info = inject('test')
    return{
      info
    }
  }
}
</script>
```
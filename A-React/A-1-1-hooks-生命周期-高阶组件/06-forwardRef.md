## 前言
ref必须指向dom元素而不是React组件
```javaScript
// 下面就是应用到React组件的错误示例：
const A=React.forwardRef((props,ref)=><B {...props} ref={ref}/>)


// 前面提到ref必须指向dom元素，那么正确方法就应用而生：
const  A=React.forwardRef((props,ref)=>(
<div ref={ref}>
	<B {...props} />
</div>
))
```

## 扩展 useImperativeHandle 可以让你在使用 ref 时自定义暴露给父组件的实例值。
在大多数情况下，应当避免使用 ref 这样的命令式代码。useImperativeHandle 应当与 forwardRef 一起使用。

```javaScript
/*
ref：定义 current 对象的 ref createHandle：一个函数，返回值是一个对象，即这个 ref 的 current
对象 [deps]：即依赖列表，当监听的依赖发生变化，useImperativeHandle 才会重新将子组件的实例属性输出到父组件
ref 的 current 属性上，如果为空数组，则不会重新输出。
*/

useImperativeHandle(ref, createHandle, [deps])
```

## React.forwardRef 
用于将父组件创建的 ref 引用关联到子组件中的任意元素上，也可以理解为子组件向父组件暴露 DOM 引用。

除此之外，因为 ref 是为了获取某个节点的实例，但是函数式组件是没有实例的，不存在 this 的，这种时候是拿不到函数式组件的 ref 的，而 React.forwardRef 也能解决这个问题。

应用场景：
- 获取深层次子孙组件的 DOM 元素
- 获取直接 ref 引用的子组件为非 class 声明的函数式组件
- 传递 refs 到高阶组件

```javaScript
// React.forwardRef 接受 渲染函数 作为参数。React 将使用 props 和 ref 作为参数来调用此函数。此函数应返回 React 节点。

// 函数定义
export function forwardRef<Props, ElementType: React$ElementType>(
  render: (props: Props, ref: React$Ref<ElementType>) => React$Node,
) {
  // do something

  const elementType = {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render,
  };

  // do something

  return elementType;
}
```

### forwardRef 获取子组件的Dom
```javaScript
// 子组件
export function AddForm(props: AddFormPrps, ref: any) {
  const [form] = Form.useForm()

	// 暴露组件的方法
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      const values = form.getFieldsValue()
      return values
    },
    resetForm: () => {
      form.resetFields()
    }
  }))

	return (
	      <Form
        form={form}
        name='template_form'
        layout='inline'
        onFinish={onFinish}
        initialValues={{ title: '', type: 0, tags: [] }}
      />
  )
}

const WrappedAddForm = forwardRef(AddForm)

export default WrappedAddForm

// 父组件：
export function TemplateModal(props: TemplateModalProps) {

  const formRef: any = useRef()

	// 调用子组件的方法
  const handleCancel = () => {
    formRef.current.resetForm()
    onClose()
    cleanModalCache()
  }

  return (
		<AddForm ref={formRef} formValues={formValues} />
	)
}
```

## 例子2：
```javaScript
function App() {
    const el = useRef(null)

    return (
        <div className="App">
            <ForwardCom ref={el}/>
            <button onClick={()=>{ console.log(el.current);}}>获取子组件的Dom</button>
        </div>
    );
}

// forwardRef获取子组件的Dom
const ForwardCom = forwardRef((props,ref)=>{

    return (
        <div>
            <div ref={ref}>子组件</div>
        </div>
    )

})
```

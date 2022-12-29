
## 一、从原理上
HashRouter在路径中包含了#，相当于HTML的锚点定位。（# 符号的英文叫hash，所以叫HashRouter，和散列没关系哦））

而BrowserRouter使用的是HTML5的新特性History，没有HashRouter(锚点定位)那样通用，低版本浏览器可能不支持。

## 二、从用法上
BrowserRouter进行组件跳转时可以传递任意参数实现组件间的通信，而HashRouter不能(除非手动拼接URL字符串)，因此一般配合Redux使用，实现组件间的数据通信。

## 三、生产实践
### 1.HashRouter
HashRouter相当于锚点定位，因此不论#后面的路径怎么变化，请求的都相当于是#之前的那个页面。可以很容易的进行前后端不分离的部署(也就是把前端打包后的文件放到服务器端的public或static里)，

因为请求的链接都是ip地址:端口/#/xxxx，因此请求的资源路径永远为/，相当于index.html，而其他的后端API接口都可以正常请求，不会和/冲突，由于前后端不分离也不会产生跨域问题。

### 3.BrowserRouter
因为BrowserRouter模式下请求的链接都是ip地址:端口/xxxx/xxxx，因此相当于每个URL都会访问一个不同的后端地址，如果后端没有覆盖到路由就会产生404错误。

可以通过加入中间件解决，放在服务器端路由匹配的最后，如果前面的API接口都不匹配，则返回index.html页面。但这样也有一些小问题，因为要求前端路由和后端路由的URL不能重复。

比如商品列表组件叫/product/list，而请求商品列表的API也是/product/list，那么就会访问不到页面，而是被API接口匹配到。

解决方法:
进行前后端分离的部署，比如前端地址ip1:端口1，后端接口地址ip2:端口2，使用Nginx反向代理服务器进行请求分发。前端向后端发起请求的URL为nginx所在的服务器+/api/xxx，通过NGINX的配置文件判断，如果URL以api开头则转发至后端接口，否则转发至前端的地址，访问项目只需访问Nginx服务器即可

```
HashRouter 只会修改URL中的哈希值部分；而 BrowserRouter 修改的是URL本身
HashRouter 是纯前端路由，可以通过输入URL直接访问；

使用时 BrowserRouter 直接输入URL会显示404，除非配置Nginx将请求指向对应的HTML文件。初次进入 / 路径时或点击 Link 组件跳转时不会发送请求
```

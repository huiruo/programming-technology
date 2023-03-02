## 在vim中输入:NERDTree
```
:q，可以关闭刚刚打开的文件
文件夹模式下 o/enter，打开文件夹
O 展开所有目录 
X 关闭所有目录 
x 关闭父级目录
C，可以更改当前的root目录
```

## 新建文件
ma  在要创建文件的目录中按命令

## 删除文件
md在要删除的文件上按命令

## 移动文件/修改文件名
mm在要修改的文件上按命令

## 设置当前目录为项目根目录
C在要设置为根目录的目录上按命令C【大写】即可。

## 查看当前文件所在目录
:NERDTreeFind执行命令 
:NERDTreeFind 或则在.vimrc中添加
```
map <leader>v :NERDTreeFind<CR>
```

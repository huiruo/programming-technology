## 内置的终端
:terminal ，让我可以轻松地在Neovim中打开一个终端作为分割

进入终端分片时默认总是处于插入模式：
```
autocmd BufEnter * if &buftype == 'terminal' | :startinsert | endif
```

## Neoterm插件
```
:T ls
```
可以设置neoterm_size 和neoterm_default_mod 来定义终端的显示方式。我把它设置为屏幕宽度的30%左右，并且在右侧是垂直的：
```
vim.g.neoterm_size = tostring(0.3 * vim.o.columns)
vim.g.neoterm_default_mod = 'botright vertical'
```

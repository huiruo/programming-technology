
https://devpress.csdn.net/linux/62ed0f9719c509286f417e3e.html

## order
```
:TSInstallInfo 来查看当前我们安装了哪些解析模块。


使用 :TSInstall <language>的命令可以下载指定语言的模块。

这里我们使用 :TSInstall lua 来下载lua模块。

后续我们可以使用 :TSUpdate lua 来更新该模块。

跟 packer 类似的 :TSUpdate 即可以用来下载也可以用来更新。也就是一条命令就搞定了

安装完成之后我们可以使用
:TSBufToggle highlight
来使用 treesitter 进行高亮
```


每次都需要手工调用命令来进行高亮的话，就太不智能了。我们可以在配置文件中配置它自动加载语法高亮。
```
require('nvim-treesitter.configs').setup({                                               
    -- 支持的语言
    ensure_installed = {"html", "css", "vim", "lua", "javascript", "typescript", "c", "cpp", "python"},
    -- 启用代码高亮
    highlight = {
        enable = true,
        additional_vim_regex_highlighting = false
    },
    --启用增量选择
    incremental_selection = {
        enable = true,
        keymaps = {
            init_selection = '<CR>',
            node_incremental = '<CR>',
            node_decremental = '<BS>',
            scope_incremental = '<TAB>'
        }
    },
    -- 启用基于 Treesitter 的代码格式化(=)
    indent = {
        enable = true
    },
})
-- 开启代码折叠
vim.wo.foldmethod = 'expr'
vim.wo.foldexpr = 'nvim_treesitter#foldexpr()'
-- 默认不折叠
vim.wo.foldlevel = 99
```

```
ensure_installed 表示需要支持哪些语言，
如果里面设置了某些语言，那么在启动之后它会自动调用 :TSUpdate 来下载和更新对应语言的 server 部分。

等它下载完了对应的语言模块之后，我们发现它已经很好的完成了代码着色的功能。

增量选择可以一次选择一块的代码，依次扩大或者缩小所选择的语言块，我们使用回车来开始和扩大增量选择，使用退格键来减少增量选择代码块。各位小伙伴可以根据自己的习惯来定义快捷键
```

另外我们可以使用 = 来格式化代码。为了方便我们定义自动命令，每当执行 :w 写入前前自动格式化代码

这里因为提前使用了 gg改变了光标位置，在格式化之后使用 `` 来回到上次跳转之前的位置。
最后我们可以使用 zc 和 zo 来折叠和展开代码。
```
local auto_indent = vim.api.nvim_create_augroup("AUTO_INDENT", {clear = true})
vim.api.nvim_create_autocmd({"BufWritePost"}, {
    pattern = "*",
    group = auto_indent,
    command = 'normal! gg=G``'
})
```


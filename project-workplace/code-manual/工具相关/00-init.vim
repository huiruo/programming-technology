set rtp +=~/.config/nvim
"set number

" plug
call plug#begin('~/.config/nvim/autoload')
Plug 'one-dark/onedark.nvim'
Plug 'preservim/nerdtree'
Plug 'godlygeek/tabular'
Plug 'preservim/vim-markdown'
call plug#end()

colorscheme onedark
"autocmd VimEnter * NERDTree

let NERDTreeWinPos='left'
let NERDTreeWinSize=20

let g:vim_markdown_folding_disabled = 1

" 常用
noremap Z ZZ <CR>
noremap <space> :
inoremap jk <Esc>
"快速切换到行首行尾                            noremap H ^
noremap L $

map T :NERDTreeToggle<CR>
" markdown code block
nmap Y i##<space>
nmap F i```<CR>```<Up><CR>

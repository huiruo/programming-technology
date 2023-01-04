## readme
```
vi ~/.config/code-server/config.yaml

code-server --host 0.0.0.0

后台运行：
proot-distro login ubuntu
nohup code-server --host 0.0.0.0 >> /home/code-server-config/log.txt 2>&1 &
vi /home/code-server-config/log.txt
abchen123
```

## 不要从g play 安装
```
从git下载：
https://github.com/termux/termux-app#installation

termux-app_v0.118.0+github-debug_arm64-v8a.apk

备份：
Ensure that storage permission is granted:

termux-setup-storage

Backing up files:
tar -zcf /sdcard/termux-backup.tar.gz -C /data/data/com.termux/files ./home ./usr
```

## 基础-创建文件夹和文件
```
mkdir /root/log-codeserver

touch /root/log-codeserver/log.txt

rm -f testfile

rm -rf testfile

查看版本
cat /etc/issue
```

## 不使用ubuntu 登录，推荐使用自带平台
```
不要登录中输入: $ termux-setup-storage
这个命令并允许权限后，Termux主目录会生成 Storage 子目录

非登录中能访问手机根目录：
cd /storage/emulated/0/
mkdir termux-space
mkdir

此命令在home中创建storage文件夹，里面有shared、dcim、downloads、pictures等等链接，分别指向内部存储的相应文件夹，其中shared是指向内部存储的根目录[2]。
```

## 安装软件如果更新失败
```
pkg update && pkg upgrade
或：
apt update && apt upgrade

pkg install git openssh
pkg i vim
export EDITOR=vim  把默认编辑器修改为vim


如果失败：
pkg remove game-repo
pkg remove science-repo
pkg update
```

git:
```
Generating public/private rsa key pair.
Enter file in which to save the key (/data/data/com.termux/files/home/.ssh/id_rsa):

cd /data/data/com.termux/files/home/.ssh

vim id_rsa.pub
cd /storage/emulated/0/termux-space/
git clone git@github.com:huiruo/life.git
```

## 启动code-server
注意后面的参数是需要的，否则服务器外面的机器是连不上的。
```
code-server --port 6666 --host 0.0.0.0
code-server --host 0.0.0.0
```

```
cd /root/.local/share/code-server/User
touch keybindings.json
```

```
insert:
jj-- Esc
tt-- C-v
ty-- markdown

Normal:
tt-- C-v
ty-- markdown
zz--  quit
zr--> activityBar
zm--> terminal

v:
cc --> copy
```

## 安装 code 
curl -fsSL https://code-server.dev/install.sh | sh
```
CentOS Linux 7 (Core)
Installing v4.4.0 of the amd64 rpm package from GitHub.

+ mkdir -p ~/.cache/code-server

To have systemd start code-server now and restart on boot:
  sudo systemctl enable --now code-server@$USER
Or, if you don't want/need a background service you can run:
  code-server
```

## Stop the code-server
对于后台运行的服务，首先要根据你服务的端口号找到进程pid，然后使用kill命令结束服务进程

查看使用某端口的进程：lsof -i:8090
或 netstat -ap|grep 8090
查看到进程id之后，使用netstat命令查看其占用的端口

netstat -nap|grep 6688

终止后台运行的进程：kill -9 进程号
```
netstat -tunlp

# 回显（部分）
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:9999            0.0.0.0:*               LISTEN      20309/node
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      1163/sshd
tcp        0      0 127.0.0.1:25            0.0.0.0:*               LISTEN      1379/master
tcp6       0      0 :::22                   :::*                    LISTEN      1163/sshd

# 可以看到占用0.0.0.0:9999的进程的pid为20309

# kill掉即可

kill -9 20309

kill -9 20405
```

## 常用软件 termux
apt update     // 更新源
apt upgrade  // 升级软件包
```
pkg install vim
apt install wget   // 下载工具
apt install tar    // 解压缩工具
```

## 安装 linux
pkg install proot-distro 
proot-distro list
```
proot-distro install <alias> 
比如，我要安装ubuntu 20.04，指令为：
proot-distro install ubuntu-20.04

proot-distro login ubuntu
输入exit可以退出登录的linux系统
```

### 安装Linux后
```
apt update
apt upgrade

可选：
apt install nodejs
apt install npm
apt install gcc
apt install g++
apt install gfortran
apt install cmake

然后安装java：
apt search openjdk

然后安装python。
apt install python3
```

### vim 配置
https://www.bilibili.com/video/av844444336/
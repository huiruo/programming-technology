PM2和Docker都是流程管理器，它们都可以执行日志转发，重新启动崩溃的工作程序以及许多其他事情.如果您在docker容器中运行pm2，则您的服务将隐藏潜在的问题，至少要遵循以下条件:

1)如果您使用pm2在每个容器上运行一个进程，那么除了增加内存消耗之外，您将不会获得太多收益.可以使用具有重启策略的纯docker完成重启.其他基于docker的环境(例如ECS或Kubernetes)也可以做到这一点.

2)如果您运行多个进程，则将使监视更加困难. CPU/内存指标不再对您的封闭环境直接可用.

3)对单个PM2流程进行健康检查的请求将在工人之间分配，这很可能隐藏不健康的目标

4)pm2隐藏了工伤事故.您几乎不会从监视系统(如CloudWatch)中了解它们.

5)负载平衡变得更加复杂，因为实际上您将具有多个级别的负载平衡.

在docker容器中运行多个进程也与docker的理念相反，即每个容器仅保留一个进程.

我能想到的一种情况是，您对Docker环境的控制非常有限.在这种情况下，运行pm2可能是控制工作人员调度的唯一选择.

---
title: 不联网使用 Epico Pilot
description: 如何不联网使用 Epico Pilot
keywords: [不联网, air-gapped, 本地模型]
---

Epico Pilot 甚至可以运行在 air-gapped 计算机上，如果你使用本地模型。只需要少量的调整就可以工作。

1. 从 [Open VSX Registry](https://open-vsx.org/extension/Epico Pilot/continue) 下载最新的 .vsix 文件，并 [安装它到 VS Code](https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix) 。
2. 打开 `~/.continue/config.json` 并设置 `"allowAnonymousTelemetry": false` 。这将停止 Epico Pilot 尝试请求 PostHog 获取 [匿名遥测](../../telemetry.md) 。
3. 还在 `config.json` 中，设置默认的模型为本地模型。你可以 [在这里](../model-providers/) 看到可用的选项。
4. 重启 VS Code 确保对 `config.json` 的变更生效。

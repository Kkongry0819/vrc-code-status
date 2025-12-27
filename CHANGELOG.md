# 更新日志

本项目的所有重要变更都会记录在此文件中。

## [0.0.1] - 2025-12-27
### 新增
- 通过 OSC（`/chatbox/input`）将当前活动文件名与语言发送到 VRChat Chatbox。
- 支持自定义消息模板与占位符：
  - `{nick}`、`{file}`、`{lang}`
  - `{errorsCount}`、`{warningsCount}`、`{errorTop}`、`{warningTop}`
- 节流发送，减少编辑时刷屏（`throttleMs`）。
- 可选：保存文件时发送（`sendOnSave`）。
- 当 Problems（错误/警告）变化时自动更新（diagnostics change）。
- 可选：保活/定时刷新，让 Chatbox 内容更常驻（`keepAliveSec` / periodic refresh）。
- 支持 UTF-8 文本（支持中文）。

### 变更
- 默认关闭 Chatbox 提示音（静默发送）。

### 备注
- 如果在 WSL 中开发、但 VRChat 运行在 Windows，建议将扩展作为 UI 扩展运行，以确保 OSC 从 Windows 发送到本机 VRChat（`extensionKind: ["ui"]`）。

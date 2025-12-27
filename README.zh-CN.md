# 🎮 VRC Code Status

🌐 English: [README.md](./README.md)

通过 OSC 把你在 VS Code 里正在写的 文件/语言/报错警告 显示到 VRChat Chatbox。

说明：VRChat 的 Chatbox 天生就是“短暂消息”，会淡出消失。你可以在 VRChat 里把显示时长调长，并在插件里开启定时刷新/保活来减少“消失”。

---

## ✨ 功能

- 通过 /chatbox/input 向 VRChat Chatbox 发送文本
- 显示：当前文件名、语言、错误/警告数量、第一条错误/警告摘要
- 支持自定义模板（占位符）
- 自动更新触发：
  - 切换文件
  - 保存（可选）
  - Problems 变化（diagnostics 更新）
- 节流防刷屏（throttleMs）
- 可选定时刷新/保活（keepAliveSec）
- 支持中文（UTF-8）
- 默认静音（不触发提示音）

---

## 🚀 快速上手

1) VRChat 开启 OSC
- 打开 VRChat
- 小菜单（PC R键位，手柄左手柄上面的键长按） -> 选项 -> OSC -> 已开启

2) 安装插件
- 从 Marketplace 安装（方法一）
- 从 Github 上下载 release 版本并通过 Install from VSIX 安装（方法二不推荐）

3) 配置（推荐）
- 按 Ctrl+Shift+P
- 运行：Preferences: Open User Settings (JSON)
- 添加：

```json
{
  "vrcOsc.enabled": true,
  "vrcOsc.host": "127.0.0.1",
  "vrcOsc.port": 9000,
  "vrcOsc.nickname": "XXX",
  "vrcOsc.throttleMs": 400,
  "vrcOsc.sendOnSave": false,
  "vrcOsc.keepAliveSec": 28,
  "vrcOsc.template": "{nick}正在Coding {file} [{lang}]\\nproblem({errorsCount}): {errorTop}\\nwarning({warningsCount}): {warningTop}\\n今天又是充满活力的一天呢！"
}
```

提示：设置里的换行请写 \\n，插件会把它转换为真正的换行。

---

## 🧩 模板占位符

- {nick}：昵称
- {file}：当前文件名
- {lang}：语言（VS Code languageId）
- {errorsCount} / {warningsCount}
- {errorTop} / {warningTop}

---

## ⚙️ 设置项

- vrcOsc.enabled（是否启用）
- vrcOsc.host（默认 127.0.0.1）
- vrcOsc.port（默认 9000）
- vrcOsc.throttleMs（节流）
- vrcOsc.nickname（昵称）
- vrcOsc.template（模板）
- vrcOsc.sendOnSave（保存是否发送）
- vrcOsc.keepAliveSec（保活秒数；0=关闭）

---

## 🐧 WSL / 远程开发注意事项

如果你在 WSL 里开发，但 VRChat 在 Windows 跑，那么插件需要在 Windows(UI) 侧运行，这样 127.0.0.1:9000 才会发到 Windows 上的 VRChat。

---

## 🐞 反馈 / Bug 提交

如果你遇到 Bug 或有功能建议，欢迎在 GitHub 的 Issues 里提出。
建议同时附上 VS Code 版本、插件版本，以及可复现的步骤/截图，方便定位问题。

---

## 📄 License

MIT

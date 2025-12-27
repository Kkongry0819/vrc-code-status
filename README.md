# 🎮 VRC Code Status

🌏 中文说明: [README.zh-CN.md](./README.zh-CN.md)

Show your current VS Code activity (file / language / diagnostics) in VRChat Chatbox via OSC.

Note: VRChat Chatbox messages are temporary and will fade out. You can extend the display duration in VRChat settings and optionally enable periodic refresh in this extension.

---

## ✨ Features

- Send current active file name and language to VRChat Chatbox (/chatbox/input)
- Diagnostics summary:
  - errors and warnings count
  - top error and warning message
- Custom message template with placeholders
- Updates on:
  - active editor change
  - save (optional)
  - diagnostics change (Problems updates)
- Throttling (throttleMs)
- Optional keep-alive / periodic refresh (keepAliveSec)
- UTF-8 supported (Chinese is OK)
- Silent sending (no notification sound)

---

## 🖼️ Demo

<p align="center">
  <img src="./demo.png" alt="VRChat Chatbox Demo" width="420" />
</p>
---

## 🚀 Quick Start

1) Enable OSC in VRChat
- Open VRChat
- Action Menu -> OSC -> Enabled

2) Install the extension
- Install from the Marketplace (Method 1)
- Download the VSIX from GitHub Releases and install via “Install from VSIX...” (Method 2, not recommended)

3) Configure (recommended)
- Press Ctrl+Shift+P
- Run: Preferences: Open User Settings (JSON)
- Add:

```json
{
  "vrcOsc.enabled": true,
  "vrcOsc.host": "127.0.0.1",
  "vrcOsc.port": 9000,
  "vrcOsc.nickname": "XXX",
  "vrcOsc.throttleMs": 400,
  "vrcOsc.sendOnSave": false,
  "vrcOsc.keepAliveSec": 28,
  "vrcOsc.template": "{nick} is coding {file} [{lang}]\\nproblem({errorsCount}): {errorTop}\\nwarning({warningsCount}): {warningTop}"
}
```

Tip: Use \\n in settings to represent a newline.

4) Optional: keep it visible longer
- In VRChat settings, increase Chatbox Display Duration (e.g. 60s)
- If you only want yourself to see it, set visibility to Mine

---

## 🧩 Template Placeholders

- {nick}: nickname
- {file}: current file name
- {lang}: VS Code languageId
- {errorsCount}, {warningsCount}
- {errorTop}, {warningTop}

---

## ⚙️ Settings

- vrcOsc.enabled (boolean)
- vrcOsc.host (string)
- vrcOsc.port (number)
- vrcOsc.throttleMs (number)
- vrcOsc.nickname (string)
- vrcOsc.template (string)
- vrcOsc.sendOnSave (boolean)
- vrcOsc.keepAliveSec (number, 0 disables)

---

## 🐧 WSL / Remote Development Notes

If you develop in WSL but run VRChat on Windows, the extension should run on Windows (UI) so that 127.0.0.1:9000 reaches VRChat.

Recommended in package.json:
"extensionKind": ["ui"]

---

## 🐞 Feedback / Bug Reports

If you find a bug or have a feature request, please open an issue on GitHub.
Include your VS Code version, extension version, and steps to reproduce if possible.

---

## 📄 License

MIT

# VRC Code Status

Show your current VS Code file, language, and diagnostics in VRChat via OSC Chatbox.

## Features
- Sends the active file name and language to VRChat Chatbox
- Optional: include Problems/Warnings counts and top messages
- Customizable template with placeholders
- Supports UTF-8 (Chinese) text

## Settings
- `vrcOsc.enabled`: Enable/disable sending
- `vrcOsc.host`: OSC host (default `127.0.0.1`)
- `vrcOsc.port`: OSC port (default `9000`)
- `vrcOsc.nickname`: Your nickname shown in template
- `vrcOsc.template`: Message template (supports `\n`)
- `vrcOsc.throttleMs`: Throttle interval in ms
- `vrcOsc.sendSfx`: Whether to trigger notification sound
- `vrcOsc.sendOnSave`: Send on save

## Template placeholders
- `{nick}` `{file}` `{lang}`
- `{errorsCount}` `{warningsCount}`
- `{errorTop}` `{warningTop}`

## VRChat
Enable OSC in VRChat, then the extension will send messages to the Chatbox endpoint `/chatbox/input`.

## License
MIT

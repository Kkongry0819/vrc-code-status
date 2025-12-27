import * as vscode from "vscode";
import * as path from "path";
import dgram from "dgram";

function pad4(n: number) {
  return (4 - (n % 4)) % 4;
}

function oscString(s: string): Buffer {
  const b = Buffer.from(s, "utf8");
  const len = b.length + 1; // + '\0'
  const total = len + pad4(len);
  const out = Buffer.alloc(total);
  b.copy(out, 0);
  out[b.length] = 0;
  return out;
}

// /chatbox/input s b n
// OSC bool 用 typetag 'T'/'F' 表示，且不占 data bytes
function buildChatboxPacket(text: string, enter: boolean, notify: boolean): Buffer {
  const address = oscString("/chatbox/input");
  const tags = oscString(",s" + (enter ? "T" : "F") + (notify ? "T" : "F"));
  const str = oscString(text);
  return Buffer.concat([address, tags, str]);
}

const out = vscode.window.createOutputChannel("VRC OSC");
type VrcConfig = {
  enabled: boolean;
  host: string;
  port: number;
  throttleMs: number;
  nickname: string;
  template: string;
  sendSfx: boolean;
  sendOnSave: boolean;
  keepAliveSec: number; // 0=关闭；>0 每隔 N 秒重发一次 lastSent
};

function getConfig(): VrcConfig {
  const cfg = vscode.workspace.getConfiguration("vrcOsc");
  return {
    enabled: cfg.get<boolean>("enabled", true),
    host: cfg.get<string>("host", "127.0.0.1"),
    port: cfg.get<number>("port", 9000),
    throttleMs: cfg.get<number>("throttleMs", 400),
    nickname: cfg.get<string>("nickname", "XXX"),
    template: cfg.get<string>("template", "{nick}正在Coding {file}\\nproblem({errorsCount}): {errorTop}\\nwarning({warningsCount}): {warningTop}\\n今天又是充满活力的一天呢！"),
    sendSfx: cfg.get<boolean>("sendSfx", false),
    sendOnSave: cfg.get<boolean>("sendOnSave", false),
    keepAliveSec: cfg.get<number>("keepAliveSec", 0),
  };
}

function sendChatbox(text: string, cfg: VrcConfig, forceNoSfx = false) {
  const notify = forceNoSfx ? false : cfg.sendSfx;
  out.appendLine(
    `[sendChatbox] host=${cfg.host} port=${cfg.port} notify=${notify} text="${text}"`
  );
  const msg = buildChatboxPacket(text, true, notify);
  const sock = dgram.createSocket("udp4");
  sock.send(msg, 0, msg.length, cfg.port, cfg.host, (err) => {
    out.appendLine(err ? `[udp error] ${String(err)}` : `[udp sent] bytes=${msg.length}`);
    sock.close();
  });
}


function gatherDiagnostics(doc: vscode.TextDocument) {
  const diags = vscode.languages.getDiagnostics(doc.uri);

  const errors = diags.filter(
    (d) => d.severity === vscode.DiagnosticSeverity.Error
  );
  const warnings = diags.filter(
    (d) => d.severity === vscode.DiagnosticSeverity.Warning
  );

  const clean = (s: string) => s.replace(/\s+/g, " ").trim();

  return {
    errorsCount: errors.length,
    warningsCount: warnings.length,
    errorTop: errors.length ? clean(errors[0].message) : "无",
    warningTop: warnings.length ? clean(warnings[0].message) : "无",
  };
}

function clampChatbox(text: string) {
  // 最多 9 行（包含换行）
  const lines = text.split(/\r?\n/).slice(0, 9);
  let out = lines.join("\n");

  // 最多 144 “字符”（按 codepoint；避免把 emoji/中文切坏）
  const arr = Array.from(out);
  if (arr.length > 144) {
    out = arr.slice(0, 144).join("");
  }

  return out;
}

function renderText(doc: vscode.TextDocument, cfg: VrcConfig): string {
  const file = path.basename(doc.fileName || "untitled");
  const lang = doc.languageId || "text";
  const d = gatherDiagnostics(doc);

  // settings.json 里写的 \n 是两个字符，这里转成真正换行
  const tpl = cfg.template.replace(/\\n/g, "\n");

  let text = tpl
    .replaceAll("{nick}", cfg.nickname)
    .replaceAll("{file}", file)
    .replaceAll("{lang}", lang)
    .replaceAll("{errorsCount}", String(d.errorsCount))
    .replaceAll("{warningsCount}", String(d.warningsCount))
    .replaceAll("{errorTop}", d.errorTop)
    .replaceAll("{warningTop}", d.warningTop);

  return clampChatbox(text);
}

export function activate(context: vscode.ExtensionContext) {
  out.show(true);
  out.appendLine("activate() called");

  let lastSent = "";
  let lastSentAt = 0;

  let timer: NodeJS.Timeout | undefined;

  const schedule = (doc?: vscode.TextDocument) => {
    const cfg = getConfig();
    if (!cfg.enabled) {return;}
    if (!doc) {return;}

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      const freshCfg = getConfig();
      if (!freshCfg.enabled) {return;}

      const text = renderText(doc, freshCfg);
      if (text && text !== lastSent) {
        sendChatbox(text, freshCfg, true /* forceNoSfx: 永远不响 */);
        lastSent = text;
        lastSentAt = Date.now();
      } else if (text && !lastSent) {
        // 第一次初始化
        sendChatbox(text, freshCfg, true);
        lastSent = text;
        lastSentAt = Date.now();
      }
    }, cfg.throttleMs);
  };

  // 1) 切换当前文件就发
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor?.document) {schedule(editor.document);}
    })
  );

  // 2) 可选：保存也发（开关）
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      const cfg = getConfig();
      if (cfg.sendOnSave) {schedule(doc);}
    })
  );

  // 3) 报错/警告变化时更新（只管当前文件）
  context.subscriptions.push(
    vscode.languages.onDidChangeDiagnostics((e) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {return;}
      const active = editor.document.uri.toString();
      const changed = e.uris.some((u) => u.toString() === active);
      if (changed) {
        schedule(editor.document);
      }
    })
  );

  // 4) keepAlive：每 1 秒检查一次是否需要重发（重发永远不响）
  const keepAliveTick = setInterval(() => {
    const cfg = getConfig();
    if (!cfg.enabled) {return;}
    if (!cfg.keepAliveSec || cfg.keepAliveSec <= 0) {return;}
    if (!lastSent) {return;}

    const now = Date.now();
    const due = now - lastSentAt >= cfg.keepAliveSec * 1000;
    if (!due) {return;}

    // 重发同样的 lastSent，让 chatbox 再出现一次（不响）
    sendChatbox(lastSent, cfg, true /* forceNoSfx */);
    lastSentAt = now;
  }, 1000);

  context.subscriptions.push({ dispose: () => clearInterval(keepAliveTick) });

  // 启动时如果已有打开文件，也发一次
  const editor = vscode.window.activeTextEditor;
  if (editor?.document) {
    schedule(editor.document);
  }
}
export function deactivate() {}

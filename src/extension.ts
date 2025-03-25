import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import express from "express";
import * as http from "http";
import * as os from "os";
import * as qrcode from "qrcode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "mobile-live-preview",
    async () => {
      const workspaceFolder =
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceFolder) {
        vscode.window.showErrorMessage(
          "Please open a folder in VS Code first."
        );
        return;
      }

      const port = await findAvailablePort(3000);
      startStaticServer(workspaceFolder, port);

      const ip = getLocalIP();
      const activeFilePath =
        vscode.window.activeTextEditor?.document.uri.fsPath;
      const relativePath = activeFilePath
        ?.replace(workspaceFolder, "")
        .replace(/\\/g, "/");
      const url = `http://${ip}:${port}${relativePath}`;

      const panel = vscode.window.createWebviewPanel(
        "simplePreview",
        "Mobile Live Preview",
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, "public")),
          ],
        }
      );

      const qrDataURL = await qrcode.toDataURL(url);
      panel.webview.html = getHtml(panel, context, "", qrDataURL);

      panel.webview.onDidReceiveMessage((message) => {
        if (message.type === "get-start-url") {
          panel.webview.postMessage({ type: "start-url", url });
        }
      });

      vscode.workspace.onDidSaveTextDocument((doc) => {
        if (doc.uri.fsPath.startsWith(workspaceFolder)) {
          panel.webview.postMessage({ type: "reload" });
        }
      });

      vscode.window.showInformationMessage(`Preview running at ${url}`);
    }
  );

  context.subscriptions.push(disposable);
}

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

function startStaticServer(folder: string, port: number) {
  const app = express();
  app.use(express.static(folder));
  app.listen(port, "0.0.0.0", () => {
    console.log(`Static server running on http://0.0.0.0:${port}`);
  });
}

function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(startPort, () => {
      server.close(() => resolve(startPort));
    });
    server.on("error", () => resolve(findAvailablePort(startPort + 1)));
  });
}

function getHtml(
  panel: vscode.WebviewPanel,
  context: vscode.ExtensionContext,
  url: string,
  qrCode: string
) {
  const htmlPath = path.join(context.extensionPath, "public", "index.html");
  let html = fs.readFileSync(htmlPath, "utf8");

  const cssUri = panel.webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, "public", "style.css"))
  );

  html = html.replace('href="style.css"', `href="${cssUri}"`);
  html = html.replace("{{URL}}", url);
  html = html.replace("{{QRCODE}}", qrCode);

  return html;
}

export function deactivate() {}

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import express from "express";
import * as http from "http";

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

      const url = `http://localhost:${port}`;
      const panel = vscode.window.createWebviewPanel(
        "simplePreview",
        "Mobile Live Preview",
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, "public")),
          ],
        }
      );

      panel.webview.html = getHtml(panel, context, url);
      vscode.window.showInformationMessage(`Preview running at ${url}`);

      vscode.workspace.onDidSaveTextDocument(() => {
        panel.webview.postMessage({ type: "reload" });
      });
    }
  );

  context.subscriptions.push(disposable);
}

function startStaticServer(folder: string, port: number) {
  const app = express();
  app.use(express.static(folder));
  app.listen(port, () => {
    console.log(`Static server running on http://localhost:${port}`);
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
  url: string
) {
  const htmlPath = path.join(context.extensionPath, "public", "index.html");
  let html = fs.readFileSync(htmlPath, "utf8");

  const cssUri = panel.webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, "public", "style.css"))
  );

  html = html.replace('href="style.css"', `href="${cssUri}"`);
  html = html.replace("{{URL}}", url);

  return html;
}

export function deactivate() {}

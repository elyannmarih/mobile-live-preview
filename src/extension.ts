import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";

export function activate(context: vscode.ExtensionContext) {
  console.log('Your extension "mobile-live-preview" is now active!');

  const disposable = vscode.commands.registerCommand(
    "mobile-live-preview",
    async (fileUri: vscode.Uri) => {
      const workspaceFolder =
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceFolder) {
        vscode.window.showErrorMessage(
          "Please open a folder in VS Code first."
        );
        return;
      }

      const relativePath = path
        .relative(workspaceFolder, fileUri.fsPath)
        .replace(/\\/g, "/");

      try {
        const port = await resolveDynamicPort();
        const url = `http://localhost:${port}/${relativePath}`;

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
      } catch (err) {
        vscode.window.showErrorMessage(
          "Could not find an active local server. Please ensure Live Server or your custom server is running."
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

async function resolveDynamicPort(): Promise<number> {
  const liveServerPort = vscode.workspace
    .getConfiguration("liveServer")
    .get<number>("settings.port");

  const fallbackPort =
    vscode.workspace
      .getConfiguration("mobileLivePreview")
      .get<number>("port") || 5500;

  let port = liveServerPort || fallbackPort;

  while (!(await isPortActive(port))) {
    port++;
    if (port > 5600) {
      throw new Error("No available port found.");
    }
  }

  return port;
}

function isPortActive(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get({ host: "localhost", port, timeout: 500 }, () => {
      req.destroy();
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => resolve(false));
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

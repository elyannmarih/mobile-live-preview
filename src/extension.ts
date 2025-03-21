import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log('Your extension "mobile-live-preview" is now active!');

  const disposable = vscode.commands.registerCommand(
    "mobile-live-preview",
    async () => {
      const url = await vscode.window.showInputBox({
        prompt: "Enter the URL to preview (e.g., http://localhost:5500/)",
      });

      if (!url) {
        vscode.window.showErrorMessage("No URL provided.");
        return;
      }

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
    }
  );

  context.subscriptions.push(disposable);
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

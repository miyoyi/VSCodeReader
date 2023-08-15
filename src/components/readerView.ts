import {
  window,
  commands,
  WebviewView,
  ProgressLocation,
  WebviewViewProvider,
  Webview,
  ExtensionContext,
  ViewColumn
} from 'vscode';
import * as fs from 'fs';
import * as chardet from 'chardet';
import * as iconv from 'iconv-lite';
import * as mammoth from 'mammoth';
import getHtmlForWebview from './utils/getHtmlForWebview';

export default class ReaderViewProvider implements WebviewViewProvider {

  public static readonly viewType = 'VSCodeReader.readerView';

  private _view?: WebviewView;
  private _isLoading: boolean = false;

  constructor(private context: ExtensionContext) {}

  public resolveWebviewView(webviewView: WebviewView) {
    this._view = webviewView;

    this._view.webview.options = {
      enableScripts: true,
    };

    this._view.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'openFile':
          const filePath = message.value;
          await this.readFile(filePath);
          break;
        case 'openCommand':
          if (this._isLoading) { return; }
          commands.executeCommand('extension.openFile');
          break;
        default:
          break;
      }
    });
    const lastOpenedFile = this.context.workspaceState.get<string>('lastOpenedFile');
    if (lastOpenedFile) {
      this.readFile(lastOpenedFile);
    }

    const htmlContent = getHtmlForWebview();
    this.updateWebview(htmlContent);
  }

  public async readFile(filePath: string) {
    this._isLoading = true;
    await window.withProgress({
      location: ProgressLocation.Notification,
      title: 'Reading file...',
      cancellable: true,
    }, async (progress, token) => {
      try {
        const buffer = await fs.promises.readFile(filePath);
        const isDocFile = /\.(docx)$/i.test(filePath);
        let fileContent: string;

        if (isDocFile) {
          const options = { buffer: buffer };
          const encode = await mammoth.extractRawText(options);
          fileContent = encode.value;
        } else {
          const encode = chardet.detect(buffer) as string;
          fileContent = iconv.decode(buffer, encode);
        }

        const htmlContent = getHtmlForWebview(fileContent);
        this.updateWebview(htmlContent);
        window.showInformationMessage('VSCodeReader opened successfully');

        // 保存最后打开的文件路径
        this.context.workspaceState.update('lastOpenedFile', filePath);
      } catch (error: any) {
        window.showErrorMessage(`Failed to open file: ${error.message}`);
      } finally {
        setTimeout(() => {
          this._isLoading = false;
        }, 2000);
      }
    });
  }

  public updateWebview(htmlContent: string) {
    if (this._view) {
      this._view.webview.html = htmlContent;
    }
  }
}

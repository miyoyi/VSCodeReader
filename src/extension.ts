import { window,commands,ExtensionContext } from 'vscode';
import ReaderViewProvider from './components/readerView';

export function activate(context: ExtensionContext) {
  const readerViewProvider = new ReaderViewProvider();
  window.registerWebviewViewProvider(
    'VSCodeReader.readerView',
    readerViewProvider,
    {
      webviewOptions: {
        retainContextWhenHidden: true
      }
    }
  );
  context.subscriptions.push(
    commands.registerCommand('extension.openFile', async () => {
      try {
        const fileUri = await window.showOpenDialog({
          canSelectFiles: true,
          canSelectFolders: false,
          openLabel: 'Open File'
        });
        if (fileUri && fileUri[0]) {
          const filePath = fileUri[0].fsPath;
          readerViewProvider.readFile(filePath);
        }
      } catch (error:any) {
        window.showErrorMessage(`Failed to open file: ${error.message}`);
      }
    })
  );
}

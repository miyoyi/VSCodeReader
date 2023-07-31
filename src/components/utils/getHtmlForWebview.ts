export default function getHtmlForWebview(fileContent?: string): string {
  const content = fileContent ? fileContent : '';
  const modifiedHtmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport">
      <title>VSCodeReader</title>
      <style>
        html, body {
          width: 100%;
          height: 100%;
        }
        #contentContainer {
          font-size: 14px;
          white-space: pre-wrap;
        }
        .button {
          position: fixed;
          margin-left: -5px;
          transition: opacity 0.3s;
        }
        #scrollToPositionInput {
          width: 50px
        }
      </style>
    </head>
    <body>
      <div class="button" id="button">
        <button id="increaseFontSizeButton">+</button>
        <button id="decreaseFontSizeButton">-</button>
        <button id="openButton">open</button>
        <button id="getPositionButton">get</button>
        <button id="savePositionButton">save</button>
        <input type="text" id="scrollToPositionInput" placeholder="to"/>
      </div>
      <div id="contentContainer">
        <div id="content">${content}</div>
      </div>
      <script>
        const vscode = acquireVsCodeApi();
        let scrollPosition = window.scrollY;
        const button = document.getElementById('button');
        const contentTag = '${content.slice(100, 110).replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, '')}';

        document.getElementById('increaseFontSizeButton').addEventListener('click', () => {
          changeFontSize(2);
        });

        document.getElementById('decreaseFontSizeButton').addEventListener('click', () => {
          changeFontSize(-2);
        });

        function changeFontSize(change) {
          const contentContainer = document.getElementById('contentContainer');
          const currentFontSize = parseFloat(window.getComputedStyle(contentContainer).fontSize);
          const newFontSize = currentFontSize + change;
          contentContainer.style.setProperty('font-size', newFontSize + 'px');
        }

        document.getElementById('openButton').addEventListener('click', () => {
          vscode.postMessage({ command: 'openCommand' });
        });

        document.getElementById('getPositionButton').addEventListener('click', () => {
          const position = vscode.getState().contentTag
          window.scrollTo(0, position);
        });

        document.getElementById('savePositionButton').addEventListener('click', () => {
          const position = { contentTag: window.scrollY};
          vscode.setState(position)
        });

        document.getElementById('scrollToPositionInput').addEventListener('keydown', event => {
          if (event.key === 'Enter') {
            const value = event.target.value;
            if (!isNaN(value)) {
              const position = parseInt(value);
              window.scrollTo(0, position);
            } else {
              event.target.value = ''
            }
          }
        });

        window.onload = () => {
          const position = vscode.getState().contentTag
          window.scrollTo(0, position);
        };
        window.onbeforeunload = () => {
          const position = { contentTag: window.scrollY};
          vscode.setState(position)
        };

        window.addEventListener('scroll', () => {
          if (window.scrollY > scrollPosition + 10) {
            button.style.opacity = '0';
          } else if (window.scrollY < scrollPosition - 20) {
            button.style.opacity = '1';
          }
          scrollPosition = window.scrollY;
        });
      </script>
    </body>
    </html>`;
  return modifiedHtmlContent;
}

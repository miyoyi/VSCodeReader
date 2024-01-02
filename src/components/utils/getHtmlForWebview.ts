  export default function getHtmlForWebview(fileContent?: string): string {
    const content = fileContent ? fileContent : '';
    const modifiedHtmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport">
        <title>VSCodeReader</title>
        <script type="text/javascript" language="JavaScript" src="https://www.seabreezecomputers.com/tips/find5.js"></script>
        <style>
          html, body {
            width: 100%;
            height: 100%;
            scroll-behavior: smooth;
          }
          #contentContainer {
            opacity: 1;
            font-size: 14px;
            white-space: pre-wrap;
          }
          .button {
            position: fixed;
            margin-left: -5px;
            transition: opacity 0.3s;
          }
          #urlInput {
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="button" id="button">
          <div>
            <input type="text" id="urlInput" placeholder="URL">
          </div>
          <button id="increaseFontSizeButton">+</button>
          <button id="decreaseFontSizeButton">-</button>
          <button id="openButton">open</button>
          <button id="getPositionButton">get</button>
          <button id="savePositionButton">save</button>
        </div>
        <div id="contentContainer">
          <div id="content">${content}</div>
        </div>
        <script>
          const vscode = acquireVsCodeApi();
          const currentX = window.scrollX;
          const currentY = window.scrollY;
          let scrollPosition = window.scrollY;
          const button = document.getElementById('button');
          const content = document.getElementById('content');
          const contentContainer = document.getElementById('contentContainer');
          const contentTag = '${content.slice(100, 110).replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, '')}';
          window.addEventListener('DOMContentLoaded', () => {
            const findWindow = document.getElementById('findwindow');
            findWindow.style.border = 'none';
            const findButton = findWindow.nextElementSibling;
            findButton.value = 'find';
            button.appendChild(findButton);

            const divElements = Array.from(findWindow.getElementsByTagName('div'));

            divElements[0].style.border = "none";
            divElements[0].style.color = "black";
            divElements[0].style.backgroundColor = "transparent";
            
            divElements[1].style.border = "none";
            divElements[1].style.backgroundColor = "transparent";
          });

          document.getElementById('urlInput').addEventListener('keyup', event => {
            if (event.target.value === '') {
              var iframe = document.querySelector('iframe');
              if (iframe) {
                iframe.remove();
              }
              return;
            }

            var iframe = document.querySelector('iframe');
            if (iframe) {
              iframe.src = event.target.value;
            } else {
              var newIframe = document.createElement('iframe');
              newIframe.src = event.target.value;
              newIframe.width = '100%';
              newIframe.height = '100%';
              document.body.appendChild(newIframe);
            }
          })

          document.getElementById('increaseFontSizeButton').addEventListener('click', () => {
            changeFontSize(2);
          });

          document.getElementById('decreaseFontSizeButton').addEventListener('click', () => {
            changeFontSize(-2);
          });

          const changeFontSize = (change) => {
            const currentFontSize = parseFloat(window.getComputedStyle(contentContainer).fontSize);
            const newFontSize = currentFontSize + change;
            contentContainer.style.setProperty('font-size', newFontSize + 'px');
          }

          document.getElementById('openButton').addEventListener('click', () => {
            vscode.postMessage({ command: 'openCommand' });
          });

          document.getElementById('getPositionButton').addEventListener('click', () => {
            get();
          });

          document.getElementById('savePositionButton').addEventListener('click', () => {
            save();
          });

          const save = () => {
            const position = { contentTag: window.scrollY};
            vscode.setState(position);
          }
          const get = () => {
            const position = vscode.getState().contentTag;
            window.scrollTo(window.scrollX, position);
          }

          window.onload = () => {
            const position = vscode.getState().contentTag;
            window.scrollTo(currentX, position);
          };
          window.onbeforeunload = () => {
            const position = { contentTag: window.scrollY};
            vscode.setState(position);
          };

          window.addEventListener('scroll', () => {
            if (window.scrollY > scrollPosition + 10) {
              button.style.opacity = '0';
            } else if (window.scrollY < scrollPosition - 20) {
              button.style.opacity = '1';
            }
            scrollPosition = window.scrollY;
          });

          window.addEventListener('keydown', e => {
            switch (e.keyCode) {
              case 65:
                window.scrollBy(-5, currentY);
                break;
              case 68:
                window.scrollBy(5, currentY);
                break;
              case 69:
                save();
                break;
              case 81:
                get();
                break;
              case 87:
                window.scrollBy(currentX, -window.innerHeight * 0.9);
                break;
              case 83:
                window.scrollBy(currentX, window.innerHeight * 0.9);
                break;
              case 32:
                e.preventDefault();
                if (+contentContainer.style.opacity) {
                  contentContainer.style.setProperty('opacity', '0');
                } else {
                  contentContainer.style.setProperty('opacity', '1');
                }
                break;
              default:
                break;
            }    
          });
        </script>
      </body>
      </html>`;
    return modifiedHtmlContent;
  }

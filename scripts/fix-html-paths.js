const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../electron/renderer/dist/index.html');

if (fs.existsSync(htmlPath)) {
  let content = fs.readFileSync(htmlPath, 'utf-8');
  content = content.replace(/href="\/assets\//g, 'href="./assets/');
  content = content.replace(/src="\/assets\//g, 'src="./assets/');
  fs.writeFileSync(htmlPath, content, 'utf-8');
  console.log('Fixed asset paths in HTML file');
} else {
  console.error('HTML file not found:', htmlPath);
}

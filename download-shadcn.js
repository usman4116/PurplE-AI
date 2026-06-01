const fs = require('fs');
const path = require('path');

const components = ['avatar', 'dropdown-menu', 'scroll-area', 'sheet', 'button', 'input', 'label'];
const outDir = path.join(__dirname, 'src', 'components', 'ui');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function downloadComponent(name) {
  console.log(`Downloading ${name}...`);
  const url = `https://ui.shadcn.com/r/styles/new-york/${name}.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${name}: ${res.statusText}`);
    const data = await res.json();
    for (const file of data.files) {
      const fileName = file.path ? path.basename(file.path) : file.name;
      const filePath = path.join(outDir, fileName);
      fs.writeFileSync(filePath, file.content, 'utf8');
      console.log(`Saved ${fileName}`);
    }
  } catch (err) {
    console.error(`Error downloading ${name}:`, err.message);
  }
}

async function main() {
  for (const c of components) {
    await downloadComponent(c);
  }
}

main();

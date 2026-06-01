const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content
        .replace(/import \{ auth \} from ['"]@\/auth['"];/g, 'import { auth } from "@clerk/nextjs/server";')
        .replace(/const session = await auth\(\);/g, 'const { userId } = await auth();')
        .replace(/!session\?\.user\?\.id/g, '!userId')
        .replace(/session\.user\.id/g, 'userId');
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir('./src/app/api');

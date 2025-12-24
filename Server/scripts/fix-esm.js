import fs from 'fs';
import path from 'path';

const distDir = path.resolve('./dist');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      fixImports(fullPath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/from\s+['"](\..*?)['"]/g, (match, p1) => {
        if (p1.endsWith('.js') || p1.startsWith('node:') || p1.startsWith('http')) return match;
        return `from '${p1}.js'`;
      });
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

fixImports(distDir);
console.log('✅ All imports fixed with .js');

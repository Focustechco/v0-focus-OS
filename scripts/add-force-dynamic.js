const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else if (f === 'route.ts') {
      files.push(full);
    }
  }
  return files;
}

const routes = walk('app/api');
let fixed = 0;

for (const r of routes) {
  let content = fs.readFileSync(r, 'utf8');
  if (!content.includes('force-dynamic')) {
    const lines = content.split('\n');
    let lastImportIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) lastImportIdx = i;
    }
    if (lastImportIdx >= 0) {
      lines.splice(lastImportIdx + 1, 0, "\nexport const dynamic = 'force-dynamic'");
      fs.writeFileSync(r, lines.join('\n'), 'utf8');
      console.log('Fixed:', r);
      fixed++;
    }
  }
}
console.log('Total fixed:', fixed);

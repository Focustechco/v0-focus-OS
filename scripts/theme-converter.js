const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /bg-\[#0A0A0A\]/g, to: 'bg-background' },
  { from: /bg-\[#111111\]/g, to: 'bg-background' },
  { from: /bg-\[#111\]/g, to: 'bg-background' },
  { from: /bg-\[#141414\]/g, to: 'bg-card' },
  { from: /bg-\[#0F0F0F\]/g, to: 'bg-background' },
  { from: /bg-\[#161616\]/g, to: 'bg-card' },
  { from: /bg-\[#0d0d0d\]/g, to: 'bg-secondary' },
  { from: /border-\[#2A2A2A\]/g, to: 'border-border' },
  { from: /border-\[#222\]/g, to: 'border-border' },
  { from: /border-\[#333\]/g, to: 'border-border' },
  { from: /hover:bg-\[#1A1A1A\]/g, to: 'hover:bg-accent/10' },
  { from: /bg-\[#e05c00\]/g, to: 'bg-primary' },
  { from: /text-\[#e05c00\]/g, to: 'text-primary' },
  { from: /text-white/g, to: 'text-foreground' },
  { from: /text-neutral-300/g, to: 'text-foreground' }
];

const componentsDir = path.join(process.cwd(), 'components');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const r of replacements) {
        if (r.from.test(content)) {
          content = content.replace(r.from, r.to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDir(componentsDir);
console.log('Theme conversion completed for components directory.');

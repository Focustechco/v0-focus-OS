const fs = require('fs');
['focus-sidebar.tsx', 'mobile-sidebar.tsx'].forEach(f => { 
  let file = 'C:/Users/adria/.gemini/antigravity/scratch/v0-focus-OS/v0-focus-OS-main/components/' + f; 
  let content = fs.readFileSync(file, 'utf8'); 
  content = content.replace(/const projetosSubItems = \[[\s\S]*?\];?/, 'const projetosSubItems: any[] = [];'); 
  content = content.replace(/hasSubmenu: "projetos"(,?)/, ''); 
  fs.writeFileSync(file, content); 
});

const fs = require('fs');
const path = require('path');
const base = 'C:/Users/adria/.gemini/antigravity/scratch/v0-focus-OS/v0-focus-OS-main';
const destDir = path.join(base, 'components', 'projetos');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

const routes = [
  { p: 'fluxo', name: 'Fluxo' },
  { p: 'sprints', name: 'Sprints' },
  { p: 'tasks', name: 'Tasks' },
  { p: 'checklists', name: 'Checklists' },
  { p: 'aprovacoes', name: 'Aprovacoes' },
  { p: 'prazos', name: 'Prazos' }
];

routes.forEach(r => {
  const file = path.join(base, 'app', r.p, 'page.tsx');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/export default function \w+Page\(\) \{/, `export function ${r.name}Tab() {`);
    
    if (content.includes('<PageWrapper')) {
      content = content.replace(/<PageWrapper[^>]*>/, '<div className="flex-1 w-full relative">');
      content = content.replace(/<\/PageWrapper>/, '</div>');
    }
    
    if (r.p === 'fluxo') {
      content = content.replace(/<div className="flex h-screen bg-\[\#0A0A0A\]">[\s\S]*?<main className="flex-1 overflow-auto p-6">/, '<div className="flex-1 w-full space-y-6">');
      content = content.replace(/<\/main>\s*<\/div>\s*<\/div>/, '</div>');
      content = content.replace(/import \{ FocusSidebar \} from "@\/components\/focus-sidebar"/, '');
      content = content.replace(/import \{ FocusHeader \} from "@\/components\/focus-header"/, '');
    }
    
    content = content.replace(/import \{ PageWrapper \} from "@\/components\/page-wrapper"/, '');
    fs.writeFileSync(path.join(destDir, `${r.p}-tab.tsx`), content);
    console.log(`Migrated ${r.p}`);
  }
});

const projPage = path.join(base, 'app', 'projetos', 'page.tsx');
if (fs.existsSync(projPage)) {
    let content = fs.readFileSync(projPage, 'utf8');
    content = content.replace(/export default function ProjetosPage\(\) \{/, `export function VisaoGeralTab() {`);
    content = content.replace(/<PageWrapper[^>]*>/, '<div className="flex-1 w-full relative">');
    content = content.replace(/<\/PageWrapper>/, '</div>');
    content = content.replace(/import \{ PageWrapper \} from "@\/components\/page-wrapper"/, '');
    fs.writeFileSync(path.join(destDir, `visao-geral-tab.tsx`), content);
    console.log(`Migrated visao geral`);
}

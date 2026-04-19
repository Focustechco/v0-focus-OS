import { testConnection, getTeams, getSpaces, getFolders, getFolderlessLists, getLists } from './lib/clickup-api.ts';

const token = 'pk_230515550_BS3ESRSBVUPJX0UW17KY9O6A48HCIFNU';

async function listHierarchy() {
  try {
    console.log('Testing connection...');
    const userRes = await testConnection(token);
    console.log(`Connected as: ${userRes.user.username} (${userRes.user.email})`);

    console.log('\nFetching Teams (Workspaces)...');
    const { teams } = await getTeams(token);
    for (const team of teams) {
      console.log(`- Team: ${team.name} (ID: ${team.id})`);
      
      console.log(`  Fetching Spaces for Team ${team.name}...`);
      const { spaces } = await getSpaces(token, team.id);
      for (const space of spaces) {
        console.log(`  - Space: ${space.name} (ID: ${space.id})`);
        
        console.log(`    Fetching Folders for Space ${space.name}...`);
        const { folders } = await getFolders(token, space.id);
        for (const folder of folders) {
          console.log(`    - Folder: ${folder.name} (ID: ${folder.id})`);
          const { lists } = await getLists(token, folder.id);
          for (const list of lists) {
            console.log(`      - List: ${list.name} (ID: ${list.id})`);
          }
        }
        
        console.log(`    Fetching Folderless Lists for Space ${space.name}...`);
        const { lists: folderlessLists } = await getFolderlessLists(token, space.id);
        for (const list of folderlessLists) {
          console.log(`      - List: ${list.name} (ID: ${list.id})`);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listHierarchy();

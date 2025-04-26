// rename-project.ts
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Files to update
const filesToUpdate = [
  'README.md',
  'package.json',
  'package-lock.json',
  'node_modules/.package-lock.json'
];

// Function to update file content
function updateFileContent(filePath: string, oldName: string, newName: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (path.basename(filePath) === 'package.json') {
        const packageJson = JSON.parse(content);
        if (packageJson.name === oldName) {
          packageJson.name = newName;
        }
        if (packageJson.productName === oldName) {
          packageJson.productName = newName;
        }
        content = JSON.stringify(packageJson, null, 2);
      } else if ((path.basename(filePath) === 'package-lock.json')
      || (path.basename(filePath) === '.package-lock.json')) {
        const packageLock = JSON.parse(content);
        if (packageLock.name === oldName) {
          packageLock.name = newName;
        }
        
        if (packageLock.packages && packageLock.packages['']) {
          if (packageLock.packages[''].name === oldName) {
            packageLock.packages[''].name = newName;
          }
        }
        
        content = JSON.stringify(packageLock, null, 2);
      } else {
        content = content.replace(new RegExp(oldName, 'g'), newName);
      }
      
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${filePath}`);
      return true;
    } else {
      console.log(`File ${filePath} not found, skipping...`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Detect current project name from package.json
function getCurrentProjectName(): string {
  try {
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return packageJson.name || 'unknown-project-name';
    }
  } catch (error) {
    console.error('Error reading package.json:', error instanceof Error ? error.message : String(error));
  }
  return 'unknown-project-name';
}

// Main function
function main(): void {
  const currentName = getCurrentProjectName();
  
  console.log(`Current project name is: ${currentName}`);
  
  rl.question('Enter new project name: ', (newName: string) => {
    if (!newName || newName.trim() === '') {
      console.log('No name provided. Exiting without changes.');
      rl.close();
      return;
    }
    
    newName = newName.trim();
    if (newName === currentName) {
      console.log('New name is the same as current name. No changes needed.');
      rl.close();
      return;
    }
    
    console.log(`Updating project name from "${currentName}" to "${newName}"...`);
    
    let updatedCount = 0;
    
    filesToUpdate.forEach(file => {
      if (updateFileContent(file, currentName, newName)) {
        updatedCount++;
      }
    });
    
    console.log(`\nName update complete! Updated ${updatedCount} file(s).`);
    console.log('You may need to run "npm install" to update dependencies.');
    
    rl.close();
  });
}

main();

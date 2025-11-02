#!/usr/bin/env node

/**
 * Fix ES Module imports to include .js extensions
 * Required for Node.js ES modules to resolve correctly
 */

const fs = require('fs');
const path = require('path');

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix relative imports without extension
  content = content.replace(
    /from ['"]([^'"]*[^.][^'"]*)['"]/g,
    (match, importPath) => {
      if (importPath.startsWith('.')) {
        modified = true;
        return `from '${importPath}.js'`;
      }
      return match;
    }
  );

  // Fix export types
  content = content.replace(
    /export type {([^}]*)}/g,
    (match, types) => {
      modified = true;
      return `export { ${types.split(',').map(t => `type ${t.trim()}`).join(', ')} }`;
    }
  );

  // Fix import types
  content = content.replace(
    /import type {([^}]*)}/g,
    (match, types) => {
      modified = true;
      return `import { type ${types.split(',').map(t => t.trim()).join(', type ')} }`;
    }
  );

  // Fix relative imports missing .js extension
  const relativeImportRegex = /(from\s+['"]\.\.?\/[^'"]+)(?<!\.js)(['"])/g;
  
  content = content.replace(relativeImportRegex, (match, importPath, quote) => {
    // Skip if already has extension
    if (importPath.endsWith('.js') || importPath.endsWith('.json') || importPath.endsWith('.cjs')) {
      return match;
    }
    modified = true;
    return `${importPath}.js${quote}`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed imports in: ${filePath}`);
  }

  return modified;
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and dist
      if (file !== 'node_modules' && file !== 'dist' && file !== 'client') {
        fixedCount += walkDirectory(filePath);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      if (fixImportsInFile(filePath)) {
        fixedCount++;
      }
    }
  }

  return fixedCount;
}

console.log('🔧 Fixing ES Module imports...');
const fixedCount = walkDirectory('server');
console.log(`\n✅ Fixed ${fixedCount} files`);

// Node.js options
process.execArgv.push('--max-old-space-size=4096');
process.execArgv.push('--experimental-modules');
process.execArgv.push('--es-module-specifier-resolution=node');

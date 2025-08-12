const fs = require('fs');
const path = require('path');

/**
 * The starting directory to scan. '.' means the current directory where the script is run.
 */
const rootDir = '.';

/**
 * The name of the final output file.
 */
const outputFile = 'all_php_code.txt';

/**
 * An array of directories and files to ignore during the scan and tree generation.
 * This is crucial for skipping things like 'vendor' or 'node_modules' folders.
 */
const ignoreList = ['node_modules', 'vendor', 'build', 'src', '.git', '.vscode', 'all_php_code.txt', 'combine_code.js'];

/**
 * Generates a text-based tree structure for a given directory.
 * @param {string} dir - The directory to start generating the tree from.
 * @param {string} prefix - The prefix for the current line (used for recursion).
 * @returns {string} The formatted directory tree as a string.
 */
function generateTree(dir, prefix = '') {
  let tree = '';
  const files = fs.readdirSync(dir);
  const filteredFiles = files.filter(file => !ignoreList.includes(file));

  filteredFiles.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const isLast = index === filteredFiles.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    
    tree += prefix + connector + file + '\n';

    if (fs.statSync(filePath).isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      tree += generateTree(filePath, newPrefix);
    }
  });
  return tree;
}


/**
 * A recursive function to get all file paths within a directory.
 * @param {string} dirPath - The directory to scan.
 * @param {string[]} arrayOfFiles - An array to accumulate file paths.
 * @returns {string[]} The final array of file paths.
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function (file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // If it's a directory, check if it should be ignored.
      if (!ignoreList.includes(file)) {
        getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}


try {
  console.log('Starting script...');

  // --- Part 1: Generate the Directory Tree ---
  console.log('Generating directory tree...');
  const treeHeader = `======================================================================\n// PROJECT DIRECTORY STRUCTURE\n======================================================================\n\n`;
  const treeBody = rootDir + '\n' + generateTree(rootDir);


  // --- Part 2: Combine all PHP file contents ---
  console.log('Scanning for PHP files...');
  
  // 1. Get a list of all files in the directory structure.
  const allFilePaths = getAllFiles(rootDir);

  // 2. Filter the list to include only .php files.
  const phpFilePaths = allFilePaths.filter(
    (filePath) => path.extname(filePath) === '.php'
  );

  console.log(`Found ${phpFilePaths.length} PHP files to combine.`);

  // 3. Read the content of each PHP file and format it.
  const combinedContent = phpFilePaths.map((filePath) => {
    const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');

    const header = `======================================================================\n// FILE: ${relativePath}\n======================================================================\n\n`;
    return header + content;
  });

  const codeBody = combinedContent.join('\n\n\n');

  // --- Part 3: Combine the tree and the code and write to file ---
  const finalOutput = treeHeader + treeBody + '\n\n\n' + codeBody;

  fs.writeFileSync(outputFile, finalOutput);

  console.log(`✅ Success! Directory tree and all PHP code have been combined into "${outputFile}"`);

} catch (error) {
  console.error('❌ An error occurred:', error);
}
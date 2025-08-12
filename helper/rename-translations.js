const fs = require('fs');
const path = require('path');

// --- Configuration ---
const languagesDir = path.join(__dirname, '../languages');
const textDomain = 'campaignbay';
// This handle MUST match the first argument of wp_enqueue_script in your PHP.
const scriptHandle = 'campaignbay'; 
// -------------------

console.log(`Scanning for translation files in: ${languagesDir}`);

fs.readdir(languagesDir, (err, files) => {
    if (err) {
        console.error('Error reading languages directory:', err);
        return;
    }

    files.forEach(file => {
        // Find files that match the hashed JSON pattern, e.g., "campaignbay-bn_BD-....json"
        const match = file.match(new RegExp(`^(${textDomain}-([a-z]{2,3}_[A-Z]{2,5}))-[a-f0-9]{32}\\.json$`));

        if (match) {
            const originalFilePath = path.join(languagesDir, file);
            
            // --- MODIFIED: Create the new, correct filename ---
            // Format: {text-domain}-{locale}-{script-handle}.json
            const newFilename = `${match[1]}-${scriptHandle}.json`; 
            const newFilePath = path.join(languagesDir, newFilename);

            console.log(`Found hashed file: ${file}`);
            console.log(`  -> Renaming to: ${newFilename}`);

            fs.rename(originalFilePath, newFilePath, (renameErr) => {
                if (renameErr) {
                    console.error(`    Error renaming file: ${renameErr}`);
                } else {
                    console.log('    Success!');
                }
            });
        }
    });
});
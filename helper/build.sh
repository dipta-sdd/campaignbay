#!/bin/bash

# --- Configuration ---
# The main slug for your plugin. This should match your main directory name.
PLUGIN_SLUG="campaignbay"

# --- Script Start ---

# Color codes for messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}📦 Starting the '${PLUGIN_SLUG}' plugin build process...${NC}"

# --- NEW: Set the project's root directory ---
# This is the most important change. We navigate up one level from the script's location.
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

# --- NEW: Navigate to the project root to run commands ---
cd "$PROJECT_ROOT"

echo -e "\n${YELLOW}⚙️  Step 1: Running the production build command...${NC}"
echo "    (This will compile your React assets for production)"

# 2. Run the NPM build command from the project root.
npm run build

# Check if the build command was successful
if [ $? -ne 0 ]; then
    echo -e "\n${RED}❌ NPM build failed. Please check the errors above. Aborting.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build complete.${NC}"

# 3. Define the name of the final zip file.
ZIP_FILE="${PLUGIN_SLUG}.zip"

echo -e "\n${YELLOW}🔍 Step 2: Previewing the file structure to be zipped...${NC}"

# 4. Define all files and folders to be excluded.
# Paths are now relative to the project root.
EXCLUDE_PATTERNS=(
    "*.zip"
    "helper"
    ".git"
    ".gitignore"
    "node_modules"
    "src"
    "vendor"
    "composer.json"
    "composer.lock"
    "package.json"
    "package-lock.json"
    "webpack.config.js"
    ".DS_Store"
    "all_php_code.txt"
    "collector.js"
    "tests.md"
)

# 5. Check if the 'tree' command is available.
if ! command -v tree >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  'tree' command not found. Falling back to a simple file list.${NC}"
    echo -e "${YELLOW}    (For a nicer view, install 'tree'. On macOS: 'brew install tree' | On Debian/Ubuntu: 'sudo apt-get install tree')${NC}\n"
    USE_VERBOSE_ZIP=true
else
    IGNORE_PATTERN=$(printf "%s|" "${EXCLUDE_PATTERNS[@]}")
    IGNORE_PATTERN=${IGNORE_PATTERN%|}
    
    # Run tree from the project root.
    tree -C -I "$IGNORE_PATTERN"
    USE_VERBOSE_ZIP=false
fi

echo -e "\n${YELLOW}🗜️  Step 3: Creating the zip file: ${ZIP_FILE}...${NC}"

# 6. Build the exclude parameters for the zip command.
ZIP_EXCLUDE_PARAMS=()
for PATTERN in "${EXCLUDE_PATTERNS[@]}"; do
    # Add '/*' to directory names to exclude their contents.
    if [[ -d "$PATTERN" ]]; then
        ZIP_EXCLUDE_PARAMS+=("--exclude" "$PATTERN/*")
    fi
    ZIP_EXCLUDE_PARAMS+=("--exclude" "$PATTERN")
done

# 7. Create the zip file from the project root.
# The zip command will run in the context of the project root.
if [ "$USE_VERBOSE_ZIP" = true ]; then
    zip -rv "${ZIP_FILE}" . "${ZIP_EXCLUDE_PARAMS[@]}"
else
    zip -rq "${ZIP_FILE}" . "${ZIP_EXCLUDE_PARAMS[@]}"
fi

if [ $? -ne 0 ]; then
    echo -e "\n${RED}❌ Failed to create the zip file. Aborting.${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ Zip file created successfully!${NC}"
echo -e "\n✨ ${GREEN}Build process complete. Your distributable file is ready:${NC}"
echo "    -> ${ZIP_FILE}"
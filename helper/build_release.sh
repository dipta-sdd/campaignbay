#!/bin/bash

# --- Configuration ---
# The main slug for your plugin.
PLUGIN_SLUG="campaignbay"

# --- Script Start ---

# Color codes for messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting the full '${PLUGIN_SLUG}' release build process...${NC}"

# --- Set the project's root directory ---
# This script is assumed to be in 'scripts/' relative to the project root.
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
BUILD_OUTPUT_DIR="${PROJECT_ROOT}/.dist" # Directory to store intermediate zips

# --- NEW: Get version from package.json ---
PACKAGE_JSON_PATH="${PROJECT_ROOT}/package.json"

if [ ! -f "$PACKAGE_JSON_PATH" ]; then
    echo -e "\n${RED}❌ Error: package.json not found at '${PACKAGE_JSON_PATH}'. Aborting.${NC}"
    exit 1
fi

# Use grep and sed to extract the version
# This command looks for "version": "X.Y.Z", extracts X.Y.Z
VERSION=$(grep '"version":' "$PACKAGE_JSON_PATH" | head -1 | sed -E 's/.*"([0-9]+\.[0-9]+\.[0-9]+)".*/\1/')

if [ -z "$VERSION" ]; then
    echo -e "\n${RED}❌ Error: Could not extract version from package.json. Aborting.${NC}"
    exit 1
fi

echo -e "${GREEN}Detected version: ${VERSION}${NC}"

# Name for the final versioned zip file.
RELEASE_ZIP_NAME="${PLUGIN_SLUG}_${VERSION}.zip" # Now includes the version!


echo -e "\n${YELLOW}⚙️  Step 1: Preparing build output directory...${NC}"
mkdir -p "$BUILD_OUTPUT_DIR"
# Clean up any previous release artifacts in the build directory
# Be careful with rm -f, ensure it targets specific files.
rm -f "${BUILD_OUTPUT_DIR}/${PLUGIN_SLUG}.zip"
rm -f "${BUILD_OUTPUT_DIR}/documentation.zip"
# Remove any old versioned release zips that match the pattern
rm -f "${BUILD_OUTPUT_DIR}/${PLUGIN_SLUG}_*.zip"


# --- Step 2: Build the main plugin zip (campaignbay.zip) ---
echo -e "\n${YELLOW}📦 Step 2: Building the main plugin zip ('${PLUGIN_SLUG}.zip')...${NC}"
# Assuming your previous script is in PROJECT_ROOT/scripts/build.sh
# We'll run it and store the output in the BUILD_OUTPUT_DIR
(cd "$PROJECT_ROOT" && ./helper/build.sh) # Execute your existing build script from project root

if [ $? -ne 0 ]; then
    echo -e "\n${RED}❌ Main plugin build failed. Aborting release process.${NC}"
    exit 1
fi

# Move the generated campaignbay.zip to our build output directory
mv "${PROJECT_ROOT}/${PLUGIN_SLUG}.zip" "${BUILD_OUTPUT_DIR}/${PLUGIN_SLUG}.zip"
echo -e "${GREEN}✅ Main plugin zip created: ${BUILD_OUTPUT_DIR}/${PLUGIN_SLUG}.zip${NC}"


# --- Step 3: Create the documentation.zip ---
DOCUMENTATION_FOLDER="Documentation" # Name of your documentation folder
DOCUMENTATION_ZIP="${BUILD_OUTPUT_DIR}/documentation.zip"

echo -e "\n${YELLOW}📚 Step 3: Creating the documentation zip ('documentation.zip')...${NC}"

# Check if the Documentation folder exists
if [ ! -d "${PROJECT_ROOT}/${DOCUMENTATION_FOLDER}" ]; then
    echo -e "\n${RED}❌ Documentation folder not found at '${PROJECT_ROOT}/${DOCUMENTATION_FOLDER}'. Aborting.${NC}"
    exit 1
fi

# Navigate to the project root to zip the Documentation folder correctly
cd "$PROJECT_ROOT"

# Zip the contents of the Documentation folder into documentation.zip
# We want the 'Documentation' folder itself inside the zip.
zip -rq "$DOCUMENTATION_ZIP" "./${DOCUMENTATION_FOLDER}"

if [ $? -ne 0 ]; then
    echo -e "\n${RED}❌ Failed to create documentation.zip. Aborting.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Documentation zip created: ${DOCUMENTATION_ZIP}${NC}"


# --- Step 4: Create the final campaignbay_version.zip ---
LICENSING_FOLDER="Licensing" # Name of your Licensing folder
FINAL_RELEASE_ZIP="${BUILD_OUTPUT_DIR}/${RELEASE_ZIP_NAME}"

echo -e "\n${YELLOW}🌟 Step 4: Creating the final release zip ('${RELEASE_ZIP_NAME}')...${NC}"

# Check if Licensing folder exists
if [ ! -d "${PROJECT_ROOT}/${LICENSING_FOLDER}" ]; then
    echo -e "\n${RED}❌ Licensing folder not found at '${PROJECT_ROOT}/${LICENSING_FOLDER}'. Aborting.${NC}"
    exit 1
fi

# Navigate back to the build output directory to create the final zip
cd "$BUILD_OUTPUT_DIR"

# Copy Licensing folder into BUILD_OUTPUT_DIR first
cp -r "${PROJECT_ROOT}/${LICENSING_FOLDER}" "${BUILD_OUTPUT_DIR}/"

zip -r "${FINAL_RELEASE_ZIP}" "${PLUGIN_SLUG}.zip" "documentation.zip" "./${LICENSING_FOLDER}"

if [ $? -ne 0 ]; then
    echo -e "\n${RED}❌ Failed to create the final release zip. Aborting.${NC}"
    exit 1
fi

# Clean up copied Licensing folder from BUILD_OUTPUT_DIR
rm -rf "${BUILD_OUTPUT_DIR}/${LICENSING_FOLDER}"


echo -e "\n${GREEN}✅ Final release zip created: ${FINAL_RELEASE_ZIP}${NC}"

echo -e "\n✨ ${GREEN}Full release build process complete! Your release file is ready:${NC}"
echo "    -> ${FINAL_RELEASE_ZIP}"

# Navigate back to original project root for consistency (optional)
cd "$PROJECT_ROOT"
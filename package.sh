#!/bin/bash

# Define the zip filename
ZIP_NAME="campaignbay.zip"
PLUGIN_SLUG="campaignbay"

# Cleanup previous build if exists
rm -rf dist
rm -f $ZIP_NAME

# Create a temporary directory for staging
mkdir -p dist/$PLUGIN_SLUG

# Copy folders
echo "Copying folders..."
cp -r app dist/$PLUGIN_SLUG/
cp -r languages dist/$PLUGIN_SLUG/
cp -r assets dist/$PLUGIN_SLUG/
cp -r build dist/$PLUGIN_SLUG/

# Copy files
echo "Copying files..."
cp index.php dist/$PLUGIN_SLUG/
cp readme.txt dist/$PLUGIN_SLUG/
cp uninstall.php dist/$PLUGIN_SLUG/
cp campaignbay.php dist/$PLUGIN_SLUG/

# Create the zip file
echo "Creating zip file..."
cd dist
zip -r ../$ZIP_NAME $PLUGIN_SLUG

# Clean up
cd ..
rm -rf dist

echo "Done! Created $ZIP_NAME containing:"
echo "- app/"
echo "- languages/"
echo "- assets/"
echo "- build/"
echo "- index.php"
echo "- readme.txt"
echo "- uninstall.php"
echo "- campaignbay.php"

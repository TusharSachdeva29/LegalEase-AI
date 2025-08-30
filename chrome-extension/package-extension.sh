#!/bin/bash

# Script to package the Chrome extension

# Define variables
EXT_DIR="/home/naina/Documents/projects/google-hackathon/chrome-extension"
BUILD_DIR="$EXT_DIR/build"
ICONS_DIR="$EXT_DIR/icons"
OUTPUT_ZIP="legal-ease-meet-assistant.zip"

# Create placeholder icons if they don't exist
mkdir -p "$ICONS_DIR"

# Check if icons exist, if not create simple colored squares
for size in 16 48 128; do
  if [ ! -f "$ICONS_DIR/icon$size.png" ]; then
    echo "Creating placeholder icon$size.png"
    convert -size ${size}x${size} xc:#10b981 "$ICONS_DIR/icon$size.png"
  fi
done

# Create build directory
mkdir -p "$BUILD_DIR"

# Copy files
cp "$EXT_DIR/manifest.json" "$BUILD_DIR/"
cp "$EXT_DIR/background.html" "$BUILD_DIR/"
cp "$EXT_DIR/background.js" "$BUILD_DIR/"
cp "$EXT_DIR/content.js" "$BUILD_DIR/"
cp "$EXT_DIR/popup.html" "$BUILD_DIR/"
cp "$EXT_DIR/popup.js" "$BUILD_DIR/"
cp "$EXT_DIR/styles.css" "$BUILD_DIR/"
cp -r "$ICONS_DIR" "$BUILD_DIR/"

# Create ZIP file
cd "$BUILD_DIR"
zip -r "../$OUTPUT_ZIP" ./*

echo "Extension packaged as $EXT_DIR/$OUTPUT_ZIP"

#!/usr/bin/env bash

# ==============================================================================
# GNOME Clipboard Build Script
# ------------------------------------------------------------------------------
# Professional build script to transpile TypeScript and prepare the distribution.
# This script does NOT rely on node_modules and uses the system 'tsc'.
# ==============================================================================

set -euo pipefail

# --- Configuration ---
SRC_DIR="src"
BUILD_DIR="${SRC_DIR}/build"
DIST_DIR="dist"

# Files to be copied from the root to dist
ASSETS=(
    "README.md"
    "LICENSE"
    "metadata.json"
)

# Directories to be copied from root to dist
ASSET_DIRS=(
    "schemas"
)

# --- Helpers ---
info() { echo -e "\033[0;32m[INFO]\033[0m $*"; }
warn() { echo -e "\033[0;33m[WARN]\033[0m $*"; }
error() { echo -e "\033[0;31m[ERROR]\033[0m $*" >&2; exit 1; }

# --- Initialization ---
info "Starting build process..."

# Dependency check
TSC="tsc"
if ! command -v tsc >/dev/null 2>&1; then
    if command -v npx >/dev/null 2>&1; then
        warn "tsc not found. Falling back to 'npx -p typescript tsc'..."
        TSC="npx -p typescript tsc"
    else
        error "TypeScript compiler (tsc) not found. Please install it (e.g., sudo npm install -g typescript)."
    fi
fi

# Cleanup previous build
info "Cleaning up old build artifacts..."
rm -rf "${DIST_DIR}" "${BUILD_DIR}"
mkdir -p "${DIST_DIR}"

# --- Compilation ---
info "Compiling TypeScript..."
if ! $TSC --project "${SRC_DIR}"; then
    error "TypeScript compilation failed."
fi

# --- Packaging ---
info "Copying assets to distribution folder..."

# Copy individual files
for file in "${ASSETS[@]}"; do
    if [[ -f "${file}" ]]; then
        cp "${file}" "${DIST_DIR}/"
    else
        warn "Asset file '${file}' not found."
    fi
done

# Copy directories
for dir in "${ASSET_DIRS[@]}"; do
    if [[ -d "${dir}" ]]; then
        cp -r "${dir}" "${DIST_DIR}/"
    else
        warn "Asset directory '${dir}' not found."
    fi
done

# Compile translations
info "Compiling translations..."
if [[ -d "po" ]]; then
    for po_file in po/*.po; do
        if [[ -f "$po_file" ]]; then
            lang=$(basename "$po_file" .po)
            mkdir -p "${DIST_DIR}/locale/${lang}/LC_MESSAGES"
            msgfmt "$po_file" -o "${DIST_DIR}/locale/${lang}/LC_MESSAGES/gnome-clipboard.mo"
        fi
    done
else
    warn "Translation directory 'po' not found."
fi

# Copy stylesheets
info "Copying stylesheets..."
cp "${SRC_DIR}"/*.css "${DIST_DIR}/" 2>/dev/null || warn "No stylesheets found in ${SRC_DIR}."

# Move compiled JS to dist
info "Finalizing JavaScript files..."
if [[ -d "${BUILD_DIR}" ]]; then
    cp -r "${BUILD_DIR}"/*.js "${DIST_DIR}/"
    rm -rf "${BUILD_DIR}"
    
    # Remove compiled schemas (should not be shipped)
    info "Removing compiled schemas..."
    rm -f "${DIST_DIR}/schemas/gschemas.compiled"
else
    error "Build output directory '${BUILD_DIR}' not found. Please check your tsconfig.json."
fi

info "Build successfully completed! Output is in '${DIST_DIR}/'."

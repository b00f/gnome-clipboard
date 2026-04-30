# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [68.0.0] - 2026-04-30

### Added
- **GNOME 50+ Compatibility**: Full support for the latest GNOME Shell environments (GNOME 45 up to 50+).
- **Image & Rich Media Support**: The clipboard now accurately stores, previews, and restores image content alongside text.
- **Categorized History**: Segregated views for "Pinned" and "Recent" clipboard history for better organization.
- **Private Mode**: Added a quick toggle to temporarily pause clipboard history tracking.
- **App Blacklisting**: Added the ability to prevent specific applications (e.g., password managers) from having their copied content recorded.
- **Global Keyboard Shortcuts**: Quick access to the clipboard manager and item pinning via user-configurable shortcuts.

### Changed
- **Architecture Refactor**: Modernized the entire codebase to use ECMAScript Modules (ESM) and the new class-based Extension API required for GNOME 45+.
- **Build System**: Removed dependency on local `node_modules` in favor of a clean, standardized Makefile-driven compilation process.
- **Binary Data Handling**: Refactored to utilize `GLib.Bytes` and MD5 hashing for robust, leak-free memory management.

### Fixed
- **Runtime Initialization**: Resolved GSettings schema discovery errors that prevented the extension from starting on newer GNOME versions.
- **Image Copy Failure**: Fixed intermittent bugs where image buffers were not correctly returned to the system clipboard upon selection.

---

[68.0.0]: https://github.com/b00f/gnome-clipboard/releases/tag/v68

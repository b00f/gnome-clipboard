# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [69.0.1] - 2026-04-30

### Fixed
- **Clipboard History Storage**: Critical fix moving clipboard data storage from cache directory (`~/.cache`) to XDG user data directory (`~/.local/share`). Cache directory is volatile and subject to system cleanup. **This ensures clipboard history persists across system restarts and cache clears.** Legacy data migration automatically preserves existing history from cache.
- **GNOME 50 Compatibility**: Verified and tested full compatibility with GNOME 50 (Tokyo release).

## [69.0.0] - 2026-04-30

### Added
- **Interactive Shortcut Recorder**: Set keyboard shortcuts by simply pressing the key combination in the preferences window.
- **Advanced Global Shortcuts**: Added global hotkeys for Clearing History, Toggling Private Mode, and Cycling Items (Next/Prev).
- **Meta.Selection Integration**: Fully transitioned to modern, core Wayland-compatible selection APIs, resolving reviewer concerns (EGO-A-005).

### Changed
- **Async I/O Refactor**: Migrated all synchronous file and subprocess operations to non-blocking asynchronous APIs, achieving full compliance with GNOME Shell review guidelines (EGO-X-004, EGO-X-002).
- **UI Performance Optimization**: Implemented differential UI updates and image caching, significantly reducing shell main-loop blocking.
- **Packaging Compliance**: Optimized the distribution bundle by automatically removing compiled schemas and source translation files (.po).

### Fixed
- **Memory Leaks**: Resolved critical signal leaks related to GSettings listeners.
- **Data Persistence**: Fixed a bug where pending history changes could be lost during a shell restart.

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

[69.0.0]: https://github.com/b00f/gnome-clipboard/releases/tag/v69
[68.0.0]: https://github.com/b00f/gnome-clipboard/releases/tag/v68

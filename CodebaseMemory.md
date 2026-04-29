# Gnome Clipboard - Codebase Memory

## Overview
**Gnome Clipboard** is a GNOME Shell extension designed to manage clipboard history. It allows users to track previously copied text, pin important items, search through history, and quickly re-copy items to the clipboard.

## Tech Stack
- **Language**: TypeScript (compiled to JavaScript).
- **Environment**: GNOME Shell (GJS - GNOME JavaScript bindings).
- **UI Framework**: St (Shell Toolkit), Clutter, and GNOME Shell UI modules.
- **Persistence**: JSON-based storage in the user's cache directory.

## Core Architecture

### 1. Extension Lifecycle (`src/extension.ts`)
- **`GnomeExtension`**: Manages the `enable()` and `disable()` states.
- **`enable()`**: Initializes the `ClipboardPanel` and adds it to the GNOME Shell status area.
- **`disable()`**: Destroys the panel and cleans up resources.

### 2. Main UI Controller (`src/clipboardPanel.ts`)
The `ClipboardPanel` class (extending `PanelMenu.Button`) is the central hub.
- **Monitoring**: Watches for clipboard changes using either a timer or the `owner-changed` event from `Meta.Selection`.
- **UI Layout**:
    - **`SearchBox`**: Filters the history.
    - **`HistoryMenu`**: Displays the list of clipboard items.
    - **`ActionBar`**: Provides global actions (Clear history, Settings, Navigation).
- **Coordination**: Syncs between the clipboard, the internal `History` state, and the `Store`.

### 3. Data Management
- **`History` (`src/history.ts`)**: In-memory storage using a `Map<number, ClipboardItem>`. Handles sorting (by usage, time, or pinned status) and trimming history size.
- **`Store` (`src/store.ts`)**: Handles disk I/O. Saves and loads the history from `~/.cache/gnome-clipboard@b00f.github.io/history.json`.
- **`ClipboardItem` (`src/clipboardItem.ts`)**: Data model for a single clipboard entry (text, usage count, timestamps, pinned status).

### 4. UI Components
- **`HistoryMenu` (`src/historyMenu.ts`)**: A scrollable menu containing `MenuItem` instances.
- **`MenuItem` (`src/menuItem.ts`)**: Individual entries in the list with actions for pinning, deleting, and selecting.
- **`ActionBar` (`src/actionBar.ts`)**: Bottom bar with icons for settings, clearing, and quick navigation.
- **`SearchBox` (`src/searchBox.ts`)**: Input field for searching history.

### 5. Configuration (`src/settings.ts` & `src/prefs.ts`)
- Uses GSettings (via `Settings`) to store user preferences like history size, notifications, and sort order.
- `prefs.ts` provides the UI for the extension's settings window.

## Key Workflows

### Clipboard Monitoring
1. The extension listens for `owner-changed` on the clipboard.
2. When triggered, it fetches the current text.
3. If the text is new, it generates a hash ID and adds it to the `History`.
4. The UI is rebuilt, and the new state is saved to the `Store`.

### Item Interaction
1. User clicks an item in the menu.
2. `_onActivateItem` is called.
3. The item's text is copied back to the system clipboard.
4. The extension's internal "last used" timestamp is updated.

## File Structure
- `src/`: Source TypeScript files.
- `schemas/`: GSettings XML schema definitions.
- `po/`: Translation files.
- `media/`: Icons and assets.
- `Makefile`: Build and installation scripts.

## Important Notes
- **Hashing**: Items are identified by a hash of their text content to prevent duplicates.
- **Versioning**: Supports GNOME Shell 40-44.
- **Testing**: Includes targets in the `Makefile` for testing in nested shells or Wayland.

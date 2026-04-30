# Gnome Clipboard

![GNOME Version](https://img.shields.io/badge/GNOME-45%20|%2046%20|%2047%20|%2050+-blue?logo=gnome&logoColor=white)
![License](https://img.shields.io/badge/License-GPLv3-blue.svg)

A professional, feature-rich GNOME Shell extension for managing your clipboard history. **Gnome Clipboard** seamlessly integrates into the GNOME top bar, giving you quick access to your recently copied text and images, allowing you to pin important items, and providing robust privacy controls.

---

## 🌟 Features

- **Rich Media & Image Support**: Natively stores and previews copied images alongside standard text.
- **Categorized History**: Automatically segregates your clipboard history into a general "Recent" tab and a dedicated "Pinned" tab for important items you want to keep permanently.
- **Privacy Controls**:
  - **Private Mode**: Quickly toggle history tracking on or off to prevent sensitive data from being recorded.
  - **App Blacklisting**: Configure specific applications (like password managers) to be ignored by the clipboard manager.
- **Global Shortcuts**: Access your clipboard history instantly using customizable keyboard shortcuts (default: `<Super>v`).
- **Searchable**: Quickly find past clipboard items using the built-in search box.
- **Persistent Storage**: Your clipboard history is securely saved to disk and persists across system reboots.
- **Modern GNOME Compatibility**: Built using modern ECMAScript Modules (ESM) and the class-based Extension API, ensuring full compatibility from GNOME 45 up to GNOME 50+.

## ⚙️ Configuration & Preferences

You can customize Gnome Clipboard to fit your workflow perfectly using the extension's preferences window.

| Setting               | Description                                                                            | Default    |
| :-------------------- | :------------------------------------------------------------------------------------- | :--------- |
| **History Size**      | The maximum number of items to keep in the recent history.                             | `100`      |
| **History Sort**      | Choose how to sort your history (e.g., by usage or time).                              | `By Time`  |
| **Timer vs Event**    | Choose whether to poll the clipboard on a timer or use system events.                  | `Events`   |
| **Save Pinned Only**  | If enabled, only pinned items are saved to disk; recent items are forgotten on reboot. | `false`    |
| **Notifications**     | Toggle desktop notifications when an item is copied or pinned.                         | `false`    |
| **Blacklist**         | A list of application classes/names whose clipboard events will be ignored.            | `[]`       |
| **Keyboard Shortcut** | Set a global shortcut to open the clipboard menu.                                      | `<Super>v` |

## 🚀 Installation

### Option 1: Official GNOME Extensions (Recommended)

The easiest way to install Gnome Clipboard is through the official GNOME Extensions portal.

1. Install the **Extension Manager** app from Flathub or your distribution's package manager.
2. Search for "Gnome Clipboard" within the app and click install.
3. Alternatively, install directly from the web: 👉 **[Gnome Clipboard on GNOME Extensions](https://extensions.gnome.org/extension/4422/gnome-clipboard/)**

### Option 2: From Source Code (For testing & latest features)

If you want the absolute latest version, or if you want to contribute to the project, you can easily build and install the extension from source.

**Prerequisites:**
Before compiling, ensure you have the following installed on your system:
- `git`
- `make`
- `nodejs` & `npm` (Our build system uses `npx` to run the TypeScript compiler)

**Step-by-step Build Guide:**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/b00f/gnome-clipboard.git
   cd gnome-clipboard
   ```

2. **Build and Install:**
   ```bash
   make install
   ```
   *This command checks dependencies, compiles the TypeScript source, packs the extension, and installs it to your local extensions directory.*

3. **Enable the Extension:**
   After installation, you need to enable the extension so GNOME loads it.
   ```bash
   make enable
   ```

4. **Restart GNOME Shell:**
   For the extension to be recognized, you must restart the GNOME Shell.
   - **X11**: Press `Alt` + `F2`, type `r`, and press `Enter`.
   - **Wayland**: You must log out and log back in.

   Alternatively, you can run our automated script which detects your session type:
   ```bash
   make restart-shell
   ```

**For Developers:**
If you are actively developing and want to automate the build-install-restart loop, simply run:
```bash
make test
```
*(Warning: If you are on Wayland, running `make test` will automatically log you out to apply the changes!)*

You can monitor logs using:
```bash
make listen
```

## 🛠️ Development Commands

The project uses a standard `Makefile` to manage the build lifecycle:

- `make all`: Checks dependencies and packs the extension.
- `make compile`: Transpiles TypeScript files to standard GNOME JavaScript (ESM).
- `make pack`: Bundles the extension into a `.zip` file ready for EGO submission.
- `make install`: Installs the extension locally.
- `make clean`: Removes the `dist` build directory and zip artifacts.
- `make update-translations`: Extracts new strings and updates all `.po` files.

## 🌍 Contributing & Translations

Contributions are extremely welcome! If you find a bug or have a feature request, please open an issue. If you would like to contribute code:
1. Fork the repository.
2. Review the `CodebaseMemory.md` to understand the architecture.
3. Submit a Pull Request.

### Adding a new translation

You can easily add support for your language:
```bash
msginit -i ./po/gnome-clipboard.pot -l <YOUR-LANG-ID>
```
Then edit the generated `.po` file in the `po/` directory. Be sure to run `make update-translations` if you change any strings in the UI!

## 📜 License

This project is licensed under the GPL-3.0 License. See the [LICENSE](LICENSE) file for more details.

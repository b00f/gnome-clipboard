import Shell from 'gi://Shell';
import Meta from 'gi://Meta';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import * as ClipboardPanel from './clipboardPanel.js';
import * as log from './log.js';
import * as Settings from './settings.js';

export default class GnomeClipboardExtension extends Extension {
    private _panel: ClipboardPanel.ClipboardPanel | null = null;

    enable() {
        log.info(`enabling...`);
        
        // Initialize logging with settings
        log.init(this.getSettings(Settings.SCHEMA_ID));

        if (!this._panel) {
            this._panel = new ClipboardPanel.ClipboardPanel(
                this.getSettings(Settings.SCHEMA_ID),
                this.gettext.bind(this),
                this.uuid,
                () => this.openPreferences()
            );
            Main.panel.addToStatusArea(this.uuid, this._panel);
        }

        this._addKeybinding();
    }

    disable() {
        log.info(`disabling...`);
        this._removeKeybinding();

        if (this._panel) {
            this._panel.destroy();
            this._panel = null;
        }
    }

    private _addKeybinding() {
        (Main as any).wm.addKeybinding(
            Settings.SHORTCUT_MENU,
            this.getSettings(Settings.SCHEMA_ID),
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => {
                if (this._panel) {
                    this._panel.toggle();
                }
            }
        );
    }

    private _removeKeybinding() {
        (Main as any).wm.removeKeybinding(Settings.SHORTCUT_MENU);
    }
}

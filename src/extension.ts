import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import * as ClipboardPanel from './clipboardPanel.js';
import * as log from './log.js';

export default class GnomeClipboardExtension extends Extension {
    private _panel: ClipboardPanel.ClipboardPanel | null = null;

    enable() {
        log.info(`enabling...`);
        
        // Initialize logging with settings
        log.init(this.getSettings());

        if (!this._panel) {
            this._panel = new ClipboardPanel.ClipboardPanel(
                this.getSettings(),
                this.gettext.bind(this),
                this.uuid,
                () => this.openPreferences()
            );
            Main.panel.addToStatusArea(this.uuid, this._panel);
        }
    }

    disable() {
        log.info(`disabling...`);

        if (this._panel) {
            this._panel.destroy();
            this._panel = null;
        }
    }
}

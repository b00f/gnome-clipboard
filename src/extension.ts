// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as ClipboardPanel from 'clipboardPanel';
import * as log from 'log';

const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;

const GETTEXT_DOMAIN = 'gnome-clipboard';
const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
export const _ = Gettext.gettext;

export class GnomeExtension {
  _uuid: any;
  _panel: any | null;

  constructor(uuid: any) {
    this._uuid = uuid;

    ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
  }

  enable() {
    log.info(`enabling...`);

    this._panel = new ClipboardPanel.ClipboardPanel();
    Main.panel.addToStatusArea(this._uuid, this._panel);
  }

  disable() {
    log.info(`disabling...`);

    this._panel.destroy();
    this._panel = null;
  }
}

// @ts-ignore
function init(meta) {
  log.info(`initializing...`);

  return new GnomeExtension(meta.uuid);
}


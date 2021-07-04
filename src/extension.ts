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
  _clipboardPanel: any | null;

  constructor(uuid: any) {
    this._uuid = uuid;

    ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
  }

  enable() {
    log.info(`enabling...`);

    this._clipboardPanel = new ClipboardPanel.ClipboardPanel();
    Main.panel.addToStatusArea(this._uuid, this._clipboardPanel);
  }

  disable() {
    log.info(`disabling...`);

    this._clipboardPanel.destroy();
    this._clipboardPanel = null;
  }
}

// @ts-ignore
function init(meta) {
  log.info(`initializing...`);

  return new GnomeExtension(meta.uuid);
}


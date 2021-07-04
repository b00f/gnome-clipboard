// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as ClipboardPanel from 'clipboardPanel';

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
      this._clipboardPanel = new ClipboardPanel.ClipboardPanel();
      Main.panel.addToStatusArea(this._uuid, this._clipboardPanel);
  }

  disable() {
      this._clipboardPanel.destroy();
      this._clipboardPanel = null;
  }
}

// @ts-ignore
function init(meta) {
  return new GnomeExtension(meta.uuid);
}


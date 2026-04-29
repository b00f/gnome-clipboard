import St from 'gi://St';
import GObject from 'gi://GObject';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

// We'll receive the gettext function from the parent
let _ = (s: string) => s;

export function init(gettextFunc: (s: string) => string) {
    _ = gettextFunc;
}

export class ActionBar
  extends PopupMenu.PopupBaseMenuItem {

  private _enableBtn: any;
  private _pinBtn: any;
  private _clearBtn: any;
  private _settingsBtn: any;
  private _prevBtn: any;
  private _nextBtn: any;

  static {
    GObject.registerClass(this);
  }

  constructor() {
    super({
      reactive: false,
      activate: false,
      hover: false,
      can_focus: false,
      style_class: 'action-bar',
    })
    
    let actionsBox = new St.BoxLayout({
      vertical: false,
      hover: false,
      can_focus: false,
    });

    this._enableBtn = new PopupMenu.PopupSwitchMenuItem(
      _("Enable"), true, {
      style_class: 'action-bar-btn',
      reactive: true, hover: true,
    });
    actionsBox.add_child(this._enableBtn);

    // Add a spacer
    let spacer = new PopupMenu.PopupBaseMenuItem({
      hover: false,
      reactive: false,
      activate: false,
    });
    actionsBox.add_child(spacer);
    
    // 'Pin' button
    this._pinBtn = new PopupMenu.PopupBaseMenuItem({
      style_class: 'action-bar-btn'
    });

    let pinIcon = new St.Icon({
      icon_name: "view-pin-symbolic",
      style_class: 'popup-menu-icon',
    });

    this._pinBtn.add_child(pinIcon);
    actionsBox.add_child(this._pinBtn);
    this._clearBtn = new PopupMenu.PopupBaseMenuItem({
      style_class: 'action-bar-btn'
    });

    let clearIcon = new St.Icon({
      icon_name: "edit-delete-symbolic",
      style_class: 'popup-menu-icon',
    });

    this._clearBtn.add_child(clearIcon);
    actionsBox.add_child(this._clearBtn);

    // 'Settings' button
    this._settingsBtn = new PopupMenu.PopupBaseMenuItem({
      style_class: 'action-bar-btn'
    });

    let settingsIcon = new St.Icon({
      icon_name: "emblem-system-symbolic",
      style_class: 'popup-menu-icon',
    });
    this._settingsBtn.add_child(settingsIcon);
    actionsBox.add_child(this._settingsBtn);

    // 'Prev' button
    this._prevBtn = new PopupMenu.PopupBaseMenuItem({
      style_class: 'action-bar-btn'
    });

    let prevIcon = new St.Icon({
      icon_name: "go-previous-symbolic",
      style_class: 'popup-menu-icon',
    });
    this._prevBtn.add_child(prevIcon);
    actionsBox.add_child(this._prevBtn);

    // 'Next' button
    this._nextBtn = new PopupMenu.PopupBaseMenuItem({
      style_class: 'action-bar-btn'
    });

    let nextIcon = new St.Icon({
      icon_name: "go-next-symbolic",
      style_class: 'popup-menu-icon',
    });
    this._nextBtn.add_child(nextIcon);
    actionsBox.add_child(this._nextBtn);

    this.add_child(actionsBox);
  }

  enableNextButton(_enable: boolean) {
    // TODO: implement
  }

  enablePrevButton(_enable: boolean) {
    // TODO: implement
  }

  onNextItem(callback: () => void) {
    this._nextBtn.connect('activate', (_obj: any) => {
      callback();
    });
  }

  onPrevItem(callback: () => void) {
    this._prevBtn.connect('activate', (_obj: any) => {
      callback();
    });
  }

  onClearHistory(callback: () => void) {
    this._clearBtn.connect('activate', (_obj: any) => {
      callback();
    });
  }

  onPin(callback: () => void) {
    this._pinBtn.connect('activate', (_obj: any) => {
      callback();
    });
  }

  onOpenSettings(callback: () => void) {
    this._settingsBtn.connect('activate', (_obj: any) => {
      callback();
    });
  }

  enable() {
    return this._enableBtn.state;
  }
}

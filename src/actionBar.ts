const {
  St,
} = imports.gi;
const PopupMenu = imports.ui.popupMenu;
const GObject = imports.gi.GObject;

export class ActionBar
  extends PopupMenu.PopupBaseMenuItem {

  static {
    GObject.registerClass(this);
  }

  constructor() {
    super({
      activate: false,
      hover: false,
      style_class: 'action-bar',
    })

    let actionsBox = new St.BoxLayout({
      vertical: false,
    });

    // TODO:: Add tooltip
    this._enableBtn = new PopupMenu.PopupSwitchMenuItem(
      _("Enable"), true, {
      style_class: 'action-bar-btn',
      reactive: true, hover: true,
    });
    this._enableBtn._ornamentLabel.visible = false;
    actionsBox.add(this._enableBtn);

    // Add a spacer
    let spacer = new PopupMenu.PopupBaseMenuItem();
    spacer._ornamentLabel.visible = false;
    actionsBox.add(spacer);

    // 'Clear' button which removes all items from cache
    this._clearBtn = new PopupMenu.PopupBaseMenuItem({
      style_class: 'action-bar-btn'
    });

    let clearIcon = new St.Icon({
      icon_name: "edit-delete-symbolic",
      style_class: 'popup-menu-icon',
    });

    this._clearBtn.add_child(clearIcon);
    this._clearBtn._ornamentLabel.visible = false;
    actionsBox.add(this._clearBtn);

    // 'Settings' button to open the settings dialog
    this._settingsBtn = new PopupMenu.PopupBaseMenuItem({
      style_class: 'action-bar-btn'
    });

    let settingsIcon = new St.Icon({
      icon_name: "emblem-system-symbolic",
      style_class: 'popup-menu-icon',
    });
    this._settingsBtn.add_child(settingsIcon);
    this._settingsBtn._ornamentLabel.visible = false;
    actionsBox.add(this._settingsBtn);

    // 'Prev' button to copy the previous item
    this._prevBtn = new PopupMenu.PopupBaseMenuItem({
      style_class: 'action-bar-btn'
    });

    let prevIcon = new St.Icon({
      icon_name: "go-previous-symbolic",
      style_class: 'popup-menu-icon',
    });
    this._prevBtn.add_child(prevIcon);
    this._prevBtn._ornamentLabel.visible = false;
    actionsBox.add(this._prevBtn);

    // 'Next' button to copy the next item
    this._nextBtn = new PopupMenu.PopupBaseMenuItem({
      style_class: 'action-bar-btn'
    });

    let nextIcon = new St.Icon({
      icon_name: "go-next-symbolic",
      style_class: 'popup-menu-icon',
    });
    this._nextBtn.add_child(nextIcon);
    this._nextBtn._ornamentLabel.visible = false;
    actionsBox.add(this._nextBtn);

    this.actor.add(actionsBox);
  }

  enableNextButton(_enable: boolean) {
    // TODO: fix me
  }

  enablePrevButton(_enable: boolean) {
    // TODO: fix me
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

  onOpenSettings(callback: () => void) {
    this._settingsBtn.connect('activate', (_obj: any) => {
      callback();
    });
  }

  enable() {
    return this._enableBtn.state;
  }
}

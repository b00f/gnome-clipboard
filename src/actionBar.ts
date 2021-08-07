const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;
const GObject = imports.gi.GObject;

export var ActionBar = GObject.registerClass(
  class ActionBar extends PopupMenu.PopupBaseMenuItem {
    protected _init() {
      super._init({
        activate: false,
        hover: false,
        style_class: 'action-bar',
      })

      let actionsBox = new St.BoxLayout({
        vertical: false,
      });
      actionsBox.set_x_expand(true);

      // TODO:: Add tooltip
      this._enableBtn = new PopupMenu.PopupSwitchMenuItem(
        _("Enable"), true, {
        style_class: 'action-bar-btn',
        reactive: true, hover: true,
      });
      this._enableBtn._ornamentLabel.visible = false;
      this._enableBtn.set_x_expand(false);
      actionsBox.add(this._enableBtn);

      // Add a spacer
      this.spacer = new PopupMenu.PopupBaseMenuItem();
      this.spacer._ornamentLabel.visible = false;
      this.spacer.set_x_expand(true);
      actionsBox.add(this.spacer);

      // Add 'Clear' button which removes all items from cache
      this._clearBtn = new PopupMenu.PopupBaseMenuItem({
        style_class: 'action-bar-btn'
      });

      this.clearIcon = new St.Icon({
        icon_name: "edit-delete-symbolic",
        style_class: 'popup-menu-icon',
      });

      this._clearBtn.add_child(this.clearIcon);
      this._clearBtn.set_x_expand(false);
      this._clearBtn._ornamentLabel.visible = false;
      actionsBox.add(this._clearBtn);

      // Add 'Settings' menu item to open settings
      this._settingsBtn = new PopupMenu.PopupBaseMenuItem({
        style_class: 'action-bar-btn'
      });

      this.settingsIcon = new St.Icon({
        icon_name: "emblem-system-symbolic",
        style_class: 'popup-menu-icon',
      });
      this._settingsBtn.add_child(this.settingsIcon);
      this._settingsBtn.set_x_expand(false);
      this._settingsBtn._ornamentLabel.visible = false;
      actionsBox.add(this._settingsBtn);

      this.actor.add(actionsBox);
    }

    onRemoveAll(callback: () => void) {
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
);

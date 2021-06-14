// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;
const GObject = imports.gi.GObject;
const Clutter = imports.gi.Clutter;

import * as ClipboardData from 'clipboardData';


export var MenuItem = GObject.registerClass(
  class MenuItem extends PopupMenu.PopupBaseMenuItem {
    _init(
      data: ClipboardData.ClipboardData,
      onActivate: (item: MenuItem) => void,
      onRemove: (item: MenuItem) => void,
      onPin: (item: MenuItem) => void) {
      super._init()

      this.data = data;

      let label = new St.Label({ text: this.data.display() });
      this.add_child(label);
      this.connect('activate', () => {
        onActivate(this);
      });

      // pin button
      let pinIcon = new St.Icon({
        icon_name: "view-pin-symbolic",
        style_class: 'popup-menu-icon'
      });

      let pinBtn = new St.Button({
        style_class: 'action-btn',
        child: pinIcon
      });

      pinBtn.set_x_align(Clutter.ActorAlign.END);
      pinBtn.set_x_expand(true);
      pinBtn.set_y_expand(true);

      this.actor.add_child(pinBtn);
      pinBtn.connect('button-press-event',
        () => {
          onPin(this);
        }
      );

      // remove button
      let removeIcon = new St.Icon({
        icon_name: "edit-delete-symbolic",
        style_class: 'popup-menu-icon'
      });

      let removeBtn = new St.Button({
        style_class: 'action-btn',
        child: removeIcon
      });

      removeBtn.set_x_align(Clutter.ActorAlign.END);
      removeBtn.set_x_expand(false);
      removeBtn.set_y_expand(true);

      this.actor.add_child(removeBtn);
      removeBtn.connect('button-press-event',
        () => {
          onRemove(this);
        }
      );
    }
  }
);
import St from 'gi://St';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as ClipboardItem from './clipboardItem.js';

export class MenuItem
  extends PopupMenu.PopupBaseMenuItem {

  public cbInfo: ClipboardItem.ClipboardItem;

  static {
    GObject.registerClass(this);
  }

  constructor(
    cbInfo: ClipboardItem.ClipboardItem,
    onActivate: (item: MenuItem) => void,
    onPin: (item: MenuItem) => void,
    onRemove: (item: MenuItem) => void) {

    super();

    this.cbInfo = cbInfo;

    let label = new St.Label({ text: cbInfo.display() });
    this.add_child(label);
    this.connect('activate', () => {
      onActivate(this);
    });

    // pin button
    let pinIcon = new St.Icon({
      icon_name: "",
      reactive: true,
      track_hover: true,
      style_class: "popup-menu-icon pin-icon",
    });

    if (this.cbInfo.pinned) {
      pinIcon.icon_name = "view-pin-symbolic";
    } else {
      pinIcon.icon_name = "";
    }

    pinIcon.connect("enter-event", (self: any) => {
      self.icon_name = "view-pin-symbolic";
    });

    pinIcon.connect("leave-event", (self: any) => {
      if (this.cbInfo.pinned) {
        self.icon_name = "view-pin-symbolic";
      } else {
        self.icon_name = "";
      }
    });

    let pinBtn = new St.Button({
      style_class: 'action-btn',
      reactive: true,
      track_hover: true,
      child: pinIcon
    });

    pinBtn.set_x_align(Clutter.ActorAlign.END);
    pinBtn.set_x_expand(true);
    pinBtn.set_y_expand(true);

    this.add_child(pinBtn);
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

    this.add_child(removeBtn);
    removeBtn.connect('button-press-event',
      () => {
        onRemove(this);
      }
    );
  }

  text(): string {
    return this.cbInfo.text;
  }
}
import St from 'gi://St';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
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

    super({
        style_class: 'clipboard-item'
    });

    this.cbInfo = cbInfo;

    let mainBox = new St.BoxLayout({
        vertical: true,
        x_expand: true,
    });

    let headerBox = new St.BoxLayout({
        vertical: false,
        x_expand: true,
    });

    // Content Box (Text or Image)
    let contentBox = new St.BoxLayout({
        vertical: false,
        x_expand: true,
        y_align: Clutter.ActorAlign.CENTER
    });

    if (cbInfo.type === ClipboardItem.ClipboardItemType.IMAGE && cbInfo.imagePath) {
      let file = Gio.file_new_for_path(cbInfo.imagePath);
      let gicon = Gio.Icon.new_for_string(file.get_path());
      let icon = new St.Icon({
        gicon: gicon,
        icon_size: 64,
        style_class: 'clipboard-image-preview'
      });
      contentBox.add_child(icon);
    } else {
      let label = new St.Label({ 
          text: cbInfo.display(),
          style_class: 'clipboard-item-text'
      });
      contentBox.add_child(label);
    }
    headerBox.add_child(contentBox);

    // Meta Box (Time + Pins)
    let metaBox = new St.BoxLayout({
        vertical: true,
        x_align: Clutter.ActorAlign.END,
        y_align: Clutter.ActorAlign.CENTER
    });

    // Relative Time
    let timeLabel = new St.Label({
        text: this._formatRelativeTime(cbInfo.copiedAt),
        style_class: 'clipboard-item-meta'
    });
    metaBox.add_child(timeLabel);

    headerBox.add_child(metaBox);
    mainBox.add_child(headerBox);

    this.add_child(mainBox);

    // Pin & Remove buttons (shown on hover/selection in some designs, or always)
    // For now, let's group them in an action container
    let actionContainer = new St.BoxLayout({
        vertical: false,
        x_align: Clutter.ActorAlign.END
    });

    // Pin Button
    let pinBtn = this._createActionBtn(
        cbInfo.pinned ? "view-pin-symbolic" : "view-pin-symbolic", 
        cbInfo.pinned ? "pinned" : "unpinned"
    );
    actionContainer.add_child(pinBtn);
    pinBtn.connect('clicked', () => onPin(this));

    // Remove Button
    let removeBtn = this._createActionBtn("edit-delete-symbolic", "remove-icon");
    actionContainer.add_child(removeBtn);
    removeBtn.connect('clicked', () => onRemove(this));

    this.add_child(actionContainer);

    this.connect('activate', () => {
      onActivate(this);
    });
  }

  private _createActionBtn(iconName: string, extraClass: string) {
      return new St.Button({
          style_class: `item-action-btn ${extraClass}`,
          child: new St.Icon({
              icon_name: iconName,
              icon_size: 14,
              style_class: 'popup-menu-icon'
          }),
          can_focus: true,
          track_hover: true
      });
  }

  private _formatRelativeTime(timestamp: number): string {
      let diff = (Date.now() - timestamp) / 1000;
      if (diff < 60) return "Just now";
      if (diff < 3600) return Math.floor(diff / 60) + "m ago";
      if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
      return Math.floor(diff / 86400) + "d ago";
  }

  text(): string {
    return this.cbInfo.text;
  }
}
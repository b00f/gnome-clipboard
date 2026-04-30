import St from 'gi://St';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as ClipboardItem from './clipboardItem.js';

export class MenuItem
  extends PopupMenu.PopupBaseMenuItem {

  public cbInfo: ClipboardItem.ClipboardItem;
  private static _iconCache: Map<string, any> = new Map();
  private _timeLabel: any;
  private _contentLabel: any;
  private _contentIcon: any;
  private _pinBtn: any;

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
      let gicon = MenuItem._iconCache.get(cbInfo.imagePath);
      if (!gicon) {
          let file = Gio.file_new_for_path(cbInfo.imagePath);
          gicon = Gio.Icon.new_for_string(file.get_path());
          MenuItem._iconCache.set(cbInfo.imagePath, gicon);
      }
      
      this._contentIcon = new St.Icon({
        gicon: gicon,
        icon_size: 48,
        style_class: 'clipboard-image-preview'
      });
      contentBox.add_child(this._contentIcon);
    } else {
      this._contentLabel = new St.Label({ 
          text: cbInfo.display(),
          style_class: 'clipboard-item-text'
      });
      contentBox.add_child(this._contentLabel);
    }
    headerBox.add_child(contentBox);

    // Meta Box (Time + Pins)
    let metaBox = new St.BoxLayout({
        vertical: true,
        x_align: Clutter.ActorAlign.END,
        y_align: Clutter.ActorAlign.CENTER
    });

    // Relative Time
    this._timeLabel = new St.Label({
        text: this._formatRelativeTime(cbInfo.copiedAt),
        style_class: 'clipboard-item-meta'
    });
    metaBox.add_child(this._timeLabel);

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
    this._pinBtn = this._createActionBtn(
        cbInfo.pinned ? "view-pin-symbolic" : "view-pin-symbolic", 
        cbInfo.pinned ? "pinned" : "unpinned"
    );
    actionContainer.add_child(this._pinBtn);
    this._pinBtn.connect('clicked', () => onPin(this));

    // Remove Button
    let removeBtn = this._createActionBtn("edit-delete-symbolic", "remove-icon");
    actionContainer.add_child(removeBtn);
    removeBtn.connect('clicked', () => onRemove(this));

    this.add_child(actionContainer);

    this.connect('activate', () => {
      onActivate(this);
    });
  }

  public updateUI() {
    this._timeLabel.set_text(this._formatRelativeTime(this.cbInfo.copiedAt));
    
    if (this._contentLabel) {
        this._contentLabel.set_text(this.cbInfo.display());
    }

    if (this._contentIcon && this.cbInfo.type === ClipboardItem.ClipboardItemType.IMAGE && this.cbInfo.imagePath) {
        let gicon = MenuItem._iconCache.get(this.cbInfo.imagePath);
        if (gicon) {
            this._contentIcon.set_gicon(gicon);
        }
    }

    // Update pin status
    this._pinBtn.remove_style_class_name('pinned');
    this._pinBtn.remove_style_class_name('unpinned');
    this._pinBtn.add_style_class_name(this.cbInfo.pinned ? 'pinned' : 'unpinned');
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
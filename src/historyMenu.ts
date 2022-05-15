// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as ScrollMenu from 'scrollMenu';
import * as ClipboardItem from 'clipboardItem';
import * as MenuItem from 'menuItem';

const PopupMenu = imports.ui.popupMenu;

export class HistoryMenu
  extends ScrollMenu.ScrollMenu {

  private _onActivateItem: (item: ClipboardItem.ClipboardItem) => void;
  private _onPinItem: (item: ClipboardItem.ClipboardItem) => void;
  private _onRemoveItem: (item: ClipboardItem.ClipboardItem) => void;
  private _nextItem: ClipboardItem.ClipboardItem | null;
  private _prevItem: ClipboardItem.ClipboardItem | null;

  constructor(
    onActivateItem: (item: ClipboardItem.ClipboardItem) => void,
    onPinItem: (item: ClipboardItem.ClipboardItem) => void,
    onRemoveItem: (item: ClipboardItem.ClipboardItem) => void) {
    super()

    this._onActivateItem = onActivateItem;
    this._onPinItem = onPinItem;
    this._onRemoveItem = onRemoveItem;
    this._nextItem = null;
    this._prevItem = null;
  }

  public rebuildMenu(
    history: Array<ClipboardItem.ClipboardItem>,
    selectedID: number) {
    super.removeAll();
    this._nextItem = null;
    this._prevItem = null;

    history.forEach((info, index, arr) => {
      let item = new MenuItem.MenuItem(info,
        this.onActivateItem.bind(this),
        this.onPinItem.bind(this),
        this.onRemoveItem.bind(this),
      );

      if (info.id() == selectedID) {
        item.setOrnament(PopupMenu.Ornament.CHECK);

        if (index - 1 > 0) {
          this._nextItem = arr[index - 1];
        }

        if (index + 1 < arr.length) {
          this._prevItem = arr[index + 1];
        }

        // Scroll to the selected item
        super.scrollToBottom()
      }

      super.addMenuItem(item);
    });
  }

  public nextItem() {
    return this._nextItem;
  }

  public prevItem() {
    return this._prevItem;
  }

  public hasNextItem() {
    return this._nextItem != null;
  }

  public hasPrevItem() {
    return this._prevItem != null;
  }

  private onActivateItem(item: MenuItem.MenuItem) {
    this._onActivateItem(item.cbInfo);
  }

  private onRemoveItem(item: MenuItem.MenuItem) {
    item.destroy();
    this._onRemoveItem(item.cbInfo);
  }

  private onPinItem(item: MenuItem.MenuItem) {
    this._onPinItem(item.cbInfo);
  }
};
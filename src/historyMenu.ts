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

  constructor(
    onActivateItem: (item: ClipboardItem.ClipboardItem) => void,
    onPinItem: (item: ClipboardItem.ClipboardItem) => void,
    onRemoveItem: (item: ClipboardItem.ClipboardItem) => void) {
    super()

    this._onActivateItem = onActivateItem;
    this._onPinItem = onPinItem;
    this._onRemoveItem = onRemoveItem;
  }

  public rebuildMenu(
    history: Array<ClipboardItem.ClipboardItem>,
    selectedID: number) {
    super.removeAll();

    history.forEach((info, _) => {
      let item = new MenuItem.MenuItem(info,
        this.onActivateItem.bind(this),
        this.onPinItem.bind(this),
        this.onRemoveItem.bind(this),
      );

      if (info.id() == selectedID) {
        item.setOrnament(PopupMenu.Ornament.CHECK)
      }

      super.addMenuItem(item);
    });
  }

  private onActivateItem(item: typeof MenuItem.MenuItem) {
    this._onActivateItem(item.cbInfo);
  }

  private onRemoveItem(item: typeof MenuItem.MenuItem) {
    item.destroy();
    this._onRemoveItem(item.cbInfo);
  }

  private onPinItem(item: typeof MenuItem.MenuItem) {
    this._onPinItem(item.cbInfo);
  }
};
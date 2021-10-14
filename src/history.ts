// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as ClipboardItem from 'clipboardItem';
import * as Settings from 'settings';

export class History {
  private _history: Map<number, ClipboardItem.ClipboardItem>;

  constructor() {
    this._history = new Map();
  }

  public clear() {
    this._history.clear();
  }

  public delete(id: number) {
    this._history.delete(id);
  }

  public get(id: number): ClipboardItem.ClipboardItem | undefined {
    return this._history.get(id);
  }

  public set(item: ClipboardItem.ClipboardItem) {
    return this._history.set(item.id(), item);
  }

  public trim(total: number) {
    let arr = this.getSorted(Settings.HISTORY_SORT_COPY_TIME);
    for (let i = total; i < arr.length; ++i) {
      let item: any = arr.pop();
      this._history.delete(item.id());
    }
  }

  public items(only_pinned: boolean): Array<ClipboardItem.ClipboardItem> {
    let items: any = [];
    this._history.forEach((item, _) => {
      if (only_pinned) {
        if (item.pinned) {
          items.push(item);
        }
      } else {
        items.push(item);
      }
    });

    return items;
  }

  public getSorted(sort_by: number): Array<ClipboardItem.ClipboardItem> {
    let arr = Array.from(this._history.values());
    arr.sort((l: ClipboardItem.ClipboardItem, r: ClipboardItem.ClipboardItem): number => {
      if (r.pinned && !l.pinned) {
        return 1;
      }

      if (!r.pinned && l.pinned) {
        return -1;
      }

      switch (sort_by) {
        case Settings.HISTORY_SORT_RECENT_USAGE:
          return r.usedAt - l.usedAt;

        case Settings.HISTORY_SORT_COPY_TIME:
          return r.copiedAt - l.copiedAt;

        case Settings.HISTORY_SORT_MOST_USAGE:
        default:
          if (r.usage == l.usage) {
            return r.copiedAt - l.copiedAt;
          }
          return r.usage - l.usage;
      }
    });

    return arr;
  }
}
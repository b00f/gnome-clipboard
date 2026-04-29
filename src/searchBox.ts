import St from 'gi://St';
import GObject from 'gi://GObject';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

let _ = (s: string) => s;

export function init(gettextFunc: (s: string) => string) {
    _ = gettextFunc;
}

export class SearchBox
  extends PopupMenu.PopupBaseMenuItem {

  public searchEntry: St.Entry;

  static {
    GObject.registerClass(this);
  }

  constructor() {
    super({
      reactive: false,
      can_focus: true,
    })

    this.searchEntry = new St.Entry({
      style_class: 'search-box',
      can_focus: true,
      hint_text: _('Type here to search...'),
      track_hover: true
    });

    this.searchEntry.set_x_expand(true);

    this.add_child(this.searchEntry);
  }

  onTextChanged(callback: any) {
    this.searchEntry.get_clutter_text().connect(
      'text-changed',
      callback
    );
  }

  getText() {
    return this.searchEntry.get_text();
  }

  setText(text: string) {
    return this.searchEntry.set_text(text);
  }
}

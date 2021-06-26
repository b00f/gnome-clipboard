const { St, GObject } = imports.gi;
const PopupMenu = imports.ui.popupMenu

export var SearchBox = GObject.registerClass(
  class SearchBox extends PopupMenu.PopupBaseMenuItem {
    constructor() {
      super();
    }

    _init() {
      super._init({
        reactive: false,
        can_focus: true,
      })

      // TODO: add 'x' clear button inside the search box
      // --------------------------------------------------
      // |                                              X |
      // --------------------------------------------------
      this.searchEntry = new St.Entry({
        style_class: 'search-box',
        can_focus: true,
        hint_text: _('Type here to search...'),
        track_hover: true
      });

      this.searchEntry.set_x_expand(true);

      this.actor.add_child(this.searchEntry);

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
);

var SearchBox = GObject.registerClass(
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
      this.search_entry = new St.Entry({
        name: 'searchItem',
        style_class: 'gt-search-box',
        can_focus: true,
        hint_text: _('Type here to search...'),
        track_hover: true
      });

      this.search_entry.set_x_expand(true);

      this.actor.add_child(this.search_entry);

    }

    onTextChanged(callback: any) {
      this.search_entry.get_clutter_text().connect(
        'text-changed',
        callback
      );
    }

    getText() {
      return this.search_entry.get_text();
    }

    setText(text: string) {
      return this.search_entry.set_text(text);
    }
  }
);

'use strict';

// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;

const ExtensionUtils = imports.misc.extensionUtils;

import * as log from 'log';
import * as Settings from 'settings';


const Gettext = imports.gettext;
const _ = Gettext.domain('gnome-clipboard').gettext;

export function init() {
    Gtk.init(null);
}

export function buildPrefsWidget() {
    let settings = ExtensionUtils.getSettings(Settings.SCHEMA_ID);

    let box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        margin: 18,
    });

    let prefsFrame = new Gtk.Frame({
        label: _("Preferences"),
    });
    box.add(prefsFrame);

    let prefsGrid = new Gtk.Grid({
        margin: 18,
        column_spacing: 12,
        row_spacing: 12,
        row_homogeneous: false,
        column_homogeneous: true,

    });

    let row = 0
    let addRowAndBindSetting = function (grid: any, widget: any, name: string, desc: string) {

        let label = new Gtk.Label({
            label: desc,
            halign: Gtk.Align.START,
        });
        widget.set_tooltip_text(desc);

        grid.attach(label, 0, row, 1, 1);
        grid.attach(widget, 1, row, 1, 1);

        if (widget instanceof Gtk.Switch || widget instanceof Gtk.ComboBox) {
            widget.active = settings.get_boolean(name)
            settings.bind(
                name,
                widget,
                'active',
                Gio.SettingsBindFlags.DEFAULT
            );
        } else if (widget instanceof Gtk.SpinButton) {
            widget.value = settings.get_uint(name)
            settings.bind(
                name,
                widget,
                'value',
                Gio.SettingsBindFlags.DEFAULT
            );
        } else {
            log.error("Invalid prefs widget")
        }

        row++;
    };

    {
        let widget = new Gtk.SpinButton({
            halign: Gtk.Align.END,
        });
        widget.set_range(2, 1000);
        widget.set_increments(1, 1);
        addRowAndBindSetting(prefsGrid, widget, Settings.HISTORY_SIZE, _("Maximum size of history:"));
    }

    {
        let widget = new Gtk.Switch({
            halign: Gtk.Align.END,
        });

        addRowAndBindSetting(prefsGrid, widget, Settings.CLIPBOARD_TIMER, "Read clipboard by timer:");
    }

    {
        let sortStore = new Gtk.ListStore();
        sortStore.set_column_types([GObject.TYPE_STRING]);
        let sorting = [
            _("Most usage"),
            _("Copy time"),
            _("Recent copied time"),
        ];
        for (let s of sorting) {
            sortStore.set(sortStore.append(), [0], [s]);
        }

        let widget = new Gtk.ComboBox({
            halign: Gtk.Align.END,
            model: sortStore,
        });
        let renderer = new Gtk.CellRendererText();
        widget.pack_start(renderer, true);
        widget.add_attribute(renderer, "text", 0);

        addRowAndBindSetting(prefsGrid, widget, Settings.HISTORY_SORT, "Sort history by:");
    }

    prefsFrame.add(prefsGrid);

    let prefsFrame2 = new Gtk.Frame({
        label: _("Preferences"),
        margin: 18,
    });

    box.add(prefsFrame2);
    box.show_all();

    return box;
}
'use strict';

// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;

import * as log from 'log';
import * as Settings from 'settings';


const Gettext = imports.gettext;
const _ = Gettext.domain('gnome-clipboard').gettext;

export function init() {
    Gtk.init(null);
}

export function buildPrefsWidget() {
    let settings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.gnome-clipboard');

    let box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        margin: 18,
        visible: true
    });

    let prefsFrame = new Gtk.Frame({
        label: _("Preferences"),
        visible: true
    });
    box.add(prefsFrame);

    // Create a parent widget that we'll return from this function
    let prefsGrid = new Gtk.Grid({
        margin: 18,
        column_spacing: 12,
        row_spacing: 12,
        visible: true,
        row_homogeneous: false,
        column_homogeneous: true,

    });

    let row = 0
    let addRowAndBindSetting = function (grid: any, widget: any, name: string, desc: string) {

        let label = new Gtk.Label({
            label: desc,
            halign: Gtk.Align.START,
            visible: true
        });
        widget.set_tooltip_text(desc);

        grid.attach(label, 0, row, 1, 1);
        grid.attach(widget, 1, row, 1, 1);

        if (widget instanceof Gtk.Switch) {
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
            visible: true
        });
        widget.set_range(0, 1000);
        widget.set_increments(1, 1);
        addRowAndBindSetting(prefsGrid, widget, Settings.HISTORY_SIZE, _("Maximum size of history:"));
    }

    {
        let widget = new Gtk.Switch({
            halign: Gtk.Align.END,
            visible: true
        });

        addRowAndBindSetting(prefsGrid, widget, Settings.CLIPBOARD_TIMER, "Read clipboard by timer:");
    }

    prefsFrame.add(prefsGrid);

    let prefsFrame2 = new Gtk.Frame({
        label: _("Preferences"),
        margin: 18,
        visible: true
    });

    box.add(prefsFrame2);

    return box;
}
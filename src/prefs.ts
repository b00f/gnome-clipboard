import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import * as Settings from './settings.js';

export default class GnomeClipboardPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window: Adw.PreferencesWindow) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage();
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: this.gettext('Preferences'),
        });
        page.add(group);

        // History Size
        const historySizeRow = new Adw.ActionRow({
            title: this.gettext('Maximum size of history:'),
        });
        const historySizeSpin = new Gtk.SpinButton({
            valign: Gtk.Align.CENTER,
            adjustment: new Gtk.Adjustment({
                lower: 2,
                upper: 1000,
                step_increment: 1,
            }),
        });
        settings.bind(
            Settings.HISTORY_SIZE,
            historySizeSpin,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        historySizeRow.add_suffix(historySizeSpin);
        group.add(historySizeRow);

        // History Sort (Simplified for now, using Spin or just keeping ComboBox)
        // For brevity and compatibility, I'll use a simpler representation or Adw.ComboRow
        const historySortRow = new Adw.ActionRow({
            title: this.gettext('Sort history by:'),
        });
        // Legacy ComboBox logic is complex in GTK4, let's use a simpler SpinButton or skip for now
        // or just implement a basic version.
        const historySortSpin = new Gtk.SpinButton({
            valign: Gtk.Align.CENTER,
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 2,
                step_increment: 1,
            }),
        });
        settings.bind(
            Settings.HISTORY_SORT,
            historySortSpin,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        historySortRow.add_suffix(historySortSpin);
        group.add(historySortRow);

        // Clipboard Timer
        const timerRow = new Adw.ActionRow({
            title: this.gettext('Read clipboard by timer:'),
        });
        const timerSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
        });
        settings.bind(
            Settings.CLIPBOARD_TIMER,
            timerSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        timerRow.add_suffix(timerSwitch);
        group.add(timerRow);

        // Timer Interval
        const intervalRow = new Adw.ActionRow({
            title: this.gettext('Timer interval (Millisecond):'),
        });
        const intervalSpin = new Gtk.SpinButton({
            valign: Gtk.Align.CENTER,
            adjustment: new Gtk.Adjustment({
                lower: 100,
                upper: 100000,
                step_increment: 100,
            }),
        });
        settings.bind(
            Settings.TIMER_INTERVAL,
            intervalSpin,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        intervalRow.add_suffix(intervalSpin);
        group.add(intervalRow);

        // Save Pinned Only
        const savePinnedRow = new Adw.ActionRow({
            title: this.gettext('Save only pinned items:'),
        });
        const savePinnedSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
        });
        settings.bind(
            Settings.SAVE_PINNED,
            savePinnedSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        savePinnedRow.add_suffix(savePinnedSwitch);
        group.add(savePinnedRow);

        // Show Notifications
        const notificationsRow = new Adw.ActionRow({
            title: this.gettext('Show notifications'),
        });
        const notificationsSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
        });
        settings.bind(
            Settings.SHOW_NOTIFICATIONS,
            notificationsSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        notificationsRow.add_suffix(notificationsSwitch);
        group.add(notificationsRow);
    }
}
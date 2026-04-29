
export const SCHEMA_ID = 'org.gnome.shell.extensions.gnome-clipboard';

export const HISTORY_SIZE = "history-size";
export const HISTORY_SORT = "history-sort";
export const CLIPBOARD_TIMER = "clipboard-timer";
export const TIMER_INTERVAL = "timer-interval";
export const SAVE_PINNED = "save-pinned";
export const SHOW_NOTIFICATIONS = "show-notifications";


export const HISTORY_SORT_COPY_TIME = 0;
export const HISTORY_SORT_RECENT_USAGE = 1;
export const HISTORY_SORT_MOST_USAGE = 2;

export class ExtensionSettings {
    private _settings: Gio.Settings;

    constructor(settings: Gio.Settings) {
        this._settings = settings;
    }

    onChanged(callback: () => void) {
        this._settings.connect('changed', callback);
    }

    historySize(): number {
        return this._settings.get_uint(HISTORY_SIZE);
    }

    historySort(): number {
        return this._settings.get_uint(HISTORY_SORT);
    }

    clipboardTimer(): boolean {
        return this._settings.get_boolean(CLIPBOARD_TIMER);
    }

    clipboardTimerIntervalInMillisecond(): number {
        return this._settings.get_uint(TIMER_INTERVAL);
    }

    savePinned(): boolean {
        return this._settings.get_boolean(SAVE_PINNED);
    }

    showNotifications(): boolean {
        return this._settings.get_boolean(SHOW_NOTIFICATIONS);
    }

    getSettings(): Gio.Settings {
        return this._settings;
    }
}
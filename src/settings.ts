const ExtensionUtils = imports.misc.extensionUtils;

interface Settings extends GObject.Object {
    get_boolean(key: string): boolean;
    set_boolean(key: string, value: boolean): void;

    get_uint(key: string): number;
    set_uint(key: string, value: number): void;

    get_string(key: string): string;
    set_string(key: string, value: string): void;

    bind(key: string, object: GObject.Object, property: string, flags: any): void
}

export const SCHEMA_ID = 'org.gnome.shell.extensions.gnome-clipboard';

export const HISTORY_SIZE = "history-size";
export const HISTORY_SORT = "history-sort";
export const CLIPBOARD_TIMER = "clipboard-timer";
export const TIMER_INTERVAL = "timer-interval";
export const SAVE_PINNED = "save-pinned";
export const SHOW_NOTIFICATIONS = "show-notifications";

export const HISTORY_SORT_MOST_USAGE = 0;
export const HISTORY_SORT_RECENT_USAGE = 1;
export const HISTORY_SORT_COPY_TIME = 2;
export class ExtensionSettings {
    private _settings: Settings = ExtensionUtils.getSettings(SCHEMA_ID);

    onChanged(callback: () => void) {
        this._settings.connect('changed',
            callback); //get notified on every schema change
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
}
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

export const HISTORY_SORT_MOST_USAGE = 0;
export const HISTORY_SORT_RECENT_USAGE = 1;
export const HISTORY_SORT_COPY_TIME = 2;
export class ExtensionSettings {
    settings: Settings = ExtensionUtils.getSettings(SCHEMA_ID);

    onChanged(callback: ()=>void) {
        this.settings.connect('changed',
            callback); //get notified on every schema change
    }

    historySize(): number {
        return this.settings.get_uint(HISTORY_SIZE);
    }

    historySort(): number {
        return this.settings.get_uint(HISTORY_SORT);
    }

    clipboardTimer(): boolean {
        return this.settings.get_boolean(CLIPBOARD_TIMER);
    }

    timerInterval(): number {
        return this.settings.get_uint(TIMER_INTERVAL);
    }
}
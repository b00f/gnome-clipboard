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

const HISTORY_SIZE = "history-size";
const CLIPBOARD_TIMER = "clipboard-timer";
const TIMER_INTERVAL = "timer-interval";

export class ExtensionSettings {
    settings: Settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.gnome-clipboard');

    cacheSize(): number {
        return this.settings.get_uint(HISTORY_SIZE);
    }

    clipboardTimer(): boolean {
        return this.settings.get_boolean(CLIPBOARD_TIMER);
    }

    timerInterval(): number {
        return this.settings.get_uint(TIMER_INTERVAL);
    }
}
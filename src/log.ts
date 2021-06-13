// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();
const ExtensionUtils = imports.misc.extensionUtils;

// simplified log4j levels
export enum LOG_LEVELS {
    OFF,
    ERROR,
    WARN,
    INFO,
    DEBUG
}

export function log_level() {
    let settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.gnome-clipboard');
    let log_level = settings.get_uint('log-level');

    return log_level;
}

export function log(text: string) {
    global.log(`${Me.metadata.name}: ${text}`);
}

export function error(text: string) {
    if (log_level() > LOG_LEVELS.OFF)
        log("[ERROR] " + text);
}

export function warn(text: string) {
    if (log_level() > LOG_LEVELS.ERROR)
        log(" [WARN] " + text);
}

export function info(text: string) {
    if (log_level() > LOG_LEVELS.WARN)
        log(" [INFO] " + text);
}

export function debug(text: string) {
    if (log_level() > LOG_LEVELS.INFO)
        log("[DEBUG] " + text);
}

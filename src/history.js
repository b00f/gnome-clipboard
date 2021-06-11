var Gio = imports.gi.Gio;
var cbItem = /** @class */ (function () {
    function cbItem() {
    }
    return cbItem;
}());
var cbHistory = /** @class */ (function () {
    function cbHistory() {
    }
    cbHistory.prototype.load = function (path) {
        var file = Gio.file_new_for_path(path);
    };
    return cbHistory;
}());

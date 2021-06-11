
class cbItem {
    value: BufferSource;
    short: string;
    pinned: boolean;
}

class cbHistory {
    items: Array<cbItem>

    load(path: string) {
        let file = Gio.file_new_for_path(path);


    }
}
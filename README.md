# Gnome Clipboard

A gnome shell extension to manage your **Gnome Clipboard**.

It allows you to pin clipboard items, select them or remove them from the history.

## Installation

To install the most recent official release: Visit Gnome Clipboard on the [Official GNOME Extensions](https://extensions.gnome.org/extension/4422/gnome-clipboard//) page.

### From source code

A `Makefile` is included. Then all you have to do is run the command below
```
git clone https://github.com/b00f/gnome-clipboard.git
cd gnome-clipboard
make install
```

If you are going to test your changes, run: `make test && make listen`.
It automatically installs the extension and restart the gnome-shell.

You can run `make test_wayland` to test this extension on [wayland](https://wayland.freedesktop.org/).

## How to contribute

If you are going to help me make this extension better, you are welcome!
To start, check the code; there are some `TODO` comments. You might be interested to work on them.

You can also [add new translation](https://wiki.gnome.org/Attic/GnomeShell/Extensions/Writing#Extension_Utils) by this command:
`msginit -i ./po/gnome-clipboard.pot -l <YOUR-LANG-ID>`.


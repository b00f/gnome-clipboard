# Gnome Clipboard

A gnome shell extension for managing clipboard content in [Gnome](https://www.gnome.org/).

It allows you to pin clipboard items, select them, or remove them from the history.

## Installation

To install the most recent release, visit Gnome Clipboard on the
[Official GNOME Extensions](https://extensions.gnome.org/extension/4422/gnome-clipboard//) page.

### From source code

Before compiling the code make sure you have installed [Typescript](https://www.typescriptlang.org/download).

A `Makefile` is included. To compile the code, run the following command:

```bash
git clone https://github.com/b00f/gnome-clipboard.git
cd gnome-clipboard
make install
```

If you want to test your changes, run: `make test && make listen`.
It will automatically install the extension and restart the gnome-shell.

You can run `make test_wayland` to test this extension on [wayland](https://wayland.freedesktop.org/).

## How to contribute

If you would like to help improve this extension, you are welcome to contribute!
To get started, review the code; there are some `TODO` comments that you might be interested in working on.

You can also [add new translation](https://wiki.gnome.org/Attic/GnomeShell/Extensions/Writing#Extension_Utils) using the following command:

```bash
msginit -i ./po/gnome-clipboard.pot -l <YOUR-LANG-ID>
````


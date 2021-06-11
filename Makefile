EXT_NAME = gnome-clipboard
UUID = $(EXT_NAME)@b00f.gitlab.com
BUNDLE = $(UUID).shell-extension.zip
POT_FILE = ./po/$(EXT_NAME).pot

all: pack

compile:
	@gulp compile

pack: compile
	@gnome-extensions pack --force --gettext-domain $(EXT_NAME) \
		--extra-source=history.js \
		--extra-source=scrollMenu.js \
		--extra-source=README.md \
		--extra-source=LICENSE

	@echo extension packed!

install: pack
	@gnome-extensions install $(BUNDLE) --force
	@echo extension installed!

test_wayland: install
	@dbus-run-session -- gnome-shell --nested --wayland

update-transaltions:
	@xgettext -L JavaScript --no-wrap --no-location --sort-output --from-code=UTF-8 -k_ -kN_ -o $(POT_FILE) *.js --package-name $(EXT_NAME)
	@for f in ./po/*.po ; do \
		msgmerge --no-location -N $$f $(POT_FILE) -o $$f ;\
	done

listen:
	journalctl -o cat -n 0 -f "$$(which gnome-shell)" | grep -v warning
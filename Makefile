EXT_NAME = gnome-clipboard
UUID = $(EXT_NAME)@b00f.github.com
BUNDLE = $(UUID).shell-extension.zip
POT_FILE = ./po/$(EXT_NAME).pot
SOURCES = src/*.ts src/*.css

all: depcheck pack

compile:
	sh scripts/transpile.sh

depcheck:
	@echo depcheck
	@if ! command -v tsc >/dev/null; then \
		echo \
		echo 'You must install TypeScript to transpile'; \
		exit 1; \
	fi

pack: compile
	@gnome-extensions pack --force --gettext-domain=$(EXT_NAME) dist \
		--extra-source=prefs.js \
		--extra-source=scrollMenu.js \
		--extra-source=historyMenu.js \
		--extra-source=confirmDialog.js \
		--extra-source=menuItem.js \
		--extra-source=cache.js \
		--extra-source=searchBox.js \
		--extra-source=actionBar.js \
		--extra-source=settings.js \
		--extra-source=log.js \
		--extra-source=utils.js \
		--extra-source=README.md \
		--extra-source=LICENSE

	@echo extension packed!

install: pack
	@gnome-extensions install $(BUNDLE) --force
	@echo extension installed!

enable:
	@gnome-extensions enable $(UUID)
	@echo extension enabled!

disable:
	@gnome-extensions disable $(UUID)
	@echo extension disbled!

update-transaltions:
	@xgettext -L JavaScript --no-wrap --no-location --sort-output --from-code=UTF-8 -k_ -kN_ -o $(POT_FILE) dist/*.js --package-name $(EXT_NAME)
	@for f in ./po/*.po ; do \
		msgmerge --no-location -N $$f $(POT_FILE) -o $$f ;\
	done

test_wayland: install
	@dbus-run-session -- gnome-shell --nested --wayland

test: depcheck compile install enable restart-shell

restart-shell:
	echo "Restart shell!"
	if bash -c 'xprop -root &> /dev/null'; then \
		busctl --user call org.gnome.Shell /org/gnome/Shell org.gnome.Shell Eval s 'Meta.restart("Restarting Gnome...")'; \
	else \
		gnome-session-quit --logout; \
	fi
	sleep 3

listen:
	journalctl -o cat -n 0 -f "$$(which gnome-shell)" | grep -v warning
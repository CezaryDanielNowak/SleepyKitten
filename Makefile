BRAND ?= syf
# ENV = local|dev|prod|staging
ENV ?= local
GULP := "./node_modules/.bin/gulp"
JEST := "./node_modules/.bin/jest"
PORT ?= 3002
VERSION ?=

.PHONY: start
start:
	$(GULP) watch --env=$(ENV) --brand=$(BRAND) --port=$(PORT)

.PHONY: build
build:
	$(GULP) build --env=$(ENV) --brand=$(BRAND) --version=$(VERSION)

.PHONY: server
server:
	$(GULP) server --env=$(ENV) --brand=$(BRAND) --port=$(PORT)

.PHONY: init-component
init-component:
	$(GULP) init-component

.PHONY: init-page
init-page:
	$(GULP) init-page

.PHONY: install
install: ## install dependencies with yarn
	# TODO: add system checks like node-version, global dependencies etc
	yarn install --no-lockfile --no-progress ${EXTRA_PARAMS}

.PHONY: reinstall
reinstall:
	rm yarn.lock || true
	rm -rf ./node_modules
	yarn install --no-lockfile ${EXTRA_PARAMS}

.PHONY: help
help: ## This help dialog.
	@IFS=$$'\n' ; \
	help_lines=(`fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//'`); \
	for help_line in $${help_lines[@]}; do \
	IFS=$$'#' ; \
		help_split=($$help_line) ; \
		help_command=`echo $${help_split[0]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
		help_info=`echo $${help_split[2]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
		printf "%-30s %s\n" $$help_command $$help_info ; \
	done

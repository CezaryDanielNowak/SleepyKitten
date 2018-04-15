EXTRA_PARAMS ?=
NEXT := "./node_modules/.bin/next"
PORT ?= 3001
JEST := "./node_modules/.bin/jest"

.PHONY: dev
dev:
	$(NEXT) ${EXTRA_PARAMS}

.PHONY: start
start:
	$(NEXT) start ${EXTRA_PARAMS}

.PHONY: build
build:
	$(NEXT) build ${EXTRA_PARAMS}

.PHONY: init-component
init-component:
	$(GULP) init-component

.PHONY: init-page
init-page:
	$(GULP) init-page

.PHONY: install
install:
	# TODO: add system checks like node-version, global dependencies etc
	yarn install --no-progress ${EXTRA_PARAMS}

.PHONY: reinstall
reinstall:
	rm -rf ./node_modules
	yarn install ${EXTRA_PARAMS}

.PHONY: test
test:
	$(JEST) -u $(TESTREGEX)

.PHONY: test-watch
test-watch:
	$(JEST) --watch --updateSnapshot

.PHONY: test-coverage
test-coverage:
	$(JEST) --coverage

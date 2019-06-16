env ?= development
flags ?=
output ?= html

export REMOVE_LOG

test:
	@NODE_ENV=$(env) node tests/*.test.js $(flags) 2>&1 | bin/cli $(flags)

run:
	@echo "NODE_ENV=$(env)"
	@make -s test
	@echo ""

ci:
	@make -s run
	@make -s run env=test
	@make -s run env=production

all:
	@make -s ci
	@make -s ci REMOVE_LOG=true
	@make -s ci flags=--iso
	@make -s ci flags=--full
	@make -s ci flags=--quiet
	@make -s ci flags=--no-color

check:
	@npm run coverage -- make -s all
	@npm run report -- -r $(output)

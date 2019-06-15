env ?= development
flags ?=
filter ?= .+?

export REMOVE_LOG

test:
	@NODE_ENV=$(env) node tests/*.test.js $(filter) --no-color 2>&1 | bin/cli --no-color $(flags)

run:
	@echo "NODE_ENV=$(env)"
	@make -s test
	@echo ""

ci:
	@make -s run
	@make -s run env=test
	@make -s run env=production

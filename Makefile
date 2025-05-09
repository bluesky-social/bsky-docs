
SHELL = /bin/bash
.SHELLFLAGS = -o pipefail -c

.PHONY: help
help: ## Print info about all commands
	@echo "Helper Commands:"
	@echo
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[01;32m%-20s\033[0m %s\n", $$1, $$2}'
	@echo
	@echo "NOTE: dependencies between commands are not automatic. Eg, you must run 'deps' and 'build' first, and after any changes"

.PHONY: build
build: ## Build the website, output in ./build/
	npm run build

.PHONY: test
test: ## Run all tests
	npx docusaurus-mdx-checker

#.PHONY: fmt
#fmt: ## Run syntax re-formatting
#	yarn prettier

#.PHONY: lint
#lint: ## Run style checks and verify syntax
#	yarn verify

.PHONY: nvm-setup
nvm-setup: ## Use NVM to install and activate node+npm
	nvm install 18
	nvm use 18

.PHONY: deps
deps: ## Installs dependent libs using 'npm install'
	npm install

.PHONY: update-lexicons
update-lexicons: ## Re-fetch Lexicons from github
	./atproto-openapi-types/scripts/get-lexicons.sh

.PHONY: update-openapi
update-openapi: ## Update the OpenAPI schema from local Lexicon files
	deno task run

.PHONY: update-mdx
update-mdx: ## Update the MDX files using OpenAPI schema
	npm run clear-and-gen-api-docs

.PHONY: run-dev
run-dev: ## Run local dev server: http://localhost:3000
	npm start

# Test Framework Template Makefile
#
# Usage:
#   make install TARGET=/path/to/your/project [NAME=project-name]
#   make install TARGET=/home/user/src/my-app NAME=my-app
#
# After installation, in your project:
#   cd cicd/tests && npm install
#   npm test                  # simple judge (default)
#   JUDGE_MODE=dual npm test  # opt in the agent judge

SHELL := /bin/bash
.PHONY: install help clean check check-install diagrams

# Default values
NAME ?= my-project
TARGET ?=

# Template source directory
TEMPLATE_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

help:
	@echo "Test Framework Template"
	@echo ""
	@echo "Usage:"
	@echo "  make install TARGET=/path/to/project [NAME=project-name]"
	@echo ""
	@echo "Examples:"
	@echo "  make install TARGET=/home/user/src/my-app NAME=my-app"
	@echo "  make install TARGET=../my-project NAME=my-project"
	@echo ""
	@echo "Maintainer:"
	@echo "  make check-install        # install into a temp dir and run it — proves the payload works"
	@echo ""
	@echo "Options:"
	@echo "  TARGET  - Required. Path to your project"
	@echo "  NAME    - Optional. Project name (default: my-project)"
	@echo ""
	@echo "After installation:"
	@echo "  cd <TARGET>/cicd/tests && npm install"
	@echo "  npm test                  # Run all tests (simple judge — fast, no model)"
	@echo "  JUDGE_MODE=dual npm test  # Opt in the agent judge (keyless)"
	@echo "  npm run list              # List available tests"

check:
ifndef TARGET
	$(error TARGET is required. Usage: make install TARGET=/path/to/project)
endif

install: check
	@echo "NOTE: Consider using agent-driven installation instead."
	@echo "  In your project, tell Claude Code:"
	@echo "    /install $(TEMPLATE_DIR)"
	@echo "  See README.md for details."
	@echo ""
	@echo "Installing test framework to: $(TARGET)"
	@echo "Project name: $(NAME)"
	@echo ""

	@# Create directories
	@mkdir -p "$(TARGET)/cicd/tests/src/judge"
	@mkdir -p "$(TARGET)/cicd/tests/src/reporter"
	@mkdir -p "$(TARGET)/cicd/tests/src/mcp/backends"
	@mkdir -p "$(TARGET)/cicd/tests/scripts"
	@mkdir -p "$(TARGET)/cicd/tests/testcases/build"
	@mkdir -p "$(TARGET)/cicd/tests/testcases/integration"
	@mkdir -p "$(TARGET)/cicd/tests/testcases/e2e"
	@mkdir -p "$(TARGET)/cicd/scripts"
	@mkdir -p "$(TARGET)/cicd/results"
	@mkdir -p "$(TARGET)/.github/workflows"

	@# Copy test framework source
	@cp "$(TEMPLATE_DIR)/cicd/tests/package.json" "$(TARGET)/cicd/tests/"
	@cp "$(TEMPLATE_DIR)/cicd/tests/tsconfig.json" "$(TARGET)/cicd/tests/"
	@cp "$(TEMPLATE_DIR)/cicd/tests/src/"*.ts "$(TARGET)/cicd/tests/src/"
	@cp "$(TEMPLATE_DIR)/cicd/tests/src/judge/"*.ts "$(TARGET)/cicd/tests/src/judge/"
	@cp "$(TEMPLATE_DIR)/cicd/tests/src/reporter/"*.ts "$(TARGET)/cicd/tests/src/reporter/"
	@# cli.ts imports src/mcp/ unconditionally — omitting it leaves a runner that
	@# dies on import, and scripts/ backs the check:* and mock-server npm scripts
	@cp "$(TEMPLATE_DIR)/cicd/tests/src/mcp/"*.ts "$(TARGET)/cicd/tests/src/mcp/"
	@cp "$(TEMPLATE_DIR)/cicd/tests/src/mcp/backends/"*.ts "$(TARGET)/cicd/tests/src/mcp/backends/"
	@cp "$(TEMPLATE_DIR)/cicd/tests/scripts/"*.ts "$(TARGET)/cicd/tests/scripts/"

	@# Copy example test cases — from templates/, not this repo's live suite
	@cp "$(TEMPLATE_DIR)/templates/testcases/build/"*.yml "$(TARGET)/cicd/tests/testcases/build/"
	@cp "$(TEMPLATE_DIR)/templates/testcases/integration/"*.yml "$(TARGET)/cicd/tests/testcases/integration/"
	@cp "$(TEMPLATE_DIR)/templates/testcases/e2e/"*.yml "$(TARGET)/cicd/tests/testcases/e2e/"

	@# Copy scripts
	@cp "$(TEMPLATE_DIR)/cicd/scripts/format-results.sh" "$(TARGET)/cicd/scripts/"
	@chmod +x "$(TARGET)/cicd/scripts/format-results.sh"

	@# Copy GitHub workflows — except the ones that test this repo's own installer,
	@# which have no meaning in a target that has no Makefile install
	@for f in "$(TEMPLATE_DIR)/.github/workflows/"*.yml; do \
		case "$$(basename "$$f")" in install-check.yml) continue;; esac; \
		cp "$$f" "$(TARGET)/.github/workflows/" 2>/dev/null || true; \
	done

	@# Copy the adopting project's CLAUDE.md — templates/, not this repo's own
	@if [ -f "$(TEMPLATE_DIR)/templates/CLAUDE.md" ]; then cp "$(TEMPLATE_DIR)/templates/CLAUDE.md" "$(TARGET)/CLAUDE.md"; fi

	@# Copy Claude skills if they exist
	@if [ -d "$(TEMPLATE_DIR)/.claude/skills" ]; then \
		mkdir -p "$(TARGET)/.claude/skills"; \
		cp -r "$(TEMPLATE_DIR)/.claude/skills/"* "$(TARGET)/.claude/skills/" 2>/dev/null || true; \
	fi

	@# Copy Claude rules if they exist
	@if [ -d "$(TEMPLATE_DIR)/.claude/rules" ]; then \
		mkdir -p "$(TARGET)/.claude/rules"; \
		cp "$(TEMPLATE_DIR)/.claude/rules/"*.md "$(TARGET)/.claude/rules/" 2>/dev/null || true; \
	fi

	@# Create .gitignore for results
	@echo "*" > "$(TARGET)/cicd/results/.gitignore"
	@echo "!.gitignore" >> "$(TARGET)/cicd/results/.gitignore"

	@# Update project name in config
	@sed -i "s/projectName: 'my-project'/projectName: '$(NAME)'/g" "$(TARGET)/cicd/tests/src/config.ts"
	@sed -i "s/sessionPrefix: 'test-session'/sessionPrefix: '$(NAME)-session'/g" "$(TARGET)/cicd/tests/src/config.ts"

	@echo ""
	@echo "========================================"
	@echo "Installation complete!"
	@echo "========================================"
	@echo ""
	@echo "Next steps:"
	@echo "  cd $(TARGET)/cicd/tests"
	@echo "  npm install"
	@echo ""
	@echo "Configure the judge (optional):"
	@echo "  Edit $(TARGET)/cicd/tests/src/config.ts"
	@echo "  Set judge.agent to swap the ACP agent (default: bundled Claude, keyless)"
	@echo ""
	@echo "Run tests:"
	@echo "  npm test                  # All tests (simple judge — fast, no model)"
	@echo "  JUDGE_MODE=dual npm test  # Opt in the agent judge (keyless)"
	@echo "  npm run list              # List available tests"
	@echo ""

check-install:
	@# Proves an install RUNS, rather than proving it was produced. Installs into a
	@# throwaway dir, checks every npm script's file arrived, then executes the CLI.
	@set -e; \
	tmp=$$(mktemp -d); \
	trap 'rm -rf "$$tmp"' EXIT; \
	echo "Installing into $$tmp"; \
	$(MAKE) --no-print-directory install TARGET="$$tmp" NAME=check-install >/dev/null; \
	cd "$$tmp/cicd/tests"; \
	echo ""; \
	echo "1/2 npm scripts reference files the installer copied"; \
	missing=$$(grep -oE '(src|scripts)/[A-Za-z0-9_./-]+\.ts' package.json | sort -u \
		| while read -r f; do [ -f "$$f" ] || echo "  $$f"; done); \
	if [ -n "$$missing" ]; then \
		echo "FAIL — npm scripts point at files that were not installed:"; \
		echo "$$missing"; \
		exit 1; \
	fi; \
	echo "    ok"; \
	echo "2/2 the installed runner executes"; \
	npm install --silent --no-audit --no-fund; \
	npx tsx src/cli.ts list; \
	echo ""; \
	echo "check-install passed"

diagrams:
	@docs/diagrams/render.sh

clean:
ifndef TARGET
	$(error TARGET is required. Usage: make clean TARGET=/path/to/project)
endif
	@echo "Removing test framework from: $(TARGET)"
	@rm -rf "$(TARGET)/cicd"
	@rm -f "$(TARGET)/.github/workflows/test-pipeline.yml"
	@rm -f "$(TARGET)/.github/workflows/test-suite.yml"
	@rm -f "$(TARGET)/.github/workflows/build.yml"
	@rm -f "$(TARGET)/.github/workflows/test-run.yml"
	@rm -f "$(TARGET)/.github/workflows/test-feature-example.yml"
	@rm -f "$(TARGET)/.github/workflows/ci.yml"
	@echo "Done."

.PHONY: help propose

help:
	@echo "Available commands:"
	@echo "  propose   - Lints, formats, commits, and pushes your changes for a new PR."
	@echo "            Usage: make propose m=\"feat: your new feature\""

propose:
	@if [ -z "$(m)" ]; then echo "❌ Commit message is required. Usage: make propose m=\\\"your commit message\\\""; exit 1; fi
	@bash scripts/propose-changes.sh "$(m)"
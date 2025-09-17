# Makefile for EcoVibe project
#
# This Makefile provides commands for common development tasks.
#
# --- Operating System Compatibility ---
#
# - macOS: Fully compatible.
# - Linux: Fully compatible.
# - WSL (Windows Subsystem for Linux): Fully compatible.
# - Windows (without WSL): Requires a bash-like environment (e.g., Git Bash) for the 'propose' command.
#   The 'help' command will work in the standard Windows Command Prompt or PowerShell.
#
# --- Usage ---
#
# To use this Makefile, open your terminal and run the desired command.
# Example:
#   make help
#   make propose m="feat: add new feature"
#
.PHONY: help propose

help:
	@echo "Available commands:"
	@echo "  propose   - Lints, formats, commits, and pushes your changes for a new PR."
	@echo "            Usage: make propose m=\"feat: your new feature\""

propose:
	@if [ -z "$(m)" ]; then echo "❌ Commit message is required. Usage: make propose m=\"your commit message\""; exit 1; fi
	@bash scripts/propose-changes.sh "$(m)"

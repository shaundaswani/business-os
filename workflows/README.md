# Workflows

This directory contains **Markdown SOPs** (Standard Operating Procedures) for the Business OS WAT framework.

## What is WAT?

- **Workflows** (this directory) — Define *what* to do and *how*. Written in Markdown. Read by AI agents before executing any operation.
- **Agents** (Claude Code) — Read workflows, make decisions, orchestrate tools.
- **Tools** (`../tools/`) — Python scripts for deterministic execution. The agent calls these; it does not handle data directly.

## How to Use

1. Before executing any task in a module, read the relevant workflow first.
2. If you discover a better method, rate limit, or edge case — **update the workflow**.
3. Never modify data directly from the AI layer — always call a tool from `../tools/`.

## Workflow Index

| File | Module | Purpose |
|------|--------|---------|
| `trading/signal_processing.md` | Trading | TradingView webhook → signal → trade state machine |

## Adding a New Workflow

Create a Markdown file with:
1. **Purpose** — what this workflow does
2. **Inputs** — what data/params are expected
3. **Steps** — numbered sequence of actions
4. **Edge Cases** — known failure modes and how to handle them
5. **Tools Called** — which scripts in `../tools/` are invoked

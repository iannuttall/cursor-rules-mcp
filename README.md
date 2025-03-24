# Playbooks Rules

A Model Context Protocol (MCP) server for interacting with Playbooks Rules API.

## Features

- List available rules
- Search for rules by query
- Get details for a specific rule

## Installation

```bash
npm install -g playbooks-rules
```

## Usage

```bash
playbooks-rules
```

## API Requirements

This MCP server expects a Rules API to be running at `https://playbooks.com/api/v1/rules`.

## Available Tools

The MCP server exposes the following tools:

### listRules

Lists all available rules from the API.

```javascript
// No parameters required
```

### searchRules

Searches for rules that match a query.

```javascript
{
  query: "your search query"
}
```

### getRule

Fetches a specific rule by slug or URL.

```javascript
{
  slug: "rule-slug-or-url"
}
```

## License

MIT 
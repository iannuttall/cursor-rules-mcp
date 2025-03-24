#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fetch } from "undici";
import { join } from "path";

// Define rule interface
interface Rule {
  title?: string;
  content: string;
  [key: string]: any;
}

// Create a new MCP server
const server = new McpServer({
  name: "Cursor Rules MCP",
  version: "0.0.1",
});

// List rules
server.tool(
  "listCursorRules",
  {},
  async () => {
    try {
      const response = await fetch('https://playbooks.com/api/v1/rules');
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error listing rules: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

// Search rules
server.tool(
  "searchCursorRules",
  {
    query: z.string().describe("The search query to find matching Cursor rules"),
  },
  async ({ query }: { query: string }) => {
    try {
      const searchUrl = `https://playbooks.com/api/v1/rules/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching rules: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

// Get a specific rule
server.tool(
  "getCursorRule",
  {
    slug: z.string().describe("The rule slug to get the specific Cursor rule"),
  },
  async ({ slug }: { slug: string }) => {
    try {
      // Extract slug if it's a URL
      if (slug.startsWith('http://') || slug.startsWith('https://')) {
        const urlParts = slug.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        if (lastPart) {
          slug = lastPart;
        }
      }
      
      const response = await fetch(`https://playbooks.com/api/v1/rules/${encodeURIComponent(slug)}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const rule = (data as any).data || data as Rule;
      
      if (!rule) {
        throw new Error(`No rule found with slug: ${slug}`);
      }
      
      // Prepare the file content for Cursor format
      const cursorContent = `---
description: ${rule.title || slug}
globs: ${rule.glob || ''}
alwaysApply: false
---
${rule.content.trim()}`;
      
      // Create the result object with filepath as key and content as value
      const result = {
        [`.cursor/rules/${slug}.mdc`]: cursorContent
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching rule: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

// Connect the server to the stdio transport
const transport = new StdioServerTransport();
await server.connect(transport); 
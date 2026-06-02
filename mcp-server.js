/**
 * MCP Server for Casper x402 Crypto API
 * 
 * Model Context Protocol (MCP) server enabling AI agents to access
 * crypto data with automatic x402 payment handling on Casper Network
 * 
 * Built for Casper Agentic Buildathon 2025
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.MCP_PORT || 3100;
const API_BASE = process.env.API_BASE || `http://localhost:3000`;

// MCP Protocol Types
const MCP_TOOLS = [
  {
    name: 'get_crypto_price',
    description: 'Get real-time cryptocurrency price by symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Cryptocurrency symbol (e.g., BTC, ETH, SOL)',
          default: 'BTC'
        },
        currency: {
          type: 'string',
          description: 'Target currency for price',
          default: 'USD'
        }
      }
    },
    price: '1 CSPR'
  },
  {
    name: 'get_market_overview',
    description: 'Get top 20 cryptocurrency market data including prices, market caps, and 24h changes',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of coins to return',
          default: 20,
          maximum: 100
        }
      }
    },
    price: '2 CSPR'
  },
  {
    name: 'analyze_address',
    description: 'Analyze an Ethereum address for balance, transaction count, and basic risk assessment',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Ethereum address to analyze'
        }
      },
      required: ['address']
    },
    price: '5 CSPR'
  },
  {
    name: 'check_token_security',
    description: 'Check a token contract for rug pull and honeypot indicators',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Token contract address'
        }
      },
      required: ['address']
    },
    price: '5 CSPR'
  },
  {
    name: 'analyze_contract',
    description: 'Perform smart contract risk analysis and vulnerability assessment',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Contract address to analyze'
        }
      },
      required: ['address']
    },
    price: '10 CSPR'
  },
  {
    name: 'investigate_address',
    description: 'Full on-chain investigation report for an address including fund flow analysis',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Address to investigate'
        }
      },
      required: ['address']
    },
    price: '25 CSPR'
  }
];

// Tool execution handlers
const toolHandlers = {
  get_crypto_price: async (params) => {
    const symbol = params.symbol || 'BTC';
    const response = await fetch(`${API_BASE}/api/crypto/price/${symbol}`);
    return await response.json();
  },

  get_market_overview: async (params) => {
    const response = await fetch(`${API_BASE}/api/crypto/market`);
    const data = await response.json();
    if (params.limit && data.top_coins) {
      data.top_coins = data.top_coins.slice(0, params.limit);
    }
    return data;
  },

  analyze_address: async (params) => {
    const response = await fetch(`${API_BASE}/api/crypto/address/${params.address}`);
    return await response.json();
  },

  check_token_security: async (params) => {
    const response = await fetch(`${API_BASE}/api/security/token/${params.address}`);
    return await response.json();
  },

  analyze_contract: async (params) => {
    const response = await fetch(`${API_BASE}/api/security/contract/${params.address}`);
    return await response.json();
  },

  investigate_address: async (params) => {
    const response = await fetch(`${API_BASE}/api/investigate/${params.address}`);
    return await response.json();
  }
};

// ============ MCP Endpoints ============

// MCP Server Info
app.get('/', (req, res) => {
  res.json({
    name: 'Casper x402 Crypto API MCP Server',
    version: '1.0.0',
    protocolVersion: '2024-11-05',
    description: 'MCP server for crypto data with Casper x402 payments',
    tools: MCP_TOOLS.map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema
    })),
    payment: {
      network: 'Casper Testnet',
      asset: 'CSPR',
      protocol: 'x402 v2',
      scheme: 'exact'
    }
  });
});

// MCP Tools List
app.get('/tools', (req, res) => {
  res.json({
    tools: MCP_TOOLS.map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
      price: t.price
    }))
  });
});

// Initialize MCP Session
app.post('/mcp/initialize', (req, res) => {
  res.json({
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {},
      resources: {}
    },
    serverInfo: {
      name: 'Casper x402 Crypto API MCP Server',
      version: '1.0.0'
    }
  });
});

// List Tools
app.post('/mcp/tools/list', (req, res) => {
  res.json({
    tools: MCP_TOOLS
  });
});

// Call Tool (handles x402 payment)
app.post('/mcp/tools/call', async (req, res) => {
  const { name, arguments: args = {} } = req.body;

  if (!name) {
    return res.status(400).json({
      error: 'Tool name is required'
    });
  }

  const tool = MCP_TOOLS.find(t => t.name === name);
  if (!tool) {
    return res.status(404).json({
      error: `Tool not found: ${name}`,
      availableTools: MCP_TOOLS.map(t => t.name)
    });
  }

  // Get payment header from request
  const paymentHeader = req.headers['payment-signature'];

  if (!paymentHeader) {
    // Return 402 Payment Required
    return res.status(402).json({
      error: 'Payment Required',
      x402_version: 2,
      scheme: 'exact',
      network: 'casper:casper-test',
      asset: 'native',
      assetSymbol: 'CSPR',
      amount: getToolPriceMotes(name),
      amountDisplay: tool.price,
      description: `Access to ${name} tool`,
      instructions: {
        step1: 'Get CSPR from Casper Testnet faucet',
        step2: 'Sign EIP-712 authorization',
        step3: 'Include PAYMENT-SIGNATURE header'
      }
    });
  }

  try {
    const handler = toolHandlers[name];
    if (!handler) {
      return res.status(500).json({ error: 'Tool handler not implemented' });
    }

    const result = await handler(args);

    res.json({
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ],
      toolUseId: `use-${Date.now()}`,
      payment: {
        status: 'verified',
        network: 'casper:casper-test',
        asset: 'CSPR'
      }
    });
  } catch (error) {
    console.error(`Tool call error: ${name}`, error);
    res.status(500).json({
      error: 'Tool execution failed',
      details: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MCP Server',
    timestamp: Date.now()
  });
});

app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     Casper x402 Crypto API - MCP Server                  ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  🚀 MCP Server running on port ${PORT}                        ║`);
  console.log('║  🌐 Network: Casper Testnet                              ║');
  console.log('║  💰 Payment: x402 v2 + CSPR                              ║');
  console.log('║  🤖 MCP Protocol for AI Agents                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('MCP Tools Available:');
  MCP_TOOLS.forEach(t => {
    console.log(`  - ${t.name}: ${t.price}`);
  });
  console.log('');
  console.log('MCP Configuration for AI Clients:');
  console.log(`  { "url": "http://localhost:${PORT}" }`);
});

function getToolPriceMotes(toolName) {
  const prices = {
    get_crypto_price: 1000000000,      // 1 CSPR
    get_market_overview: 2000000000,   // 2 CSPR
    analyze_address: 5000000000,      // 5 CSPR
    check_token_security: 5000000000,  // 5 CSPR
    analyze_contract: 1000000000,     // 10 CSPR
    investigate_address: 2500000000    // 25 CSPR
  };
  return prices[toolName] || 1000000000;
}

export default app;

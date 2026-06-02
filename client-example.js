/**
 * Casper x402 Payment Client Example
 * 
 * Demonstrates how to sign and send x402 payments on Casper Network
 * for the x402-Crypto-API-Casper endpoints
 * 
 * Built for Casper Agentic Buildathon 2025
 */

import fetch from 'node-fetch';

// Configuration
const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const CASPER_FACILITATOR_URL = process.env.CASPER_FACILITATOR_URL || 'http://localhost:4022';

// Mock signer for demo (in production, use actual Casper SDK)
class CasperSigner {
  constructor(privateKey) {
    this.privateKey = privateKey;
    this.publicKey = this.derivePublicKey();
    this.address = this.deriveAddress();
  }

  derivePublicKey() {
    // In production: derive from actual private key using Casper SDK
    return '01' + 'a'.repeat(64); // Mock ED25519 public key
  }

  deriveAddress() {
    // In production: derive account hash from public key
    return '01' + 'b'.repeat(64); // Mock Casper account address
  }

  async signEIP712(digest) {
    // In production: sign with actual Casper EIP-712 implementation
    // Using Casper Go SDK or similar
    return '02' + 'c'.repeat(64) + '01'; // Mock 65-byte signature
  }

  generateNonce() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Create payment payload for Casper x402
async function createPaymentPayload(signer, amount, payeeAddress, chainId = 'casper:casper-test') {
  const now = Math.floor(Date.now() / 1000);
  
  const authorization = {
    from: signer.address,
    to: payeeAddress,
    value: amount.toString(),
    validAfter: (now - 600).toString(), // 10 min ago
    validBefore: (now + 900).toString(), // 15 min from now
    nonce: signer.generateNonce()
  };

  // In production: create proper EIP-712 digest using casper-eip-712 types
  const digest = new Uint8Array(32);
  crypto.getRandomValues(digest);
  
  const signature = await signer.signEIP712(digest);

  return {
    x402Version: 2,
    scheme: 'exact',
    network: chainId,
    payload: {
      signature: signature,
      publicKey: signer.publicKey,
      authorization: authorization
    }
  };
}

// Make a paid API request
async function paidRequest(endpoint, signer, payeeAddress) {
  console.log(`\n📡 Requesting: ${endpoint}`);

  // First request - will return 402 with payment requirements
  const firstResponse = await fetch(`${API_BASE}${endpoint}`);
  
  if (firstResponse.status !== 402) {
    if (firstResponse.ok) {
      const data = await firstResponse.json();
      console.log('✅ Response (free or already paid):', data);
      return data;
    }
    throw new Error(`Unexpected status: ${firstResponse.status}`);
  }

  // Parse payment requirements
  const requirements = await firstResponse.json();
  console.log('💰 Payment Required:', requirements.amountDisplay || requirements.amount);
  
  const amount = BigInt(requirements.payment_requirements?.amount || requirements.amount);

  // Create and sign payment
  console.log('🔐 Signing payment...');
  const paymentPayload = await createPaymentPayload(signer, amount, payeeAddress);
  
  // Build PAYMENT-SIGNATURE header
  const { authorization } = paymentPayload.payload;
  const headerValue = [
    'casper',
    authorization.from,
    authorization.value,
    paymentPayload.payload.signature
  ].join(':');

  // Retry with payment
  console.log('📤 Retrying with payment...');
  const secondResponse = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'PAYMENT-SIGNATURE': headerValue,
      'Content-Type': 'application/json'
    }
  });

  if (secondResponse.status === 402) {
    const error = await secondResponse.json();
    console.error('❌ Payment failed:', error);
    throw new Error(`Payment failed: ${error.reason || error.error}`);
  }

  const data = await secondResponse.json();
  console.log('✅ Response:', data);
  return data;
}

// Demo usage
async function demo() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     Casper x402 Crypto API - Client Demo                 ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\nAPI Base: ${API_BASE}`);

  // Initialize signer (in production, load real keys)
  const signer = new CasperSigner('mock-private-key');
  console.log(`\nSigner Address: ${signer.address.slice(0, 20)}...`);

  // Get payee address from API status
  console.log('\n📋 Getting API status...');
  try {
    const statusRes = await fetch(`${API_BASE}/api/status`);
    const status = await statusRes.json();
    console.log('API Status:', {
      service: status.service,
      network: status.network,
      facilitator: status.facilitator
    });

    const payeeAddress = status.payee || signer.address;
    console.log(`Payee Address: ${payeeAddress.slice(0, 20)}...`);

    // Test endpoints
    console.log('\n\n🧪 Testing Paid Endpoints...\n');

    // 1. Crypto Price
    await paidRequest('/api/crypto/price/BTC', signer, payeeAddress);

    // 2. Market Overview
    await paidRequest('/api/crypto/market', signer, payeeAddress);

    // 3. Address Analysis
    await paidRequest('/api/crypto/address/0x742d35Cc6634C0532925a3b844Bc9e7595f123f9', signer, payeeAddress);

    // 4. Token Security
    await paidRequest('/api/security/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', signer, payeeAddress);

    console.log('\n\n✅ All demos completed!');

  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    console.log('\n💡 Make sure the API server is running:');
    console.log('   npm start');
  }
}

// MCP Client Example
async function mcpDemo() {
  console.log('\n\n🤖 MCP Server Demo\n');

  const mcpUrl = process.env.MCP_URL || 'http://localhost:3100';

  // List available tools
  console.log('📋 Listing MCP tools...');
  const toolsRes = await fetch(`${mcpUrl}/tools`);
  const tools = await toolsRes.json();
  
  console.log('Available Tools:');
  tools.tools?.forEach(t => {
    console.log(`  - ${t.name}: ${t.price}`);
  });

  // Call a tool
  console.log('\n🔧 Calling get_crypto_price...');
  const callRes = await fetch(`${mcpUrl}/mcp/tools/call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'get_crypto_price',
      arguments: { symbol: 'ETH' }
    })
  });

  if (callRes.status === 402) {
    const req = await callRes.json();
    console.log('💰 MCP Payment Required:', req.amountDisplay);
    console.log('   (Include PAYMENT-SIGNATURE header to complete)');
  } else {
    const result = await callRes.json();
    console.log('✅ MCP Response:', result);
  }
}

// Run demo
demo().then(() => mcpDemo()).catch(console.error);

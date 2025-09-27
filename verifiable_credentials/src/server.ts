import express from 'express';
import { initializeAgent, getAgent } from './veramo/setup.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize the agent
let agent: any = null;

// Middleware
app.use(express.json());

// Initialize agent middleware
app.use(async (req, res, next) => {
  if (!agent) {
    try {
      agent = await initializeAgent();
    } catch (error) {
      console.error('Failed to initialize agent:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to initialize credential agent'
      });
    }
  }
  next();
});

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Verifiable Credentials Server is running' });
});

// Issue Credential endpoint
app.post('/issue-credential', async (req, res) => {
  try {
    const { credentialSubject, issuerAlias, proofFormat = 'jwt' } = req.body;

    // Validate required fields
    if (!credentialSubject) {
      return res.status(400).json({
        success: false,
        error: 'credentialSubject is required'
      });
    }

    if (!issuerAlias) {
      return res.status(400).json({
        success: false,
        error: 'issuerAlias is required'
      });
    }

    // Get or create issuer identifier
    let identifier;
    try {
      identifier = await agent.didManagerGetByAlias({ alias: issuerAlias });
    } catch (error) {
      // If identifier doesn't exist, create it
      identifier = await agent.didManagerCreate({ alias: issuerAlias });
    }

    // Create verifiable credential
    const verifiableCredential = await agent.createVerifiableCredential({
      credential: {
        issuer: { id: identifier.did },
        credentialSubject: {
          id: credentialSubject.id || `did:ens:${issuerAlias}.eth`,
          ...credentialSubject
        },
      },
      proofFormat: proofFormat as 'jwt' | 'lds',
    });

    res.json({
      success: true,
      credential: verifiableCredential,
      issuer: {
        did: identifier.did,
        alias: identifier.alias
      }
    });

  } catch (error) {
    console.error('Error issuing credential:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to issue credential',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Verify Credential endpoint
app.post('/verify-credential', async (req, res) => {
  try {
    const { credential } = req.body;

    console.log(credential)
    console.log(typeof credential)

    // Validate required fields
    if (!credential) {
      return res.status(400).json({
        success: false,
        error: 'credential is required'
      });
    }

    // Verify the credential
    const result = await agent.verifyCredential({
      credential: credential
    });

    res.json({
      success: true,
      verified: result.verified,
      result: result
    });

  } catch (error) {
    console.error('Error verifying credential:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify credential',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// List identifiers endpoint (useful for debugging)
app.get('/identifiers', async (req, res) => {
  try {
    const identifiers = await agent.didManagerFind();
    res.json({
      success: true,
      identifiers: identifiers
    });
  } catch (error) {
    console.error('Error listing identifiers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list identifiers',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'POST /issue-credential',
      'POST /verify-credential',
      'GET /identifiers'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Verifiable Credentials Server running on port ${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /issue-credential - Issue a new credential`);
  console.log(`   POST /verify-credential - Verify a credential`);
  console.log(`   GET  /identifiers - List all identifiers`);
});

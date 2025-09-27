# Verifiable Credentials Server API

This server provides endpoints for issuing and verifying verifiable credentials using Veramo.

## Endpoints

### 1. Health Check
**GET** `/health`

Returns server status.

**Response:**
```json
{
  "status": "OK",
  "message": "Verifiable Credentials Server is running"
}
```

### 2. Issue Credential
**POST** `/issue-credential`

Issues a new verifiable credential.

**Request Body:**
```json
{
  "credentialSubject": {
    "id": "did:ens:user123.eth",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "verified": true
  },
  "issuerAlias": "issuer-org-001",
  "proofFormat": "jwt"
}
```

**Response:**
```json
{
  "success": true,
  "credential": {
    "credentialSubject": {
      "id": "did:ens:user123.eth",
      "name": "John Doe",
      "email": "john@example.com",
      "age": 25,
      "verified": true
    },
    "issuer": {
      "id": "did:ethr:0x..."
    },
    "type": ["VerifiableCredential"],
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "issuanceDate": "2024-01-15T10:30:00.000Z",
    "proof": {
      "type": "JwtProof2020",
      "jwt": "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ..."
    }
  },
  "issuer": {
    "did": "did:ethr:0x...",
    "alias": "issuer-org-001"
  }
}
```

### 3. Verify Credential
**POST** `/verify-credential`

Verifies a verifiable credential.

**Request Body:**
```json
{
  "credential": {
    "credentialSubject": {
      "id": "did:ens:user123.eth",
      "name": "John Doe",
      "email": "john@example.com",
      "age": 25,
      "verified": true
    },
    "issuer": {
      "id": "did:ethr:0x..."
    },
    "type": ["VerifiableCredential"],
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "issuanceDate": "2024-01-15T10:30:00.000Z",
    "proof": {
      "type": "JwtProof2020",
      "jwt": "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ..."
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "result": {
    "verified": true,
    "proof": {
      "type": "JwtProof2020",
      "verificationMethod": "did:ethr:0x...#controller",
      "jwt": "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ..."
    }
  }
}
```

### 4. List Identifiers
**GET** `/identifiers`

Lists all available issuer identifiers.

**Response:**
```json
{
  "success": true,
  "identifiers": [
    {
      "did": "did:ethr:0x...",
      "alias": "issuer-org-001",
      "provider": "did:ens"
    }
  ]
}
```

## Usage Examples

### Using curl

**Issue a credential:**
```bash
curl -X POST http://localhost:3000/issue-credential \
  -H "Content-Type: application/json" \
  -d '{
    "credentialSubject": {
      "id": "did:ens:user123.eth",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "issuerAlias": "my-issuer"
  }'
```

**Verify a credential:**
```bash
curl -X POST http://localhost:3000/verify-credential \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "credentialSubject": {
        "id": "did:ens:user123.eth",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "issuer": {
        "id": "did:ethr:0x..."
      },
      "type": ["VerifiableCredential"],
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "issuanceDate": "2024-01-15T10:30:00.000Z",
      "proof": {
        "type": "JwtProof2020",
        "jwt": "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ..."
      }
    }
  }'
```

### Using JavaScript/TypeScript

```javascript
// Issue a credential
const issueCredential = async (credentialData) => {
  const response = await fetch('http://localhost:3000/issue-credential', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      credentialSubject: credentialData,
      issuerAlias: 'my-issuer'
    })
  });
  
  return await response.json();
};

// Verify a credential
const verifyCredential = async (credential) => {
  const response = await fetch('http://localhost:3000/verify-credential', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ credential })
  });
  
  return await response.json();
};
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error details"
}
```

Common HTTP status codes:
- `400` - Bad Request (missing required fields)
- `500` - Internal Server Error (server-side issues)
- `404` - Not Found (invalid endpoint)



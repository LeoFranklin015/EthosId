import { agent } from './veramo/setup.js'

async function main() {
  const result = await agent.verifyCredential({
    credential: {
      "credentialSubject": {
        "you": "Rock",
        "id": "did:ens:justverified.eth#0x0f986674fa6b1Ed1786A8cB1112898F3d40e25Fc"
      },
      "issuer": {
        "id": "did:ethr:0x022b9e36d62bc13510401fb165e10b97722018a83a9f7eb2916181f6abd12e3bb6"
      },
      "type": [
        "VerifiableCredential"
      ],
      "@context": [
        "https://www.w3.org/2018/credentials/v1"
      ],
      "issuanceDate": "2025-09-27T16:54:55.000Z",
      "proof": {
        "type": "JwtProof2020",
        "jwt": "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7InlvdSI6IlJvY2sifX0sInN1YiI6ImRpZDplbnM6anVzdHZlcmlmaWVkLmV0aCMweDBmOTg2Njc0ZmE2YjFFZDE3ODZBOGNCMTExMjg5OEYzZDQwZTI1RmMiLCJuYmYiOjE3NTg5OTIwOTUsImlzcyI6ImRpZDpldGhyOjB4MDIyYjllMzZkNjJiYzEzNTEwNDAxZmIxNjVlMTBiOTc3MjIwMThhODNhOWY3ZWIyOTE2MTgxZjZhYmQxMmUzYmI2In0.tmzeXweUSmPYbBoOKlNcuDiSahapRMyxnf__IAU0OJKIR3qzW59pl9ET35HkH3GbNEpi1XCbJwDGANihcPsdow"
      }
    }
  })
  console.log(`Credential verified`, result)
}

main().catch(console.log)
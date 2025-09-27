import { agent } from './veramo/setup.js'

async function main() {
  const identifier = await agent.didManagerGetByAlias({ alias: 'test-1234f1' })

  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: identifier.did },
      credentialSubject: {
        id: 'did:ens:justverified.eth#0x0f986674fa6b1Ed1786A8cB1112898F3d40e25Fc',
        you: 'Rock',
      },
    },
    proofFormat: 'jwt',
  })
  console.log(`New credential created`)
  console.log(JSON.stringify(verifiableCredential, null, 2))
}

main().catch(console.log)
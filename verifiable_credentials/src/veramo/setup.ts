// Core interfaces
import { createAgent, IDIDManager, IResolver, IDataStore, IKeyManager, ICredentialPlugin } from '@veramo/core'

// Core identity manager plugin
import { DIDManager } from '@veramo/did-manager'

// Ethr did identity provider
import { EthrDIDProvider } from '@veramo/did-provider-ethr'

// Core key manager plugin
import { KeyManager } from '@veramo/key-manager'

// Custom key management system for RN
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'

// W3C Verifiable Credential plugin
import { CredentialPlugin } from '@veramo/credential-w3c'

// Custom resolvers
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'

// Storage plugin using TypeOrm
import { Entities, KeyStore, DIDStore, IDataStoreORM, PrivateKeyStore, migrations } from '@veramo/data-store'

// TypeORM is installed with `@veramo/data-store`
import { DataSource } from 'typeorm'

// This will be the name for the local sqlite database for demo purposes
const DATABASE_FILE = 'database.sqlite'

// You will need to get a project ID from infura https://www.infura.io
const INFURA_PROJECT_ID = 'e3e1c42c729045a99f976837920df2bd'

// This will be the secret key for the KMS
const KMS_SECRET_KEY =
  '81946f9f33086c9dc24f8ee285e0abeb4277e360a225eef6aa1c14e1ab871224'

let agent: any = null;

async function initializeAgent() {
  if (agent) return agent;

  const dbConnection = await new DataSource({
    type: 'sqlite',
    database: DATABASE_FILE,
    synchronize: false,
    migrations,
    migrationsRun: true,
    logging: ['error', 'info', 'warn'],
    entities: Entities,
  }).initialize()

  agent = createAgent<IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver & ICredentialPlugin>({
    plugins: [
      new KeyManager({
        store: new KeyStore(dbConnection),
        kms: {
          local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY))),
        },
      }),
      new DIDManager({
        store: new DIDStore(dbConnection),
        defaultProvider: 'did:ens',
        providers: {
          'did:ens': new EthrDIDProvider({
            defaultKms: 'local',
            network: 'sepolia',
            rpcUrl: 'https://sepolia.infura.io/v3/' + INFURA_PROJECT_ID,
          }),
        },
      }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...ethrDidResolver({
              infuraProjectId: INFURA_PROJECT_ID,
              networks: [
                {
                  name: 'sepolia',
                  rpcUrl: 'https://sepolia.infura.io/v3/' + INFURA_PROJECT_ID,
                },
                {
                  name: 'mainnet',
                  rpcUrl: 'https://mainnet.infura.io/v3/' + INFURA_PROJECT_ID,
                }
              ]
            }),
          }),
        }),
      new CredentialPlugin(),
    ],
  })

  return agent;
}

export { initializeAgent };
export const getAgent = () => agent;

// For backward compatibility with existing scripts
export { agent };
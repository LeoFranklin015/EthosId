import { GraphQLClient } from 'graphql-request';

// ENS Subgraph endpoint
const ENS_SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/49574/enssepolia/version/latest';

// Create GraphQL client
export const graphqlClient = new GraphQLClient(ENS_SUBGRAPH_URL);

// GraphQL query to get domains for an account
export const GET_DOMAINS_FOR_ACCOUNT = `
  query getDomainsForAccount($owner: String!) {
    domains(where: { owner: $owner }) {
      name
      createdAt
      expiryDate
      resolver {
      address
    }
    }
  }
`;

// Type definitions for the GraphQL response
interface Domain {
  name: string;
  createdAt: number;
  expiryDate: number;
  resolver: {
    address: string;
  };
}

interface DomainsResponse {
  domains: Domain[];
}

// Function to fetch domains for an account
export async function getDomainsForAccount(ownerAddress: string): Promise<Domain[]> {
  try {
    // Ensure address is lowercase
    const normalizedAddress = ownerAddress.toLowerCase();
    
    const variables = {
      owner: normalizedAddress
    };

    const data = await graphqlClient.request<DomainsResponse>(GET_DOMAINS_FOR_ACCOUNT, variables);
    return data.domains;
  } catch (error) {
    console.error('Error fetching domains:', error);
    throw error;
  }
}


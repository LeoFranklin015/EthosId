import type { Address } from 'viem'
import type { KnownProfile, KnownReverse } from '../utils/resolutions.js'
import {
  COIN_TYPE_DEFAULT,
  COIN_TYPE_ETH,
  coinTypeFromChain,
} from '../fixtures/ensip19.js'

export const ENS_REGISTRY: Address =
  '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'

export const KNOWN_RESOLUTIONS: KnownProfile[] = [
  {
    title: 'PublicResolverV0',
    name: 'jessesum.eth',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0x8c4Eb6988A199DAbcae0Ce31052b3f3aC591787e',
        origin: 'on',
      },
    ],
    errors: [
      {
        call: '0x12345678',
        answer: '0x',
      },
    ],
  },
  {
    title: 'PublicResolverV2',
    name: 'nick.eth',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5',
        origin: 'on',
      },
    ],
    texts: [{ key: 'com.github', value: 'arachnid', origin: 'on' }],
  },
  {
    title: 'PublicResolverV3',
    name: 'vitalik.eth',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        origin: 'on',
      },
    ],
    texts: [{ key: 'url', value: 'https://vitalik.ca', origin: 'on' }],
  },
  {
    title: 'TheOffchainResolver (onchain)',
    name: 'raffy.eth',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0x51050ec063d393217b436747617ad1c2285aeeee',
        origin: 'on',
      },
    ],
  },
  {
    title: 'TheOffchainResolver (offchain)',
    name: 'raffy.eth',
    texts: [
      {
        key: 'location',
        value: 'Hello from TheOffchainGateway.js!',
        origin: 'off',
      },
    ],
  },
  {
    title: 'TheOffchainResolver (hybrid)',
    name: 'raffy.eth',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0x51050ec063d393217b436747617ad1c2285aeeee',
        origin: 'on',
      },
    ],
    texts: [
      {
        key: 'location',
        value: 'Hello from TheOffchainGateway.js!',
        origin: 'off',
      },
    ],
  },
  {
    title: 'Coinbase',
    name: 'raffy.base.eth',
    texts: [
      { key: 'url', value: 'https://raffy.xyz' },
      { key: 'com.github', value: 'adraffy' },
    ],
  },
  {
    title: 'Coinbase',
    name: 'adraffy.cb.id',
    addresses: [
      {
        coinType: 0n,
        value: '0x00142e6414903e4b24d05132352f71b75c165932a381',
      },
      {
        coinType: 2n,
        value: '0x00142016d413f40444a390ca68cd604e39c6ca94ecf4',
      },
      {
        coinType: COIN_TYPE_ETH,
        value: '0xC973b97c1F8f9E3b150E2C12d4856A24b3d563cb',
      },
    ],
  },
  {
    title: 'Namestone',
    name: 'slobo.eth',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0x534631Bcf33BDb069fB20A93d2fdb9e4D4dD42CF',
        origin: 'on',
      },
    ],
    texts: [
      {
        key: 'com.github',
        value: 'namestonehq',
        origin: 'off',
      },
    ],
  },
  {
    title: 'Namespace',
    name: 'thecap.gotbased.eth',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0x035eBd096AFa6b98372494C7f08f3402324117D3',
        origin: 'off',
      },
    ],
    texts: [
      {
        key: 'com.twitter',
        value: 'thecaphimself',
      },
    ],
  },
  {
    title: 'ENSOffchainResolver',
    name: '1.offchainexample.eth',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0x41563129cDbbD0c5D3e1c86cf9563926b243834d',
        origin: 'off',
      },
    ],
    texts: [
      {
        key: 'email',
        value: 'nick@ens.domains',
        origin: 'off',
      },
    ],
  },
  {
    title: 'Clave',
    name: 'getclave.clv.eth',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0x62Ae9c1dcA30e09AFF1b23D30aCFb780dc0724b8',
        origin: 'off',
      },
    ],
  },
  {
    title: 'BNB',
    name: 'cz.bnb.eth',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0x28816c4C4792467390C90e5B426F198570E29307',
        origin: 'off',
      },
    ],
  },
  {
    title: 'Unruggable Gateway',
    name: 'raffy.teamnick.eth',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0x51050ec063d393217b436747617ad1c2285aeeee',
        origin: 'off',
      },
    ],
    texts: [
      {
        key: 'avatar',
        value: 'https://raffy.antistupid.com/ens.jpg',
        origin: 'off',
      },
    ],
  },
  {
    title: 'EVMGateway',
    name: 'raffy.linea.eth',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0x51050ec063d393217b436747617ad1c2285aeeee',
        origin: 'off',
      },
    ],
  },
  {
    title: 'LineaNFTResolver',
    name: '1.efrogs.eth',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0xAD59EA85DB6F36c93DF955C9780F99e0bF447FF2',
        origin: 'off',
      },
    ],
  },
  {
    title: 'NFTResolver',
    name: 'moo331.nft-owner.eth',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0x51050ec063d393217b436747617ad1c2285aeeee',
        origin: 'on',
      },
    ],
    texts: [{ key: 'description', value: 'Good Morning Cafe', origin: 'on' }],
  },
  {
    title: '3DNS',
    name: 'josh.box',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0x682A689A89Db38a8F51CE58cA7Ee0705D1EDC523',
        origin: 'off',
      },
    ],
    texts: [{ key: 'com.twitter', value: 'joshbrandley', origin: 'off' }],
  },
  {
    title: 'OffchainDNS',
    name: 'taytems.xyz', // 'brantly.rocks'
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0x8e8Db5CcEF88cca9d624701Db544989C996E3216',
        origin: 'batch',
      },
    ],
  },
  {
    title: 'OffchainDNS',
    name: 'ezccip.raffy.xyz',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0x51050ec063d393217b436747617ad1c2285aeeee',
        origin: 'batch',
      },
    ],
    texts: [
      {
        key: 'avatar',
        value: 'https://raffy.antistupid.com/ens.jpg',
        origin: 'batch',
      },
    ],
  },
  {
    title: 'JustaName',
    name: 'yodl.eth',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0x3Fbe48F4314f6817B7Fe39cdAD635E8Dd12ab299',
      },
    ],
  },
  {
    // warning: this requires chainId = 1
    title: 'Uninames',
    name: 'raffy.uni.eth',
    addresses: [
      {
        coinType: COIN_TYPE_ETH,
        value: '0x51050ec063d393217B436747617aD1C2285Aeeee',
      },
    ],
    texts: [{ key: 'com.twitter', value: 'adraffy' }],
  },
]

export const KNOWN_PRIMARIES: KnownReverse[] = [
  {
    title: 'ReverseV1',
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    coinType: COIN_TYPE_ETH,
    primary: 'vitalik.eth',
  },
  {
    title: 'ReverseV2',
    address: '0x51050ec063d393217B436747617aD1C2285Aeeee',
    coinType: COIN_TYPE_ETH,
    primary: 'raffy.eth',
  },
  {
    title: 'PublicResolverV3',
    address: '0xacE594e18275c46302a6E76F3518b80D92849000',
    coinType: COIN_TYPE_ETH,
    primary: 'cold.raffy.eth',
  },
  {
    address: '0x179A862703a4adfb29896552DF9e307980D19285',
    coinType: COIN_TYPE_DEFAULT,
    primary: 'gregskril.eth',
  },
  {
    address: '0x179A862703a4adfb29896552DF9e307980D19285',
    coinType: coinTypeFromChain(8453),
    primary: 'greg.base.eth',
  },
  {
    title: 'no name',
    address: '0x8000000000000000000000000000000000000001',
    coinType: COIN_TYPE_ETH,
    primary: '',
  },
  {
    title: 'no name',
    address: '0x8000000000000000000000000000000000000001',
    coinType: COIN_TYPE_DEFAULT,
    primary: '',
  },
  {
    title: 'no name',
    address: '0x8000000000000000000000000000000000000001',
    coinType: coinTypeFromChain(8453),
    primary: '',
  },
  {
    title: 'no resolver',
    address: '0x00',
    coinType: 0n,
  },
]

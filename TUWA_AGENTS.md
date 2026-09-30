# 🤖 TUWA Ecosystem: Integration Guide for AI Agents

> Context for AI coding agents that build apps with TUWA. Copy this file into the `AGENTS.md` (or `CLAUDE.md`, `.cursorrules`) of your app, or point the agent to its raw URL: `https://raw.githubusercontent.com/TuwaIO/workflows/main/TUWA_AGENTS.md`.
> The maintainers of the TUWA packages follow the `AGENTS.md` of each repository instead.

Every code block below compiles against the current releases (`@tuwaio/sdk` 0.2, Nova UI Kit 0.7, Pulsar 0.8, Satellite Connect 0.6, SIWX 0.4). When the docs and this file disagree, the docs win.

---

## 1. Projects and Packages

TUWA is a headless-first, modular Web3 stack for EVM and Solana: state and logic live in framework-agnostic stores, the UI is optional.

| Project               | Packages                                                                         | Role                                                                          | Docs                                                               |
| --------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Orbit Utils**       | `@tuwaio/orbit-core`, `orbit-evm`, `orbit-solana`                                | Network helpers: adapters, clients, ENS/SNS names, explorer links, Pimlico    | [orbit.docs.tuwa.io](https://orbit.docs.tuwa.io/)                  |
| **SIWX**              | `@tuwaio/siwx-core`, `siwx-evm`, `siwx-solana`, `siwx-react`, `siwx-server`      | CAIP-122 sign-in: messages, signatures, sessions                              | [siwx.docs.tuwa.io](https://siwx.docs.tuwa.io/)                    |
| **Satellite Connect** | `@tuwaio/satellite-core`, `satellite-evm`, `satellite-solana`, `satellite-react` | Headless wallet connection store; reconnects after a reload                   | [satellite.docs.tuwa.io](https://satellite.docs.tuwa.io/)          |
| **Pulsar**            | `@tuwaio/pulsar-core`, `pulsar-evm`, `pulsar-solana`, `pulsar-react`             | Transaction tracking: store in `localStorage`, trackers that survive a reload | [pulsar.docs.tuwa.io](https://pulsar.docs.tuwa.io/)                |
| **Nova UI Kit**       | `@tuwaio/nova-core`, `nova-connect`, `nova-transactions`                         | React components: connect modals, transaction modals, toasts and history      | [stories.tuwa.io](https://stories.tuwa.io/)                        |
| **TUWA SDK**          | `@tuwaio/sdk`, `evm-sdk`, `solana-sdk`, `quasar-sdk`                             | Re-exports of the projects above by subpath; the client of Quasar             | [sdk.docs.tuwa.io](https://sdk.docs.tuwa.io/)                      |
| **Quasar**            | Quasar Cloud (`api.tuwa.io`, dashboard `quasar.tuwa.io`) and Community Edition   | Server-side tracking, transaction history on every device, webhooks           | [docs.tuwa.io/quasar](https://docs.tuwa.io/quasar)                 |
| **Cosmos Playground** | `@tuwaio/create-cosmos-playground` and the templates                             | Starter apps, see [Templates](#9-templates)                                   | [Starter Templates](https://docs.tuwa.io/guides/starter-templates) |

Dependencies point one way: Orbit ← SIWX, Satellite Connect, Pulsar ← Nova UI Kit ← TUWA SDK. A package never imports a project above it. Quasar is a service, reached only through `@tuwaio/quasar-sdk` on your server.

Step-by-step guides (the long form of this file): [Full-Stack React](https://docs.tuwa.io/guides/full-stack-react), [Quasar transaction sync](https://docs.tuwa.io/guides/quasar-transaction-sync), [React transaction tracking](https://docs.tuwa.io/guides/react-transaction-tracking) (packages without the SDK), [Multi-chain authentication](https://docs.tuwa.io/guides/multi-chain-auth-siwx-caip122).

---

## 2. Stack

| Requirement | Version                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| Runtime     | Node.js 20.9–24 LTS (Vite 8 needs 20.19+). Not Node.js 25+: its global `localStorage` breaks SSR checks and Vitest |
| Framework   | React 19.2+; Next.js 16 (App Router) or Vite                                                                       |
| Language    | TypeScript, strict mode                                                                                            |
| Styling     | Tailwind CSS v4 (optional: the Nova stylesheets are precompiled)                                                   |
| State       | `zustand` 5, `immer` 11                                                                                            |
| EVM         | `@wagmi/core` 3 and `viem` 2 (no `wagmi` React package: the app hydrates the config itself, see §4)                |
| Solana      | `@solana/kit` 8.2+, `@wallet-standard/*`, `@solana/react` for the transaction signer                               |

---

## 3. Install

**The SDK (recommended).** `@tuwaio/sdk` brings the TUWA projects and their shared libraries; add the add-on of each network you use. An app with one network never installs or bundles the packages of the other.

```bash
# EVM
pnpm add @tuwaio/sdk @tuwaio/evm-sdk @wagmi/core viem

# Solana
pnpm add @tuwaio/sdk @tuwaio/solana-sdk @solana/kit @solana/react @wallet-standard/react \
  @wallet-standard/app @wallet-standard/base @wallet-standard/features @wallet-standard/ui @wallet-standard/ui-registry

# Quasar sync (server)
pnpm add @tuwaio/quasar-sdk
```

For wagmi connectors other than `injected`, install their SDKs too: `@wagmi/connectors` with `@walletconnect/ethereum-provider` (WalletConnect) and `@safe-global/safe-apps-provider` `@safe-global/safe-apps-sdk` (Safe{Wallet}).

| Import                                                                                         | Package                                                                    |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `@tuwaio/sdk/orbit`                                                                            | `@tuwaio/orbit-core`                                                       |
| `@tuwaio/sdk/pulsar`                                                                           | `@tuwaio/pulsar-core` and `@tuwaio/pulsar-react`                           |
| `@tuwaio/sdk/satellite`                                                                        | `@tuwaio/satellite-react`                                                  |
| `@tuwaio/sdk/siwx`, `/siwx/core`, `/siwx/server`, `/siwx/server-next`                          | `@tuwaio/siwx-react`, `siwx-core`, `siwx-server`, `siwx-server/next`       |
| `@tuwaio/sdk/nova-core`, `/nova-transactions`, `/nova-transactions/providers`                  | Nova UI Kit                                                                |
| `@tuwaio/sdk/nova-connect` (and `/components`, `/hooks`, `/i18n`, `/satellite`)                | `@tuwaio/nova-connect`                                                     |
| `@tuwaio/sdk/styles/all.css` (or `nova-core.css`, `nova-connect.css`, `nova-transactions.css`) | The Nova stylesheets                                                       |
| `@tuwaio/evm-sdk/orbit`, `/pulsar`, `/satellite`, `/siwx`, `/nova-connect`                     | `orbit-evm`, `pulsar-evm`, `satellite-evm`, `siwx-evm`, `nova-connect/evm` |
| `@tuwaio/solana-sdk/orbit`, `/pulsar`, `/satellite`, `/siwx`, `/nova-connect`                  | The Solana counterparts                                                    |
| `@tuwaio/quasar-sdk` (server), `@tuwaio/quasar-sdk/react` (browser)                            | The Quasar client, `preFlightTxCheck`                                      |

**The packages one by one** (to pin each version): follow the [React transaction tracking guide](https://docs.tuwa.io/guides/react-transaction-tracking) and the installation section of the [Nova Connect README](https://stories.tuwa.io/?path=/docs/packages-nova-connect-overview--docs). Imports then come from the packages themselves (`@tuwaio/pulsar-core`, `@tuwaio/nova-connect/evm`, …); the code is otherwise the same.

---

## 4. Full-Stack Setup (Next.js App Router, EVM and Solana)

Wallet connection with the Nova Connect modals, SIWX sign-in with server sessions, and tracked transactions with the Nova Transactions modals and toasts. For one network, drop the other add-on, its adapter, its watcher and its props.

```css
/* src/app/globals.css */
@import '@tuwaio/sdk/styles/all.css';
@import 'tailwindcss';
```

```ts
// src/configs/appConfig.ts
import { createDefaultTransports } from '@tuwaio/evm-sdk/satellite';
import { createConfig, hydrate, injected } from '@wagmi/core';
import { mainnet, sepolia } from 'viem/chains';

export const appChains = [sepolia, mainnet] as const;

// Created once, outside components. createDefaultTransports uses the public RPC URLs of the viem chains.
export const wagmiConfig = createConfig({
  chains: appChains,
  connectors: [injected()],
  transports: createDefaultTransports(appChains),
  ssr: true,
});

// Without WagmiProvider, hydrate the config in the browser: with `ssr: true`, only hydration adds the installed
// EIP-6963 wallets (MetaMask, Rabby, …) to the connectors. Satellite Connect reconnects the last wallet itself.
if (typeof window !== 'undefined') void hydrate(wagmiConfig, { reconnectOnMount: false }).onMount();

// An RPC URL for each Solana cluster the app uses, by cluster name: mainnet, devnet, testnet
export const solanaRPCUrls = {
  devnet: 'https://api.devnet.solana.com',
};
```

```ts
// src/lib/authStores.ts
import { MemorySiwxNonceStore, MemorySiwxSessionStore } from '@tuwaio/sdk/siwx/server';

// For one server process; they refuse to run with NODE_ENV=production. Use Redis or a database there.
export const sessionStore = new MemorySiwxSessionStore();
export const nonceStore = new MemorySiwxNonceStore();
```

```ts
// src/app/api/siwx/[...siwx]/route.ts
import { createSiwxApiHandler } from '@tuwaio/sdk/siwx/server-next';

import { nonceStore, sessionStore } from '@/lib/authStores';

const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');

// Serves /api/siwx/nonce, /api/siwx/verify, /api/siwx/session and /api/siwx/logout
export const { GET, POST, DELETE } = createSiwxApiHandler({
  sessionStore,
  nonceStore,
  policy: {
    expectedDomain: appUrl.host,
    expectedUri: appUrl.origin,
    requireExpirationTime: true,
    maxIssuedAtAgeSeconds: 300,
  },
});
```

Demos without a database use `createStatelessDemoSiwxHandler({ signingSecret, policy })` from the same subpath instead (a signed cookie; sessions cannot be revoked) and read the session with `getSiwxServerSession({ cookieSource, signingSecret })`, as the `nextjs-evm` and `nextjs-tuwa-quasar` templates do.

```ts
// src/transactions.ts
import type { Transaction } from '@tuwaio/sdk/pulsar';

export enum TxType {
  increment = 'increment',
}

// One member per transaction type: `type` and `payload` are typed everywhere the transaction is read
export type IncrementTx = Transaction & { type: TxType.increment; payload: { value: number } };

export type AppTransaction = IncrementTx;
```

```ts
// src/hooks/pulsarStore.ts
import { pulsarEvmAdapter } from '@tuwaio/evm-sdk/pulsar';
import { createBoundedUseStore, createPulsarStore } from '@tuwaio/sdk/pulsar';
import { pulsarSolanaAdapter } from '@tuwaio/solana-sdk/pulsar';

import { appChains, solanaRPCUrls, wagmiConfig } from '@/configs/appConfig';
import type { AppTransaction } from '@/transactions';

export const pulsarStore = createPulsarStore<AppTransaction>({
  name: 'my-app-transactions', // the localStorage key
  adapter: [pulsarEvmAdapter(wagmiConfig, appChains), pulsarSolanaAdapter({ rpcUrls: solanaRPCUrls })],
});

export const usePulsarStore = createBoundedUseStore(pulsarStore);
```

```tsx
// src/providers/Providers.tsx
'use client';

import { EVMConnectorsWatcher } from '@tuwaio/evm-sdk/nova-connect';
import { satelliteEVMAdapter } from '@tuwaio/evm-sdk/satellite';
import { NovaConnectProvider, type NovaConnectProviderProps } from '@tuwaio/sdk/nova-connect';
import { NovaTransactionsProvider } from '@tuwaio/sdk/nova-transactions/providers';
import { getAdapterFromConnectorType } from '@tuwaio/sdk/orbit';
import { useInitializeTransactionsPool } from '@tuwaio/sdk/pulsar';
import { SatelliteConnectProvider, useSatelliteConnectStore } from '@tuwaio/sdk/satellite';
import { SolanaConnectorsWatcher } from '@tuwaio/solana-sdk/nova-connect';
import { satelliteSolanaAdapter } from '@tuwaio/solana-sdk/satellite';
import type { ReactNode } from 'react';

import { appChains, solanaRPCUrls, wagmiConfig } from '@/configs/appConfig';
import { usePulsarStore } from '@/hooks/pulsarStore';

// Created once: a new adapter array on every render makes SatelliteConnectProvider update its store each time
const satelliteAdapters = [
  satelliteEVMAdapter(wagmiConfig, appChains),
  satelliteSolanaAdapter({ rpcUrls: solanaRPCUrls }),
];

// Nova Connect asks every connected wallet to sign in and disconnects a wallet that refuses
const siwx: NovaConnectProviderProps['siwx'] = {
  getNonce: async () => {
    const res = await fetch('/api/siwx/nonce');
    return ((await res.json()) as { nonce: string }).nonce;
  },
  verifier: async (payload) => {
    const res = await fetch('/api/siwx/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok ? res.json() : null;
  },
  destroyer: async () => {
    await fetch('/api/siwx/logout', { method: 'POST' });
  },
};

// The modals and toasts of Nova Transactions, fed by the Pulsar store
function TransactionsUI() {
  const transactionsPool = usePulsarStore((state) => state.transactionsPool);
  const initialTx = usePulsarStore((state) => state.initialTx);
  const closeTxTrackedModal = usePulsarStore((state) => state.closeTxTrackedModal);
  const executeTxAction = usePulsarStore((state) => state.executeTxAction);
  const initializeTransactionsPool = usePulsarStore((state) => state.initializeTransactionsPool);
  const getAdapter = usePulsarStore((state) => state.getAdapter);
  const activeConnection = useSatelliteConnectStore((state) => state.activeConnection);

  // Restarts the trackers of pending transactions after a page reload
  useInitializeTransactionsPool({ initializeTransactionsPool });

  return (
    <NovaTransactionsProvider
      transactionsPool={transactionsPool}
      initialTx={initialTx}
      closeTxTrackedModal={closeTxTrackedModal}
      executeTxAction={executeTxAction}
      connectedWalletAddress={activeConnection?.isConnected ? activeConnection.address : undefined}
      connectedAdapterType={getAdapterFromConnectorType(activeConnection?.connectorType ?? 'evm:')}
      adapter={getAdapter()}
    />
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const transactionsPool = usePulsarStore((state) => state.transactionsPool);
  const getAdapter = usePulsarStore((state) => state.getAdapter);

  return (
    <SatelliteConnectProvider adapter={satelliteAdapters} autoConnect>
      <EVMConnectorsWatcher wagmiConfig={wagmiConfig} />
      <SolanaConnectorsWatcher />
      <TransactionsUI />
      <NovaConnectProvider
        appChains={appChains}
        solanaRPCUrls={solanaRPCUrls}
        transactionPool={transactionsPool}
        // The prop is typed for the base Transaction; the store holds AppTransaction
        pulsarAdapter={getAdapter() as NovaConnectProviderProps['pulsarAdapter']}
        siwx={siwx}
        withBalance
        withChain
      >
        {children}
      </NovaConnectProvider>
    </SatelliteConnectProvider>
  );
}
```

```tsx
// src/app/layout.tsx
import './globals.css';

import type { ReactNode } from 'react';

import { Providers } from '@/providers/Providers';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**A tracked EVM transaction.** `actionFunction` sends the transaction and returns its key (the hash); Pulsar validates the metadata, asks the wallet to switch to `desiredChainID`, adds the transaction to the pool and tracks it to its final status. `TxActionButton` shows the status of the last transaction it sent.

```tsx
// src/components/IncrementButton.tsx
'use client';

import { TxActionButton } from '@tuwaio/sdk/nova-transactions';
import { OrbitAdapter } from '@tuwaio/sdk/orbit';
import { useSatelliteConnectStore } from '@tuwaio/sdk/satellite';
import { writeContract } from '@wagmi/core';
import { sepolia } from 'viem/chains';

import { wagmiConfig } from '@/configs/appConfig';
import { usePulsarStore } from '@/hooks/pulsarStore';
import { TxType } from '@/transactions';

const COUNTER_ADDRESS = '0xAe7f46914De82028eCB7E2bF97Feb3D3dDCc2BAB'; // a counter contract on Sepolia
const counterAbi = [
  { type: 'function', name: 'increment', inputs: [], outputs: [], stateMutability: 'nonpayable' },
] as const;

export function IncrementButton() {
  const executeTxAction = usePulsarStore((state) => state.executeTxAction);
  const transactionsPool = usePulsarStore((state) => state.transactionsPool);
  const getLastTxKey = usePulsarStore((state) => state.getLastTxKey);
  const walletAddress = useSatelliteConnectStore((state) => state.activeConnection?.address);

  const increment = () =>
    executeTxAction({
      actionFunction: () =>
        writeContract(wagmiConfig, {
          address: COUNTER_ADDRESS,
          abi: counterAbi,
          functionName: 'increment',
          chainId: sepolia.id,
        }),
      params: {
        type: TxType.increment,
        adapter: OrbitAdapter.EVM,
        desiredChainID: sepolia.id,
        title: ['Incrementing', 'Incremented', 'Increment failed', 'Increment replaced'],
        description: 'Increment the counter by 1.',
        payload: { value: 1 },
        withTrackedModal: true, // opens the tracking modal of Nova Transactions
      },
    });

  return (
    <TxActionButton
      action={increment}
      transactionsPool={transactionsPool}
      getLastTxKey={getLastTxKey}
      walletAddress={walletAddress}
    >
      Increment
    </TxActionButton>
  );
}
```

**A tracked Solana transaction.** The signer comes from `@solana/react` for the Wallet Standard account of the connection, so it lives in a component rendered only while a Solana wallet is connected. Pulsar checks the cluster (`desiredChainID`) but cannot switch it. The instruction comes from the Codama client of your program ([§8](#8-solana-programs-codama)).

```tsx
// src/components/SolanaTxButton.tsx
'use client';

import type { Instruction } from '@solana/kit';
import { useWalletAccountTransactionSendingSigner } from '@solana/react';
import { TxActionButton } from '@tuwaio/sdk/nova-transactions';
import { OrbitAdapter } from '@tuwaio/sdk/orbit';
import { useSatelliteConnectStore } from '@tuwaio/sdk/satellite';
import { createSolanaClientWithCache } from '@tuwaio/solana-sdk/orbit';
import { signAndSendSolanaTx } from '@tuwaio/solana-sdk/pulsar';
import type { SolanaConnection } from '@tuwaio/solana-sdk/satellite';

import { usePulsarStore } from '@/hooks/pulsarStore';
import { TxType } from '@/transactions';

type WalletAccount = NonNullable<SolanaConnection['connectedAccount']>;

function SendButton(props: { account: WalletAccount; connection: SolanaConnection; instruction: Instruction }) {
  const { account, connection, instruction } = props;
  const executeTxAction = usePulsarStore((state) => state.executeTxAction);
  const transactionsPool = usePulsarStore((state) => state.transactionsPool);
  const getLastTxKey = usePulsarStore((state) => state.getLastTxKey);
  const cluster = String(connection.chainId); // 'devnet', 'mainnet', …
  const signer = useWalletAccountTransactionSendingSigner(account, `solana:${cluster}`);

  const send = () =>
    executeTxAction({
      actionFunction: () =>
        signAndSendSolanaTx({
          client: createSolanaClientWithCache({ rpcUrlOrMoniker: connection.rpcURL }),
          signer,
          instruction,
        }),
      params: {
        type: TxType.increment,
        adapter: OrbitAdapter.SOLANA,
        desiredChainID: cluster,
        rpcUrl: connection.rpcURL, // saved with the transaction: tracking resumes on the same RPC after a reload
        title: ['Incrementing', 'Incremented', 'Increment failed', 'Increment replaced'],
        description: 'Increment the counter by 1.',
        payload: { value: 1 },
        withTrackedModal: true,
      },
    });

  return (
    <TxActionButton
      action={send}
      transactionsPool={transactionsPool}
      getLastTxKey={getLastTxKey}
      walletAddress={connection.address}
    >
      Send
    </TxActionButton>
  );
}

export function SolanaTxButton({ instruction }: { instruction: Instruction }) {
  const connection = useSatelliteConnectStore((state) => state.activeConnection) as SolanaConnection | undefined;
  if (!connection?.isConnected || !connection.connectedAccount) return null;
  return <SendButton account={connection.connectedAccount} connection={connection} instruction={instruction} />;
}
```

```tsx
// src/app/page.tsx
'use client';

import { ConnectButton } from '@tuwaio/sdk/nova-connect/components';

import { IncrementButton } from '@/components/IncrementButton';

export default function HomePage() {
  return (
    <main className="flex flex-col items-start gap-4 p-8">
      <ConnectButton />
      <IncrementButton />
    </main>
  );
}
```

**The session on the server.** Server Actions and route handlers read the session from the cookie and compare it with the wallet the request is about. The SIWX state in the browser (`@tuwaio/sdk/siwx`) is UI state, never proof of the sign-in.

```ts
// src/app/actions.ts
'use server';

import { getSiwxServerSession, isSessionMatchingTarget } from '@tuwaio/sdk/siwx/server';
import { cookies } from 'next/headers';

import { sessionStore } from '@/lib/authStores';

export async function saveProfile(walletAddress: string, nickname: string) {
  const session = await getSiwxServerSession({ cookieSource: await cookies(), sessionStore });
  if (!session || !isSessionMatchingTarget(session, walletAddress)) {
    throw new Error('Unauthorized');
  }

  // The request comes from the owner of `walletAddress`
  return { walletAddress, nickname };
}
```

---

## 5. Quasar Sync

Every new transaction is also sent to Quasar through your server: Quasar tracks it on the server, sends your webhooks and returns the history of the wallet on any device. The secret key (`sk_live_…` or `sk_test_…`, from the dashboard) stays on the server; leave the domain allowlist of the Quasar app empty, because server requests carry no `Origin`.

```ts
// src/app/quasarActions.ts
'use server';

import { Quasar, QuasarSDKError, type Transaction } from '@tuwaio/quasar-sdk';
import { getSiwxServerSession, isSessionMatchingTarget } from '@tuwaio/sdk/siwx/server';
import { cookies } from 'next/headers';

import { sessionStore } from '@/lib/authStores';

const quasar = new Quasar({
  secretKey: process.env.QUASAR_SECRET_KEY ?? '',
  baseUrl: process.env.NEXT_PUBLIC_QUASAR_BASE_URL, // a self-hosted node; Quasar Cloud when unset
});

const APP_NAME = 'my-app'; // keeps the history of this app apart inside one Quasar app

async function getSession() {
  return getSiwxServerSession({ cookieSource: await cookies(), sessionStore });
}

export async function syncTransaction(tx: Transaction): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || !isSessionMatchingTarget(session, tx.from, tx.chainId)) {
    return { success: false, error: 'The signed-in wallet did not send this transaction.' };
  }

  try {
    await quasar.pulsar.syncCreate(tx, APP_NAME);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof QuasarSDKError ? error.message : 'Quasar is unavailable.' };
  }
}

export async function getHistory(params: { walletAddress: string; page?: number }) {
  const session = await getSession();
  if (!session || !isSessionMatchingTarget(session, params.walletAddress)) {
    return null;
  }

  return quasar.pulsar.getHistory({
    walletAddress: params.walletAddress,
    page: params.page,
    limit: 10,
    appName: APP_NAME,
  });
}
```

The store checks the sign-in before each wallet prompt, syncs each new transaction, and merges the history pages with the local transactions:

```ts
// src/hooks/pulsarStore.ts
import { pulsarEvmAdapter } from '@tuwaio/evm-sdk/pulsar';
import { preFlightTxCheck } from '@tuwaio/quasar-sdk/react';
import {
  createBoundedUseStore,
  createPulsarStore,
  createTxInMemoryStore,
  type TxInMemoryPagination,
} from '@tuwaio/sdk/pulsar';
import { pulsarSolanaAdapter } from '@tuwaio/solana-sdk/pulsar';

import { getHistory, syncTransaction } from '@/app/quasarActions';
import { appChains, solanaRPCUrls, wagmiConfig } from '@/configs/appConfig';
import type { AppTransaction } from '@/transactions';

export const pulsarStore = createPulsarStore<AppTransaction>({
  name: 'my-app-transactions',
  adapter: [pulsarEvmAdapter(wagmiConfig, appChains), pulsarSolanaAdapter({ rpcUrls: solanaRPCUrls })],
  // Stops the transaction when the user is not signed in or Quasar does not respond
  beforeTxProcess: () => preFlightTxCheck(process.env.NEXT_PUBLIC_QUASAR_BASE_URL),
  // Throw on failure: the transaction stays unsynced and is sent again later (reconcileUnsyncedTransactions)
  onRemoteCreate: async (tx) => {
    const result = await syncTransaction(tx);
    if (!result.success) throw new Error(result.error);
  },
});

export const usePulsarStore = createBoundedUseStore(pulsarStore);

export const historyStore = createTxInMemoryStore<AppTransaction>({
  localTransactionsPool: pulsarStore.getState().transactionsPool,
  reconcileUnsyncedTransactions: pulsarStore.getState().reconcileUnsyncedTransactions,
  getHistory: async ({ page, walletAddress }) => {
    const history = await getHistory({ walletAddress, page });
    return history && { ...history, docs: history.docs as AppTransaction[] };
  },
  // Pending transactions sent from another device continue to be tracked here
  onHistoryFetched: (remoteTxs) => pulsarStore.getState().injectExternalPendingTxs(remoteTxs),
});

pulsarStore.subscribe((state) => historyStore.getState().syncWithLocalPool(state.transactionsPool));

export const useHistoryStore = createBoundedUseStore(historyStore);

export function useHistoryPagination(): TxInMemoryPagination {
  const isLoading = useHistoryStore((state) => state.isLoading);
  const isError = useHistoryStore((state) => state.isError);
  const currentPage = useHistoryStore((state) => state.currentPage);
  const hasMore = useHistoryStore((state) => state.hasMore);
  const fetchNextPage = useHistoryStore((state) => state.fetchNextPage);
  return { isLoading, isError, currentPage, hasMore, fetchNextPage };
}
```

In `Providers.tsx`, feed Nova from the history store: `transactionPool` and `pagination` of `NovaConnectProvider`, `transactionsPool` and `pagination` of `NovaTransactionsProvider` come from `useHistoryStore` and `useHistoryPagination()`. Load the first page once the connected wallet is signed in, with a component rendered inside `SatelliteConnectProvider`:

```tsx
// src/providers/HistoryLoader.tsx
'use client';

import { useSatelliteConnectStore } from '@tuwaio/sdk/satellite';
import { isSessionMatchingTarget, useSiwxSessionStore } from '@tuwaio/sdk/siwx';
import { useEffect } from 'react';

import { useHistoryStore } from '@/hooks/pulsarStore';

export function HistoryLoader() {
  const address = useSatelliteConnectStore((state) => state.activeConnection?.address);
  const session = useSiwxSessionStore((state) => state.session);
  const fetchInitial = useHistoryStore((state) => state.fetchInitial);
  const isSignedIn = Boolean(session && address && isSessionMatchingTarget(session, address));

  useEffect(() => {
    if (isSignedIn && address) void fetchInitial(address);
  }, [isSignedIn, address, fetchInitial]);

  return null;
}
```

**Webhooks.** Quasar posts the final status of each synced transaction to the endpoints of the app, signed with `x-quasar-signature` (hex HMAC-SHA256 of the raw body). Verify before parsing, answer within 10 seconds, and make the handler idempotent (a failed delivery is retried, up to 5 attempts):

```ts
// src/app/api/webhooks/quasar/route.ts
import { createHmac, timingSafeEqual } from 'node:crypto';

export async function POST(request: Request) {
  const secret = process.env.QUASAR_WEBHOOK_SECRET;
  const signature = request.headers.get('x-quasar-signature');
  if (!secret || !signature) {
    return Response.json({ error: 'Missing signature' }, { status: 401 });
  }

  const body = await request.text();
  const expected = Buffer.from(createHmac('sha256', secret).update(body).digest('hex'), 'hex');
  const received = Buffer.from(signature, 'hex');
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // `status` is Success, Failed or Replaced; `metadata` is the payload of the Pulsar transaction
  const event = JSON.parse(body) as { txKey: string; status: string; txType: string; metadata: unknown };
  if (event.status === 'Success') {
    // Fulfill the order, credit the balance, notify the user…
  }

  return Response.json({ received: true });
}
```

On `localhost`, register an endpoint with a `localhost` URL and relay its deliveries with `npx @tuwaio/quasar-sdk listen --forward-to http://localhost:3000/api/webhooks/quasar` (reads `QUASAR_WEBHOOK_SECRET` from `.env`). Quotas, limits and the API reference: [docs.tuwa.io/quasar](https://docs.tuwa.io/quasar).

---

## 6. Theming, Customization and Labels

**CSS variables.** Nova reads `--tuwa-*` variables from `:root` (light) and `.dark` (dark theme: add the class to the root element). Override them after the Nova stylesheets:

| Variables                                                                                           | Purpose                                     |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `--tuwa-text-primary`, `-secondary`, `-tertiary`, `-accent`, `-on-accent`                           | Text, links, text on accent backgrounds     |
| `--tuwa-bg-primary`, `-secondary`, `-muted`                                                         | Page, cards and modals, highlighted areas   |
| `--tuwa-border-primary`, `-secondary`                                                               | Borders                                     |
| `--tuwa-success-*`, `--tuwa-error-*`, `--tuwa-pending-*`, `--tuwa-info-*` (`-bg`, `-text`, `-icon`) | Transaction and status colors               |
| `--tuwa-button-gradient-from`, `-to`, `-from-hover`, `-to-hover`                                    | Primary buttons                             |
| `--tuwa-standart-button-bg`, `-hover`                                                               | Secondary buttons                           |
| `--tuwa-rounded-corners`, `--tuwa-ring-width`                                                       | Corner radius (4px), focus ring width (2px) |
| `--tuwa-testnet-icons`                                                                              | Tint of testnet chain icons                 |

**Customization.** Every Nova component takes a `customization` prop: `classNames` functions replace the default classes of each part, `components` replace parts, `childCustomizations` reach nested components. The full reference is the [Theming page](https://stories.tuwa.io/?path=/docs/theming--docs); the `custom-style` template restyles every modal.

```ts
// src/styles/connectButton.ts
import type { ConnectButtonCustomization } from '@tuwaio/sdk/nova-connect/components';
import { cn } from '@tuwaio/sdk/nova-core';

// <ConnectButton customization={connectButtonCustomization} />
export const connectButtonCustomization: ConnectButtonCustomization = {
  classNames: {
    button: ({ buttonData }) =>
      cn(
        'rounded-[var(--tuwa-rounded-corners)] px-4 py-2 text-sm font-medium',
        buttonData.isConnected
          ? 'bg-[var(--tuwa-bg-secondary)] text-[var(--tuwa-text-primary)]'
          : 'bg-[var(--tuwa-text-accent)] text-[var(--tuwa-text-on-accent)]',
      ),
  },
};
```

**Labels.** `labels` of `NovaConnectProvider` takes any subset of `NovaConnectLabels` (flat); `labels` of `NovaTransactionsProvider` takes whole groups of `NovaTransactionsLabels`:

```ts
// src/i18n/labels.ts
import { ukrainianLabels } from '@tuwaio/sdk/nova-connect/i18n';
import { defaultLabels, type NovaTransactionsLabels } from '@tuwaio/sdk/nova-transactions';

export const connectLabels = { ...ukrainianLabels, connectWallet: 'Увійти' };

export const transactionsLabels: Partial<NovaTransactionsLabels> = {
  statuses: { ...defaultLabels.statuses, pending: 'Waiting for confirmation' },
};
```

---

## 7. Pulsar Without React

The trackers work without the store, for your own state or a server. `evmTracker` resolves when tracking has finished; `initializePollingTracker` with a fetcher (`solanaFetcher`, `safeFetcher`) polls in the background.

```ts
// src/lib/trackTransaction.ts
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { initializePollingTracker } from '@tuwaio/pulsar-core';
import { evmTracker } from '@tuwaio/pulsar-evm';
import { solanaFetcher } from '@tuwaio/pulsar-solana';
import { createConfig, http } from '@wagmi/core';
import { sepolia } from 'viem/chains';

const wagmiConfig = createConfig({ chains: [sepolia], transports: { [sepolia.id]: http() } });

export async function trackEvmTransaction(hash: `0x${string}`) {
  await evmTracker({
    config: wagmiConfig,
    tx: { txKey: hash, chainId: sepolia.id, requiredConfirmations: 2 },
    onTxDetailsFetched: (details) => console.log('Nonce', details.nonce),
    onSuccess: async (_details, receipt) => console.log(receipt.status, receipt.blockNumber),
    onReplaced: (replacement) => console.log('Replaced by', replacement.transaction.hash),
    onFailure: (error) => console.error('Tracking failed', error),
  });
}

export function trackSolanaSignature(signature: string) {
  initializePollingTracker({
    tx: {
      adapter: OrbitAdapter.SOLANA,
      txKey: signature,
      chainId: 'solana:devnet',
      rpcUrl: 'https://api.devnet.solana.com',
      localTimestamp: Math.floor(Date.now() / 1000), // when the transaction was sent, in seconds
      pending: true, // polling starts only for pending transactions
    },
    fetcher: solanaFetcher,
    onSuccess: (status) => console.log('Finalized in slot', status.slot),
    onFailure: (status) => console.error('Failed or not finalized in time', status?.err),
  });
}
```

ERC-4337 (`erc4337Tracker`), Safe (`safeFetcher`) and the helpers: [EVM Trackers Standalone](https://pulsar.docs.tuwa.io/evmStandalone), [Solana Trackers Standalone](https://pulsar.docs.tuwa.io/solanaStandalone). The trackers read `@tuwaio/pulsar-evm` and `@tuwaio/pulsar-solana` directly; with the SDK, use `@tuwaio/evm-sdk/pulsar` and `@tuwaio/solana-sdk/pulsar`.

---

## 8. Solana Programs (Codama)

Generate the client of an Anchor program with Codama for `@solana/kit`; never edit the generated folder.

1. Put the Anchor IDL at `src/targets/<program>/idl/<program>.json`.
2. Add `@codama/cli`, `@codama/nodes-from-anchor` and `@codama/renderers-js` as dev dependencies, the script `"generate:solana": "codama run js"`, and `codama.json`:

   ```json
   {
     "idl": "src/targets/solanatest/idl/solanatest.json",
     "scripts": {
       "js": {
         "from": "@codama/renderers-js",
         "args": [
           "src/programs/solanatest/generated",
           {
             "generatedFolder": "",
             "syncPackageJson": false,
             "deleteFolderBeforeRendering": true,
             "kitImportStrategy": "rootOnly"
           }
         ]
       }
     }
   }
   ```

3. Run `pnpm generate:solana` after every change of the IDL. The client exports an instruction builder per instruction (`getIncrementInstruction(...)`) and a decoder per account; pass the instruction to `signAndSendSolanaTx`.

---

## 9. Templates

```bash
npx @tuwaio/create-cosmos-playground
```

| Template              | Stack                | Shows                                                                                             |
| --------------------- | -------------------- | ------------------------------------------------------------------------------------------------- |
| `nextjs-tuwa`         | Next.js, SDK         | EVM and Solana: wallet connection, tracked transactions (standard and ERC-4337), a Codama program |
| `nextjs-evm`          | Next.js, SDK         | EVM only, with SIWX sign-in                                                                       |
| `nextjs-solana`       | Next.js, SDK         | Solana only, with a Codama program                                                                |
| `vite-tuwa`           | Vite, SDK            | `nextjs-tuwa` as a client-side app                                                                |
| `nextjs-tuwa-not-sdk` | Next.js, packages    | `nextjs-tuwa` on the packages one by one, plus the deprecated Gelato relay                        |
| `custom-style`        | Vite, SDK            | EVM only, with every Nova component restyled                                                      |
| `nextjs-tuwa-quasar`  | Next.js, SDK, Quasar | Full stack: SIWX, Quasar sync and history, webhooks                                               |

Source: [cosmos-playground/examples](https://github.com/TuwaIO/cosmos-playground/tree/main/examples).

---

## 10. Rules for Agents

**Dependencies**

- Use `viem` and `@wagmi/core` for EVM, `@solana/kit` and Wallet Standard for Solana.
- Never add `ethers`, `web3.js`, legacy `@solana/web3.js` classes, `gill`, the `siwe` package or `@tuwaio/satellite-siwe-next-auth` (deprecated; sign-in is `@tuwaio/siwx-*`). Do not add RainbowKit, ConnectKit or Reown AppKit as the connect modal: Nova Connect is the wallet UI.
- `wagmi` (React), `WagmiProvider` and `@tanstack/react-query` are not needed: Satellite Connect and Pulsar use `@wagmi/core` actions.
- Install only the add-on of the networks the app uses; do not import `@tuwaio/solana-sdk` in an EVM-only app or the reverse.

**Wiring**

- Create the wagmi config, the Satellite adapters, the Pulsar stores and the `siwx` options once, at module level. A new adapter on every render makes `SatelliteConnectProvider` update its store each time.
- Right after `createConfig`, call `hydrate(wagmiConfig, { reconnectOnMount: false }).onMount()` in the browser (`typeof window !== 'undefined'`), as in §4. Without it (and without `WagmiProvider`), a config with `ssr: true` never adds the EIP-6963 wallets: the connect modal lists no installed wallets and the last one does not reconnect after a reload. Keep `reconnectOnMount: false`: Satellite Connect restores the connection.
- Render one watcher per network inside `SatelliteConnectProvider`: `EVMConnectorsWatcher` (with `wagmiConfig`) and `SolanaConnectorsWatcher`.
- Pass `siwx` only to `NovaConnectProvider`, never to the watchers, and always with `getNonce`: the SIWX server handlers accept only nonces they issued.
- `solanaRPCUrls` is keyed by cluster name (`mainnet`, `devnet`, `testnet`), not by `solana:…` chain ID.
- Import `ConnectButton` from `@tuwaio/sdk/nova-connect/components` and `preFlightTxCheck` from `@tuwaio/quasar-sdk/react`.
- Render `NovaTransactionsProvider` once and call `useInitializeTransactionsPool` once, so pending transactions resume after a reload.
- The impersonated wallet (`impersonated()` connector and `withImpersonated`) cannot sign messages: leave it out of apps with SIWX, where Nova Connect would disconnect it.

**Security**

- Keep secrets on the server: `QUASAR_SECRET_KEY`, `QUASAR_WEBHOOK_SECRET` and the SIWX signing secret. Only `NEXT_PUBLIC_*` and `VITE_*` values reach the browser.
- Server code reads the session with `getSiwxServerSession` from the cookie and checks it with `isSessionMatchingTarget` before acting for a wallet. Never accept a session object from the browser.
- `onRemoteCreate` throws when the sync fails; a resolved promise marks the transaction as synced.
- Verify webhook signatures over the raw body with a constant-time comparison.
- Use a shared session and nonce store (Redis or a database) in production; the memory stores and the stateless demo profile are for development and demos.

**State**

- Blockchain writes go through `executeTxAction` of the Pulsar store; read their status from the store with selectors, not from local `useState`.
- Select single fields from Zustand stores (`useStore((state) => state.field)`), never the whole state.
- Type each transaction: a union of `Transaction & { type; payload }` as the generic of `createPulsarStore`.
- Keep `title` at most 100 characters, `description` at most 300 and `payload` under 10 KB: Pulsar rejects larger metadata with `PulsarTransactionValidationError`.

**Styling and code**

- Color and round Nova-looking UI with the `--tuwa-*` variables, merge classes with `cn` from `@tuwaio/sdk/nova-core`.
- Strict TypeScript without `any`; English in code and comments; run the linter and the formatter of the project after changes.
- Never edit generated code (`src/programs/*/generated`).

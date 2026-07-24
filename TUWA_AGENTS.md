# 🤖 TUWA Ecosystem: Complete Integration Standard

> **SYSTEM INSTRUCTION:** You are acting as a Senior Web3 Solutions Architect.
> This document is the **Single Source of Truth** for building Decentralized Applications (dApps) using the TUWA Ecosystem.
> Unlike internal package maintenance, your goal here is **Integration** and **Usage**.

---

## 1. Ecosystem Architecture

TUWA is a headless-first, modular Web3 stack. We strictly separate **Logic** from **UI**.

```
┌─────────────────────────────────────────────────────────────┐
│              Your Application (React 19+)                   │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│              @tuwaio/sdk (Core SDK)                         │
│  • sdk: Subpath entrypoints for Orbit, Pulsar, Satellite    │
│  • evm-sdk / solana-sdk: Chain-specific transport adapters  │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│     @tuwaio/nova-*  (UI Kit - The Visual Layer)             │
│  • nova-core: Base styles, CSS variables, utilities         │
│  • nova-connect: Wallet connection components               │
│  • nova-transactions: Transaction modals & toasts           │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│   @tuwaio/pulsar-*  (Transaction Tracking Engine)           │
│  • pulsar-core: Headless state machine (Zustand)            │
│  • pulsar-evm: EVM adapter (Standard, Safe, Gelato)         │
│  • pulsar-solana: Solana adapter                            │
│  • pulsar-react: React bindings & hooks                     │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│   @tuwaio/satellite-*  (Wallet Connection Layer)            │
│  • satellite-core: Universal store & types                  │
│  • satellite-evm: Wagmi/Viem bridge                         │
│  • satellite-solana: Gill/Wallet Standard bridge            │
│  • satellite-react: React provider & hooks                  │
│  • satellite-siwe-next-auth: SIWE authentication            │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│       @tuwaio/orbit-*  (Foundation Layer - Helpers)         │
│  • orbit-core: Types, adapter system, utilities             │
│  • orbit-evm: ENS, chain switching, Viem helpers            │
│  • orbit-solana: RPC client, name/avatar resolution         │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│     Quasar Cloud Layer & SDK (@tuwaio/quasar-sdk)           │
│  • quasar-sdk: Transaction indexing, quota metering, auth  │
│  • Quasar Server & Dashboard: SaaS Backend & Iron Dome Guard│
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Package Scope | Role | When to use? |
| --- | --- | --- | --- |
| **Foundation** | `@tuwaio/orbit-*` | *The Toolbox* | Low-level helpers, formatters, chain adapters |
| **Connectivity** | `@tuwaio/satellite-*` | *The Connector* | Wallet connections (EVM/Solana), session management |
| **State Engine** | `@tuwaio/pulsar-*` | *The Tracker* | Transaction lifecycle tracking with persistence |
| **Visual Layer** | `@tuwaio/nova-*` | *The UI Kit* | Pre-built React components (Modals, Toasts) |
| **Core SDK** | `@tuwaio/sdk`, `@tuwaio/*-sdk` | *The Integrator* | Single-entrypoint integration for dApps |
| **Cloud Infrastructure** | `@tuwaio/quasar-sdk` / Quasar | *The Cloud & Indexer* | On-chain transaction indexing, multi-tenant cloud & API security |

### 📚 Documentation Hub

* **Orbit Utils:** [https://orbit.docs.tuwa.io/](https://orbit.docs.tuwa.io/)
* **Satellite Connect:** [https://satellite.docs.tuwa.io/](https://satellite.docs.tuwa.io/)
* **Pulsar Engine:** [https://pulsar.docs.tuwa.io/](https://pulsar.docs.tuwa.io/)
* **Nova Storybook:** [https://stories.tuwa.io/?path=/docs/introduction--docs](https://stories.tuwa.io/?path=/docs/introduction--docs)
* **TUWA SDK:** [https://sdk.docs.tuwa.io/](https://sdk.docs.tuwa.io/)
* **Quasar Cloud:** [https://quasar.docs.tuwa.io/](https://quasar.docs.tuwa.io/)

---

## 2. Technical Stack Requirements (STRICT)

Any project using TUWA must adhere to these constraints to ensure stability and compatibility.

| Requirement | Version | Notes                                                                   |
| --- | --- |-------------------------------------------------------------------------|
| **Runtime** | Node.js v20 - v24 (LTS) | ⚠️ **Node v25+ is PROHIBITED** - causes localStorage/vitest instability |
| **Package Manager** | `pnpm` (Recommended) or `npm` | —                                                                       |
| **Framework** | React v19+ / Next.js 16+ (App Router) | You can use Vite instead of Next.js if you want                         |
| **Styling** | Tailwind CSS v4 | —                                                                       |
| **Language** | TypeScript v5.9+ (Strict Mode) | —                                                                       |
| **State** | Zustand + Immer | Required for Pulsar/Satellite                                           |

---

## 3. Getting Started: Full-Stack React Guide

This guide demonstrates how to build a production-ready, multi-chain Next.js App Router application integrating **EVM**, **Solana**, **Nova UI components**, and **Quasar Cloud Sync**.

---

### 🎨 1. Global CSS Styles Import (`layout.tsx`)

To style Nova UI components (`ConnectButton`, transaction toasts, modal dialogs), import the bundled CSS stylesheet into your global CSS file (e.g. `src/styles/globals.css`) or root layout:

#### Option A: Complete Bundle Import (Recommended)

In your global CSS file (`src/styles/globals.css`):

```css
/* src/styles/globals.css */
@import '@tuwaio/sdk/styles/all.css';

/* Optional: if your dApp uses Tailwind CSS v4 */
@import 'tailwindcss';
```

Or directly in your root React layout (`src/app/layout.tsx`):

```tsx
// src/app/layout.tsx
import '@tuwaio/sdk/styles/all.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

#### Option B: Granular Individual Styles

If you prefer to include only specific module styles:

```css
/* Import individual stylesheets as needed */
@import '@tuwaio/sdk/styles/nova-core.css';
@import '@tuwaio/sdk/styles/nova-connect.css';
@import '@tuwaio/sdk/styles/nova-transactions.css';

/* Optional: if your dApp uses Tailwind CSS v4 */
@import 'tailwindcss';
```

> **Styling & Tailwind CSS Note**: All Nova UI components (`ConnectButton`, modals, toasts) ship with fully compiled, self-contained styles inside `@tuwaio/sdk/styles/all.css`. Installing Tailwind CSS is **optional** — we use Tailwind utility classes in our code examples for dApp layout structure, but you are free to use any styling solution (CSS Modules, Styled Components, or Plain CSS). If you do use Tailwind CSS v4 in your project, remember to include `@import 'tailwindcss';` in your global CSS file.

---

### 📝 2. Define Transaction Union Types (`types.ts`)

```typescript
// src/types.ts
import type { Transaction } from '@tuwaio/sdk/pulsar';

export enum AppTxType {
  SWAP = 'SWAP',
}

export type SwapTx = Transaction & {
  type: AppTxType.SWAP;
  payload: { tokenIn: string; tokenOut: string; amount: number };
};

export type TransactionUnion = SwapTx;
```

---

### ☁️ 3. Backend Server Actions (`actions.ts`)

```typescript
// src/app/actions.ts
'use server';

import { Quasar, MiniSessionAuth, utils } from '@tuwaio/quasar-sdk';
import { TransactionUnion } from '@/types';

const quasar = new Quasar({ secretKey: process.env.QUASAR_SDK_SK ?? '' });

export async function syncTransaction(tx: TransactionUnion, authData: MiniSessionAuth) {
  const isValid = await utils.verifyMiniSession(authData);
  if (!isValid) throw new Error('Invalid signature.');

  await quasar.pulsar.syncCreate(tx, 'My App');
  return { success: true };
}

export async function getHistory(params: any, authData: MiniSessionAuth) {
  const isValid = await utils.verifyMiniSession(authData);
  if (!isValid) throw new Error('Invalid signature.');

  return quasar.pulsar.getHistory(params);
}
```

---

### 🔐 4. Client Auth Store (`useAuthStore.ts`)

```typescript
// src/hooks/useAuthStore.ts
import { utils } from '@tuwaio/quasar-sdk';

export const useAuthStore = utils.createMiniSessionStore('quasar-mini-session-storage');
```

---

### ⚙️ 5. Application Configuration (`appConfig.ts`)

Configure EVM chains, Wagmi connectors, default transports, and Solana RPC endpoints using SDK subpath imports:

```typescript
// src/configs/appConfig.ts
import { createDefaultTransports, impersonated } from '@tuwaio/evm-sdk/satellite';
import { createConfig, injected } from '@wagmi/core';
import { type Chain, mainnet, sepolia } from 'viem/chains';

export const solanaRPCUrls = {
  'solana:mainnet': 'https://api.mainnet-beta.solana.com',
  'solana:devnet': 'https://api.devnet.solana.com',
};

export const appEVMChains = [mainnet, sepolia] as readonly [Chain, ...Chain[]];

export const wagmiConfig = createConfig({
  connectors: [injected(), impersonated({})],
  transports: createDefaultTransports(appEVMChains),
  chains: appEVMChains,
  ssr: true,
  syncConnectedChain: true,
});
```

---

### ⚡ 6. Headless Tracking Store (`usePulsarStore.ts`)

```typescript
// src/hooks/usePulsarStore.ts
'use client';

import { createPulsarStore, createTxInMemoryStore, createBoundedUseStore } from '@tuwaio/sdk/pulsar';
import { pulsarEvmAdapter } from '@tuwaio/evm-sdk/pulsar';
import { pulsarSolanaAdapter } from '@tuwaio/solana-sdk/pulsar';
import { getMiniSessionAuth } from '@tuwaio/quasar-sdk/react';

import { getHistory, syncTransaction } from '@/app/actions';
import { wagmiConfig, appEVMChains, solanaRPCUrls } from '@/configs/appConfig';
import { TransactionUnion } from '@/types';

const storageName = 'transactions-tracking-storage';

const initialStore = createPulsarStore<TransactionUnion>({
  name: storageName,
  adapter: [pulsarEvmAdapter(wagmiConfig, appEVMChains), pulsarSolanaAdapter({ rpcUrls: solanaRPCUrls })],
  beforeTxProcess: async () => {
    await getMiniSessionAuth();
  },
  onRemoteCreate: async (tx) => {
    try {
      const auth = await getMiniSessionAuth();
      await syncTransaction(tx as TransactionUnion, auth);
    } catch (err) {
      console.error('[PulsarHook] Remote sync failed:', err);
    }
  },
});

export const usePulsarStore = createBoundedUseStore(initialStore);

const pulsarInMemoryStore = createTxInMemoryStore<TransactionUnion>({
  localTransactionsPool: initialStore.getState().transactionsPool,
  getHistory: async ({ page, walletAddress }) => {
    try {
      const auth = await getMiniSessionAuth();
      const history = await getHistory({ walletAddress, page, limit: 10, appName: 'My App' }, auth);
      if (!history) return null;

      return { ...history, docs: history.docs as TransactionUnion[] };
    } catch (error) {
      console.error('[PulsarHook] Failed to fetch history:', error);
      throw error;
    }
  },
  onHistoryFetched: async (remoteTxs) => {
    await initialStore.getState().injectExternalPendingTxs(remoteTxs);
  },
});

initialStore.subscribe((s) => pulsarInMemoryStore.getState().syncWithLocalPool(s.transactionsPool));

export const usePulsarInMemoryStore = createBoundedUseStore(pulsarInMemoryStore);
```

---

### 🌉 7. Quasar Auth Bridge (`QuasarSDKAuthProvider.tsx`)

```tsx
// src/providers/QuasarSDKAuthProvider.tsx
'use client';

import { useContext, useEffect } from 'react';
import { useSatelliteConnectStore, SatelliteStoreContext } from '@tuwaio/sdk/satellite';
import { QuasarActiveConnection, QuasarAuthBridge as QuasarSDKAuthBridge } from '@tuwaio/quasar-sdk/react';
import { wagmiConfig } from '@/configs/appConfig';
import { useAuthStore } from '@/hooks/useAuthStore';

export function QuasarAuthBridge() {
  const activeConnection = useSatelliteConnectStore((s) => s.activeConnection);
  const store = useContext(SatelliteStoreContext);

  const session = useAuthStore((s) => s.miniSession);
  const setSession = useAuthStore((s) => s.setMiniSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    if (!activeConnection?.isConnected) {
      clearSession();
    }
  }, [activeConnection?.isConnected, clearSession]);

  if (!activeConnection || !store) return null;

  return (
    <QuasarSDKAuthBridge
      activeConnection={activeConnection as QuasarActiveConnection}
      store={store as any}
      wagmiConfig={wagmiConfig}
      session={session}
      setSession={setSession}
    />
  );
}
```

---

### 📺 8. Nova Transactions Provider (`NovaTransactionsProvider.tsx`)

```tsx
// src/providers/NovaTransactionsProvider.tsx
'use client';

import { useSatelliteConnectStore } from '@tuwaio/sdk/satellite';
import { useInitializeTransactionsPool, type TxInMemoryPagination } from '@tuwaio/sdk/pulsar';
import { getAdapterFromConnectorType } from '@tuwaio/sdk/orbit';
import { NovaTransactionsProvider as NTP } from '@tuwaio/sdk/nova-transactions/providers';
import { usePulsarInMemoryStore, usePulsarStore } from '@/hooks/usePulsarStore';

export function NovaTransactionsProvider({ pagination }: { pagination: TxInMemoryPagination }) {
  const initialTx = usePulsarStore((s) => s.initialTx);
  const closeTxTrackedModal = usePulsarStore((s) => s.closeTxTrackedModal);
  const executeTxAction = usePulsarStore((s) => s.executeTxAction);
  const initializeTransactionsPool = usePulsarStore((s) => s.initializeTransactionsPool);

  const activeConnection = useSatelliteConnectStore((s) => s.activeConnection);
  const getAdapter = usePulsarStore((s) => s.getAdapter);
  const transactionsPool = usePulsarInMemoryStore((s) => s.transactionsPool);

  useInitializeTransactionsPool({ initializeTransactionsPool });

  return (
    <NTP
      transactionsPool={transactionsPool}
      initialTx={initialTx}
      closeTxTrackedModal={closeTxTrackedModal}
      executeTxAction={executeTxAction}
      connectedWalletAddress={activeConnection?.isConnected ? activeConnection.address : undefined}
      connectedAdapterType={getAdapterFromConnectorType(activeConnection?.connectorType ?? 'evm:')}
      adapter={getAdapter()}
      pagination={pagination}
    />
  );
}
```

---

### 🚀 9. Assembling Application Providers (`AppProviders.tsx`)

```tsx
// src/providers/AppProviders.tsx
'use client';

import { SatelliteConnectProvider } from '@tuwaio/sdk/satellite';
import { NovaConnectProvider } from '@tuwaio/sdk/nova-connect';
import { satelliteEVMAdapter } from '@tuwaio/evm-sdk/satellite';
import { EVMConnectorsWatcher } from '@tuwaio/evm-sdk/nova-connect';
import { satelliteSolanaAdapter } from '@tuwaio/solana-sdk/satellite';
import { SolanaConnectorsWatcher } from '@tuwaio/solana-sdk/nova-connect';
import { getMiniSessionAuth } from '@tuwaio/quasar-sdk/react';

import { appEVMChains, solanaRPCUrls, wagmiConfig } from '@/configs/appConfig';
import { usePulsarInMemoryStore, usePulsarStore } from '@/hooks/usePulsarStore';
import { NovaTransactionsProvider } from '@/providers/NovaTransactionsProvider';
import { QuasarAuthBridge } from '@/providers/QuasarSDKAuthProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const getAdapter = usePulsarStore((s) => s.getAdapter);
  const transactionsPool = usePulsarInMemoryStore((s) => s.transactionsPool);

  const isLoading = usePulsarInMemoryStore((s) => s.isLoading);
  const isError = usePulsarInMemoryStore((s) => s.isError);
  const currentPage = usePulsarInMemoryStore((s) => s.currentPage);
  const hasMore = usePulsarInMemoryStore((s) => s.hasMore);
  const fetchNextPage = usePulsarInMemoryStore((s) => s.fetchNextPage);
  const fetchInitial = usePulsarInMemoryStore((s) => s.fetchInitial);

  const pagination = { isLoading, isError, currentPage, hasMore, fetchNextPage };

  return (
    <SatelliteConnectProvider
      adapter={[satelliteEVMAdapter(wagmiConfig, appEVMChains), satelliteSolanaAdapter({ rpcUrls: solanaRPCUrls })]}
      autoConnect={true}
      callbackAfterConnected={async (connection) => {
        try {
          await getMiniSessionAuth();
          setTimeout(() => fetchInitial(connection.address), 2000);
        } catch (err) {
          console.error('[QuasarAuth] Auto-authentication failed:', err);
          setTimeout(() => fetchInitial(connection.address), 2000);
        }
      }}
    >
      <EVMConnectorsWatcher wagmiConfig={wagmiConfig} />
      <SolanaConnectorsWatcher />

      <QuasarAuthBridge />
      <NovaTransactionsProvider pagination={pagination} />

      <NovaConnectProvider
        appChains={appEVMChains}
        solanaRPCUrls={solanaRPCUrls}
        transactionPool={transactionsPool}
        pulsarAdapter={getAdapter() as any}
        withImpersonated
        withBalance
        withChain
        pagination={pagination}
      >
        {children}
      </NovaConnectProvider>
    </SatelliteConnectProvider>
  );
}
```

---

### 💻 10. Rendering UI Components (`page.tsx`)

Render **`<ConnectButton />`** and **`<TxActionButton />`** anywhere in your application:

```tsx
// src/app/page.tsx
'use client';

import { ConnectButton } from '@tuwaio/sdk/nova-connect';
import { TxActionButton } from '@tuwaio/sdk/nova-transactions';
import { getAdapterFromConnectorType, OrbitAdapter } from '@tuwaio/sdk/orbit';
import { useSatelliteConnectStore } from '@tuwaio/sdk/satellite';

import { usePulsarInMemoryStore, usePulsarStore } from '@/hooks/usePulsarStore';
import { AppTxType } from '@/types';

export default function HomePage() {
  const executeTxAction = usePulsarStore((s) => s.executeTxAction);
  const getLastTxKey = usePulsarStore((s) => s.getLastTxKey);
  const transactionsPool = usePulsarInMemoryStore((s) => s.transactionsPool);
  const activeConnection = useSatelliteConnectStore((s) => s.activeConnection);

  const handleSwapAction = async () => {
    const adapterType = activeConnection?.connectorType
      ? getAdapterFromConnectorType(activeConnection.connectorType)
      : OrbitAdapter.EVM;
    const isEvm = adapterType === OrbitAdapter.EVM;

    await executeTxAction({
      actionFunction: async () => {
        // Execute smart contract call (e.g. writeContract via Viem/Wagmi or sendTransaction via Gill)
        /* return await swapTokensContractCall(); */
      },
      onSuccess: (tx) => {
        console.log('Swap transaction completed successfully:', tx);
      },
      params: {
        type: AppTxType.SWAP,
        adapter: adapterType,
        desiredChainID: isEvm ? 1 : 'mainnet',
        rpcUrl: isEvm ? undefined : activeConnection?.rpcURL,
        title: ['Swapping Tokens', 'Tokens Swapped', 'Error During Swap', 'Swap Transaction Replaced'],
        description: [
          `Swapping 100 USDC for ${isEvm ? 'ETH' : 'SOL'}...`,
          `Success! Swapped 100 USDC for ${isEvm ? 'ETH' : 'SOL'}.`,
          'Something went wrong during token swap.',
          'Transaction was replaced in wallet.',
        ],
        payload: {
          tokenIn: 'USDC',
          tokenOut: isEvm ? 'ETH' : 'SOL',
          amount: 100,
        },
        withTrackedModal: true,
        requiredConfirmations: isEvm ? 3 : undefined,
      },
    });
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold">TUWA Multi-Chain App</h1>
        <ConnectButton />
      </header>

      <section className="p-6 bg-card rounded-xl border space-y-4">
        <h2 className="text-lg font-semibold">Execute Transaction</h2>
        <TxActionButton
          action={handleSwapAction}
          getLastTxKey={getLastTxKey}
          transactionsPool={transactionsPool}
          walletAddress={activeConnection?.address}
        >
          Execute Swap Action
        </TxActionButton>
      </section>
    </main>
  );
}
```

---

## 4. CSS Variables Reference (Complete)

Nova uses **CSS Variables** integrated with Tailwind. All variables use the `--tuwa-*` prefix.

### Light Theme (Default `:root`)

```css
:root {
  /* Status Colors - Success */
  --tuwa-success-bg: theme('colors.green.100');
  --tuwa-success-text: theme('colors.green.700');
  --tuwa-success-icon: theme('colors.green.500');

  /* Status Colors - Error */
  --tuwa-error-bg: theme('colors.red.100');
  --tuwa-error-text: theme('colors.red.700');
  --tuwa-error-icon: theme('colors.red.500');

  /* Status Colors - Pending */
  --tuwa-pending-bg: theme('colors.yellow.100');
  --tuwa-pending-text: theme('colors.yellow.800');
  --tuwa-pending-icon: theme('colors.yellow.600');

  /* Status Colors - Info */
  --tuwa-info-bg: theme('colors.gray.100');
  --tuwa-info-text: theme('colors.gray.600');
  --tuwa-info-icon: theme('colors.gray.500');

  /* Typography */
  --tuwa-text-primary: theme('colors.gray.900');
  --tuwa-text-secondary: theme('colors.gray.500');
  --tuwa-text-tertiary: theme('colors.gray.400');
  --tuwa-text-accent: theme('colors.blue.600');
  --tuwa-text-on-accent: theme('colors.white');

  /* Backgrounds */
  --tuwa-bg-primary: theme('colors.white');
  --tuwa-bg-secondary: theme('colors.gray.50');
  --tuwa-bg-muted: theme('colors.gray.100');

  /* Borders */
  --tuwa-border-primary: theme('colors.gray.200');
  --tuwa-border-secondary: theme('colors.gray.100');

  /* Buttons - Gradient (Primary Action) */
  --tuwa-button-gradient-from: theme('colors.blue.600');
  --tuwa-button-gradient-to: theme('colors.purple.600');
  --tuwa-button-gradient-from-hover: theme('colors.blue.700');
  --tuwa-button-gradient-to-hover: theme('colors.purple.700');

  /* Buttons - Standard (Secondary Action) */
  --tuwa-standart-button-bg: theme('colors.gray.100');
  --tuwa-standart-button-hover: theme('colors.gray.200');

  /* Misc */
  --tuwa-testnet-icons: #c4bfb8;

  /* Shape & Focus */
  --tuwa-rounded-corners: 4px;
  --tuwa-ring-width: 2px;
}
```

### Dark Theme (`.dark` class)

Apply `.dark` class to your root element. All variables automatically switch:

```css
.dark {
  /* Status Colors - Success */
  --tuwa-success-bg: theme('colors.green.900');
  --tuwa-success-text: theme('colors.green.300');
  --tuwa-success-icon: theme('colors.green.400');

  /* Status Colors - Error */
  --tuwa-error-bg: theme('colors.red.900');
  --tuwa-error-text: theme('colors.red.300');
  --tuwa-error-icon: theme('colors.red.400');

  /* Status Colors - Pending */
  --tuwa-pending-bg: theme('colors.yellow.900');
  --tuwa-pending-text: theme('colors.yellow.300');
  --tuwa-pending-icon: theme('colors.yellow.400');

  /* Status Colors - Info */
  --tuwa-info-bg: theme('colors.gray.700');
  --tuwa-info-text: theme('colors.gray.300');
  --tuwa-info-icon: theme('colors.gray.400');

  /* Typography */
  --tuwa-text-primary: theme('colors.gray.50');
  --tuwa-text-secondary: theme('colors.gray.400');
  --tuwa-text-tertiary: theme('colors.gray.500');
  --tuwa-text-accent: theme('colors.blue.400');
  --tuwa-text-on-accent: theme('colors.white');

  /* Backgrounds */
  --tuwa-bg-primary: theme('colors.gray.900');
  --tuwa-bg-secondary: theme('colors.gray.800');
  --tuwa-bg-muted: theme('colors.gray.700');

  /* Borders */
  --tuwa-border-primary: theme('colors.gray.700');
  --tuwa-border-secondary: theme('colors.gray.800');

  /* Buttons - Gradient */
  --tuwa-button-gradient-from: theme('colors.blue.500');
  --tuwa-button-gradient-to: theme('colors.purple.500');
  --tuwa-button-gradient-from-hover: theme('colors.blue.600');
  --tuwa-button-gradient-to-hover: theme('colors.purple.600');

  /* Buttons - Standard */
  --tuwa-standart-button-bg: theme('colors.gray.700');
  --tuwa-standart-button-hover: theme('colors.gray.800');

  /* Misc */
  --tuwa-testnet-icons: #c4bfb8;
}
```

### Variables Quick Reference Table

| Variable | Purpose | Light Default | Dark Default |
| --- | --- | --- | --- |
| `--tuwa-text-primary` | Main text color | gray.900 | gray.50 |
| `--tuwa-text-secondary` | Secondary text | gray.500 | gray.400 |
| `--tuwa-text-tertiary` | Muted text | gray.400 | gray.500 |
| `--tuwa-text-accent` | Links, highlights | blue.600 | blue.400 |
| `--tuwa-text-on-accent` | Text on accent bg | white | white |
| `--tuwa-bg-primary` | Main background | white | gray.900 |
| `--tuwa-bg-secondary` | Cards, modals | gray.50 | gray.800 |
| `--tuwa-bg-muted` | Highlighted areas | gray.100 | gray.700 |
| `--tuwa-border-primary` | Main borders | gray.200 | gray.700 |
| `--tuwa-border-secondary` | Subtle borders | gray.100 | gray.800 |
| `--tuwa-success-*` | Success states | green.* | green.* (dark) |
| `--tuwa-error-*` | Error states | red.* | red.* (dark) |
| `--tuwa-pending-*` | Pending states | yellow.* | yellow.* (dark) |
| `--tuwa-info-*` | Info states | gray.* | gray.* (dark) |
| `--tuwa-rounded-corners` | Border radius | 4px | 4px |
| `--tuwa-ring-width` | Focus ring width | 2px | 2px |

---

## 5. Nova Package Customization

### NovaConnectProvider Options

```tsx
<NovaConnectProvider
  appChains={appEVMChains}          // Required: Supported EVM chains
  solanaRPCUrls={solanaRPCUrls}     // Optional: Solana RPC endpoints
  withBalance                        // Show wallet balance
  withChain                          // Show chain selector
  withImpersonated                   // Enable address impersonation
  labels={customLabels}              // i18n override
  customization={customization}      // Deep styling customization
>
```

### NovaTransactionsProvider Options

```tsx
<NovaTransactionsProvider
  transactionsPool={transactionsPool}       // From Pulsar store
  initialTx={initialTx}                     // Current tracked tx
  closeTxTrackedModal={closeTxTrackedModal} // Close handler
  executeTxAction={executeTxAction}         // Optional: direct tx execution
  connectedWalletAddress={address}          // Current wallet
  connectedAdapterType={TransactionAdapter.EVM}
  adapter={getAdapter()}                    // Pulsar adapter
  labels={txLabels}                         // i18n override
  customization={txCustomization}           // Deep styling customization
/>
```

### Customization Pattern: Shared Styles

Create a centralized styles file for consistency:

```typescript
// utils/customization/shared_styles.ts
import { cn } from '@tuwaio/nova-core';

export const SHARED_STYLES = {
  // Typography
  fontMono: 'font-[DM_Mono] font-light',
  fontMonoMedium: 'font-[DM_Mono] font-medium',

  // Text Colors (using TUWA variables)
  textPrimary: 'text-[var(--tuwa-text-primary)]',
  textSecondary: 'text-[var(--tuwa-text-secondary)]',
  textAccent: 'text-[var(--tuwa-text-accent)]',
  textError: 'text-[var(--tuwa-error-icon)]',

  // Background Colors
  bgBase: 'bg-[var(--tuwa-bg-secondary)]',
  bgDark: 'bg-[var(--tuwa-bg-primary)]',
  bgAccent: 'bg-[var(--tuwa-text-accent)]',
  bgMuted: 'bg-[var(--tuwa-bg-muted)]',

  // Borders
  borderDefault: 'border border-[var(--tuwa-border-primary)]',
  borderAccent: 'border-[var(--tuwa-text-accent)]',

  // Focus States
  baseFocus: cn(
    'focus:outline-none focus:ring-[length:var(--tuwa-ring-width)]',
    'focus:ring-offset-[length:var(--tuwa-ring-width)]',
    'focus:ring-[var(--tuwa-text-accent)]',
    'focus:ring-offset-[var(--tuwa-border-secondary)]',
  ),

  // Interactive States
  itemInteractive: cn(
    'transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-[length:var(--tuwa-ring-width)]',
    'focus:ring-offset-[length:var(--tuwa-ring-width)]',
    'focus:ring-[var(--tuwa-text-accent)]',
    'focus:ring-offset-[var(--tuwa-bg-secondary)]',
  ),

  // Rounded corners using variable
  rounded: 'rounded-[var(--tuwa-rounded-corners)]',
} as const;

// Reusable button patterns
export const BUTTON_STYLES = {
  primary: cn(
    'cursor-pointer inline-flex items-center justify-center gap-2',
    'rounded-[var(--tuwa-rounded-corners)] transition-all duration-200',
    'px-4 py-2 text-sm',
    'bg-[var(--tuwa-text-accent)] text-[var(--tuwa-text-on-accent)]',
    'hover:bg-[var(--tuwa-bg-muted)] hover:text-[var(--tuwa-text-primary)]',
  ),

  ghost: cn(
    'cursor-pointer inline-flex items-center justify-center gap-2',
    'rounded-[var(--tuwa-rounded-corners)] transition-all duration-200',
    'bg-[var(--tuwa-bg-secondary)]',
    'border border-[var(--tuwa-border-primary)]',
    'text-[var(--tuwa-text-primary)]',
    'hover:bg-[var(--tuwa-border-primary)]',
  ),

  danger: cn(
    'cursor-pointer inline-flex items-center justify-center gap-2',
    'rounded-[var(--tuwa-rounded-corners)] transition-all duration-200',
    'border border-[var(--tuwa-border-primary)]',
    'text-[var(--tuwa-text-primary)]',
    'hover:bg-[var(--tuwa-error-icon)]/10',
    'hover:border-[var(--tuwa-error-icon)]',
    'hover:text-[var(--tuwa-error-icon)]',
  ),
} as const;
```

### Customizing Nova Connect

```typescript
// utils/customization/nova_connect_provider.ts
import { NovaConnectProviderCustomization } from '@tuwaio/nova-connect';
import { cn } from '@tuwaio/nova-core';
import { SHARED_STYLES, BUTTON_STYLES } from './shared_styles';

export const nova_connect_customization: NovaConnectProviderCustomization = {
  modals: {
    connectModal: {
      classNames: {
        modalContainer: () => 'bg-[var(--tuwa-bg-secondary)]',
        header: () => cn(
          'bg-[var(--tuwa-bg-secondary)]',
          'border-b border-[var(--tuwa-border-primary)]',
        ),
        title: () => cn(SHARED_STYLES.fontMonoMedium, SHARED_STYLES.textPrimary),
        closeButton: () => cn(
          'cursor-pointer rounded-[var(--tuwa-rounded-corners)] p-1 transition-colors',
          SHARED_STYLES.textSecondary,
          'hover:bg-[var(--tuwa-bg-muted)]',
          SHARED_STYLES.baseFocus,
        ),
        mainContent: () => 'bg-[var(--tuwa-bg-secondary)]',
        footer: () => cn(
          'bg-[var(--tuwa-bg-secondary)]',
          'border-t border-[var(--tuwa-border-primary)]',
        ),
        backButton: () => BUTTON_STYLES.ghost,
        actionButton: () => BUTTON_STYLES.primary,
      },

      childComponents: {
        connectorsSelections: {
          connectorsBlock: {
            installed: {
              classNames: {
                title: () => cn(
                  SHARED_STYLES.fontMonoMedium,
                  SHARED_STYLES.textAccent,
                  'text-sm uppercase tracking-wide',
                ),
              },
            },
          },
        },

        connecting: {
          classNames: {
            container: () => 'flex flex-col gap-4 items-center justify-center w-full',
            statusContainer: ({ statusData }) => cn(
              'relative flex items-center justify-center',
              'min-w-[110px] min-h-[110px]',
              'border-2 rounded-full p-4',
              'transition-all duration-300 ease-in-out',
              statusData.state === 'error'
                ? 'border-[var(--tuwa-error-icon)] bg-[var(--tuwa-error-icon)]/5'
                : statusData.state === 'success'
                  ? 'border-[var(--tuwa-text-accent)] bg-[var(--tuwa-text-accent)]/5'
                  : 'border-[var(--tuwa-border-primary)] bg-[var(--tuwa-bg-secondary)]',
            ),
            spinner: () => cn(
              'absolute animate-spin rounded-full -inset-[2px]',
              'border-2 border-[var(--tuwa-text-accent)] border-t-transparent',
            ),
          },
        },
      },
    },
  },
};
```

### Customizing Transactions Toast

```typescript
// utils/customization/nova_tx_provider.ts
import { cn } from '@tuwaio/nova-core';
import { NovaTransactionsProviderProps } from '@tuwaio/nova-transactions/providers';
import { SHARED_STYLES, BUTTON_STYLES } from './shared_styles';

export const nova_tx_customization: NovaTransactionsProviderProps<any>['customization'] = {
  toast: {
    classNames: {
      container: cn(
        'rounded-[var(--tuwa-rounded-corners)]',
        'border border-[var(--tuwa-border-primary)]',
        'bg-[var(--tuwa-bg-secondary)]',
      ),
      title: cn(SHARED_STYLES.fontMonoMedium, 'text-sm', SHARED_STYLES.textPrimary),
      description: cn(SHARED_STYLES.fontMono, 'mt-1 text-xs', SHARED_STYLES.textSecondary),
      hashLink: cn(
        SHARED_STYLES.fontMono,
        'text-[var(--tuwa-text-accent)]',
        'hover:underline transition-colors',
      ),
      statusBadge: cn(SHARED_STYLES.fontMono, 'text-xs font-medium'),
      speedUpButton: BUTTON_STYLES.primary,
    },
  },

  trackingTxModal: {
    classNames: {
      container: 'bg-[var(--tuwa-bg-secondary)]',
      header: cn(
        'bg-[var(--tuwa-bg-secondary)]',
        'border-[var(--tuwa-border-primary)]',
      ),
      headerTitle: cn(SHARED_STYLES.fontMonoMedium, SHARED_STYLES.textPrimary),
    },
  },
};
```

### Internationalization

```tsx
const connectLabels = {
  connectWallet: 'Подключить кошелек',
  disconnect: 'Отключить',
  connecting: 'Подключение...',
  connected: 'Подключен',
};

const transactionsLabels = {
  statuses: {
    pending: 'В обработке...',
    success: 'Успешно!',
    failed: 'Ошибка!',
  },
  toast: {
    openTransactionsInfo: 'Показать транзакции',
  },
};

<NovaConnectProvider labels={connectLabels}>
  <NovaTransactionsProvider labels={transactionsLabels} />
</NovaConnectProvider>
```

---

## 6. Pulsar EVM Standalone (Without Full Store)

Use low-level trackers directly without the complete Pulsar store.

### Why Use `evmTracker`?

| Feature | `waitForTransactionReceipt` (viem) | `evmTracker` (Pulsar) |
|---|---|---|
| Handles RPC Lags | ❌ No | ✅ Built-in retry mechanism |
| Full Lifecycle Support | 🤷 Limited | ✅ All stages with callbacks |
| Fetches Full Tx Details | ❌ No | ✅ Yes via `getTransaction` |
| Abstraction Level | Low | High |

### EVM Tracker Example

```tsx
import { evmTracker } from '@tuwaio/pulsar-evm';
import { config } from './wagmi';

async function trackMyTransaction(txHash: string, chainId: number) {
  await evmTracker({
    config,
    tx: {
      txKey: txHash,
      chainId,
    },
    onTxDetailsFetched: (txDetails) => {
      console.log('Transaction details received:', txDetails);
    },
    onSuccess: async (txDetails, receipt, client) => {
      console.log('Transaction mined!', receipt);
    },
    onReplaced: (replacement) => {
      console.log('Transaction was replaced:', replacement);
    },
    onFailure: (error) => {
      console.error('Tracking failed:', error);
    },
  });
}
```

### Gelato & Safe Fetchers

```tsx
import { initializePollingTracker } from '@tuwaio/pulsar-core';
import { gelatoFetcher, safeFetcher } from '@tuwaio/pulsar-evm';

// Tracking a Gelato relay task
async function trackGelatoTask(taskId: string) {
  await initializePollingTracker({
    tx: { txKey: taskId },
    fetcher: gelatoFetcher,
    onSuccess: (status) => console.log('Gelato task succeeded:', status),
    onFailure: (status) => console.error('Gelato task failed:', status),
  });
}

// Tracking a Safe multisig transaction
async function trackSafeTx(safeTxHash: string, chainId: number, fromAddress: string) {
  await initializePollingTracker({
    tx: { txKey: safeTxHash, chainId, from: fromAddress },
    fetcher: safeFetcher,
    onSuccess: (status) => console.log('Safe transaction succeeded:', status),
    onFailure: (status) => console.error('Safe transaction failed:', status),
    onReplaced: (replacement) => console.warn('Transaction was replaced:', replacement),
  });
}
```

### Helper: `checkTransactionsTracker`

```tsx
import { checkTransactionsTracker } from '@tuwaio/pulsar-evm';

const { tracker, txKey } = checkTransactionsTracker('0xabc...', 'injected');
// tracker -> 'ethereum' or relevant tracker type
// txKey -> same as input or derived key
```

---

## 7. Pulsar Solana Standalone (Without Full Store)

### Why Use `solanaFetcher`?

| Feature | Solana RPC (manual) | `solanaFetcher` (Pulsar) |
|---|---|---|
| Handles RPC Lags | ❌ No | ✅ Built-in retry mechanism |
| Full Lifecycle Support | 🤷 Limited | ✅ All stages with callbacks |
| Fetches Full Tx Details | ❌ Extra RPC calls needed | ✅ Yes, automatically |
| Abstraction Level | Low | High |

### Solana Tracker Example

```tsx
import { initializePollingTracker } from '@tuwaio/pulsar-core';
import { solanaFetcher } from '@tuwaio/pulsar-solana';
import { OrbitAdapter } from '@tuwaio/orbit-core';

async function trackMySolanaTransaction(txSignature: string, rpcUrl: string, chainId: string) {
  await initializePollingTracker({
    tx: {
      txKey: txSignature,
      rpcUrl: rpcUrl,
      chainId: chainId, // e.g., 'solana:mainnet' or 'solana:devnet'
      adapter: OrbitAdapter.SOLANA,
      localTimestamp: Math.floor(Date.now() / 1000),
    },
    fetcher: solanaFetcher,
    onIntervalTick: (response) => {
      console.log('Transaction status update:', response);
    },
    onSuccess: (response) => {
      console.log('Transaction finalized!', response);
    },
    onFailure: (response) => {
      console.error('Tracking failed or transaction error:', response?.err);
    },
  });
}
```

### Helper: `signAndSendSolanaTx`

```tsx
import type { Instruction, SolanaClient, TransactionSendingSigner } from 'gill';
import { signAndSendSolanaTx } from '@tuwaio/pulsar-solana';

async function sendTransaction(
  client: SolanaClient,
  signer: TransactionSendingSigner,
  instruction: Instruction | Instruction[]
) {
  const signature = await signAndSendSolanaTx({
    client,
    signer,
    instruction,
  });
  console.log('Transaction sent with signature:', signature);
  return signature;
}
```

### Helper: `checkSolanaChain`

```tsx
import { checkSolanaChain } from '@tuwaio/pulsar-solana';

function ensureCorrectNetwork(requiredChain: string, currentChain: string) {
  try {
    checkSolanaChain(requiredChain, currentChain);
    console.log('Network is correct, proceeding...');
  } catch (error) {
    console.error('Network mismatch:', error.message);
  }
}
```

---

## 8. Quick Start Templates (Cosmos Playground)

Use the CLI to scaffold a new project:

```bash
npx @tuwaio/create-cosmos-playground
```

### Available Templates

| Template | Description |
| --- | --- |
| **`custom-style`** | Vite example with full customization of nova-transactions and nova-connect |
| **`nextjs-tuwa`** | Next.js example with dynamic switching between Solana and EVM adapters |
| **`nextjs-solana`** | Next.js example demonstrating Solana transaction tracking |
| **`nextjs-evm`** | Next.js example demonstrating EVM transaction tracking |
| **`vite-tuwa`** | Simple Vite-based example with Nova Connect |

**Live Demo:** [https://custom-style.tuwa.io/](https://custom-style.tuwa.io/)

---

## 9. AI Agent Guidelines (Rules of Engagement)

When acting as a developer using TUWA, you must strictly adhere to these rules:

### 1. Dependency Integrity

* **NEVER** install `ethers.js` or `web3.js`. Always use `viem` and `wagmi`.
* **NEVER** use `@solana/web3.js` legacy classes directly. Use `gill` or `@tuwaio/orbit-solana` helpers.
* **NEVER** mix Satellite (connection state) logic with Orbit (utilities) logic.

### 2. State Management

* **DO NOT** create local `useState` for transaction loading states (`isLoading`, `isSuccess`).
* **ALWAYS** use `usePulsarStore` -> `executeTxAction` for blockchain writes.
* **ALWAYS** use `immer` patterns (`produce`) when modifying complex state manually.
* **ALWAYS** use atomic selectors from Zustand stores to prevent re-renders.

### 3. Visual Consistency

* Use `@tuwaio/nova-core` utility `cn()` for class merging.
* Use Tailwind classes for layout.
* Use `--tuwa-*` CSS variables for coloring to respect the user's theme.
* Use `--tuwa-rounded-corners` for all border radius values.
* Use `--tuwa-ring-width` for focus ring widths.

### 4. Code Quality

* Run `pnpm lint --fix` after generating implementation code.
* Strictly define types for Transaction payloads in Pulsar.
* Use TypeScript strict mode.

---

## 10. Package Summary

### Core Packages

| Package | NPM | Purpose |
| --- | --- | --- |
| `@tuwaio/orbit-core` | [![NPM](https://img.shields.io/npm/v/@tuwaio/orbit-core.svg)](https://npmjs.com/package/@tuwaio/orbit-core) | Types, adapter system, utilities |
| `@tuwaio/orbit-evm` | [![NPM](https://img.shields.io/npm/v/@tuwaio/orbit-evm.svg)](https://npmjs.com/package/@tuwaio/orbit-evm) | ENS, chain switching, Viem helpers |
| `@tuwaio/orbit-solana` | [![NPM](https://img.shields.io/npm/v/@tuwaio/orbit-solana.svg)](https://npmjs.com/package/@tuwaio/orbit-solana) | RPC client, name/avatar resolution |

### Connectivity Packages

| Package | NPM | Purpose |
| --- | --- | --- |
| `@tuwaio/satellite-core` | [![NPM](https://img.shields.io/npm/v/@tuwaio/satellite-core.svg)](https://npmjs.com/package/@tuwaio/satellite-core) | Universal store & types |
| `@tuwaio/satellite-evm` | [![NPM](https://img.shields.io/npm/v/@tuwaio/satellite-evm.svg)](https://npmjs.com/package/@tuwaio/satellite-evm) | Wagmi/Viem bridge |
| `@tuwaio/satellite-solana` | [![NPM](https://img.shields.io/npm/v/@tuwaio/satellite-solana.svg)](https://npmjs.com/package/@tuwaio/satellite-solana) | Gill/Wallet Standard bridge |
| `@tuwaio/satellite-react` | [![NPM](https://img.shields.io/npm/v/@tuwaio/satellite-react.svg)](https://npmjs.com/package/@tuwaio/satellite-react) | React provider & hooks |
| `@tuwaio/satellite-siwe-next-auth` | [![NPM](https://img.shields.io/npm/v/@tuwaio/satellite-siwe-next-auth.svg)](https://npmjs.com/package/@tuwaio/satellite-siwe-next-auth) | SIWE authentication for Next.js |

### Transaction Packages

| Package | NPM | Purpose |
| --- | --- | --- |
| `@tuwaio/pulsar-core` | [![NPM](https://img.shields.io/npm/v/@tuwaio/pulsar-core.svg)](https://npmjs.com/package/@tuwaio/pulsar-core) | Headless state machine |
| `@tuwaio/pulsar-evm` | [![NPM](https://img.shields.io/npm/v/@tuwaio/pulsar-evm.svg)](https://npmjs.com/package/@tuwaio/pulsar-evm) | EVM adapter (Standard, Safe, Gelato) |
| `@tuwaio/pulsar-solana` | [![NPM](https://img.shields.io/npm/v/@tuwaio/pulsar-solana.svg)](https://npmjs.com/package/@tuwaio/pulsar-solana) | Solana adapter |
| `@tuwaio/pulsar-react` | [![NPM](https://img.shields.io/npm/v/@tuwaio/pulsar-react.svg)](https://npmjs.com/package/@tuwaio/pulsar-react) | React bindings & hooks |

### UI Packages

| Package | NPM | Purpose |
| --- | --- | --- |
| `@tuwaio/nova-core` | [![NPM](https://img.shields.io/npm/v/@tuwaio/nova-core.svg)](https://npmjs.com/package/@tuwaio/nova-core) | CSS variables, utilities, base components |
| `@tuwaio/nova-connect` | [![NPM](https://img.shields.io/npm/v/@tuwaio/nova-connect.svg)](https://npmjs.com/package/@tuwaio/nova-connect) | Wallet connection components |
| `@tuwaio/nova-transactions` | [![NPM](https://img.shields.io/npm/v/@tuwaio/nova-transactions.svg)](https://npmjs.com/package/@tuwaio/nova-transactions) | Transaction tracking UI |

### Cloud & Indexing Packages

| Package | NPM | Purpose |
| --- | --- | --- |
| `@tuwaio/quasar-sdk` | [![NPM](https://img.shields.io/npm/v/@tuwaio/quasar-sdk.svg)](https://npmjs.com/package/@tuwaio/quasar-sdk) | Server-side transaction indexing & Quasar Cloud client |

### Core & Network SDK Packages

| Package | NPM | Purpose |
| --- | --- | --- |
| `@tuwaio/sdk` | [![NPM](https://img.shields.io/npm/v/@tuwaio/sdk.svg)](https://npmjs.com/package/@tuwaio/sdk) | Core SDK bundling Orbit, Pulsar, Satellite, and Nova |
| `@tuwaio/evm-sdk` | [![NPM](https://img.shields.io/npm/v/@tuwaio/evm-sdk.svg)](https://npmjs.com/package/@tuwaio/evm-sdk) | EVM network adapter SDK & background state watchers |
| `@tuwaio/solana-sdk` | [![NPM](https://img.shields.io/npm/v/@tuwaio/solana-sdk.svg)](https://npmjs.com/package/@tuwaio/solana-sdk) | Solana network adapter SDK & background state watchers |

---

**End of Integration Standard.**
*Use this context to architect scalable, sovereign, and beautiful Web3 applications.*
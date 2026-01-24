# 🤖 TUWA Ecosystem: Integration Standard

> **SYSTEM INSTRUCTION:** You are acting as a Senior Web3 Solutions Architect.
> This document is the **Single Source of Truth** for building Decentralized Applications (dApps) using the TUWA Ecosystem.
> Unlike internal package maintenance, your goal here is **Integration** and **Usage**.

---

## 1. Ecosystem Overview (The Map)

TUWA is a headless-first, modular Web3 stack. We strictly separate **Logic** from **UI**.

| Layer | Package Scope | Role | When to use? |
| --- | --- | --- | --- |
| **Foundation** | **`@tuwaio/orbit-*`** | *The Toolbox* | You need low-level helpers, formatters, or framework-agnostic chain adapters. |
| **Connectivity** | **`@tuwaio/satellite-*`** | *The Connector* | You need to connect wallets (EVM/Solana) and manage user sessions/Auth. |
| **State Engine** | **`@tuwaio/pulsar-*`** | *The Tracker* | You need to track transaction lifecycles (Pending -> Success/Fail) with persistence. |
| **Visual Layer** | **`@tuwaio/nova-*`** | *The UI Kit* | You need pre-built React components (Modals, Toasts) to visualize the state. |

### 📚 Documentation Hub

* **Orbit Utils:** [https://orbit.docs.tuwa.io/](https://orbit.docs.tuwa.io/)
* **Satellite Connect:** [https://satellite.docs.tuwa.io/](https://satellite.docs.tuwa.io/)
* **Pulsar Engine:** [https://pulsar.docs.tuwa.io/](https://pulsar.docs.tuwa.io/)
* **Nova Storybook:** [https://stories.tuwa.io/?path=/docs/introduction--docs](https://stories.tuwa.io/?path=/docs/introduction--docs)

---

## 2. Technical Stack Requirements (STRICT)

Any project using TUWA must adhere to these constraints to ensure stability and compatibility.

* **Runtime:** **Node.js v20 - v24** (LTS).
* ⚠️ **CRITICAL:** **Node v25+ is PROHIBITED**. It causes known instability with `localStorage` and `vitest`.


* **Package Manager:** `pnpm` (Recommended) or `npm`.
* **Framework:** React v19+ / Next.js 16+ (App Router).
* **Styling:** Tailwind CSS v4.
* **Language:** TypeScript v5.9+ (Strict Mode).

---

## 3. Getting Started: The "Golden Path"

Follow this sequence to integrate the full TUWA stack into a React application.

### Step 1: Installation (The Full Stack)

Install the complete TUWA ecosystem along with all mandatory peer dependencies for State, Web3, and UI.

```bash
# 1. TUWA Ecosystem (Logic & UI)
pnpm add @tuwaio/orbit-core @tuwaio/orbit-evm @tuwaio/orbit-solana \
         @tuwaio/satellite-core @tuwaio/satellite-evm @tuwaio/satellite-solana @tuwaio/satellite-react \
         @tuwaio/pulsar-core @tuwaio/pulsar-evm @tuwaio/pulsar-solana @tuwaio/pulsar-react \
         @tuwaio/nova-core @tuwaio/nova-connect @tuwaio/nova-transactions

# 2. State & Utilities (CRITICAL)
# 'immer' -> Required for immutable state updates in Pulsar/Satellite
# 'dayjs' -> Required for transaction timestamp formatting
# 'clsx/tailwind-merge' -> Required for Nova's style composition
pnpm add zustand immer dayjs clsx tailwind-merge

# 3. Web3 Infrastructure
# 'gill' -> Modern Solana RPC client used by Orbit
# '@wallet-standard/react' -> Required for Solana wallets
# '@tanstack/react-query' -> Required peer dependency for Wagmi
pnpm add viem wagmi @wagmi/core @tanstack/react-query \
         gill @wallet-standard/react

# 4. UI Dependencies (Nova Foundation)
# 'framer-motion' & '@emotion/is-prop-valid' -> Animations core
# '@radix-ui/*' -> Primitives for Modals and Dropdowns
# '@web3icons/*' -> Chain and Token logos
# 'ethereum-blockies-base64' -> Default wallet avatars
# 'react-toastify' -> Notification system for Transactions
pnpm add framer-motion @emotion/is-prop-valid \
         @radix-ui/react-dialog @radix-ui/react-select \
         @heroicons/react \
         @web3icons/react @web3icons/common \
         ethereum-blockies-base64 react-toastify

```

### Step 2: Setup CSS with Tailwind CSS v4

Configure your global styles to import Nova's design system.

```css
/* src/styles/app.css */

/* 1. Import Nova foundation (REQUIRED) */
@import '@tuwaio/nova-core/dist/index.css';

/* 2. Import Nova feature packages */
@import '@tuwaio/nova-connect/dist/index.css';
@import '@tuwaio/nova-transactions/dist/index.css';

/* 3. Import Tailwind CSS */
@import 'tailwindcss';

/* 4. Custom Theme Extensions */
@theme {
  --animate-float: float var(--tw-duration, 4000ms) var(--tw-ease, ease-in-out) infinite;
}

```

### Step 3: Configure Wagmi (EVM Layer)

Set up the standard Wagmi configuration using Satellite's transports.

```tsx
// src/config/appConfig.ts
import { createConfig } from '@wagmi/core';
import { injected } from '@wagmi/connectors';
import { mainnet, sepolia } from 'viem/chains';
import type { Chain } from 'viem/chains';
import { createDefaultTransports } from '@tuwaio/satellite-evm';

export const appEVMChains = [
  mainnet,
  sepolia,
] as readonly [Chain, ...Chain[]];

export const wagmiConfig = createConfig({
  connectors: [injected()], // Add other connectors here (WalletConnect, Coinbase)
  transports: createDefaultTransports(appEVMChains),
  chains: appEVMChains,
  ssr: true,
});

```

### Step 4: Create the Transaction Store (Pulsar)

Define your custom transaction types and initialize the headless store with the **FIFO** eviction policy.

```tsx
// src/hooks/usePulsarStore.ts
'use client';

import { createBoundedUseStore, createPulsarStore, Transaction } from '@tuwaio/pulsar-core';
import { evmAdapter } from '@tuwaio/pulsar-evm';
import { wagmiConfig, appEVMChains } from '@/config/appConfig';

const storageName = 'transactions-tracking-storage';

export enum TxType {
  swap = 'swap',
  transfer = 'transfer',
}

// Define custom payloads for your dApp
type SwapTx = Transaction & {
  type: TxType.swap;
  payload: { fromToken: string; toToken: string; amount: string };
};

type TransferTx = Transaction & {
  type: TxType.transfer;
  payload: { to: string; amount: string; token: string };
};

export type TransactionUnion = SwapTx | TransferTx;

// Initialize the store with persistence and adapters
export const usePulsarStore = createBoundedUseStore(
  createPulsarStore<TransactionUnion>({
    name: storageName,
    adapter: evmAdapter(wagmiConfig, appEVMChains),
    maxTransactions: 50, // FIFO Policy to prevent localStorage bloat
  }),
);

```

### Step 5: Setup Providers (The Architecture)

Wrap your app in the correct order: `Wagmi -> Satellite -> Nova Connect -> Nova Transactions`.

> **Note on Selectors:** We use atomic selectors in the wrapper to prevent unnecessary re-renders when the store updates.

```tsx
// src/providers/index.tsx
'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { satelliteEVMAdapter } from '@tuwaio/satellite-evm';
import { SatelliteConnectProvider, useSatelliteConnectStore } from '@tuwaio/nova-connect/satellite';
import { NovaConnectProvider } from '@tuwaio/nova-connect';
import { EVMWalletsWatcher } from '@tuwaio/nova-connect/evm';
import { NovaTransactionsProvider } from '@tuwaio/nova-transactions/providers';
import { TransactionAdapter } from '@tuwaio/pulsar-core';
import { useInitializeTransactionsPool } from '@tuwaio/pulsar-react';

import { wagmiConfig, appEVMChains } from '@/config/appConfig';
import { usePulsarStore } from '@/hooks/usePulsarStore';

const queryClient = new QueryClient();

// Bridge component to connect Headless Store (Pulsar) to UI (Nova)
function NovaTransactionsProviderWrapper() {
  // Use atomic selectors for performance
  const getAdapter = usePulsarStore((state) => state.getAdapter);
  const initialTx = usePulsarStore((state) => state.initialTx);
  const closeTxTrackedModal = usePulsarStore((state) => state.closeTxTrackedModal);
  const transactionsPool = usePulsarStore((state) => state.transactionsPool);
  const executeTxAction = usePulsarStore((state) => state.executeTxAction);
  const initializeTransactionsPool = usePulsarStore((state) => state.initializeTransactionsPool);
  
  // Get active connections state from Satellite
  const activeConnection = useSatelliteConnectStore((state) => state.activeConnection);

  // Initialize tracking for pending transactions on mount
  useInitializeTransactionsPool({ initializeTransactionsPool });

  return (
    <NovaTransactionsProvider
      transactionsPool={transactionsPool}
      initialTx={initialTx}
      closeTxTrackedModal={closeTxTrackedModal}
      executeTxAction={executeTxAction}
      connectedWalletAddress={activeConnection?.isConnected ? activeConnection.address : undefined}
      connectedAdapterType={TransactionAdapter.EVM}
      adapter={getAdapter()}
    />
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/* Layer 1: Connectivity Logic */}
        <SatelliteConnectProvider
          adapter={satelliteEVMAdapter(wagmiConfig)}
          autoConnect={true}
        >
          <EVMWalletsWatcher wagmiConfig={wagmiConfig} />
          
          {/* Layer 2: Connectivity UI */}
          <NovaConnectProvider
            appChains={appEVMChains}
            withBalance
            withChain
            withImpersonated
          >
            {/* Layer 3: Transaction UI */}
            <NovaTransactionsProviderWrapper />
            {children}
          </NovaConnectProvider>
        </SatelliteConnectProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

```

### Step 6: Usage in Components

Execute transactions using the "Headless -> UI" flow.

```tsx
// src/components/DemoApp.tsx
import { sepolia } from 'viem/chains';
import { OrbitAdapter } from '@tuwaio/orbit-core';
import { ConnectButton } from '@tuwaio/nova-connect/components';
import { usePulsarStore, TxType } from '@/hooks/usePulsarStore';

export function DemoApp() {
  // Select only the action executor
  const executeTxAction = usePulsarStore((state) => state.executeTxAction);

  // Define the blockchain interaction
  const swapAction = async () => {
    // Return the tx hash (0x...) from your contract write
    return "0x123..."; 
  };

  const executeSwap = async () => {
    await executeTxAction({
      actionFunction: swapAction, 
      onSuccess: (tx) => console.log('Swap executed!', tx),
      // Metadata for Nova UI
      params: {
        type: TxType.swap,
        adapter: OrbitAdapter.EVM,
        desiredChainID: sepolia.id, // Auto-switches network
        title: 'Swap ETH',
        description: 'Swapping 1 ETH for USDT',
        payload: { fromToken: 'ETH', toToken: 'USDT', amount: '1' },
        withTrackedModal: true, // Opens the Nova modal automatically
      },
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <ConnectButton />
      <button onClick={executeSwap} className="btn-primary">
        Execute Swap
      </button>
    </div>
  );
}

```

---

## 4. Theming & Customization

Nova uses **CSS Variables** integrated with Tailwind. You can override them globally in your CSS.

```css
/* src/styles/app.css */
:root {
  /* Brand Identity */
  --tuwa-color-primary: #6366f1; /* Indigo-500 */
  --tuwa-color-primary-hover: #4f46e5; /* Indigo-600 */

  /* Semantic Status Colors */
  --tuwa-success-bg: #d1fae5; /* Emerald-100 */
  --tuwa-success-text: #065f46; /* Emerald-800 */
  --tuwa-error-bg: #fee2e2; /* Red-100 */
  --tuwa-error-text: #991b1b; /* Red-800 */

  /* UI Gradients */
  --tuwa-gradient-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

/* Dark Mode Overrides */
.dark {
  --tuwa-color-primary: #818cf8; /* Indigo-400 */
  --tuwa-success-bg: #064e3b; /* Emerald-900 */
  --tuwa-success-text: #d1fae5; /* Emerald-100 */
}

```

---

## 5. AI Agent Guidelines (Rules of Engagement)

When acting as a developer using TUWA, you must strictly adhere to these rules:

1. **Dependency Integrity:**
* **NEVER** install `ethers.js` or `web3.js`. Always use `viem` and `wagmi`.
* **NEVER** use `@solana/web3.js` legacy classes directly. Use `gill` or `@tuwaio/orbit-solana` helpers.
* **NEVER** mix Satellite (UI) logic with Orbit (Core) logic.


2. **State Management:**
* **DO NOT** create local `useState` for transaction loading states (`isLoading`, `isSuccess`).
* **ALWAYS** use `usePulsarStore` -> `executeTxAction` for blockchain writes. This ensures persistence, global UI updates, and error handling.
* **ALWAYS** use `immer` patterns (`produce`) when modifying complex state manually.


3. **Visual Consistency:**
* Use `@tuwaio/nova-core` utility `cn()` for class merging.
* Use Tailwind classes for layout.
* Use Nova CSS variables for coloring to respect the user's theme.


4. **Code Quality:**
* Run `pnpm lint --fix` after generating implementation code.
* Strictly define types for Transaction payloads in Pulsar.



---

**End of Integration Standard.**
*Use this context to architect scalable, sovereign, and beautiful Web3 applications.*
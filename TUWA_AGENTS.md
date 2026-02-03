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
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Package Scope | Role | When to use? |
| --- | --- | --- | --- |
| **Foundation** | `@tuwaio/orbit-*` | *The Toolbox* | Low-level helpers, formatters, chain adapters |
| **Connectivity** | `@tuwaio/satellite-*` | *The Connector* | Wallet connections (EVM/Solana), session management |
| **State Engine** | `@tuwaio/pulsar-*` | *The Tracker* | Transaction lifecycle tracking with persistence |
| **Visual Layer** | `@tuwaio/nova-*` | *The UI Kit* | Pre-built React components (Modals, Toasts) |

### 📚 Documentation Hub

* **Orbit Utils:** [https://orbit.docs.tuwa.io/](https://orbit.docs.tuwa.io/)
* **Satellite Connect:** [https://satellite.docs.tuwa.io/](https://satellite.docs.tuwa.io/)
* **Pulsar Engine:** [https://pulsar.docs.tuwa.io/](https://pulsar.docs.tuwa.io/)
* **Nova Storybook:** [https://stories.tuwa.io/?path=/docs/introduction--docs](https://stories.tuwa.io/?path=/docs/introduction--docs)

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

## 3. Getting Started: The "Golden Path"

Follow this sequence to integrate the full TUWA stack into a React application.

### Step 1: Installation (The Full Stack)

Install the complete TUWA ecosystem along with all mandatory peer dependencies.

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

// Solana RPC URLs (optional)
export const solanaRPCUrls = {
  devnet: 'https://api.devnet.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com',
};
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

---

**End of Integration Standard.**
*Use this context to architect scalable, sovereign, and beautiful Web3 applications.*
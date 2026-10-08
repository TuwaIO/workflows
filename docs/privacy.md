# Privacy Policy
Last Updated: October 8, 2026

This Privacy Policy describes how FOP Tkach Oleksandr ("we," "us," or "our") collects, uses, and protects your information when you use the unified TUWA ecosystem, which includes the main site [tuwa.io](https://tuwa.io/), the showcase at [demo.tuwa.io](https://demo.tuwa.io/), the Quasar dashboard at [quasar.tuwa.io](https://quasar.tuwa.io/), the Custom Styles editor at [custom-style.tuwa.io](https://custom-style.tuwa.io/), the documentation at [docs.tuwa.io](https://docs.tuwa.io/) and [stories.tuwa.io](https://stories.tuwa.io/), and our open-source npm packages (Orbit Utils, SIWX, Satellite Connect, Pulsar, Nova UI Kit, the TUWA SDK and the Quasar SDK).

## 1. Open Source Ecosystem & Transparency
The core logical layers of TUWA are open-source and publicly available on [GitHub](https://github.com/TuwaIO). Our npm packages (`@tuwaio/orbit-*`, `@tuwaio/satellite-*`, `@tuwaio/pulsar-*`, `@tuwaio/nova-*`, `@tuwaio/siwx-*`, `@tuwaio/sdk` and the network add-ons) run in your own app and send no data to us. Quasar Community Edition runs on your own servers and sends no data to us either. We encourage you to review our [Documentation](https://docs.tuwa.io) to fully understand how data flows within these headless and UI-agnostic modules.

## 2. Core Principle: Self-Custody
TUWA is built for self-custody and keeps data on your device where it can. We NEVER ask for, access, or store your private keys. You maintain full sovereignty over your digital assets at all times.

## 3. Data Collection & Usage
To provide the ecosystem's features, we collect limited, specific data:
- **Registration & Notifications:** We collect your email address strictly for authentication, account management, and sending necessary operational notifications.
- **Wallet Sign-In:** If you sign in to the Quasar dashboard with a wallet (SIWX), we store its public address to identify your account.
- **Web3 Synchronization:** We collect public wallet addresses and transaction metadata to synchronize your on-chain history across devices via the Quasar cloud layer.
- **Billing Information:** If you choose to utilize our paid SaaS features or API quotas, we collect necessary billing and payment information to process transactions and maintain immutable billing histories.

We do not sell your personal data to third parties.

## 4. API Keys & Infrastructure
We utilize robust RPC infrastructure to process blockchain requests. Users have the option to provide their own custom RPC API keys (e.g., Alchemy, Infura, or custom endpoints). Any custom RPC endpoints and API keys you provide are encrypted at rest in our database (AES-256-GCM) and decrypted only by the Quasar engine when it calls your provider.

## 5. Data Storage and Protection
Most Web3 operations occur locally on your client device using Local Storage (for example, by Pulsar and Satellite Connect). Any data transmitted to Quasar Cloud is protected using industry-standard security measures, including transport layer security (TLS) and access controls that scope every record to its organization.

## 6. Your Rights (GDPR/CCPA Compliance)
You have the right to access the personal data associated with your account, request corrections, and request its complete deletion from our infrastructure at any time. To exercise these rights, please contact us at [admin@tuwa.io](mailto:admin@tuwa.io). Note that immutable on-chain data cannot be deleted.

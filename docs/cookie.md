# Cookie Policy
Last Updated: October 27, 2026

This Cookie Policy explains how the TUWA ecosystem—including [tuwa.io](https://tuwa.io/), [demo.tuwa.io](https://demo.tuwa.io/), [custom-style.tuwa.io](https://custom-style.tuwa.io/), the documentation sites and the [Quasar dashboard](https://quasar.tuwa.io)—uses cookies, Local Storage and similar browser storage to provide you with a secure, multi-chain Web3 experience.

## 1. Authentication & Session Cookies
We use session cookies for authorization where login is offered: in the Quasar dashboards, in the demo at [demo.tuwa.io](https://demo.tuwa.io) and in the wallet demo on [tuwa.io](https://tuwa.io). This includes Sign-In With X (SIWX) for multi-chain wallet authentication and the underlying Payload CMS authorization mechanism used by the Quasar dashboard. These cookies maintain your session and identity. Our other sites set no cookies of their own.

## 2. Platform Specifics
- **Main Website ([tuwa.io](https://tuwa.io)):** Sets a cookie only when you sign in with a wallet in the demo on the home page: a signed session cookie keeps you signed in for 30 minutes. Local Storage keeps the theme and the language you choose and, if you connect a wallet in the demo, the wallet, sign-in and transaction state described in Sections 3 and 4.
- **Demo ([demo.tuwa.io](https://demo.tuwa.io)):** When you sign in with a wallet, a signed session cookie keeps you signed in for 30 minutes. Local Storage keeps the wallet and transaction state described in Section 3.
- **Quasar Dashboard ([quasar.tuwa.io](https://quasar.tuwa.io)):** Uses session cookies for authentication and dashboard access.
- **Staging Quasar Dashboard ([quasar-stg.tuwa.io](https://quasar-stg.tuwa.io/)):** Uses the same session-cookie-based authentication and access model as the production dashboard.
- **Custom Styles ([custom-style.tuwa.io](https://custom-style.tuwa.io)):** Is purely client-side and does not use cookies. It relies on local state, standard caching and, if you connect a wallet or use the read-only Impersonate mode, the storage described in Sections 3 and 4.
- **Documentation ([docs.tuwa.io](https://docs.tuwa.io) and the project sites on subdomains of docs.tuwa.io):** Use no cookies. Local Storage keeps the theme and the language you choose and the tab you pick in the guides, such as EVM or Solana. The [Playground](https://docs.tuwa.io/playground) runs on simulated wallets: while you use it, it keeps the simulated connection, sign-in and transactions as described in Section 4.
- **Status page ([tuwa.io/status](https://tuwa.io/status)):** Our own page. The tuwa.io server reads the status of our services from UptimeRobot, so the page and the status badge on [tuwa.io](https://tuwa.io) set no cookies or browser storage of their own and your browser does not contact UptimeRobot.
- **Component explorer ([stories.tuwa.io](https://stories.tuwa.io)):** Uses no cookies. If you switch the theme, it keeps your choice in Session Storage until you close the tab. If you connect a wallet or use the read-only Impersonate mode, it keeps the storage described in Sections 3 and 4.

Both Quasar dashboards require session cookies to function. If you instruct your browser to refuse these cookies, you will not be able to log into or use either dashboard.

## 3. Local Storage (Local-First Architecture)
Our open-source packages use your browser's Local Storage: Pulsar keeps the transactions it tracks (EVM and Solana; a finished one for 30 days), and Satellite Connect remembers the last connected wallet: until you close the tab, or until you disconnect it if you tick "Remember this wallet" when you connect. Interface settings such as the theme are kept for 30 days after you choose them. This keeps your transaction state on your device. Nothing about a wallet is stored before you connect one. Read the [Pulsar documentation](https://pulsar.docs.tuwa.io) and the [Satellite Connect documentation](https://satellite.docs.tuwa.io) for the technical details.

Where applicable law requires consent for storage or access on your device, including Local Storage or storage used by third-party libraries, we will seek it unless an exception applies. Strict necessity depends on the particular purpose of the storage, not merely on the type of technology (Directive 2002/58/EC, Article 5(3)).

## 4. What We Store
This list was checked against our sites and code. It covers the storage that our sites and our own code write, including the libraries we use; Section 5 covers storage that wallets write for themselves.

| Name | Type | Where | Written | Purpose | Duration |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `payload-token` | Cookie (HttpOnly) | Quasar dashboards | When you sign in | Keeps you signed in | 24 hours |
| `siwx-session` | Cookie (HttpOnly) | Quasar dashboards | When you sign in with a wallet | Keeps a wallet sign-in (SIWX) | 24 hours |
| `passkey_challenge` | Cookie (HttpOnly) | Quasar dashboards | When you start a passkey sign-in or registration | Protects that passkey operation | 5 minutes |
| `siwx-session-v2` | Cookie (HttpOnly) | demo.tuwa.io | When you sign in with a wallet | Keeps a wallet sign-in (SIWX) | 30 minutes |
| `siwx-demo-session` | Cookie (HttpOnly) | tuwa.io | When you sign in with a wallet in the demo | Keeps a wallet sign-in (SIWX) | 30 minutes |
| `payload-theme` | Cookie | Admin panel of the Quasar dashboards | When you switch the theme on its sign-in page or in its settings | Remembers the light or dark theme you chose | 30 days after you switch it |
| `payload-theme:expires` | Local Storage | Admin panel of the Quasar dashboards | When the admin panel finds the `payload-theme` cookie | Remembers when to remove that cookie | 30 days after you switch the theme |
| `payload-lng` | Cookie | Admin panel of the Quasar dashboards | When you pick a language in its account settings | Remembers the language you chose | 30 days after you pick it |
| `payload-lng:expires` | Local Storage | Admin panel of the Quasar dashboards | When the admin panel finds the `payload-lng` cookie | Remembers when to remove that cookie | 30 days after you pick the language |
| `theme`, `theme:expires` | Local Storage | tuwa.io, the documentation sites and the Quasar dashboards | When you switch the theme | Remembers the light or dark theme you chose, and when to forget it | 30 days after you switch it |
| `tuwa-locale`, `tuwa-locale:expires` | Local Storage | tuwa.io, the documentation sites and the Quasar dashboards | When you pick a language | Remembers the language you chose (English, Ukrainian or Simplified Chinese), and when to forget it | 30 days after you pick it |
| `tuwa-guide-network`, `tuwa-guide-network:expires` | Local Storage | docs.tuwa.io | When you pick a tab in a guide | Remembers the EVM or Solana tab you chose, and when to forget it | 30 days after you pick it |
| `quasar:auth_method` | Local Storage | Quasar dashboards | When you sign in | Remembers whether you signed in with a wallet, so that disconnecting that wallet signs you out | Until you sign out or clear it |
| `quasar_selected_org_id:*` | Local Storage | Quasar dashboards | When you sign in or switch organizations | Opens the organization you used last; the name contains your account ID | Until you sign out or your sign-in ends |
| `quasar_sidebar_sections`, `quasar_sidebar_collapsed` | Local Storage | Quasar dashboards | When you open, close or collapse the sidebar | Remembers the layout of the sidebar | 30 days after you change it |
| `quasar_table_pagesize_*` | Local Storage | Quasar dashboards | When you change the number of rows in a table | Remembers the number of rows you chose | 30 days after you change it |
| `quasar_page_refresh_cooldowns` | Session Storage | Quasar dashboards | When you refresh the data of a page | Limits how often a page can refresh its data | Until you close the tab |
| `orbit-core:lastConnectedConnector`, `orbit-core:recentlyConnectedConnectorsListHelpers` | Session Storage; Local Storage if you tick "Remember this wallet" | Sites where you can connect a wallet | When you connect a wallet | Reconnects the wallet you connected last and lists the wallets you used (Satellite Connect) | Until you close the tab; with "Remember this wallet", until you disconnect or clear it |
| `siwx-react:session` | Local Storage | Sites where you sign in with a wallet, including the simulated sign-in of the docs.tuwa.io Playground | When you sign in with a wallet | Lets the page show that you are signed in: the wallet address and network, the site, and when the sign-in started and expires | Until you sign out or sign in again, or until the sign-in expires: an expired one is removed the next time a page of the site loads |
| `satellite-connect:impersonatedAddress` | Local Storage | Sites that offer the read-only Impersonate mode (stories.tuwa.io, custom-style.tuwa.io) | When you enter an address in Impersonate mode and connect | Keeps the address you chose to view in read-only mode; no wallet is connected | Until you disconnect or clear it |
| Pulsar transaction store | Local Storage | Sites where you send a tracked transaction | When you send a transaction | Keeps the state of the transactions you sent (Pulsar), so the site can finish tracking a pending one and show you their status | A finished transaction for 30 days after it finished, a pending one until it finishes; at most your last 50 |
| `tuwa-storybook-theme` | Session Storage | stories.tuwa.io | When you switch the theme | Remembers the light or dark theme you chose | Until you close the tab |

Our sites are served through Cloudflare. In our current configuration, Cloudflare sets no cookies on them; if we turn on a Cloudflare protection that uses a cookie, we will add it to this list first.

## 5. No Third-Party Tracking
We do not use third-party advertising, analytics or cross-site tracking. Our sites connect only to wallets that run in your browser: browser extensions, the in-app browser of a mobile wallet, or Safe{Wallet} when it opens our site. They do not offer WalletConnect. Wallets store their own data in the wallet, outside our sites. We do not control the storage or tracking practices of wallets and their providers; please read their own policies.

## 6. Contact Information
If you have any questions regarding our Cookie Policy, please contact us at [admin@tuwa.io](mailto:admin@tuwa.io).

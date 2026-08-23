# TUWA Ecosystem — Email Routing Manifest

> **Source of Truth for standardized contact email routing across all TUWA ecosystem repositories, applications, packages, and legal documents.**

---

## 1. Domain & Routing Standard

All official communications, documentation, repository meta files, and application interfaces must strictly use the following contextual email addresses under the `@tuwa.io` domain:

| Context / Category | Standard Email | Target Scope & Usage |
| :--- | :--- | :--- |
| **Security & Audits** | `security@tuwa.io` | `SECURITY.md`, `.well-known/security.txt`, vulnerability disclosures, security audit reports, bug bounty programs. |
| **General & Community** | `hello@tuwa.io` | Landing page footers, main `README.md` contact sections, team contact links, general inquiries, community links, `CODE_OF_CONDUCT.md` reporting. |
| **Partnerships & Business** | `partners@tuwa.io` | Business development, institutional partnerships, protocol integrations, grant applications, investor inquiries. |
| **Dev Support & Help** | `support@tuwa.io` | Technical developer documentation, SDK troubleshooting sections, developer portal, error fallback modals, dashboard user support. |
| **Legal & Compliance** | `admin@tuwa.io` | `PRIVACY.md`, `TERMS.md`, `COOKIE.md`, legal contact notices, GDPR/CCPA data requests, system administrative notices, monitoring alert receivers. |
| **Press & Media** | `media@tuwa.io` | Press kits, brand asset requests, media inquiries, publication contact points. |

---

## 2. Contextual Routing Rules

### 2.1 Security Disclosures (`security@tuwa.io`)
- Used exclusively for reporting security vulnerabilities, cryptographic bugs, and unauthorized access incidents.
- Never use personal or non-standard aliases for security disclosures.

### 2.2 Developer Support vs General Contact
- **`support@tuwa.io`**: Used in SDK error messages, technical integration guides, and developer help centers.
- **`hello@tuwa.io`**: Used for general user outreach, ecosystem invitations, social links, and open-source contributor communications.

### 2.3 Legal & Compliance Policies (`admin@tuwa.io`)
- All terms of service, privacy policies, cookie policies, and data protection clauses must provide `admin@tuwa.io` as the point of contact for legal and regulatory compliance.
- PDF policy headers generated via automated pipelines must direct to `admin@tuwa.io`.

### 2.4 Infrastructure & System Monitoring
- Transactional notification senders: `noreply@mail.tuwa.io` / `no-reply@tuwa.io`.
- Monitoring/Alerting recipient: `admin@tuwa.io`.
- Monitoring sender: `monitoring@mail.tuwa.io`.

---

## 3. Ecosystem Application Mapping

| Repository | Primary Components | Contact Endpoints Used |
| :--- | :--- | :--- |
| **`workflows`** | Legal policies, PDF generator, Code of Conduct | `admin@tuwa.io`, `hello@tuwa.io` |
| **`Landing/website`** | Official landing site, team profiles, footer | `hello@tuwa.io`, `partners@tuwa.io` |
| **`quasar`** | Dashboard, NestJS server, monitoring, billing | `support@tuwa.io`, `admin@tuwa.io`, `noreply@mail.tuwa.io` |
| **`docs` / `sdk`** | Technical documentation, SDK guides, APIs | `support@tuwa.io` |
| **`nova-uikit` / `orbit` / `pulsar-core` / `satellite-connect` / `siwx`** | Headless core packages & UI components | `hello@tuwa.io`, `support@tuwa.io` |

---

*Last Updated: August 2026 — TUWA Architecture Team*

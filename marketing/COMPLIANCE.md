# FestFrame compliance snapshot

This is a practical product checklist, not legal advice. FestFrame targets EU attendees and processes email, country code, saved plans, and analytics identifiers, so having no registered company does not automatically remove data-protection responsibilities.

## Current email flow

FestFrame has one optional marketing checkbox. It is unchecked by default and separate from the `Plan My Fest` action.

When an email is submitted, the lead record stores:

- normalized email;
- persistent browser UUID;
- Vercel country code when available;
- `marketing_consent` true or false;
- consent timestamp when true;
- privacy notice version;
- creation/update timestamps.

The live Neon migration was applied and both consent/no-consent production requests were tested on 22 July 2026. Test records were deleted.

**Status:** ready to collect new marketing opt-ins. Not ready to send a campaign until unsubscribe and sender identity are configured.

All 22 leads collected before this migration are treated as `marketing_consent=false`. Do not market to them. Their email may still be used to provide plan restore because that is the service they requested.

## Before the first marketing email

1. Send only to `marketing_consent=true`.
2. Use an email provider with unsubscribe handling and include unsubscribe in every message.
3. Include the operator/sender identity and contact method.
4. Record withdrawals and suppress those addresses from future sends.
5. Send only the purpose users accepted: occasional FestFrame product updates.
6. Do not upload unchecked emails or artist selections to advertising platforms.

## Persistent visitor ID

On app load, FestFrame reads `festframe-lead-id` from `localStorage`. If it is missing or not a valid UUID v4, the browser generates one with `crypto.randomUUID()` and stores it. A separate random session ID is generated for each page load.

Every first-party product event sends both values:

- `session_id`: separates page-load sessions;
- `visitor_id`: connects repeat visits from the same browser.

Submitting email sends the same `visitor_id` to the lead endpoint, which can associate product usage with that optional lead. Clearing site storage, using a different browser, or private browsing creates a new visitor. It is not a cross-device identity and FestFrame does not intentionally store raw IP addresses.

## Main remaining risks

### 1. Persistent analytics storage

The UUID is stored before a user chooses email and is used for analytics. EU ePrivacy rules can apply to persistent browser storage even when it is first-party and pseudonymous. `Legitimate interests` in the privacy notice does not automatically remove the device-storage consent question.

Low-effort choices before scaling:

- keep Vercel's cookieless aggregate analytics and use only session-level first-party events until consent; or
- add a small analytics choice before creating the persistent UUID.

Do not add Meta Pixel until this is resolved.

### 2. Unverified email restore

Anyone who knows an email can currently load that email's saved artist plan. The data is low sensitivity, but it is still personal data and the flow has no proof of email ownership. Add a magic link before storing anything more sensitive, adding payments, or supporting crew membership.

### 3. Tomorrowland and artist intellectual property

`Unofficial` reduces confusion but is not a license. Tomorrowland's published website terms reserve rights in its text, images, software, and other materials and prohibit reproduction/distribution without written permission. Artist photographs may also have separate copyright owners.

Risk-reduction actions:

- keep FestFrame branding visually independent;
- never use the Tomorrowland logo as the FestFrame logo;
- use original generated wallpaper art only;
- do not sell official images, logos, or copied website assets;
- consider removing artist photos before turning the Tomorrowland version into a paid product;
- seek permission or legal review before meaningful monetization around this specific festival.

### 4. Privacy notice completeness

The current Privacy page covers data types, purposes, providers, rights, and plan-security limits. Before broader EU promotion, add a direct operator contact, clearer retention periods, the applicable controller identity, withdrawal instructions, and the supervisory-authority complaint route.

### 5. Paid product obligations

When payments start, update Terms with seller identity, exact digital deliverable, price/tax display, refund policy, support contact, and applicable consumer withdrawal wording. A merchant-of-record checkout helps with VAT and invoices but does not make every product/legal obligation disappear.

## Checkbox count

For the current free flow, one checkbox is enough:

- optional marketing email consent, unchecked by default.

Plan restore does not need to be bundled with marketing consent. Privacy and Terms links can remain visible without a required checkbox for this free validation tool, although explicit Terms acceptance becomes more useful when accounts or payments are added.

References: [European Commission on valid consent](https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/legal-grounds-processing-data/grounds-processing/when-consent-valid_en), [EU ePrivacy Directive Article 13](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32002L0058), [European Commission data-subject rights](https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en), and [Tomorrowland website terms](https://www.tomorrowland.com/article/website-terms-of-use/).

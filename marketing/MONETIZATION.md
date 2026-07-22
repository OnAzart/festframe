# FestFrame monetization

FestFrame is currently a seasonal consumer utility, not a recurring SaaS habit. A subscription before multiple festivals would fight the product's natural usage pattern. Start with one-time event value, then move toward crews and organizers.

## Recommendation

Keep all current W2 features free. After W2, add one fake-door experiment before building billing:

> **FestFrame Plus — EUR 5.99 per festival**  
> Premium wallpaper styles, extra phone sizes, custom colors, and a clean share version.

Record `premium_interest_clicked`. Build checkout only if at least 3-5% of wallpaper exporters click the offer or users ask how to pay for better exports.

## Ranked options

| Rank | Offer | Price | Build effort | Why it can work |
| ---: | --- | ---: | --- | --- |
| 1 | Festival Plus export pack | EUR 5.99 once | 1-2 days after validation | Directly extends the proven wallpaper job |
| 2 | Crew Pack | EUR 9.99 per festival group | 3-5 days | Shared route, friend comparison, and conflict view solve a repeated pain |
| 3 | Creator Route Pack | EUR 29 per festival | 1-2 days plus manual service | Branded route images and tracked links for creators/fan pages |
| 4 | Organizer white-label | EUR 299-999 per event | About one week after generic importer | Higher revenue without needing huge consumer traffic |
| 5 | Sponsored export style | EUR 250+ per weekend | Low code, sales effort | Sponsor appears tastefully on shared outputs |
| 6 | Affiliate festival essentials | Commission | A few hours | Earplugs, power banks, ponchos; low revenue and must be disclosed |
| 7 | Consumer subscription | EUR 2.99-4.99/month | High | Skip until FestFrame supports many festivals and repeat use |

## Simplest payment path

Use Lemon Squeezy for the first one-time paid product instead of building tax and checkout infrastructure:

1. Create a single-payment `FestFrame Festival Plus` product.
2. Use tax-inclusive pricing and a hosted checkout/payment link.
3. After the fake-door test passes, add a signed webhook and a small entitlement table keyed to the existing email profile.
4. Unlock premium export themes only after the webhook confirms payment.
5. Keep free exports useful and branded; paid output should add choice, not repair an intentionally bad free product.

Lemon Squeezy acts as merchant of record and handles sales tax/VAT, but FestFrame still has to account for payout income and maintain customer support/refund terms. Its public fee example includes a base fee plus percentage charges, so very low prices have weak unit economics. EUR 5.99 is a better starting test than EUR 1-2.

## Package design

### Free

- full timetable planning;
- Must / Want / Maybe;
- clash view;
- calendar, PDF, and two wallpaper styles;
- visible `MADE WITH FESTFRAME` signature.

### Festival Plus — EUR 5.99 once

- four premium original backgrounds;
- custom accent colors;
- iPhone and Android-specific crops;
- alternate compact/detailed layouts;
- clean share version with a smaller FestFrame signature.

Do not sell timetable accuracy, official access, artist images, or removal of the unofficial disclosure.

### Crew Pack — EUR 9.99 once

- one shareable crew link;
- compare up to eight saved routes;
- show `everyone wants`, conflicts, and possible meetup gaps;
- export a group route image.

## Revenue math for the first test

At 2,000 visitors, assume 15% export and 3% of exporters buy:

```text
2,000 × 15% × 3% = 9 purchases
9 × EUR 5.99 = EUR 53.91 gross
```

That will not fund a company, but it validates willingness to pay. The meaningful business model begins when the same engine can serve many festivals or sell a EUR 299+ organizer package.

## What not to do now

- no monthly subscription for one festival;
- no paywall before the first useful export;
- no ads inside the planning workflow;
- no resale of user plans or email data;
- no paid Tomorrowland-branded asset pack without permission;
- no complex credit or usage billing.

References: [Lemon Squeezy single payments](https://docs.lemonsqueezy.com/help/products/single-payment), [fees](https://docs.lemonsqueezy.com/help/getting-started/fees), and [sales tax/VAT](https://docs.lemonsqueezy.com/help/payments/sales-tax-vat).

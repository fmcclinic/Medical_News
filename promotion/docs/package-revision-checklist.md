# Package revision checklist

Use this checklist whenever a public screening package gains, loses, renames, or reprices a service.

1. Recalculate the package total from the remaining confirmed final service prices.
2. Update the campaign card: price, item count, and any summary that names the changed service domain.
3. Update the landing page: hero, overview copy, detailed table, table total, and price-bearing metadata.
4. Remove references to a deleted service from customer-facing clinical copy; do not retain claims outside the active package scope.
5. Search the campaign files for the old label, old total, and old item count. Confirm the table service-row count equals the displayed count.
6. Verify the card through `index.html` and the public `promo/` route; check the price and labels at desktop and mobile widths, and run `git diff --check`.

Public surfaces may show only final service prices and the confirmed package total. Never expose test codes, base prices, surcharges, or internal pricing calculations.

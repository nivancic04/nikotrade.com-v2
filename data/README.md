# Local Data Skeleton

Ovaj direktorij je ostavljen kao kostur za lokalni fallback ako ikad zatreba.

Trenutno:
- upiti i tokeni idu u Neon (`inquiries`, `inquiry_access_tokens`)
- proizvodi idu u Neon (`products`, `product_images`) uz fallback iz koda

Ako ikad želite vratiti lokalni fallback za upite, možete ovdje držati JSON datoteku
(npr. `inquiries-store.local.json`) i spojiti je na `lib/inquiries-store.ts`.

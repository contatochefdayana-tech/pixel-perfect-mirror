<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Business values (fees, cities, delivery rates) live only in `src/config/app.config.ts` — single place to change.
- Business rules are pure functions in `src/domain/rules.ts` with tests — so they can be ported to a backend.
- All state mutations go through `actions` in `src/state/store.ts` (localStorage-backed mock) — each action maps to a future API endpoint.
- One order per producer; a checkout groups N orders — the cart supports multiple producers.

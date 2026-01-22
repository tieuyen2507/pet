# Team Plan (Pet Health Passport)

## Roles

- Member A: Web platform, auth, dashboard
- Member B: Pets + Reminders CRUD
- Member C: Blockchain + Verify

## Branch rules

- One feature = one branch: feat/<member>-<feature>
- Push daily when a vertical slice is done
- Keep PRs small (1-5 main files)
- Commit prefixes: feat:, fix:, chore:
- Avoid touching the same files across members when possible

## Suggested 6-day schedule

Day 1
- A: init Next.js + Tailwind + shadcn + base layout (feat/a-init-ui)
- B: Prisma Pet/Reminder models + migrate (feat/b-prisma-models)
- C: Hardhat init + contract skeleton + roles (feat/c-contract-skeleton)

Day 2
- A: auth register/login/logout + bcrypt (feat/a-auth)
- B: Pets API CRUD (feat/b-pets-api)
- C: attestRecord + event + getAttestation (feat/c-contract-attest)

Day 3
- A: middleware/session guard + utils (feat/a-guard)
- B: Pets UI list/create/detail (feat/b-pets-ui)
- C: Hardhat tests (feat/c-contract-tests)

Day 4
- A: dashboard shell + cards (feat/a-dashboard)
- B: Reminders API + overdue logic (feat/b-reminders-api)
- C: Web3 connect + read/write (feat/c-web3-readwrite)

Day 5
- A: zod + toast + error handling (feat/a-ui-validation)
- B: Reminders UI tab + mark DONE (feat/b-reminders-ui)
- C: EIP-712 prepare/sign/verify (feat/c-eip712)

Day 6
- A: README + env (docs/readme-env)
- B: search/filter on /pets (feat/b-search-filter)
- C: Verify page public + optional QR (feat/c-verify-qr)

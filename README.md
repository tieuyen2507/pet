# Pet Health Passport

Pet Health Passport is a full-stack project built with Next.js 14 (App Router + TypeScript), PostgreSQL/Prisma, and a Hardhat + Solidity contract for on-chain attestations. It supports core pet management, reminders, and medical records with EIP-712 signatures and public verification.

## Features

- Auth: NextAuth Credentials, register + login, bcrypt password hashing
- Pets CRUD + search
- Reminders with status (UPCOMING/DONE/OVERDUE)
- Medical records with on-chain attestation hash + EIP-712 signatures
- Public verification page: `/verify?recordId=...`

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Prisma + PostgreSQL
- Tailwind CSS + shadcn/ui
- Hardhat + Solidity + OpenZeppelin AccessControl
- ethers v6

## Quick Start

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your database and contract values.

### 3) Set up the database

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Hardhat (Smart Contract)

### Run tests

```bash
npx hardhat test
```

### Local chain + deploy

```bash
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
```

Copy the deployed contract address into:

- `CONTRACT_ADDRESS`
- `NEXT_PUBLIC_CONTRACT_ADDRESS`

Then restart the Next.js dev server.

## EIP-712 Attestation Flow

1. Create a medical record in `/pets/[id]`.
2. Click **Attest (Vet)**.
3. Server returns typed data from `/api/records/[id]/prepare-attestation`.
4. Wallet signs typed data and sends on-chain `attestRecord`.
5. Signature saved via `/api/records/[id]/save-signature`.

## Public Verification

Use `GET /verify?recordId=<record-uuid>` to validate:

- Recomputed hash vs on-chain attestation
- Signature recovery vs issuer address

## Notes

- Vet/Admin roles are determined via `VET_EMAILS` and `ADMIN_EMAILS` in `.env`.
- For on-chain reads, set `RPC_URL` to a reachable JSON-RPC endpoint.

## Scripts

- `npm run dev` - Next.js dev server
- `npm run prisma:generate` - Prisma client
- `npm run prisma:migrate` - Prisma migrate
- `npm run hardhat:test` - Contract tests
- `npm run hardhat:node` - Local chain
- `npm run hardhat:deploy` - Deploy contract to localhost

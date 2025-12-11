# Medical Record dApp
On-chain medical record management on IOTA (Move) with a modern Next.js frontend. The app demonstrates full-stack integration: a Move smart contract (shared object), React UI, and deployment tooling.

## Table of Contents
- Introduction
- Key Features
- Techniques & Architecture
- Technologies Used
- Project Structure
- Installation & Setup
  - Prerequisites
  - 1. Smart Contract Deployment
  - 2. Frontend Setup
- Configuration
- Smart Contract API
- Contribution
- License

## Introduction
This dApp stores patient medical records as shared objects on the IOTA network. Owners can update records and transfer ownership; anyone can read them. It showcases a simple yet extensible medical-record flow with clear on-chain state.

## Key Features
- On-chain medical records (shared object) with structured fields.
- Owner-only updates; ownership can be transferred.
- Status and visit metadata (visit timestamp, doctor, notes, allergies, medications).
- Ready-made React UI with wallet connect, create/update/transfer forms, and transaction status.

## Techniques & Architecture
- Resource-oriented design (Move): `MedicalRecord` enforces ownership and prevents duplication.
- Shared object pattern: records are globally readable while updates are permissioned.
- React + dApp Kit: contract calls, wallet integration, and data fetching via `useIotaClientQuery`.
- Radix UI primitives for accessible, themeable UI.

## Technologies Used
- IOTA Move (smart contract)
- Next.js + React + TypeScript
- @iota/dapp-kit
- @radix-ui/themes

## Project Structure
```
├── app/              # Next.js app directory
├── components/       # React components (UI)
├── hooks/            # Contract integration logic
├── lib/              # Network & package config
└── contract/         # Move contracts (patient)
```

## Installation & Setup

### Prerequisites
- Node.js v18+
- IOTA CLI
- IOTA wallet (browser extension) connected to testnet

### 1. Smart Contract Deployment
```bash
cd contract/patient
move build
# Or use the wrapper script from project root:
# npm run iota-deploy
# After publish, copy the Package ID from the output.
```

### 2. Frontend Setup
```bash
cd <project-root>
npm install --legacy-peer-deps
npm run dev
```

## Configuration
Update `lib/config.ts` with the Package ID you published (testnet):
```ts
export const TESTNET_PACKAGE_ID = "0x7d554224afc3ee774c7e6e8a755726e34d6f2b1444c4054b09b0e82742ffb3c3";
```
The app also has a fallback `DEFAULT_PACKAGE_ID` inside `hooks/useContract.ts`—keep it in sync with your deployed package.

## Smart Contract API
- `create(patient_name, age, gender, diagnosis, medications, allergies, notes, doctor, visit_ts_ms, last_updated_ms, status, ctx)`
  - Creates and shares a `MedicalRecord`; owner = sender.
- `update(record, patient_name, age, gender, diagnosis, medications, allergies, notes, doctor, visit_ts_ms, last_updated_ms, status, ctx)`
  - Updates fields; only owner can call.
- `transfer_ownership(record, new_owner, ctx)`
  - Transfers ownership to another address.

## Contribution
1) Fork the repo.  
2) Create a feature branch (`git checkout -b feature/your-feature`).  
3) Commit and push (`git commit -m "Add feature"`).  
4) Open a Pull Request.
image.png
## License
MIT

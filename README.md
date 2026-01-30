# Pet Health Passport

Ứng dụng quản lý sức khỏe thú cưng với Next.js 14, PostgreSQL/Prisma và Hardhat + Solidity. Hỗ trợ đăng nhập, quản lý thú cưng, nhắc lịch, hồ sơ y tế, ký/neo dữ liệu on-chain và trang xác minh công khai.

## Tính năng chính

- Đăng ký/đăng nhập (NextAuth Credentials)
- CRUD thú cưng, nhắc lịch, hồ sơ y tế
- Ký/neo dữ liệu lên blockchain
- Trang xác minh công khai: `/verify?recordId=<uuid>`
- Ví MetaMask + ký thông điệp: `/wallet`

## Yêu cầu

- Node.js 18+
- PostgreSQL
- MetaMask (để demo ký/neo)

## Cài đặt & chạy

### 1) Cài dependencies

```bash
npm install
```

### 2) Thiết lập DATABASE_URL (Postgres)

Copy file `.env.example` thành `.env` và điền `DATABASE_URL`.

Ví dụ:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pet_manager"
```

### 3) Prisma migrate + seed

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

> Nếu chưa có script `prisma:seed`, có thể chạy trực tiếp:
> `npx ts-node prisma/seed.ts`

### 4) Hardhat local + deploy contract

Terminal 1:
```bash
npm run hardhat:node
```

Terminal 2:
```bash
npm run hardhat:deploy
```

Sau khi deploy, cập nhật `.env`:
```
CHAIN_ID=31337
RPC_URL="http://127.0.0.1:8545"
CONTRACT_ADDRESS="<địa chỉ contract>"
NEXT_PUBLIC_CONTRACT_ADDRESS="<địa chỉ contract>"
```

### 5) Chạy app

```bash
npm run dev
```

Mở `http://localhost:3000`.

## Demo flow đầy đủ

1. **Register/Login**  
   Vào `/register` hoặc `/login`.

2. **Tạo pet**  
   Vào `/pets` → tạo pet mới.

3. **Tạo record**  
   Vào `/pets/<PET_ID>/records/new` → tạo record.

4. **Kết nối ví & ký thông điệp**  
   Vào `/wallet` → Connect MetaMask → Sign message.

5. **Neo record lên blockchain**  
   Quay lại `/pets/<PET_ID>/records` → bấm **Neo hồ sơ**  
   → txHash được lưu trong DB và hiển thị ở record.

## Scripts hữu ích

- `npm run dev` – chạy app
- `npm run prisma:generate` – tạo Prisma client
- `npm run prisma:migrate` – chạy migration
- `npm run prisma:seed` – seed dữ liệu
- `npm run hardhat:test` – test smart contract
- `npm run hardhat:node` – local chain
- `npm run hardhat:deploy` – deploy contract vào local chain

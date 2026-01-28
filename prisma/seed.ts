import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      name: "Yen Nguyen",
      email: "yen@example.com",
      passwordHash: "hashed-password-1",
    },
    {
      name: "Minh Tran",
      email: "minh@example.com",
      passwordHash: "hashed-password-2",
    },
  ];

  const petsByUser = [
    [
      {
        name: "Mochi",
        species: "Dog",
        breed: "Shiba Inu",
        gender: "Female",
        birthDate: new Date("2022-03-15T00:00:00Z"),
        photoUrl: "https://example.com/pets/mochi.jpg",
      },
      {
        name: "Luna",
        species: "Cat",
        breed: "British Shorthair",
        gender: "Female",
        birthDate: new Date("2021-09-20T00:00:00Z"),
        photoUrl: "https://example.com/pets/luna.jpg",
      },
    ],
    [
      {
        name: "Coco",
        species: "Dog",
        breed: "Poodle",
        gender: "Male",
        birthDate: new Date("2020-05-10T00:00:00Z"),
        photoUrl: "https://example.com/pets/coco.jpg",
      },
      {
        name: "Bun",
        species: "Rabbit",
        breed: "Netherland Dwarf",
        gender: "Male",
        birthDate: new Date("2023-01-05T00:00:00Z"),
        photoUrl: "https://example.com/pets/bun.jpg",
      },
    ],
  ];

  for (const [index, user] of users.entries()) {
    await prisma.user.create({
      data: {
        ...user,
        pets: {
          create: petsByUser[index].map((pet, petIndex) => ({
            ...pet,
            medicalRecords: {
              create: [
                {
                  title: "Annual Checkup",
                  description: "Routine health check and vaccines.",
                  visitDate: new Date(`2024-01-${petIndex + 10}T09:00:00Z`),
                  attachmentsUrl: "https://example.com/records/checkup.pdf",
                  recordHash: `record-hash-${index + 1}-${petIndex + 1}-1`,
                  txHash: `0xtxhash${index + 1}${petIndex + 1}a`,
                  chainId: 11155111,
                },
                {
                  title: "Follow-up Visit",
                  description: "Monitoring recovery and adjusting diet.",
                  visitDate: new Date(`2024-06-${petIndex + 12}T10:30:00Z`),
                  attachmentsUrl: "https://example.com/records/followup.pdf",
                  recordHash: `record-hash-${index + 1}-${petIndex + 1}-2`,
                  txHash: `0xtxhash${index + 1}${petIndex + 1}b`,
                  chainId: 11155111,
                },
              ],
            },
            appointments: {
              create: [
                {
                  type: "Vaccine",
                  note: "Rabies booster",
                  startAt: new Date(`2025-02-${petIndex + 5}T08:30:00Z`),
                },
                {
                  type: "Grooming",
                  note: "Full grooming session",
                  startAt: new Date(`2025-03-${petIndex + 6}T14:00:00Z`),
                },
              ],
            },
          })),
        },
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

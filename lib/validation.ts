import { z } from "zod";

export const speciesEnum = z.enum(["DOG", "CAT", "BIRD", "RABBIT", "OTHER"]);
export const genderEnum = z.enum(["MALE", "FEMALE", "UNKNOWN"]);
export const reminderTypeEnum = z.enum([
  "VACCINE",
  "MEDICINE",
  "CHECKUP",
  "GROOMING",
  "OTHER",
]);
export const reminderStatusEnum = z.enum(["UPCOMING", "DONE", "OVERDUE"]);
export const recordTypeEnum = z.enum([
  "VACCINE",
  "DIAGNOSIS",
  "TRANSFER",
  "OTHER",
]);

export const petCreateSchema = z.object({
  name: z.string().min(1),
  species: speciesEnum,
  breed: z.string().min(1),
  gender: genderEnum,
  birthDate: z.string().optional().nullable(),
  weightKg: z.number().nonnegative().finite().optional().nullable(),
  photoUrl: z
    .union([
      z.string().url(),
      z.string().regex(/^\/uploads\/.+/, "Invalid photo URL"),
    ])
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
});

export const petUpdateSchema = petCreateSchema.partial();

export const reminderCreateSchema = z.object({
  type: reminderTypeEnum,
  title: z.string().min(1),
  dueDate: z.string().min(1),
  status: reminderStatusEnum.optional(),
});

export const reminderUpdateSchema = reminderCreateSchema.partial();

export const recordCreateSchema = z.object({
  visitDate: z.string().min(1),
  symptoms: z.string().min(1),
  diagnosis: z.string().min(1),
  treatment: z.string().min(1),
  cost: z.number().int().nonnegative().finite(),
  recordType: recordTypeEnum,
});

export const saveSignatureSchema = z.object({
  issuerAddress: z.string().min(1),
  signature: z.string().min(1),
  recordHash: z.string().min(1),
});

export const appointmentCreateSchema = z.object({
  type: z.string().min(1),
  note: z.string().optional().nullable(),
  startAt: z.string().min(1),
});

export const appointmentUpdateSchema = appointmentCreateSchema.partial();

export const recordCrudCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  visitDate: z.string().min(1),
  attachmentsUrl: z.string().url().optional().nullable(),
  recordHash: z.string().min(1).optional(),
  txHash: z.string().min(1).optional().nullable(),
  chainId: z.number().int().positive().optional().nullable(),
});

export const recordCrudUpdateSchema = recordCrudCreateSchema.partial();

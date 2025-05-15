import { z } from "zod";

export const CreatorSchema = z.object({
  address: z.string().startsWith("0x").length(42),
  signature: z.string().startsWith("0x"),
});

export const AbiInputSchema = z.object({
  internalType: z.string(),
  name: z.string(),
  type: z.string(),
});

export const AbiOutputSchema = z.object({
  internalType: z.string(),
  name: z.string(),
  type: z.string(),
});

export const AbiSchema = z.object({
  inputs: z.array(AbiInputSchema),
  name: z.string(),
  outputs: z.array(AbiOutputSchema),
  stateMutability: z.string(),
  type: z.string(),
});

export const ActionSchema = z.object({
  title: z.string(),
  contractAddress: z.string().startsWith("0x").length(42),
  method: z.string(),
  calldata: z.string().startsWith("0x"),
  abi: z.array(AbiSchema),
});

export const AgendaMetadataSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  network: z.enum(["mainnet", "sepolia"]),
  transaction: z.string().startsWith("0x"),
  creator: CreatorSchema,
  snapshotUrl: z.string().url().optional(),
  discourseUrl: z.string().url().optional(),
  actions: z.array(ActionSchema),
});

export type AgendaMetadata = z.infer<typeof AgendaMetadataSchema>;

import { AgendaMetadataSchema } from "../types/agenda-metadata";
import { ethers, verifyMessage } from "ethers";

export function validateSchema(data: any) {
  return AgendaMetadataSchema.safeParse(data);
}

export function getAgendaSignatureMessage(agendaId: number, transactionHash: string) {
  return `I am the one who submitted agenda #${agendaId} via transaction ${transactionHash}. This signature proves that I am the one who submitted this agenda.`;
}

export async function validateAgendaSignature(agendaId: number, transactionHash: string, signature: string, expectedAddress: string) {
  const message = getAgendaSignatureMessage(agendaId, transactionHash);
  const recovered = verifyMessage(message, signature);
  return recovered.toLowerCase() === expectedAddress.toLowerCase();
}

const AGENDA_CREATED_EVENT = "event AgendaCreated(address indexed from,uint256 indexed id,address[] targets,uint128 noticePeriodSeconds,uint128 votingPeriodSeconds,bool atomicExecute)";
const iface = new ethers.Interface([AGENDA_CREATED_EVENT]);

export function validateTransactionSender(tx: ethers.TransactionResponse, expectedSender: string) {
  if (!tx) throw new Error("Transaction not found");
  return tx.from.toLowerCase() === expectedSender.toLowerCase();
}

export function validateAgendaIdFromEvent(receipt: ethers.TransactionReceipt, expectedId: number) {
  if (!receipt) throw new Error("Transaction receipt not found");
  const event = iface.getEvent("AgendaCreated");
  if (!event) throw new Error("AgendaCreated event definition not found");
  const eventTopic = event.topicHash;
  const log = receipt.logs.find(l => l.topics[0] === eventTopic);
  if (!log) throw new Error("AgendaCreated event not found in transaction logs");
  const parsed = iface.parseLog(log);
  if (!parsed) throw new Error("Failed to parse AgendaCreated event log");
  const eventId = parsed.args.id.toString();
  return eventId === expectedId.toString();
}

import { ethers } from "ethers";
import { AgendaMetadata, AgendaMetadataSchema } from "../types/agenda-metadata.js";
import { ContractInterfaces, EventTopics } from "../config/abi-loader.js";
import {
  TIME_CONSTANTS,
  VALIDATION_CONSTANTS,
  ERROR_MESSAGES,
  SIGNATURE_MESSAGES
} from "../config/constants.js";

// Transaction interface for ethers.js
interface Transaction {
  from: string;
  to: string;
  data: string;
  hash: string;
  blockNumber: number | null;
  blockHash: string | null;
  index: number | null;
  confirmations: number;
  gasLimit: bigint;
  gasPrice: bigint | null;
  maxFeePerGas: bigint | null;
  maxPriorityFeePerGas: bigint | null;
  nonce: number;
  type: number | null;
  value: bigint;
}

// Event interface creation (loaded from ABI configuration)
const agendaCreatedEventInterface = ContractInterfaces.DAO;

// Event type definition (updated to match actual contract ABI)
interface AgendaCreatedEvent {
  from: string;
  id: bigint;
  targets: string[];
  noticePeriodSeconds: bigint;
  votingPeriodSeconds: bigint;
  atomicExecute: boolean;
}



export const AgendaValidator = {
  /**
   * Validates if signature timestamp is within 1 hour from current time
   */
  validateSignatureTimestamp(timestamp: string): boolean {
    try {
      const signatureTime = new Date(timestamp);

      // Check if it's a valid date
      if (isNaN(signatureTime.getTime())) {
        console.error(ERROR_MESSAGES.INVALID_TIMESTAMP(timestamp));
        return false;
      }

      const currentTime = new Date();
      const timeDiff = Math.abs(currentTime.getTime() - signatureTime.getTime());

      if (timeDiff > TIME_CONSTANTS.SIGNATURE_VALID_DURATION) {
        console.error(ERROR_MESSAGES.SIGNATURE_EXPIRED(
          signatureTime.toISOString(),
          currentTime.toISOString()
        ));
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating signature timestamp:", error);
      return false;
    }
  },

  /**
   * Validates agenda signature
   */
  async validateAgendaSignature(
    metadata: AgendaMetadata,
    isUpdate: boolean = false
  ): Promise<boolean> {
    try {
      const { creator, id, transaction } = metadata;
      const timestamp = isUpdate ? metadata.updatedAt! : metadata.createdAt;

      // 1. Validate signature timestamp (within 1 hour)
      if (!this.validateSignatureTimestamp(timestamp)) {
        return false;
      }

      // 2. Generate signature message and validate
      const message = this.getAgendaSignatureMessage(id, transaction, timestamp, isUpdate);
      const recovered = ethers.verifyMessage(message, creator.signature);
      const expectedAddress = creator.address.toLowerCase();
      const isValid = recovered.toLowerCase() === expectedAddress;

      if (!isValid) {
        console.error(ERROR_MESSAGES.SIGNATURE_MISMATCH(
          recovered.toLowerCase(),
          expectedAddress.toLowerCase()
        ));
      }

      return isValid;
    } catch (error) {
      console.error("Signature validation error:", error instanceof Error ? error.message : error);
      return false;
    }
  },

  /**
   * Validates transaction sender
   */
  validateTransactionSender(tx: Transaction, expectedSender: string): boolean {
    if (!tx) {
      throw new Error("Transaction not found");
    }

    const isValid = tx.from.toLowerCase() === expectedSender.toLowerCase();
    if (!isValid) {
      console.error(ERROR_MESSAGES.SENDER_MISMATCH(
        tx.from.toLowerCase(),
        expectedSender.toLowerCase()
      ));
    }
    return isValid;
  },

  /**
   * Validates agenda ID from transaction event
   */
  validateAgendaIdFromEvent(tx: any, expectedAgendaId: number): boolean {
    try {
      if (!tx) {
        throw new Error("Transaction receipt not found");
      }

      if (!tx.logs || tx.logs.length === 0) {
        throw new Error("AgendaCreated event not found in transaction logs");
      }

      let hasAgendaCreatedEvent = false;

      for (const log of tx.logs) {
        try {
          const parsedLog = agendaCreatedEventInterface.parseLog({
            topics: log.topics,
            data: log.data
          });

          if (parsedLog && parsedLog.name === 'AgendaCreated') {
            hasAgendaCreatedEvent = true;
            const eventData = parsedLog.args as unknown as AgendaCreatedEvent;
            const eventAgendaId = Number(eventData.id); // Changed from agendaId to id

            // Event data validation
            if (eventAgendaId !== expectedAgendaId) {
              console.error(ERROR_MESSAGES.AGENDA_ID_MISMATCH(eventAgendaId, expectedAgendaId));
              return false;
            }

            return true;
          }
        } catch (parseError) {
          // If this looks like an AgendaCreated event but fails to parse, throw specific error
          const agendaCreatedTopic = agendaCreatedEventInterface.getEvent('AgendaCreated')?.topicHash;
          if (log.topics && log.topics[0] === agendaCreatedTopic) {
            throw new Error(`Failed to parse AgendaCreated event log. Error: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
          }
          // Continue to next log if parsing fails for other events
          continue;
        }
      }

      if (!hasAgendaCreatedEvent) {
        throw new Error("AgendaCreated event not found in transaction logs");
      }

      return false;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generates signature message
   */
  getAgendaSignatureMessage(
    agendaId: number,
    txHash: string,
    timestamp: string,
    isUpdate: boolean = false
  ): string {
    return isUpdate
      ? SIGNATURE_MESSAGES.UPDATE(agendaId, txHash, timestamp)
      : SIGNATURE_MESSAGES.CREATE(agendaId, txHash, timestamp);
  },

  /**
   * Validates schema using Zod
   */
  validateSchema(metadata: any): { success: boolean; error?: any } {
    try {
      const result = AgendaMetadataSchema.safeParse(metadata);
      return result;
    } catch (error) {
      return { success: false, error };
    }
  }
};

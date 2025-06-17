import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// 현재 디렉토리 설정 (Jest와 ES 모듈 호환)
const currentDir = path.resolve(process.cwd(), 'src/config');

/**
 * ABI Loader utility for managing contract ABIs
 */
export class ABILoader {
  private static abiCache: Map<string, any[]> = new Map();

  /**
   * Load ABI from JSON file
   */
  static loadABI(contractName: string): any[] {
    if (this.abiCache.has(contractName)) {
      return this.abiCache.get(contractName)!;
    }

    try {
      const abiPath = path.join(currentDir, 'abi', `${contractName}.json`);
      const abiContent = fs.readFileSync(abiPath, 'utf8');
      const abi = JSON.parse(abiContent);

      this.abiCache.set(contractName, abi);
      return abi;
    } catch (error) {
      throw new Error(`Failed to load ABI for contract ${contractName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get ethers Interface for a contract
   */
  static getInterface(contractName: string): ethers.Interface {
    const abi = this.loadABI(contractName);
    return new ethers.Interface(abi);
  }

  /**
   * Get specific event from contract ABI
   */
  static getEvent(contractName: string, eventName: string): ethers.EventFragment | null {
    const iface = this.getInterface(contractName);
    return iface.getEvent(eventName);
  }

  /**
   * Get event topic hash
   */
  static getEventTopicHash(contractName: string, eventName: string): string {
    const event = this.getEvent(contractName, eventName);
    if (!event) {
      throw new Error(`Event ${eventName} not found in contract ${contractName}`);
    }
    return event.topicHash;
  }
}

/**
 * Pre-configured contract interfaces
 */
export const ContractInterfaces = {
  DAO: ABILoader.getInterface('dao-contract'),
} as const;

/**
 * Pre-configured event topic hashes
 */
export const EventTopics = {
  AgendaCreated: ABILoader.getEventTopicHash('dao-contract', 'AgendaCreated'),
} as const;
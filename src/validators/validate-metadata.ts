#!/usr/bin/env node

import { ethers } from "ethers";
import { AgendaValidator } from "./agenda-validator.js";
import { AgendaMetadata, AgendaMetadataSchema } from "../types/agenda-metadata.js";
import { getRpcUrl } from "../config/rpc.js";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Load environment variables (for local development)
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check file existence using GitHub raw URL for main branch
async function checkFileExistsOnGitHub(filePath: string): Promise<boolean> {
  try {
    const githubRawUrl = `https://raw.githubusercontent.com/tokamak-network/dao-agenda-metadata-repository/main/${filePath}`;
    const response = await fetch(githubRawUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn(`Warning: Could not check file existence on GitHub: ${error}`);
    return false;
  }
}

// Check if file exists locally
function checkFileExistsLocally(filePath: string): boolean {
  try {
    return existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Check file existence (local first, then GitHub)
async function checkFileExists(filePath: string): Promise<boolean> {
  const localExists = checkFileExistsLocally(filePath);
  if (localExists) {
    return true;
  }

  return await checkFileExistsOnGitHub(filePath);
}

// Validation step type definition
type ValidationStep =
  | 'schema'           // Schema validation
  | 'format'           // File format and path validation
  | 'pr-title'         // PR title consistency validation
  | 'time'             // Time validation (1-hour rule)
  | 'signature'        // Signature validation
  | 'transaction'      // Transaction validation
  | 'all';             // All validations

type ValidationSteps = ValidationStep[];

// Individual validation functions
async function validateSchema(metadata: AgendaMetadata): Promise<boolean> {
  try {
    const result = AgendaMetadataSchema.safeParse(metadata);
    if (!result.success) {
      console.error("❌ Schema validation failed:", result.error.errors);
      return false;
    }
    return true;
  } catch (error) {
    console.error("❌ Schema validation error:", error);
    return false;
  }
}

// Extract network from file path
function extractNetworkFromPath(filePath: string): string | null {
  const match = filePath.match(/data\/agendas\/([^\/]+)\//);
  return match ? match[1] : null;
}

// Extract ID from filename
function extractIdFromFilename(filePath: string): number | null {
  const match = filePath.match(/agenda-(\d+)\.json$/);
  return match ? parseInt(match[1], 10) : null;
}

async function validateFormat(metadata: AgendaMetadata, filePath: string): Promise<boolean> {
  try {
    // Extract network and ID from file path
    const networkFromPath = extractNetworkFromPath(filePath);
    const idFromFilename = extractIdFromFilename(filePath);

    if (!networkFromPath) {
      console.error("❌ Could not extract network from file path:", filePath);
      return false;
    }

    if (idFromFilename === null) {
      console.error("❌ Could not extract ID from filename:", filePath);
      return false;
    }

    // Validate network consistency
    if (metadata.network !== networkFromPath) {
      console.error(`❌ Network mismatch: metadata.network="${metadata.network}", path network="${networkFromPath}"`);
      return false;
    }

    // Validate ID consistency
    if (metadata.id !== idFromFilename) {
      console.error(`❌ ID mismatch: metadata.id=${metadata.id}, filename ID=${idFromFilename}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Format validation error:", error);
    return false;
  }
}

async function validatePrTitle(metadata: AgendaMetadata, filePath: string, prTitle: string): Promise<boolean> {
  try {
    // Determine operation type from PR title, not from metadata
    const isUpdateFromTitle = prTitle.startsWith("[Agenda Update]");
    const isCreateFromTitle = prTitle.startsWith("[Agenda]") && !isUpdateFromTitle;

    if (!isUpdateFromTitle && !isCreateFromTitle) {
      console.error(`❌ PR title must start with "[Agenda]" or "[Agenda Update]"`);
      console.error(`   Actual: "${prTitle}"`);
      return false;
    }

    const expectedPrefix = isUpdateFromTitle ? "[Agenda Update]" : "[Agenda]";
    const expectedPattern = `${expectedPrefix} ${metadata.network} - ${metadata.id} - `;

    if (!prTitle.startsWith(expectedPattern)) {
      console.error(`❌ PR title format error:`);
      console.error(`   Expected: "${expectedPattern}<title>"`);
      console.error(`   Actual: "${prTitle}"`);
      return false;
    }

    // Check file existence based on PR title operation type
    const fileExistsOnGitHub = await checkFileExistsOnGitHub(filePath);

    if (isUpdateFromTitle && !fileExistsOnGitHub) {
      console.error(`❌ Update operation requires existing file on GitHub main branch, but ${filePath} does not exist`);
      return false;
    }

    if (isCreateFromTitle && fileExistsOnGitHub) {
      console.error(`❌ Create operation requires new file, but ${filePath} already exists on GitHub main branch`);
      return false;
    }



    return true;
  } catch (error) {
    console.error("❌ PR title validation error:", error);
    return false;
  }
}

async function validateTime(metadata: AgendaMetadata): Promise<boolean> {
  try {
    const isUpdate = !!metadata.updatedAt;
    const timestampToCheck = isUpdate ? metadata.updatedAt! : metadata.createdAt;

    if (!AgendaValidator.validateSignatureTimestamp(timestampToCheck)) {
      return false;
    }

    // For updates, check that updatedAt is later than createdAt
    if (isUpdate) {
      const createdTime = new Date(metadata.createdAt);
      const updatedTime = new Date(metadata.updatedAt!);

      if (updatedTime <= createdTime) {
        console.error(`❌ updatedAt must be later than createdAt`);
        console.error(`   createdAt: ${metadata.createdAt}`);
        console.error(`   updatedAt: ${metadata.updatedAt}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Time validation error:", error);
    return false;
  }
}

async function validateSignature(metadata: AgendaMetadata): Promise<boolean> {
  try {
    const isUpdate = !!metadata.updatedAt;
    return await AgendaValidator.validateAgendaSignature(metadata, isUpdate);
  } catch (error) {
    console.error("❌ Signature validation error:", error);
    return false;
  }
}

async function validateTransaction(metadata: AgendaMetadata): Promise<boolean> {
  try {
    const rpcUrl = getRpcUrl(metadata.network);
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Get transaction
    const tx = await provider.getTransaction(metadata.transaction);
    if (!tx) {
      console.error(`❌ Transaction not found: ${metadata.transaction}`);
      return false;
    }

    // Validate transaction sender
    if (!tx.from) {
      console.error("❌ Transaction has no sender address");
      return false;
    }

    if (!AgendaValidator.validateTransactionSender(tx as any, metadata.creator.address)) {
      return false;
    }

    // Validate calldata
    if (!validateCalldata(tx, metadata)) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Transaction validation error:", error);
    return false;
  }
}

// Validate calldata consistency
function validateCalldata(tx: any, metadata: AgendaMetadata): boolean {
  try {
    // Decode TON.approveAndCall transaction data
    const approveAndCallInterface = new ethers.Interface([
      "function approveAndCall(address spender, uint256 amount, bytes data)"
    ]);

    let decodedData;
    try {
      decodedData = approveAndCallInterface.decodeFunctionData("approveAndCall", tx.data);
    } catch (error) {
      console.error("❌ Failed to decode approveAndCall data:", error);
      return false;
    }

    const callData = decodedData[2]; // data parameter

    // Try to decode as agenda parameters (both legacy and new versions)
    let agendaParams;
    let hasmemo = false;

    try {
      // Try legacy version first (without memo)
      agendaParams = ethers.AbiCoder.defaultAbiCoder().decode(
        ["address[]", "uint128", "uint128", "bool", "bytes[]"],
        callData
      );
    } catch (legacyError) {
      try {
        // Try new version (with memo)
        agendaParams = ethers.AbiCoder.defaultAbiCoder().decode(
          ["address[]", "uint128", "uint128", "bool", "bytes[]", "string"],
          callData
        );
        hasmemo = true;
      } catch (error) {
        console.error("❌ Failed to decode agenda parameters:", error);
        console.error("   Legacy error:", legacyError);
        console.error("   New version error:", error);
        return false;
      }
    }

    const [addresses, , , , calldatas, memo] = agendaParams;

    // Validate addresses array
    const metadataAddresses = metadata.actions.map(action => action.contractAddress.toLowerCase());
    const txAddresses = addresses.map((addr: string) => addr.toLowerCase());

    if (JSON.stringify(metadataAddresses) !== JSON.stringify(txAddresses)) {
      console.error("❌ Actions contractAddress array does not match transaction addresses");
      console.error("   Metadata addresses:", metadataAddresses);
      console.error("   Transaction addresses:", txAddresses);
      return false;
    }

    // Validate calldata array
    const metadataCalldatas = metadata.actions.map(action => action.calldata.toLowerCase());
    const txCalldatas = calldatas.map((data: string) => data.toLowerCase());

    if (JSON.stringify(metadataCalldatas) !== JSON.stringify(txCalldatas)) {
      console.error("❌ Actions calldata array does not match transaction calldatas");
      console.error("   Metadata calldatas:", metadataCalldatas);
      console.error("   Transaction calldatas:", txCalldatas);
      return false;
    }

    // Validate memo (new version only)
    if (hasmemo && memo !== undefined) {
      const metadataMemo = metadata.snapshotUrl || metadata.discourseUrl || "";
      if (memo !== metadataMemo) {
        console.error("❌ Memo does not match snapshotUrl/discourseUrl");
        console.error("   Transaction memo:", memo);
        console.error("   Metadata memo:", metadataMemo);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Calldata validation error:", error);
    return false;
  }
}

// Main validation function
export async function validateMetadata(
  filePath: string,
  prTitle: string,
  steps: ValidationSteps = ['all']
): Promise<boolean> {
  try {
    console.log(`🚀 Starting validation with steps: ${steps.join(', ')}`);

    // Read and parse metadata file
    const fileContent = readFileSync(filePath, 'utf-8');
    const metadata: AgendaMetadata = JSON.parse(fileContent);

    // Determine which steps to run
    const stepsToRun = steps.includes('all') ?
      ['schema', 'format', 'pr-title', 'time', 'signature', 'transaction'] :
      steps;

    // Run validation steps
    for (const step of stepsToRun) {
      console.log(`🔍 Running ${step} validation...`);

      let isValid = false;
      switch (step) {
        case 'schema':
          isValid = await validateSchema(metadata);
          break;
        case 'format':
          isValid = await validateFormat(metadata, filePath);
          break;
        case 'pr-title':
          isValid = await validatePrTitle(metadata, filePath, prTitle);
          break;
        case 'time':
          isValid = await validateTime(metadata);
          break;
        case 'signature':
          isValid = await validateSignature(metadata);
          break;
        case 'transaction':
          isValid = await validateTransaction(metadata);
          break;
        default:
          console.error(`❌ Unknown validation step: ${step}`);
          return false;
      }

      if (!isValid) {
        console.error(`❌ ${step} validation failed`);
        return false;
      }

      console.log(`✅ ${step.charAt(0).toUpperCase() + step.slice(1)} validation passed`);
    }

    console.log(`✅ ${filePath} is valid (${stepsToRun.join(', ')} validations passed).`);
    return true;

  } catch (error) {
    console.error(`❌ ${filePath} error:`, error instanceof Error ? error.message : error);
    return false;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npm run validate -- [--pr-title '<PR_TITLE>'] [--check <steps>] <file1.json> [file2.json ...]

Options:
  --pr-title <title>    PR title for validation (required)
  --check <steps>       Comma-separated validation steps to run (default: all)
                        Available steps: schema, format, pr-title, time, signature, transaction, all
  --help, -h           Show this help message

Examples:
  npm run validate -- --pr-title "[Agenda] sepolia - 123 - Test Agenda" data/agendas/sepolia/agenda-123.json
  npm run validate -- --pr-title "[Agenda Update] mainnet - 456 - Updated Agenda" --check schema,time data/agendas/mainnet/agenda-456.json
  npm run validate -- --pr-title "[Agenda] sepolia - 789 - New Agenda" --check signature data/agendas/sepolia/agenda-789.json

Validation Steps:
  schema        - JSON schema validation
  format        - File format and path validation
  pr-title      - PR title consistency validation
  time          - Time validation (1-hour rule)
  signature     - Creator signature validation
  transaction   - On-chain transaction validation
  all           - Run all validation steps (default)

Environment Variables:
  PR_TITLE             Alternative way to provide PR title
    `);
    process.exit(0);
  }

  // Parse arguments
  let prTitle = process.env.PR_TITLE || '';
  let checkSteps: ValidationSteps = ['all'];
  const files: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--pr-title' && i + 1 < args.length) {
      prTitle = args[i + 1];
      i++; // Skip next argument
    } else if (arg === '--check' && i + 1 < args.length) {
      checkSteps = args[i + 1].split(',') as ValidationSteps;
      i++; // Skip next argument
    } else if (!arg.startsWith('--')) {
      files.push(arg);
    }
  }

  // Validate arguments
  if (!prTitle) {
    console.error('❌ PR title is required. Use --pr-title option or set PR_TITLE environment variable.');
    process.exit(1);
  }

  if (files.length === 0) {
    console.error('❌ At least one file path is required.');
    process.exit(1);
  }

  // Validate files
  let allValid = true;
  for (const file of files) {
    const isValid = await validateMetadata(file, prTitle, checkSteps);
    if (!isValid) {
      allValid = false;
    }
  }

  process.exit(allValid ? 0 : 1);
}

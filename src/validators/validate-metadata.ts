import * as fs from "fs";
import * as path from "path";
import { ethers } from "ethers";
import {
  validateSchema,
  validateTransactionSender,
  validateAgendaIdFromEvent,
  validateAgendaSignature,
} from "./agenda-validator";

// 명령행 인자 파싱
let files: string[] = [];
let prTitleArg: string | undefined;
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === "--pr-title" && i + 1 < process.argv.length) {
    prTitleArg = process.argv[i + 1];
    i++;
  } else {
    files.push(process.argv[i]);
  }
}
if (files.length === 0) {
  console.error("Usage: ts-node src/validators/validate-metadata.ts [--pr-title '<PR_TITLE>'] <file1.json> [file2.json ...]");
  process.exit(1);
}

// PR 제목에서 값 추출
const prTitle = prTitleArg || process.env.PR_TITLE;
function parsePrTitle(title: string) {
  // [Agenda] <네트워크> - <id> - <제목>
  const match = title.match(/^\[Agenda\]\s+(mainnet|sepolia)\s*-\s*(\d+)\s*-\s*(.+)$/);
  if (!match) return null;
  return {
    network: match[1],
    id: Number(match[2]),
    title: match[3].trim(),
  };
}

let hasError = false;

(async () => {
  if (files.length > 1) {
    console.error("❌ Only one metadata file is allowed per PR.");
    process.exit(1);
  }
  for (const filePath of files) {
    try {
      // 파일 경로에서 network 추출 (data/agendas/<network>/...)
      const match = filePath.match(/data\/agendas\/(mainnet|sepolia)\//);
      const pathNetwork = match ? match[1] : null;
      // 파일명에서 id 추출 (agenda-<id>.json)
      const fileNameMatch = filePath.match(/agenda-(\d+)\.json$/);
      const fileId = fileNameMatch ? Number(fileNameMatch[1]) : null;
      if (!fileId) {
        hasError = true;
        console.error(`❌ File name must be in the form agenda-<id>.json (got: ${filePath})`);
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      // 파일명과 id 일치 검증
      if (fileId !== null && data.id !== undefined && fileId !== data.id) {
        hasError = true;
        console.error(`❌ File name id (${fileId}) does not match metadata id (${data.id})`);
      }
      // PR 제목과 메타데이터 값 비교
      if (prTitle) {
        const parsed = parsePrTitle(prTitle);
        if (!parsed) {
          hasError = true;
          console.error(`❌ PR title does not match required format: [Agenda] <network> - <id> - <title>`);
        } else {
          if (parsed.network !== data.network) {
            hasError = true;
            console.error(`❌ PR title network (${parsed.network}) does not match metadata network (${data.network})`);
          }
          if (parsed.id !== data.id) {
            hasError = true;
            console.error(`❌ PR title id (${parsed.id}) does not match metadata id (${data.id})`);
          }
          if (parsed.title !== data.title) {
            hasError = true;
            console.error(`❌ PR title title (${parsed.title}) does not match metadata title (${data.title})`);
          }
        }
      }
      // 파일 경로와 network 값 비교
      if (pathNetwork && data.network && pathNetwork !== data.network) {
        hasError = true;
        console.error(`❌ File path network (${pathNetwork}) does not match metadata network (${data.network})`);
      }
      const result = validateSchema(data);
      if (result.success) {
        let txCheck = true;
        let idCheck = true;
        let sigCheck = true;
        if (data.network && data.transaction && data.creator && data.creator.address && data.id) {
          try {
            const rpcUrl = data.network === "mainnet"
              ? process.env.MAINNET_RPC_URL
              : process.env.SEPOLIA_RPC_URL;
            if (!rpcUrl) throw new Error(`Missing RPC URL for network: ${data.network}`);
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const tx = await provider.getTransaction(data.transaction);
            if (!tx) throw new Error("Transaction not found");
            const receipt = await provider.getTransactionReceipt(data.transaction);
            if (!receipt) throw new Error("Transaction receipt not found");
            txCheck = validateTransactionSender(tx, data.creator.address);
            if (!txCheck) {
              hasError = true;
              console.error(`❌ ${filePath} transaction sender does not match creator.address`);
            }
            idCheck = validateAgendaIdFromEvent(receipt, data.id);
            if (!idCheck) {
              hasError = true;
              console.error(`❌ ${filePath} AgendaCreated event id does not match metadata id`);
            }
            // signature 검증
            sigCheck = await validateAgendaSignature(data.id, data.transaction, data.creator.signature, data.creator.address);
            if (!sigCheck) {
              hasError = true;
              console.error(`❌ ${filePath} creator.signature is invalid or does not match creator.address`);
            }
          } catch (e) {
            hasError = true;
            console.error(`❌ ${filePath} transaction/event/signature validation error:`, e);
          }
        }
        if (txCheck && idCheck && sigCheck && !hasError) {
          console.log(`✅ ${filePath} is valid.`);
        }
      } else {
        hasError = true;
        console.error(`❌ ${filePath} validation failed:`);
        console.error(JSON.stringify(result.error.issues, null, 2));
      }
    } catch (e) {
      hasError = true;
      console.error(`❌ ${filePath} error:`, e);
    }
  }
  if (hasError) {
    process.exit(2);
  } else {
    process.exit(0);
  }
})();

# dao-agenda-metadata-repository

A secure system for uploading and automatically validating DAO agenda metadata.

## Key Features
- Upload agenda metadata via Pull Request (PR)
- Automatic validation (CI/CD) using GitHub Actions
- Comprehensive validation: transaction, event, signature, schema, etc.
- Network-specific folder structure (mainnet, sepolia)

## Metadata Example
```json
{
  "id": 1,
  "title": "Increase Treasury Allocation",
  "description": "Proposal to increase the DAO treasury allocation for Q3 2024.",
  "network": "mainnet",
  "transaction": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "creator": {
    "address": "0x1111111111111111111111111111111111111111",
    "signature": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef"
  },
  "snapshotUrl": "https://snapshot.org/#/mydao.eth/proposal/1",
  "discourseUrl": "https://forum.mydao.com/t/proposal-1",
  "actions": [
    {
      "title": "updateSeigniorage()",
      "contractAddress": "0x2320542ae933FbAdf8f5B97cA348c7CeDA90fAd7",
      "method": "updateSeigniorage()",
      "calldata": "0x764a7856",
      "abi": [
        {
          "inputs": [],
          "name": "updateSeigniorage",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    }
  ]
}
```

## Folder Structure
```
data/
  agendas/
    mainnet/
      agenda-1.json
    sepolia/
      agenda-2.json
```

## Metadata Filename Convention
- The metadata filename must be in the form `agenda-<id>.json`, and the id must match the `id` field in the metadata.
- Example:
  - data/agendas/mainnet/agenda-1.json
  - data/agendas/sepolia/agenda-2.json
- If the filename and id do not match, validation will fail.

## PR and Automatic Validation
- When a PR is created, only the changed metadata file is automatically validated.
- PR Title Format: `[Agenda] <network> - <id> - <title>`
  - Example: `[Agenda] sepolia - 64 - Test Agenda`
  - `<network>` must be either "mainnet" or "sepolia"
  - `<id>` must match the agenda ID in the metadata file
  - `<title>` must match the title in the metadata file
- PR Description Format:
  ```
  ## Agenda Metadata Submission

  - Network: mainnet/sepolia
  - Agenda ID: 1
  - Title: Increase Treasury Allocation
  - Transaction Hash: 0x...
  - Creator Address: 0x...
  - Signature: 0x...

  ## Description
  Please include a summary of the changes and the related issue.

  ## Type of change
  - [ ] New agenda
  - [ ] Update existing agenda
  - [ ] Other (please describe)

  ## Checklist
  - [ ] My PR title follows the format: `[Agenda] <network> - <agenda_id> - <agenda_title>`
  - [ ] I have added only one agenda file
  - [ ] I have verified the agenda metadata
  - [ ] I have checked the agenda ID matches the PR title
  - [ ] I have verified the network (mainnet/sepolia) matches the PR title

  ```
- Validation checks:
  - Schema (required fields, types, format)
  - Transaction `from` address matches `creator.address`
  - The `id` in the AgendaCreated event of the transaction matches the metadata id
  - **creator.signature is required and must match the message and address**
- If validation fails, the PR cannot be merged.

### How to Sign Your Agenda Metadata

To prove ownership of the agenda registration, sign a message using the same wallet that submitted the agenda registration transaction. Here's how:

1. Run the DAO Agenda Signature Generation Tool
  ```
  cd src/sign
  python -m http.server 8000
  ```
2. Visit the tool in your browser:
  ```
  http://localhost:8000
  ```
  - Enter the agenda ID and transaction hash, then click the Sign Message button.

3. Connect your MetaMask wallet (must be the same wallet that submitted the agenda transaction)

4. When prompted, MetaMask will ask you to sign the following message (replace `<id>` and `<tx-hash>`):

  **Signature Message Format:**
  ```
  I am the one who submitted agenda #<id> via transaction <tx-hash>. This signature proves that I am the one who submitted this agenda.
  ```

5. Review the message in MetaMask

6. Click "Sign" to approve

7. Copy the generated signature (a long hex string starting with "0x")

8. Include this signature in your metadata file under the `creator.signature` field

## Local Validation & Testing
1. Install dependencies
  ```sh
  npm install
  ```
2. Set environment variables (.env or export)
  ```sh
  export MAINNET_RPC_URL="https://..."
  export SEPOLIA_RPC_URL="https://..."
  ```
3. **Validate a specific metadata file**
  ```sh
  npm run validate -- --pr-title "[Agenda] sepolia - 64 - Test Agenda" data/agendas/sepolia/agenda-64.json
  ```
  - Or set the PR_TITLE environment variable.
  - The validation result will be printed in the terminal.
  - To skip PR title validation, omit the --pr-title option.

  **Validation Output Example:**
  - Success:
    ```
    ✅ data/agendas/sepolia/agenda-64.json is valid.
    ```
  - Failure:
    ```
    ❌ PR title id (2) does not match metadata id (1)
    ❌ File path network (mainnet) does not match metadata network (sepolia)
    ❌ data/agendas/sepolia/agenda-64.json creator.signature is invalid or does not match creator.address
    ❌ data/agendas/sepolia/agenda-64.json validation failed:
    {
      "issues": [
        {
          "code": "invalid_type",
          "expected": "number",
          "received": "string",
          "path": ["id"],
          "message": "Expected number, received string"
        }
      ]
    }
    ```
4. Run tests
  ```sh
  npm test
  ```

## GitHub Actions Secrets
- In Settings > Secrets and variables > Actions, add:
  - `MAINNET_RPC_URL`
  - `SEPOLIA_RPC_URL`

## Contributing & Contact
- PRs and issues are welcome!
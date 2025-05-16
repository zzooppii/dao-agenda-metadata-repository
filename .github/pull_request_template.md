# PR Title Rules

- Please follow the format below:

  `[Agenda] <network> - <agenda_id> - <agenda_title>`

  Example: `[Agenda] mainnet - 1 - Increase Treasury Allocation`

---

## Metadata Filename Rules
- The metadata filename must follow the format `agenda-<id>.json`, where id must match the id field in the metadata.
- Examples:
  - data/agendas/mainnet/agenda-1.json
  - data/agendas/sepolia/agenda-2.json

---

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

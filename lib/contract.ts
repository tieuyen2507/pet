export const petAttestationAbi = [
  "function attestRecord(bytes32 recordId, bytes32 petId, bytes32 recordHash, uint8 recordType)",
  "function getAttestation(bytes32 recordId) view returns (bytes32 petId, bytes32 recordHash, address issuer, uint8 recordType, uint64 timestamp)",
  "event RecordAttested(bytes32 indexed recordId, bytes32 indexed petId, bytes32 recordHash, address issuer, uint8 recordType, uint64 timestamp)",
];

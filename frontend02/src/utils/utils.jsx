export const encryptContractId = (contractId) => {
  return btoa(contractId); // Base64 encode
};

export const decryptContractId = (encryptedContractId) => {
  return atob(encryptedContractId); // Base64 decode
};

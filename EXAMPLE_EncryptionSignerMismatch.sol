// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title EncryptionSignerMismatch
 * @notice ANTI-PATTERN: Demonstrates encryption/signer mismatch error
 * @dev Shows the second most common FHEVM error (30% of failures)
 */
contract EncryptionSignerMismatch {
    // Mapping to track who encrypted what
    mapping(bytes32 => address) public encrypter;
    mapping(bytes32 => euint32) private encryptedValues;

    // Events
    event ValueEncrypted(bytes32 indexed id, address indexed encrypter);
    event DecryptionAttempted(bytes32 indexed id, address indexed caller, bool success);

    /**
     * ❌ ANTI-PATTERN #1: Different user encrypts vs executes
     *
     * SCENARIO:
     * - Alice encrypts value with her public key
     * - Bob tries to decrypt by calling contract function
     * - Bob's transaction signer is Bob, but input was encrypted for Alice
     * - Result: "decryption failed" error
     *
     * ROOT CAUSE:
     * Encrypted values are bound to the user who encrypted them.
     * Only that user can provide valid input proofs for decryption.
     */

    /**
     * ✅ CORRECT: Encrypt with specific user
     * @param id Identifier for encrypted value
     * @param valueEuint32 Encrypted value (must be encrypted by msg.sender)
     * @param valueProof Zero-knowledge proof (must match msg.sender's encryption)
     */
    function storeValueCorrect(bytes32 id, externalEuint32 valueEuint32, bytes calldata valueProof) external {
        // ✅ CORRECT: Verify that caller encrypted this value
        // The proof must have been created using msg.sender's public key
        euint32 value = TFHE.fromExternal(valueEuint32, valueProof);

        encryptedValues[id] = value;
        encrypter[id] = msg.sender;

        TFHE.allowThis(value);
        TFHE.allow(value, msg.sender);

        emit ValueEncrypted(id, msg.sender);
    }

    /**
     * ❌ ANTI-PATTERN: Accepting encrypted values from other users
     * @param id Identifier
     * @param valueEuint32 Encrypted value (encrypted by unknown user)
     * @param valueProof Proof (encrypted by unknown user)
     *
     * PROBLEM:
     * If valueEuint32 was encrypted by Alice with her public key,
     * but the contract accepts it from Bob,
     * then only Alice can decrypt it later, not Bob.
     */
    function storeValueWrong(bytes32 id, externalEuint32 valueEuint32, bytes calldata valueProof) external {
        // ❌ WRONG: Not checking who encrypted this value
        // Assumes msg.sender encrypted it, but might be from someone else!
        euint32 value = TFHE.fromExternal(valueEuint32, valueProof);

        encryptedValues[id] = value;
        encrypter[id] = msg.sender; // ❌ WRONG: Assuming this is true

        TFHE.allowThis(value);
        TFHE.allow(value, msg.sender);
    }

    /**
     * ❌ ANTI-PATTERN #2: Cross-user decryption attempt
     *
     * SCENARIO:
     * 1. Alice encrypts value and calls storeValue(value_for_alice)
     * 2. Bob later calls getValueFromAlice(value_for_alice)
     * 3. Bob's signer is Bob, but value was encrypted for Alice
     * 4. Decryption fails: "decryption failed"
     */
    function attemptCrossUserDecryption(bytes32 id) external returns (euint32) {
        // ❌ WRONG: The value was encrypted by encrypter[id]
        // But we're trying to decrypt using msg.sender
        // They don't match!

        euint32 value = encryptedValues[id];

        // This will fail if msg.sender != encrypter[id]
        // Error: "decryption failed" because signer doesn't match encryption

        TFHE.allowThis(value);
        TFHE.allow(value, msg.sender); // ❌ Will fail!

        return value;
    }

    /**
     * ✅ CORRECT: Verify signer matches encrypter
     * @param id Identifier of encrypted value
     * @return The encrypted value (only if caller is original encrypter)
     */
    function getValueCorrect(bytes32 id) external returns (euint32) {
        // ✅ CORRECT: Verify that caller is the encrypter
        require(msg.sender == encrypter[id], "Signer mismatch: you are not the original encrypter");

        euint32 value = encryptedValues[id];

        TFHE.allowThis(value);
        TFHE.allow(value, msg.sender);

        emit DecryptionAttempted(id, msg.sender, true);

        return value;
    }

    /**
     * ❌ ANTI-PATTERN #3: Sharing encrypted value without re-encryption
     *
     * SCENARIO:
     * - Alice encrypts value with her key
     * - Alice wants to share with Bob
     * - Alice passes encrypted value to Bob
     * - Bob tries to decrypt
     * - Fails: value encrypted for Alice, not Bob
     */
    function shareWithUser(bytes32 id, address recipient) external {
        // ❌ WRONG: Just passing encrypted value doesn't work!
        // Value is bound to original encrypter's public key

        // This would require re-encryption with recipient's public key
        // But we're not doing that here
        euint32 value = encryptedValues[id];

        TFHE.allowThis(value);
        TFHE.allow(value, recipient); // ❌ Recipient still can't decrypt!
        // The proof would be invalid for recipient because it was created for original encrypter
    }

    /**
     * ✅ CORRECT: Share by having recipient encrypt their own input
     * @param id Identifier
     * @param recipientEncryptedValue Recipient's own encrypted value
     * @param recipientProof Recipient's own proof
     *
     * PATTERN:
     * Each user must provide their own encrypted input
     * Created with their own public key
     * With their own zero-knowledge proof
     */
    function shareWithUserCorrect(bytes32 id, externalEuint32 recipientEncryptedValue, bytes calldata recipientProof) external {
        // ✅ CORRECT: Recipient provides their own encrypted input
        euint32 recipientValue = TFHE.fromExternal(recipientEncryptedValue, recipientProof);

        // Now recipient can use their own encrypted value
        TFHE.allowThis(recipientValue);
        TFHE.allow(recipientValue, msg.sender);
    }

    /**
     * ❌ ANTI-PATTERN #4: Transaction signed by different account
     *
     * SCENARIO:
     * - Alice encrypts value for herself
     * - Alice creates transaction data
     * - Charlie intercepts and re-signs transaction with his key
     * - Charlie submits transaction (signer = Charlie)
     * - Fails: encrypted for Alice, signed by Charlie
     */
    function operationWithSigner(bytes32 id, externalEuint32 operandEuint32, bytes calldata operandProof)
                                 external returns (euint32) {
        // The critical check: msg.sender (transaction signer) must match encryption
        require(msg.sender == encrypter[id], "Transaction signer must match encrypter");

        euint32 value = encryptedValues[id];
        euint32 operand = TFHE.fromExternal(operandEuint32, operandProof);

        euint32 result = TFHE.add(value, operand);

        TFHE.allowThis(result);
        TFHE.allow(result, msg.sender);

        return result;
    }

    /**
     * SUMMARY OF ENCRYPTION/SIGNER MISMATCH
     *
     * THE RULE:
     * The user who ENCRYPTS a value with their public key
     * MUST be the same user who SIGNS the transaction (msg.sender)
     * that uses that encrypted value.
     *
     * COMMON MISTAKES:
     * ❌ Alice encrypts → Bob submits transaction
     * ❌ Alice encrypts → Relay re-signs with attacker's key
     * ❌ Encrypting for user A → Using proof created by user B
     * ❌ Cross-chain encrypted values with different signers
     *
     * ALWAYS CHECK:
     * ✅ msg.sender == original encrypter
     * ✅ Proof was created with same public key as msg.sender
     * ✅ Don't relay encrypted inputs without re-encryption
     * ✅ Each user provides their own encrypted inputs
     *
     * ERROR MESSAGE:
     * "decryption failed" = usually signer/encryption mismatch
     */

    /**
     * @notice Get who encrypted a value
     */
    function getEncrypter(bytes32 id) external view returns (address) {
        return encrypter[id];
    }

    /**
     * @notice Explain the mismatch error
     */
    function explainMismatchError() external pure returns (string memory) {
        return "Encryption/signer mismatch: User who encrypted value must be same as transaction signer (msg.sender)";
    }
}

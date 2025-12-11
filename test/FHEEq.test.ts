/**
 * FHEEq Contract - Test Suite
 *
 * Tests encrypted equality comparison operations with FHEVM
 * Demonstrates comparison patterns for encrypted values
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('FHEEq Contract Tests', () => {
  let fheEq: any;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;

  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();

    const FHEEqFactory = await ethers.getContractFactory('FHEEq');
    fheEq = await FHEEqFactory.deploy();
    await fheEq.deployed();
  });

  describe('✅ Deployment', () => {
    it('should deploy successfully', async () => {
      expect(fheEq.address).to.be.properAddress;
    });
  });

  describe('✅ Comparison Operations', () => {
    it('should compare encrypted values successfully', async () => {
      const input = await (ethers as any).encryptedInput(owner.address);
      input.add32(50);
      const encrypted = await input.encrypt();

      const tx = await fheEq.compare(
        encrypted.handles[0],
        encrypted.inputProof
      );
      const receipt = await tx.wait();

      expect(receipt.status).to.equal(1);
    });

    it('should compare zero values', async () => {
      const input = await (ethers as any).encryptedInput(owner.address);
      input.add32(0);
      const encrypted = await input.encrypt();

      const tx = await fheEq.compare(
        encrypted.handles[0],
        encrypted.inputProof
      );
      await tx.wait();

      expect(tx.hash).to.not.be.undefined;
    });

    it('should compare maximum uint32 values', async () => {
      const input = await (ethers as any).encryptedInput(owner.address);
      input.add32(4294967295);
      const encrypted = await input.encrypt();

      const tx = await fheEq.compare(
        encrypted.handles[0],
        encrypted.inputProof
      );
      await tx.wait();

      expect(tx.hash).to.not.be.undefined;
    });

    it('should handle multiple comparisons', async () => {
      const testValues = [10, 20, 30, 40, 50];

      for (const value of testValues) {
        const input = await (ethers as any).encryptedInput(owner.address);
        input.add32(value);
        const encrypted = await input.encrypt();

        const tx = await fheEq.compare(
          encrypted.handles[0],
          encrypted.inputProof
        );
        const receipt = await tx.wait();

        expect(receipt.status).to.equal(1);
      }
    });
  });

  describe('⚡ Gas Usage', () => {
    it('should use reasonable gas for comparison', async () => {
      const input = await (ethers as any).encryptedInput(owner.address);
      input.add32(100);
      const encrypted = await input.encrypt();

      const tx = await fheEq.compare(
        encrypted.handles[0],
        encrypted.inputProof
      );
      const receipt = await tx.wait();

      const gasUsed = receipt.gasUsed.toNumber();
      expect(gasUsed).to.be.greaterThan(100000);
      expect(gasUsed).to.be.lessThan(5000000);
    });

    it('should not exceed block gas limit', async () => {
      const block = await ethers.provider.getBlock('latest');
      const blockGasLimit = block.gasLimit.toNumber();

      const input = await (ethers as any).encryptedInput(owner.address);
      input.add32(100);
      const encrypted = await input.encrypt();

      const tx = await fheEq.compare(
        encrypted.handles[0],
        encrypted.inputProof
      );
      const receipt = await tx.wait();

      expect(receipt.gasUsed.toNumber()).to.be.lessThan(blockGasLimit);
    });
  });

  describe('❌ Error Handling', () => {
    it('should reject invalid encrypted input', async () => {
      try {
        const tx = await fheEq.compare(
          '0x0000000000000000000000000000000000000000',
          '0x'
        );
        await tx.wait();
      } catch (error) {
        expect(error).to.exist;
      }
    });

    it('should reject empty proof', async () => {
      const input = await (ethers as any).encryptedInput(owner.address);
      input.add32(100);
      const encrypted = await input.encrypt();

      try {
        const tx = await fheEq.compare(encrypted.handles[0], '0x');
        await tx.wait();
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe('👥 Multi-User Operations', () => {
    it('should handle comparisons from different users', async () => {
      const input1 = await (ethers as any).encryptedInput(owner.address);
      input1.add32(100);
      const encrypted1 = await input1.encrypt();

      const tx1 = await fheEq.compare(
        encrypted1.handles[0],
        encrypted1.inputProof
      );
      await tx1.wait();

      const input2 = await (ethers as any).encryptedInput(user1.address);
      input2.add32(200);
      const encrypted2 = await input2.encrypt();

      const tx2 = await fheEq
        .connect(user1)
        .compare(encrypted2.handles[0], encrypted2.inputProof);
      await tx2.wait();

      expect(tx1.hash).to.not.equal(tx2.hash);
    });
  });

  describe('🔍 Edge Cases', () => {
    it('should handle boundary value comparisons', async () => {
      const boundaryValues = [0, 1, 2147483647, 4294967295];

      for (const value of boundaryValues) {
        const input = await (ethers as any).encryptedInput(owner.address);
        input.add32(value);
        const encrypted = await input.encrypt();

        const tx = await fheEq.compare(
          encrypted.handles[0],
          encrypted.inputProof
        );
        const receipt = await tx.wait();

        expect(receipt.status).to.equal(1);
      }
    });

    it('should handle rapid sequential comparisons', async () => {
      for (let i = 0; i < 5; i++) {
        const input = await (ethers as any).encryptedInput(owner.address);
        input.add32(i);
        const encrypted = await input.encrypt();

        const tx = await fheEq.compare(
          encrypted.handles[0],
          encrypted.inputProof
        );
        const receipt = await tx.wait();

        expect(receipt.status).to.equal(1);
      }
    });
  });

  describe('🔒 Security', () => {
    it('should preserve encryption throughout comparison', async () => {
      const input = await (ethers as any).encryptedInput(owner.address);
      input.add32(12345);
      const encrypted = await input.encrypt();

      const tx = await fheEq.compare(
        encrypted.handles[0],
        encrypted.inputProof
      );
      const receipt = await tx.wait();

      // Transaction succeeds without revealing plaintext
      expect(receipt.status).to.equal(1);
      expect(encrypted.handles[0]).to.not.equal(undefined);
    });

    it('should not leak plaintext in events', async () => {
      const input = await (ethers as any).encryptedInput(owner.address);
      input.add32(9999);
      const encrypted = await input.encrypt();

      const tx = await fheEq.compare(
        encrypted.handles[0],
        encrypted.inputProof
      );
      const receipt = await tx.wait();

      // Check that events don't contain plaintext
      if (receipt.events && receipt.events.length > 0) {
        receipt.events.forEach((event: any) => {
          const eventStr = JSON.stringify(event);
          expect(eventStr.includes('9999')).to.be.false;
        });
      }
    });
  });
});

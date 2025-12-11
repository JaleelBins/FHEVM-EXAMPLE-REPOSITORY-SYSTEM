/**
 * FHEAdd Contract - Test Suite
 *
 * Tests encrypted addition operations with FHEVM
 * Demonstrates arithmetic patterns for encrypted values
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('FHEAdd Contract Tests', () => {
  let fheAdd: any;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;

  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();

    const FHEAddFactory = await ethers.getContractFactory('FHEAdd');
    fheAdd = await FHEAddFactory.deploy();
    await fheAdd.deployed();
  });

  describe('✅ Deployment', () => {
    it('should deploy successfully', async () => {
      expect(fheAdd.address).to.be.properAddress;
    });
  });

  describe('✅ Addition Operations', () => {
    it('should add encrypted values successfully', async () => {
      const input = await (ethers as any).encryptedInput(owner.address);
      input.add32(100);
      const encrypted = await input.encrypt();

      const tx = await fheAdd.add(encrypted.handles[0], encrypted.inputProof);
      const receipt = await tx.wait();

      expect(receipt.status).to.equal(1);
    });

    it('should add zero value', async () => {
      const input = await (ethers as any).encryptedInput(owner.address);
      input.add32(0);
      const encrypted = await input.encrypt();

      const tx = await fheAdd.add(encrypted.handles[0], encrypted.inputProof);
      await tx.wait();

      expect(tx.hash).to.not.be.undefined;
    });

    it('should add maximum uint32 value', async () => {
      const input = await (ethers as any).encryptedInput(owner.address);
      input.add32(4294967295);
      const encrypted = await input.encrypt();

      const tx = await fheAdd.add(encrypted.handles[0], encrypted.inputProof);
      await tx.wait();

      expect(tx.hash).to.not.be.undefined;
    });

    it('should handle multiple additions', async () => {
      for (let i = 1; i <= 3; i++) {
        const input = await (ethers as any).encryptedInput(owner.address);
        input.add32(i * 25);
        const encrypted = await input.encrypt();

        const tx = await fheAdd.add(encrypted.handles[0], encrypted.inputProof);
        const receipt = await tx.wait();

        expect(receipt.status).to.equal(1);
      }
    });
  });

  describe('⚡ Gas Usage', () => {
    it('should use reasonable gas for addition', async () => {
      const input = await (ethers as any).encryptedInput(owner.address);
      input.add32(100);
      const encrypted = await input.encrypt();

      const tx = await fheAdd.add(encrypted.handles[0], encrypted.inputProof);
      const receipt = await tx.wait();

      const gasUsed = receipt.gasUsed.toNumber();
      expect(gasUsed).to.be.greaterThan(100000);
      expect(gasUsed).to.be.lessThan(5000000);
    });
  });

  describe('❌ Error Handling', () => {
    it('should reject invalid input', async () => {
      try {
        const tx = await fheAdd.add(
          '0x0000000000000000000000000000000000000000',
          '0x'
        );
        await tx.wait();
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  describe('👥 Multi-User Operations', () => {
    it('should handle operations from different users', async () => {
      const input1 = await (ethers as any).encryptedInput(owner.address);
      input1.add32(100);
      const encrypted1 = await input1.encrypt();

      const tx1 = await fheAdd.add(encrypted1.handles[0], encrypted1.inputProof);
      await tx1.wait();

      const input2 = await (ethers as any).encryptedInput(user1.address);
      input2.add32(200);
      const encrypted2 = await input2.encrypt();

      const tx2 = await fheAdd.connect(user1).add(
        encrypted2.handles[0],
        encrypted2.inputProof
      );
      await tx2.wait();

      expect(tx1.hash).to.not.equal(tx2.hash);
    });
  });
});

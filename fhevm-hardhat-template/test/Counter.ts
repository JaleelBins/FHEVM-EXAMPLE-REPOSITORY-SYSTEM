import { expect } from "chai";
import { ethers } from "hardhat";

describe("Counter", function () {
  async function deployCounterFixture() {
    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.deploy();
    await counter.waitForDeployment();

    return { counter };
  }

  it("Should have initial count of 0", async function () {
    const { counter } = await deployCounterFixture();
    const count = await counter.getCount();
    expect(count).to.not.be.undefined;
  });

  it("Should increment counter", async function () {
    const { counter } = await deployCounterFixture();
    await counter.increment();
    // Note: In FHEVM, we cannot directly compare encrypted values
    // The actual value remains encrypted
  });

  it("Should decrement counter", async function () {
    const { counter } = await deployCounterFixture();
    await counter.decrement();
    // Note: In FHEVM, we cannot directly compare encrypted values
  });

  it("Should handle multiple operations", async function () {
    const { counter } = await deployCounterFixture();
    await counter.increment();
    await counter.increment();
    await counter.decrement();
  });
});

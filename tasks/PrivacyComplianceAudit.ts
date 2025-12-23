import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:deployPrivacyComplianceAudit")
  .addParam("privateKey", "The deployer private key")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const deployer = new ethers.Wallet(taskArguments.privateKey).connect(ethers.provider);
    const factory = await ethers.getContractFactory("PrivacyComplianceAudit", deployer);
    const privacyComplianceAudit = await factory.deploy();
    await privacyComplianceAudit.waitForDeployment();
    console.log(`PrivacyComplianceAudit contract deployed to: `, await privacyComplianceAudit.getAddress());
  });

task("task:requestAudit")
  .addParam("privateKey", "The user private key")
  .addParam("contract", "The PrivacyComplianceAudit contract address")
  .addOptionalParam("compliancetype", "The compliance type (0-5)", "0")
  .addOptionalParam("expectedscore", "The expected compliance score (0-100)", "80")
  .addOptionalParam("datahash", "The data hash", "0x0000000000000000000000000000000000000000000000000000000000000000")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const user = new ethers.Wallet(taskArguments.privateKey).connect(ethers.provider);
    const privacyComplianceAuditFactory = await ethers.getContractFactory("PrivacyComplianceAudit");
    const privacyComplianceAudit = privacyComplianceAuditFactory.attach(taskArguments.contract).connect(user);

    const complianceType = parseInt(taskArguments.compliancetype);
    const expectedScore = parseInt(taskArguments.expectedscore);
    const dataHash = taskArguments.datahash;

    const tx = await privacyComplianceAudit.requestAudit(complianceType, expectedScore, dataHash);
    const receipt = await tx.wait();

    console.log(`Audit request submitted. Transaction hash: ${receipt?.hash}`);

    // Extract audit ID from event
    if (receipt?.logs) {
      const event = receipt.logs[0];
      console.log(`Audit ID: ${event.topics[1]}`);
    }
  });

task("task:getTotalAudits")
  .addParam("contract", "The PrivacyComplianceAudit contract address")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const privacyComplianceAuditFactory = await ethers.getContractFactory("PrivacyComplianceAudit");
    const privacyComplianceAudit = privacyComplianceAuditFactory.attach(taskArguments.contract);

    const totalAudits = await privacyComplianceAudit.getTotalAudits();
    console.log(`Total audits: ${totalAudits}`);
  });

task("task:getAuditInfo")
  .addParam("privateKey", "The user private key")
  .addParam("contract", "The PrivacyComplianceAudit contract address")
  .addParam("auditid", "The audit ID")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const user = new ethers.Wallet(taskArguments.privateKey).connect(ethers.provider);
    const privacyComplianceAuditFactory = await ethers.getContractFactory("PrivacyComplianceAudit");
    const privacyComplianceAudit = privacyComplianceAuditFactory.attach(taskArguments.contract).connect(user);

    const auditId = parseInt(taskArguments.auditid);
    const auditInfo = await privacyComplianceAudit.getAuditInfo(auditId);

    console.log(`Audit Info for ID ${auditId}:`);
    console.log(`  Audited Entity: ${auditInfo[0]}`);
    console.log(`  Compliance Type: ${auditInfo[1]}`);
    console.log(`  Audit Timestamp: ${auditInfo[2]}`);
    console.log(`  Audit Completed: ${auditInfo[3]}`);
    console.log(`  Report Hash: ${auditInfo[4]}`);
    console.log(`  Valid Until: ${auditInfo[5]}`);
    console.log(`  Is Valid: ${auditInfo[6]}`);
  });

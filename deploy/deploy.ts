import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedPrivacyComplianceAudit = await deploy("PrivacyComplianceAudit", {
    from: deployer,
    log: true,
  });

  console.log(`PrivacyComplianceAudit contract deployed at: `, deployedPrivacyComplianceAudit.address);
};

export default func;
func.id = "deploy_privacycomplianceaudit";
func.tags = ["PrivacyComplianceAudit"];

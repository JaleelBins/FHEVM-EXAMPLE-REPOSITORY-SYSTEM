import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedCounter = await deploy("Counter", {
    from: deployer,
    log: true,
  });

  console.log(`Counter contract deployed to: `, deployedCounter.address);
};

export default func;
func.id = "deploy_counter";
func.tags = ["Counter"];

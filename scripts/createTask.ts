import hre = require("hardhat");
import { ContractPoker } from "../typechain";
import { abi as DistributorAbi } from "../test/abis/Distributor.json";
import { abi as OpsAbi } from "../test/abis/Ops.json";
import { abi as ForwarderAbi } from "../test/abis/Forwarder.json";
import { Ops } from "../test/types/Ops";

const { ethers } = hre;

const opsAddress = "0xB3f5503f93d5Ef84b06993a1975B9D21B962892F";
const forwarderAddress = "0xA9AB392d9c725a302329434E92812fdeD02160d4";

const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const distributorAddress = "0x623164A9Ee2556D524b08f34F1d2389d7B4e1A1C";
const ohmAddress = "0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5";

const main = async () => {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log("Deployer: ", deployerAddress);

  const poker: ContractPoker = await ethers.getContract("ContractPoker");
  const ops: Ops = await ethers.getContractAt(OpsAbi, opsAddress);
  const forwarder = await ethers.getContractAt(ForwarderAbi, forwarderAddress);
  const distributor = await ethers.getContractAt(
    DistributorAbi,
    distributorAddress
  );

  const execAddress = poker.address;
  const execSelector = poker.interface.getSighash("poke");
  const pokeCallData =
    distributor.interface.encodeFunctionData("triggerRebase");
  const execData = poker.interface.encodeFunctionData("poke", [
    distributorAddress,
    pokeCallData,
    ohmAddress,
    100,
    false,
    true,
  ]);
  const resolverAddress = forwarder.address;
  const resolverData = forwarder.interface.encodeFunctionData("checker", [
    execData,
  ]);

  await ops.createTaskNoPrepayment(
    execAddress,
    execSelector,
    resolverAddress,
    resolverData,
    ETH,
    {
      maxFeePerGas: ethers.utils.parseUnits("51", "gwei"),
      maxPriorityFeePerGas: ethers.utils.parseUnits("1.5", "gwei"),
    }
  );
};

main();

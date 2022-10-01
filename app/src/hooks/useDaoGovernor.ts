import { useEffect, useState } from 'react';
import { useConfig } from '@usedapp/core';
import { Contract, providers, utils } from 'ethers';
// @ts-ignore
import DaoGovernor from '../artifacts/contracts/governance/DaoGovernor.sol/DaoGovernor.json';

const loadDaoGovernor = (signer: providers.JsonRpcSigner): Contract => {
  const daoGovernorAddress = '0x685b749604722369a30E77F890E7852255e88586';
  const daoGovernorAbi = DaoGovernor.abi;

  // A Contract is an Abstraction which represents a Connection to a specific Contract on the Ethereum Network,
  // so that Applications can use it like a normal JavaScript Object
  const daoGovernor = new Contract(daoGovernorAddress, daoGovernorAbi, signer);

  return daoGovernor;
};

export const useDaoGovernor = (
  signer: providers.JsonRpcSigner
): [Contract, utils.Interface] => {
  const { readOnlyChainId, readOnlyUrls } = useConfig();
  const [daoGovernor, setDaoGovernor] = useState<Contract>();
  const [daoGovernorInterface, setDaoGovernorInterface] =
    useState<utils.Interface>();

  useEffect(() => {
    setDaoGovernor(loadDaoGovernor(signer));
    setDaoGovernorInterface(new utils.Interface(DaoGovernor.abi));
  }, [readOnlyChainId, readOnlyUrls]);

  return [daoGovernor!, daoGovernorInterface!];
};

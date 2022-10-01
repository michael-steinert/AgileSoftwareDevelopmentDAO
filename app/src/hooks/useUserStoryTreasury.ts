import { useEffect, useState } from 'react';
import { useConfig } from '@usedapp/core';
import { Contract, providers, utils } from 'ethers';
// @ts-ignore
import UserStoryTreasury from '../artifacts/contracts/user-story-treasury/UserStoryTreasury.sol/UserStoryTreasury.json';

const loadUserStoryTreasury = (signer: providers.JsonRpcSigner): Contract => {
  const userStoryTreasuryAddress = '0x3c7c05A116cBD477ED7A5dde02454d146B81DEcD';
  const userStoryTreasuryAbi = UserStoryTreasury.abi;

  // A Contract is an Abstraction which represents a Connection to a specific Contract on the Ethereum Network,
  // so that Applications can use it like a normal JavaScript Object
  const userStoryTreasury = new Contract(
    userStoryTreasuryAddress,
    userStoryTreasuryAbi,
    signer
  );

  return userStoryTreasury;
};

export const useUserStoryTreasury = (
  signer: providers.JsonRpcSigner
): [Contract, utils.Interface] => {
  const { readOnlyChainId, readOnlyUrls } = useConfig();
  const [userStoryTreasury, setUserStoryTreasury] = useState<Contract>();
  const [userStoryTreasuryInterface, setUserStoryTreasuryInterface] =
    useState<utils.Interface>();

  useEffect(() => {
    setUserStoryTreasury(loadUserStoryTreasury(signer));
    setUserStoryTreasuryInterface(new utils.Interface(UserStoryTreasury.abi));
  }, [readOnlyChainId, readOnlyUrls]);

  return [userStoryTreasury!, userStoryTreasuryInterface!];
};

"use client";

import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import deployedContracts from '../../packages/nextjs/contracts/deployedContracts';

export interface TokenInfo {
  name: string;
  symbol: string;
  metadata: string;
  creator: string;
  creatorAllocation: bigint;
  maxSupply: bigint;
  currentSupply: bigint;
  virtualTrust: bigint;
  virtualTokens: bigint;
  completed: boolean;
  creationTime: bigint;
}

export interface TokenData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  currentPrice: number;
  startPrice: number;
  marketCap: number;
  maxSupply: number;
  creatorSupplyPercent: number;
  holders: number;
  creator: string;
  intuitionLink: string;
  isAlpha: boolean;
  address?: string;
  tokenInfo?: TokenInfo;
}

export const useMemeLaunchpad = () => {
  const [tokens, setTokens] = useState<TokenData[]>([]);

  // Contract addresses from deployedContracts
  const memeLaunchpadAddress = deployedContracts[13579]?.MemeLaunchpad?.address;

  // Get all tokens
  const { data: tokenAddresses, refetch: refetchTokens } = useReadContract({
    address: memeLaunchpadAddress as `0x${string}`,
    abi: deployedContracts[13579]?.MemeLaunchpad?.abi,
    functionName: 'getAllTokens',
    enabled: !!memeLaunchpadAddress,
  });

  // Get token count
  const { data: tokenCount } = useReadContract({
    address: memeLaunchpadAddress as `0x${string}`,
    abi: deployedContracts[13579]?.MemeLaunchpad?.abi,
    functionName: 'getTokenCount',
    enabled: !!memeLaunchpadAddress,
  });

  // Create token function
  const { writeContract: writeCreateToken, data: createTokenHash } = useWriteContract();

  const { isSuccess: isCreateTokenSuccess } = useWaitForTransactionReceipt({
    hash: createTokenHash,
  });

  // Buy tokens function
  const { writeContract: writeBuyTokens, data: buyTokensHash } = useWriteContract();

  const { isSuccess: isBuyTokensSuccess } = useWaitForTransactionReceipt({
    hash: buyTokensHash,
  });

  // Sell tokens function
  const { writeContract: writeSellTokens, data: sellTokensHash } = useWriteContract();

  const { isSuccess: isSellTokensSuccess } = useWaitForTransactionReceipt({
    hash: sellTokensHash,
  });


  const createToken = async (name: string, symbol: string, metadata: string, totalSupply: bigint) => {
    if (!memeLaunchpadAddress) return;

    writeCreateToken({
      address: memeLaunchpadAddress as `0x${string}`,
      abi: deployedContracts[13579]?.MemeLaunchpad?.abi,
      functionName: 'createToken',
      args: [name, symbol, metadata, totalSupply],
    });
  };

  const buyTokens = async (tokenAddress: string, minTokensOut: bigint) => {
    if (!memeLaunchpadAddress) return;

    writeBuyTokens({
      address: memeLaunchpadAddress as `0x${string}`,
      abi: deployedContracts[13579]?.MemeLaunchpad?.abi,
      functionName: 'buyTokens',
      args: [tokenAddress as `0x${string}`, minTokensOut],
    });
  };

  const sellTokens = async (tokenAddress: string, tokenAmount: bigint, minEthOut: bigint) => {
    if (!memeLaunchpadAddress) return;

    writeSellTokens({
      address: memeLaunchpadAddress as `0x${string}`,
      abi: deployedContracts[13579]?.MemeLaunchpad?.abi,
      functionName: 'sellTokens',
      args: [tokenAddress as `0x${string}`, tokenAmount, minEthOut],
    });
  };

  // Refresh tokens when transactions complete
  useEffect(() => {
    if (isCreateTokenSuccess || isBuyTokensSuccess || isSellTokensSuccess) {
      refetchTokens();
    }
  }, [isCreateTokenSuccess, isBuyTokensSuccess, isSellTokensSuccess, refetchTokens]);

  return {
    tokens,
    tokenCount,
    createToken,
    buyTokens,
    sellTokens,
    refetchTokens,
    isCreateTokenSuccess,
    isBuyTokensSuccess,
    isSellTokensSuccess,
  };
};

export const useTokenInfo = (tokenAddress: string) => {
  const memeLaunchpadAddress = deployedContracts[13579]?.MemeLaunchpad?.address;

  const { data: tokenInfo } = useReadContract({
    address: memeLaunchpadAddress as `0x${string}`,
    abi: deployedContracts[13579]?.MemeLaunchpad?.abi,
    functionName: 'getTokenInfo',
    args: [tokenAddress as `0x${string}`],
    enabled: !!memeLaunchpadAddress && !!tokenAddress,
  });

  const { data: currentPrice } = useReadContract({
    address: memeLaunchpadAddress as `0x${string}`,
    abi: deployedContracts[13579]?.MemeLaunchpad?.abi,
    functionName: 'getCurrentPrice',
    args: [tokenAddress as `0x${string}`],
    enabled: !!memeLaunchpadAddress && !!tokenAddress,
  });

  return {
    tokenInfo: tokenInfo as TokenInfo | undefined,
    currentPrice: currentPrice ? Number(currentPrice) / 1e18 : 0, // Convert from wei
  };
};
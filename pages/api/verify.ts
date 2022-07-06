// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ethers } from 'ethers';
import { verifyMessage } from 'ethers/lib/utils';
import type { NextApiRequest, NextApiResponse } from 'next';
import abiFile from '../../abiFile.json';

const CONTRACT_ADDRESS = '0x1d269Cf95A2732ce98fAaF909642D756b59Af0aF';

const getTokenIdRenter = async (tokenId: string) => {
  const provider = new ethers.providers.JsonRpcProvider(
    'https://kovan.optimism.io'
  );
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abiFile.abi, provider);
  const renter = await contract.userOf(tokenId);
  return renter;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { walletAddress, signature, tokenId } = JSON.parse(req.body);
    if (!walletAddress || !signature || !tokenId) {
      return res
        .status(400)
        .json({ error: 'Missing walletAddress or signature or tokenId' });
    }
    const expectedMessage = `Signed by ${walletAddress} for token ID ${tokenId}`;
    const extractedAddress = verifyMessage(expectedMessage, signature);
    if (extractedAddress !== walletAddress) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
    const renterFromContract = await getTokenIdRenter(tokenId);
    if (renterFromContract !== walletAddress) {
      return res.status(400).json({ error: 'Permission denied' });
    }
    return res.status(200).json({ ok: true });
  } else {
    // method not supported
    res.status(405).end();
  }
}

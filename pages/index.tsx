import type { NextPage } from 'next';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { Toaster, toast } from 'react-hot-toast';

const Home: NextPage = () => {
  const { data: accountData } = useAccount();
  const walletAddress = accountData?.address;
  const [tokenId, setTokenId] = useState('');
  const { signMessageAsync } = useSignMessage();
  const [authenticated, setAuthenticated] = useState(false);

  const onUnlockClick = async () => {
    if (!walletAddress) {
      return alert('Please connect your wallet first');
    }
    if (!tokenId) {
      return alert('Please enter a token id');
    }
    const messageToBeSigned = `Signed by ${walletAddress} for token ID ${tokenId}`;
    const signature = await signMessageAsync({ message: messageToBeSigned });
    const res = await (
      await fetch('/api/verify', {
        method: 'POST',
        body: JSON.stringify({
          walletAddress,
          signature,
          tokenId,
        }),
      })
    ).json();
    if (res.ok) {
      toast.success('Authenticated!');
      setAuthenticated(true);
    } else {
      toast.error('Failed to authenticate!');
    }
  };

  return (
    <div className='py-6 flex flex-col items-center'>
      <Toaster />
      <ConnectButton />

      {authenticated ? (
        <div>
          <iframe
            width='560'
            height='315'
            src='https://www.youtube.com/embed/dQw4w9WgXcQ'
            title='YouTube video player'
            frameBorder='0'
            className='mt-6 rounded-lg'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <>
          <h1 className='text-4xl font-bold mt-6'>
            🔐 Gated rentable NFT frontend
          </h1>
          <h3>Use the NFT you rented to see what&apos;s inside 👀</h3>

          <label className='block text-gray-700 font-bold mt-6'>Token ID</label>
          <input
            className='rounded p-2 border w-[300px]'
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder='Token ID of the NFT you rented'
          />

          <button
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4'
            onClick={onUnlockClick}
          >
            Sign and unlock
          </button>
        </>
      )}
    </div>
  );
};

export default Home;

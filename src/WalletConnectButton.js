import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

const WalletConnectButton = ({ setUserPublicKey }) => {
  const { publicKey, connect, connecting, wallet } = useWallet();
  const { setVisible } = useWalletModal();

  const connectWallet = async () => {
    try {
      if (!wallet) {
        setVisible(true); // Show the wallet modal if no wallet is selected
      } else if (!publicKey) {
        await connect(); // Trigger the connection process
      }

      // If there's a publicKey, set it
      if (publicKey) {
        setUserPublicKey(publicKey.toString());
        console.log("Connected with Public Key:", publicKey.toString());
      }
    } catch (error) {
      console.error("Error connecting to the wallet: ", error);
    }
  };

  return <button onClick={connectWallet} disabled={connecting}>
    {connecting ? 'Connecting...' : 'Connect Wallet'}
  </button>;
};

export default WalletConnectButton;

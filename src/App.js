import React, { useState } from 'react';
import Canvas from './Canvas';
import BurnTokensToGetPixels from './BurnTokensToGetPixels';
import WalletConnectButton from './WalletConnectButton';
import { WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'; // Corrected import
import '@solana/wallet-adapter-react-ui/styles.css';

const App = () => {
  const [userPublicKey, setUserPublicKey] = useState(null);
  const [color, setColor] = useState('#000000');
  const network = WalletAdapterNetwork.Mainnet;
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={`https://alien-dimensional-cloud.solana-mainnet.quiknode.pro/4b7aa52b9eb7f231f7b0ddaa6e6d25cc21c9d636/`}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider> {/* Now correctly imported */}
          <div>
            <WalletConnectButton setUserPublicKey={setUserPublicKey} />
            {userPublicKey && <BurnTokensToGetPixels />}
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            <Canvas color={color} userPublicKey={userPublicKey} />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;

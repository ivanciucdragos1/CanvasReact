import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import React, { useState } from 'react';
import Canvas from "src/Canvas";
import WalletConnectButton from "src/WalletConnectButton";
import { WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'; // Corrected import
import '@solana/wallet-adapter-react-ui/styles.css';
import BurnTokensToGetPixels from "src/BurnTokensToGetPixels";

export function CanvasDashboard() {
  const [userPublicKey, setUserPublicKey] = useState(null);
  const [color, setColor] = useState('#000000');
  const network = WalletAdapterNetwork.Mainnet;
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={`https://alien-dimensional-cloud.solana-mainnet.quiknode.pro/4b7aa52b9eb7f231f7b0ddaa6e6d25cc21c9d636/`}>
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider> {/* Now correctly imported */}

    <div className="flex flex-col w-full min-h-screen">
      <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
        
        <div className="flex items-center w-full gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <Button className="rounded-full ml-auto" size="icon" variant="ghost">
            <BellIcon className="w-4 h-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <Button className="rounded-full" size="icon" variant="ghost">
            <img
              alt="Avatar"
              className="rounded-full border"
              height="32"
              src="/placeholder.svg"
              style={{
                aspectRatio: "32/32",
                objectFit: "cover",
              }}
              width="32"
            />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </div>
      </header>
      <main className="flex-1 flex gap-4 p-4 md:gap-8 md:p-10">
        <section className="flex flex-col gap-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="font-semibold">Connected Wallet:</div>
              <div className="text-gray-500 dark:text-gray-400">
                Not connected
              </div>
              <WalletConnectButton setUserPublicKey={setUserPublicKey} />
              {userPublicKey}
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />

            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-1">
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <div className="grid gap-1">
                <Label className="text-sm" htmlFor="tokens">
                  Tokens to burn
                </Label>
                <Input id="tokens" placeholder="Enter amount" />
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <div className="grid gap-1">
                <Label className="text-sm" htmlFor="pixels">
                  Owned pixels:
                </Label>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <div className="grid gap-1">
                <Label className="text-sm" htmlFor="tokens">
                  Choose a color
                </Label>
                <Input
                  className="w-[px] h-8 mt-4"
                  placeholder="Choose a color"
                  type="color"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="flex-1 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <Canvas color={color} userPublicKey={userPublicKey}></Canvas>
        </section>
      </main>
    </div>
    </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function FrameIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" x2="2" y1="6" y2="6" />
      <line x1="22" x2="2" y1="18" y2="18" />
      <line x1="6" x2="6" y1="2" y2="22" />
      <line x1="18" x2="18" y1="2" y2="22" />
    </svg>
  );
}

function BellIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

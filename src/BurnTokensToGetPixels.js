import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createBurnInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const TEST_TOKEN_MINT_ADDRESS = '72N1wwNbu6QfwfEtGbbjxBZEetYwBb5VqBEXnNptGLFn';

const BurnTokensToGetPixels = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [amountToBurn, setAmountToBurn] = useState(0);
  const [isBurning, setIsBurning] = useState(false);

  const updatePixelsInDatabase = async (pixelsToAdd) => {
    try {
        const response = await fetch('http://localhost:3000/update-pixels', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userPublicKey: wallet.publicKey.toString(), pixelsToAdd }),
          });
          

      const data = await response.json();

      if (data.success) {
        console.log('Pixel count updated successfully');
      } else {
        console.error('Failed to update pixel count');
      }
    } catch (error) {
      console.error('Error updating pixel count:', error);
    }
  };

  const burnTokens = async () => {
    if (!wallet.connected || !amountToBurn) return;

    setIsBurning(true);
    try {
      const TESTTokenMint = new PublicKey(TEST_TOKEN_MINT_ADDRESS);
      const userTokenAccount = await getAssociatedTokenAddress(TESTTokenMint, wallet.publicKey);

      let transaction = new Transaction().add(
        createBurnInstruction(
          userTokenAccount,
          TESTTokenMint,
          wallet.publicKey,
          amountToBurn,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const signature = await wallet.sendTransaction(transaction, connection);
      const confirmation = await connection.confirmTransaction(signature, 'processed');

      if (confirmation.value.err == null) {
        // Transaction succeeded, update pixels
        await updatePixelsInDatabase(amountToBurn);
        setIsBurning(false);
      } else {
        // Transaction failed
        console.error('Transaction failed');
        setIsBurning(false);
      }
    } catch (error) {
      console.error('Error burning tokens:', error);
      setIsBurning(false);
    }
  };

  return (
    <div>
      <input
        type="number"
        value={amountToBurn}
        onChange={(e) => setAmountToBurn(parseInt(e.target.value))}
        placeholder="Amount to burn"
        disabled={isBurning}
      />
      <button onClick={burnTokens} disabled={isBurning}>
        {isBurning ? 'Burning...' : 'Burn Tokens'}
      </button>
    </div>
  );
};

export default BurnTokensToGetPixels;

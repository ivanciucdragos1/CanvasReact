import React, { useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createBurnInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const TEST_TOKEN_MINT_ADDRESS = '72N1wwNbu6QfwfEtGbbjxBZEetYwBb5VqBEXnNptGLFn';

const BurnTokensToGetPixels = ({ amountToBurn, burnTrigger, onTransactionComplete }) => {
  const { connection } = useConnection();
  const wallet = useWallet();

  // Define fetchAvailablePixels function
  const fetchAvailablePixels = async () => {
    if (wallet.publicKey) {
      try {
        const response = await fetch(`http://localhost:3000/user-pixels/${wallet.publicKey.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch available pixels');
        }
        const data = await response.json();
        // Assuming the endpoint returns an object with an available_pixels property
        console.log(`Available pixels: ${data.available_pixels}`);
        // Here you can use the fetched data, e.g., updating a state or triggering a re-render
      } catch (error) {
        console.error('Error fetching available pixels:', error);
      }
    }
  };
  useEffect(() => {
    const burnTokens = async () => {
      if (!wallet.connected || !amountToBurn) return;

      try {
        const TESTTokenMint = new PublicKey(TEST_TOKEN_MINT_ADDRESS);
        const userTokenAccount = await getAssociatedTokenAddress(TESTTokenMint, wallet.publicKey);
        let transaction = new Transaction().add(
          createBurnInstruction(userTokenAccount, TESTTokenMint, wallet.publicKey, amountToBurn, [], TOKEN_PROGRAM_ID)
        );

        const signature = await wallet.sendTransaction(transaction, connection);
        const confirmation = await connection.confirmTransaction(signature, 'processed');

        if (confirmation.value.err == null) {
          console.log('Transaction succeeded');

          const response = await fetch('http://localhost:3000/update-pixels', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userPublicKey: wallet.publicKey.toString(),
              pixelsToAdd: -amountToBurn,
              transactionId: signature,
            }),
          });

          const responseData = await response.json();
          if (responseData.success) {
            console.log('Backend updated successfully');
            await fetchAvailablePixels(); // Call fetchAvailablePixels to update the count
          } else {
            console.error('Backend update failed');
          }
        } else {
          console.error('Transaction failed');
        }
      } catch (error) {
        console.error('Error burning tokens:', error);
      }
    };

    if (burnTrigger) {
      burnTokens().then(() => onTransactionComplete()); // Ensure burnTokens completes before resetting the trigger
    }
  }, [burnTrigger, amountToBurn, wallet, connection, onTransactionComplete, fetchAvailablePixels]); // Include fetchAvailablePixels in the dependency array

  return null;
};

export default BurnTokensToGetPixels;

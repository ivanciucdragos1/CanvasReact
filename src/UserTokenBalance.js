import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getAssociatedTokenAddress, getAccountInfo, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

const TEST_TOKEN_MINT_ADDRESS = '72N1wwNbu6QfwfEtGbbjxBZEetYwBb5VqBEXnNptGLFn';

const UserTokenBalance = () => {
    const [tokenBalance, setTokenBalance] = useState(null);
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    useEffect(() => {
        const fetchTokenBalance = async () => {
            if (!publicKey) {
                setTokenBalance(null);
                return;
            }
        
            try {
                const tokenMintAddress = new PublicKey(TEST_TOKEN_MINT_ADDRESS);
                const userTokenAddress = await getAssociatedTokenAddress(tokenMintAddress, publicKey);
                
                const accountInfo = await connection.getAccountInfo(userTokenAddress);
                if (accountInfo && accountInfo.data) {
                    const info = accountInfo.data; // The raw account data
                    const amount = info.readBigInt64LE(64); // Assuming the token amount is at byte 64
                    setTokenBalance(amount.toString()); // Convert BigInt to string for display
                } else {
                    setTokenBalance(0);
                }
            } catch (error) {
                console.error('Error fetching token balance:', error);
                setTokenBalance(null);
            }
        };
        

        fetchTokenBalance();
    }, [publicKey, connection]);

    return (
        <div>
            <h2>Your TEST Token Balance</h2>
            <p>{tokenBalance !== null ? `${tokenBalance} TEST tokens` : 'Loading...'}</p>
        </div>
    );
};

export default UserTokenBalance;

import React, { useEffect, useState } from "react";

const TransactionsBox = () => {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      const response = await fetch(
        `http://localhost:3000/transactions?page=${currentPage}&limit=${transactionsPerPage}`
      );
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        console.error("Failed to fetch transactions");
      }
    };

    fetchTransactions();
  }, [currentPage]);

  return (
    <div>
      <h2>Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>User ID |</th>
            <th>Amount Burned |</th>
            <th>Timestamp |</th>
            <th>Transaction ID</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index}>
              <td>
                <a
                  href={`https://solscan.io/account/${transaction.user_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {transaction.user_id.slice(0, 5)}...
                </a>
              </td>
              <td>
                <span style={{ color: "red" }}>
                  {transaction.amount_burned}
                </span>
              </td>
              <td>{new Date(transaction.timestamp).toLocaleTimeString()}</td>
              <td>
                {transaction.transaction_id ? (
                  <a
                    href={`https://solscan.io/tx/${transaction.transaction_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {transaction.transaction_id.slice(0, 5)}
                  </a>
                ) : (
                  "N/A"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination logic */}
    </div>
  );
};

export default TransactionsBox;

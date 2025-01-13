import React, { useState, useEffect } from "react";
import { ethers } from "ethers";  // Import corect pentru ethers
import { formatEther } from "ethers"; // Import corect pentru formatEther
import { BrowserProvider } from "ethers";
import '../App.css';
import { TOKENBANIT_CONTRACT } from "../constants";

function AccountInfo({ walletAddress }) {
  const [balance, setBalance] = useState(null);
  const [response, setResponse] = useState("");

  const checkBalance = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        TOKENBANIT_CONTRACT.address,
        TOKENBANIT_CONTRACT.abi,
        provider
      );
      const bal = await contract.balanceOf(walletAddress);
      setBalance(formatEther(bal));
    } catch (error) {
      setResponse(`Eroare: ${error?.message || "Eroare necunoscută"}`);
    }
  };

  return (
    <div>
      <button onClick={checkBalance} class="App-buttons">Verifică balanța</button>
      {balance && <p>Balanță: {balance} Tokeni</p>}
      <p>{response}</p>
    </div>
  );
}

export default AccountInfo;

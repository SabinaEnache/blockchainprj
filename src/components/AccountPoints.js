import React, { useState, useEffect } from "react";
import { ethers } from "ethers";  // Import corect pentru ethers
import { BrowserProvider } from "ethers";
import '../App.css';
import { PUNCTEFIDELITATE_CONTRACT } from "../constants";

function AccountPoints({ walletAddress }) {
  const [puncte, setPuncte] = useState(null);
  const [response, setResponse] = useState("");


  const checkPoints = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        PUNCTEFIDELITATE_CONTRACT.address,
        PUNCTEFIDELITATE_CONTRACT.abi,
        provider
      );
      const points = await contract.puncte(walletAddress);
      setPuncte(points.toString());
    } catch (error) {
      setResponse(`Eroare: ${error.message}`);
    }
  };

  return (
    <div>
      <button onClick={checkPoints} class="App-buttons">Verifică puncte de fidelitate</button>
      {puncte && <p>{puncte} Puncte</p>}
      <p>{response}</p>
    </div>
  );
}

export default AccountPoints;
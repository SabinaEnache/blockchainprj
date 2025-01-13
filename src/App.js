import './App.css';
import ConnectWallet from "./components/ConnectWallet.js";
import AccountInfo from "./components/AccountInfo";
import AccountPoints from "./components/AccountPoints.js";
import React, { useState } from "react";

function App() {
  const [balance, setBalance] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");

  return (
    <div className="App">
      <h1 className="App-header">Aplicatie pentru Puncte de Fidelitate</h1>
      <ConnectWallet setWalletAddress={setWalletAddress} />
      {walletAddress && (
        <>
          <p>Wallet conectat: {walletAddress}</p>
          <AccountInfo walletAddress={walletAddress} />
          <AccountPoints walletAddress={walletAddress} />
        </>
      )}
    </div>
    
  );
}

export default App;

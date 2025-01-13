import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
import { TOKENBANIT_CONTRACT, PUNCTEFIDELITATE_CONTRACT } from "../constants";
import { produse } from "../components/Produse.js";

function ConnectWallet({ setWalletAddress }) {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [balance, setBalance] = useState(null);
  const [puncte, setPuncte] = useState(null);

  // Verifică dacă MetaMask este disponibil
  useEffect(() => {
    if (window.ethereum) {
      setProvider(new BrowserProvider(window.ethereum)); // Folosește BrowserProvider
    } else {
      alert("MetaMask nu este instalat!");
    }
  }, []);

  const connectMetaMask = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Adresa cont MetaMask:", accounts);
      setAccount(accounts[0]);
      setIsConnected(true);
  
      // Creează un contract semnat cu utilizatorul conectat
      const signer = await provider.getSigner();
      const tokenContract = new Contract(
        TOKENBANIT_CONTRACT.address,
        TOKENBANIT_CONTRACT.abi,
        signer
      );
  
      // Apelează funcția claimTokens
      try {
        const tx = await tokenContract.claimInitialTokens();
        await tx.wait(); // Așteaptă confirmarea tranzacției
        console.log("Tokenii inițiali au fost revendicați cu succes!");
  
        // Actualizează balanța după ce tokenii au fost revendicați
        const updatedBalance = await tokenContract.balanceOf(accounts[0]);
        setBalance(updatedBalance.toString());
      } catch (claimError) {
        console.error("Eroare la revendicarea tokenilor: tokenii au fost deja revendicati");
        //alert("Eroare la revendicarea tokenilor: probabil deja ai revendicat!");
      }
    } catch (error) {
      console.error("Eroare la conectarea cu MetaMask:", error.message);
    }
  };
  

  // Funcție pentru a deconecta MetaMask
  const disconnectMetaMask = () => {
    setAccount(null);
    setIsConnected(false);
    setBalance(null);
    setPuncte(null);
  };

  // Funcție pentru a verifica balanța de tokeni
  const checkBalance = async () => {
    if (!account || !provider) return;

    const contract = new Contract(
      TOKENBANIT_CONTRACT.address,
      TOKENBANIT_CONTRACT.abi,
      provider
    );

    try {
      const bal = await contract.balanceOf(account);
      setBalance(bal.toString());
    } catch (err) {
      console.error("Eroare la verificarea balanței:", err);
    }
  };

  // Funcție pentru a verifica punctele de fidelitate
  const checkPoints = async () => {
    if (!account || !provider) return;

    const contract = new Contract(
      PUNCTEFIDELITATE_CONTRACT.address,
      PUNCTEFIDELITATE_CONTRACT.abi,
      provider
    );

    try {
      const points = await contract.puncte(account);
      if (points) {
        setPuncte(points.toString());
      } else {
        setPuncte("0"); // Dacă punctele sunt inexistente, setează-le la "0"
      }
    } catch (err) {
      console.error("Eroare la verificarea punctelor de fidelitate:", err);
    }
  };

  // Funcția de cumpărare cu tokeni
  const buyWithTokens = async (tokenAmount) => {
    if (!account || !provider) return;
    if (parseInt(balance) < tokenAmount) {
      alert("Nu aveți suficienti tokeni!");
      return;
    }
    
    const signer = await provider.getSigner();
    const tokenContract = new Contract(
      TOKENBANIT_CONTRACT.address,
      TOKENBANIT_CONTRACT.abi,
      signer
    );
    const fidelitateContract = new Contract(
      PUNCTEFIDELITATE_CONTRACT.address,
      PUNCTEFIDELITATE_CONTRACT.abi,
      signer
    );
  
    try {
      // Transferă tokenii pentru produs
      console.log("Chem transfer de tokeni...");
      await tokenContract.transfer(PUNCTEFIDELITATE_CONTRACT.address, tokenAmount);
      console.log("Transfer efectuat cu succes.");
  
      // Actualizează balanța
      setBalance((parseInt(balance) - tokenAmount).toString());

      console.log("Chem genereazaPuncte in buyWithTokens...");
      await fidelitateContract.genereazaPuncte(account, tokenAmount);
      console.log("Puncte generate cu succes.");
      setPuncte((parseInt(puncte) + tokenAmount/10).toString());

      alert("Produsul a fost cumpărat cu succes cu tokeni!");
    } catch (err) {
      console.error("Eroare la cumpărarea cu tokeni:", err);
      alert("A apărut o eroare la cumpărarea produsului cu tokeni.");
    }
  };
  // Funcția de cumpărare cu puncte de fidelitate
  const buyWithPoints = async (pointsAmount, product) => {
    if (!account || !provider) return;
    if (parseInt(puncte) < pointsAmount) {
      alert("Nu aveți suficiente puncte!");
      return;
    }

    const signer = await provider.getSigner();
    const fidelitateContract = new Contract(
      PUNCTEFIDELITATE_CONTRACT.address,
      PUNCTEFIDELITATE_CONTRACT.abi,
      signer
    );

    try {
      // Folosește punctele de fidelitate pentru produs
      await fidelitateContract.folosestePuncte(account, product.puncte);

      // Actualizează punctele
      setPuncte((parseInt(puncte) - product.puncte).toString());
      alert("Produsul a fost cumpărat cu puncte de fidelitate!");
    } catch (err) {
      console.error("Eroare la cumpărarea cu puncte:", err);
      alert("A apărut o eroare la cumpărarea produsului cu puncte.");
    }
  };

  return (
    <div>
      {!isConnected ? (
        <div>
          <h2>Conectare</h2>
          <button onClick={connectMetaMask} className="App-buttons">Conectează-te la MetaMask</button>
        </div>
      ) : (
        <div>
          <h2>Cont conectat: {account}</h2>
          <button onClick={checkBalance} className="App-buttons">Vezi balanța</button>
          {balance && <p>Balanța ta: {balance} Tokeni</p>}
  
          <button onClick={checkPoints} className="App-buttons">Vezi punctele de fidelitate</button>
          {puncte && <p>Punctele tale de fidelitate: {puncte}</p>}
  
          <button onClick={disconnectMetaMask} className="App-buttons">Deconectează-te</button>
        </div>
      )}
  
      {/* Afișarea produselor */}
      <div className="product-list">
        {produse.map((produs) => (
          <ProductCard key={produs.id} product={produs} onBuyWithTokens={buyWithTokens} onBuyWithPoints={buyWithPoints} isConnected={isConnected}/>
        ))}
      </div>
    </div>
  );
}

//Componenta pentru cardul fiecărui produs
function ProductCard({ product, onBuyWithTokens, onBuyWithPoints, isConnected }) {
  return (
    <div className="product-card">
      <img src={product.imagine} alt={product.titlu} className="product-image"/>
      <h3>{product.titlu}</h3>
      <p>Preț: {product.pret} Tokeni</p>
      <p>Puncte necesare: {product.puncte}</p>

      {/* Dacă nu ești conectat, afișează un mesaj, altfel butonul de cumpărare */}
      {!isConnected ? (
        <p>Conectează-te pentru a cumpăra acest produs.</p>
      ) : (
        <>
          <button onClick={() => onBuyWithTokens(product.pret, product)} className="product-buttons">Cumpără cu Tokeni</button>
          <button onClick={() => onBuyWithPoints(product.puncte, product)} className="product-buttons">Cumpără cu Puncte</button>
        </>
      )}
    </div>
  );
}


export default ConnectWallet;

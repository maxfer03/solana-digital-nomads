import twitterLogo from "./assets/twitter-logo.svg";
import idl from "./idl.json";
import kp from "./keypair.json";
import "./App.css";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import { useEffect, useState } from "react";

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
//let baseAccount = Keypair.generate();
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

// Get our program's id form the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devent.
const network = clusterApiUrl("devnet");

// Control's how we want to acknowledge when a trasnaction is "done".
const opts = {
  preflightCommitment: "processed",
};

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [addDestination, setAddDestination] = useState(false);
  const [userInput, setUserInput] = useState({
    url: "",
    destination: "",
    txt: "",
  });
  const [destinations, setDestinations] = useState([]);
  const [acc, setAcc] = useState(false);

  const checkWallet = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Wallet found");
          const response = await solana.connect({ onlyIfTrusted: true });

          const pKey = response.publicKey.toString();
          console.log("Connected with Public Key:", pKey);
          setWalletAddress(pKey);
        } else {
          console.log("No Phantom wallet found :(");
        }
      } else {
        console.log("No Solana object found :(");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      const pKey = response.publicKey.toString();
      console.log("Connected with Public Key:", pKey);
      setWalletAddress(pKey);
    }
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const createAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping");
      await program.rpc.initialize({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "Created a new BaseAccount w/ address:",
        baseAccount.publicKey.toString()
      );
      setAcc(true);
      await getDestinations();
    } catch (error) {
      console.log("Error creating BaseAccount account:", error);
    }
  };

  const getDestinations = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("Got Acc", account);
      setAcc(true);
      setDestinations(account.destinationList);
    } catch (err) {
      console.log(err);
      setDestinations([]);
    }
  };

  const handleChange = (e) => {
    setUserInput({ ...userInput, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      let usrAdr = {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      };
     

      await program.rpc.addDestination(
        userInput.url,
        userInput.destination,
        userInput.txt,
        {
          accounts: {
            baseAccount: baseAccount.publicKey,
          },
        }
      );
      console.log("input successfuly sent to program");
      // setDestinations([
      //   {
      //     url: userInput.url,
      //     text: userInput.destination,
      //     comment: userInput.txt,
      //     adr: usrAdr.toString(),
      //   },
      //   ...destinations,
      // ]);
      await getDestinations();
    } catch (err) {
      console.log(err);
    }
    setAddDestination(false);
  };

  useEffect(() => {
    if (walletAddress) {
      getDestinations();
    }
    window.addEventListener("load", async (event) => {
      await checkWallet();
    });
  }, [walletAddress]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">🖼 Digital Nomads</p>
          <p>(styles not finished)</p>
          {walletAddress.length === 0 ? (
            <button
              className="cta-button connect-wallet-button"
              onClick={connectWallet}
            >
              Connect Phantom
            </button>
          ) : (
            ""
          )}
          <p className="sub-text">
            Wanna travel somewhere? Share it with us through Solana 😎
          </p>
          {walletAddress.length !== 0 &&
            (destinations.length === 0 && !acc ? (
              <button onClick={createAccount}>Initialize Solana Account</button>
            ) : (
              <button onClick={() => setAddDestination(true)}>
                Add a destination
              </button>
            ))}
        </div>
        <div className="imgs-container">
          {walletAddress.length !== 0 &&
            destinations.length !== 0 &&
            destinations.map((el, idx) => {
              return (
                <div className="each-img" key={idx}>
                  <img src={el.img} alt={el.img} />
                  <div className="img-text">
                    <div>
                      <div>{el.destination}</div>
                      <div>{el.comment}</div>
                    </div>
                    <div>Address: {/*el.usr.toString()*/ '...'} </div>
                  </div>
                </div>
              );
            })}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
      {addDestination && (
        <div className="add-destination">
          <form onSubmit={(e) => handleSubmit(e)}>
            <button onClick={() => setAddDestination(false)}>back</button>
            <input
              className="text-input"
              type="text"
              placeholder="Image Link"
              name="url"
              value={userInput.url}
              onChange={(e) => handleChange(e)}
              required
            />
            <input
              className="text-input"
              name="destination"
              type="text"
              placeholder="Destination Name"
              onChange={(e) => handleChange(e)}
              required
            />
            <input
              className="text-input"
              name="txt"
              type="textarea"
              placeholder="Add a comment if you want!"
              onChange={(e) => handleChange(e)}
            />

            <input className="submit" type="submit" />
          </form>
        </div>
      )}
    </div>
  );
};

export default App;

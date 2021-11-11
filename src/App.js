import twitterLogo from "./assets/twitter-logo.svg";
import idl from "./idl.json";
import kp from "./keypair.json";
import "./App.css";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import { useEffect, useState } from "react";

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3;

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
      // let usrAdr = {
      //   accounts: {
      //     baseAccount: baseAccount.publicKey,
      //     user: provider.wallet.publicKey,
      //   },
      // };

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
      <div class="custom-shape-divider-top-1636668684">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
            class="shape-fill"
          ></path>
        </svg>
      </div>
      <div className="container">
        <div className="header-container">
          <span className="header">🖼 Digital Nomads</span>
          {walletAddress.length === 0 ? (
            <button
              className="multibutton"
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
              <button className="multibutton" onClick={createAccount}>Initialize Solana Account</button>
            ) : (
              <button className="multibutton" onClick={() => setAddDestination(true)}>
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
                  <img
                    src={el.img}
                    alt={
                      el.img.slice(12, 30) +
                      "..." +
                      el.img.slice(-5, el.img.length)
                    }
                  />
                  <div className="img-text">
                    <div>
                      <div>{el.destination}</div>
                      <div>{el.comment}</div>
                    </div>
                    <div>
                      Address:{" "}
                      {el.usr.toString().slice(0, 5) +
                        "..." +
                        el.usr
                          .toString()
                          .slice(-5, el.usr.toString().length)}{" "}
                    </div>
                  </div>
                </div>
              );
            })}
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

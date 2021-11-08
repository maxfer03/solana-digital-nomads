import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

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
  const [destinations, setDestinations] = useState([
    {
      url: "https://www.studentuniverse.com/blog/wp-content/uploads/2019/03/feat-1.jpg",
      text: "User Text",
      comment: "user comment!!",
      adr: "User Adress",
    },
    {
      url: "https://www.nordicviewband.com/wp-content/uploads/2019/06/nordic-view-sunset-boat-sea-1600x900.jpg",
      text: "User Text",
      comment: "user comment!!",
      adr: "User Adress",
    },
    {
      url: "https://media-cdn.tripadvisor.com/media/photo-s/0c/48/04/0e/kayak-views.jpg",

      text: "User Text",
      comment: "user comment!!",
      adr: "User Adress",
    },
    {
      url: "https://cdn.kimkim.com/files/a/content_articles/featured_photos/45a06fbfcf1c9e1774f4fedf2e5703040ee67bfd/big-232ba789711e4cd8cc7226ab5143eb6a.jpg",

      text: "User Text",
      comment: "user comment!!",
      adr: "User Adress",
    },
    {
      url: "https://www.studentuniverse.com/blog/wp-content/uploads/2019/03/feat-1.jpg",
      text: "User Text",
      comment: "user comment!!",
      adr: "User Adress",
    },
    {
      url: "https://www.nordicviewband.com/wp-content/uploads/2019/06/nordic-view-sunset-boat-sea-1600x900.jpg",
      text: "User Text",
      comment: "user comment!!",
      adr: "User Adress",
    },
    {
      url: "https://media-cdn.tripadvisor.com/media/photo-s/0c/48/04/0e/kayak-views.jpg",

      text: "User Text",
      comment: "user comment!!",
      adr: "User Adress",
    },
    {
      url: "https://cdn.kimkim.com/files/a/content_articles/featured_photos/45a06fbfcf1c9e1774f4fedf2e5703040ee67bfd/big-232ba789711e4cd8cc7226ab5143eb6a.jpg",

      text: "User Text",
      comment: "user comment!!",
      adr: "User Adress",
    },
  ]);
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

  const handleChange = (e) => {
    setUserInput({ ...userInput, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDestinations([
      {
        url: userInput.url,
        text: userInput.destination,
        comment: userInput.txt,
        adr: "123xzojj390nxf98",
      },
      ...destinations,
    ]);
    setAddDestination(false);
  };

  useEffect(() => {
    window.addEventListener("load", async (event) => {
      await checkWallet();
    });
  });
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">🖼 Digital Nomads</p>
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
          {walletAddress.length !== 0 && (
            <button onClick={() => setAddDestination(true)}>
              Add a destination
            </button>
          )}
        </div>
        <div className="imgs-container">
          {walletAddress.length !== 0 &&
            destinations.map((el) => {
              return (
                <div className="each-img">
                  <img src={el.url} alt={el.url} />
                  <div className="img-text">
                    <div>
                      <div>{el.text}</div>
                      <div>{el.comment}</div>
                    </div>

                    <div>Address: {el.adr}</div>
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
              required="true"
            />
            <input
              className="text-input"
              name="destination"
              type="text"
              placeholder="Destination Name"
              onChange={(e) => handleChange(e)}
              required="true"
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

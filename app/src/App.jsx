import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import GovernorContract from "./artifacts/contracts/GovernorContract.sol/GovernorContract.json";
import UserStoryContract from "./artifacts/contracts/UserStoryContract.sol/UserStoryContract.json";

const App = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [allUserStories, setAllUserStories] = useState([]);
    const [error, setError] = useState({});
    const [description, setDescription] = useState("");
    const [functionalComplexity, setFunctionalComplexity] = useState("");
    const [effortEstimation, setEffortEstimation] = useState("");

    const governanceContractAddress = "0x889EEB08b1b42F2F681f49A6E1EA4115f49E779b";
    const userStoryContractAddress = "0xbD046a019aCf77B9F370C4F7C4C6354Af8936C1a";
    const governanceContractABI = GovernorContract.abi;
    const userStoryContractABI = UserStoryContract.abi;

    useEffect(() => {
        checkIfWalletIsConnected().catch(console.error);
    }, []);

    /* Listen on emitted Wave Events to update the Data in Real-Rime */
    useEffect(() => {
        const {ethereum} = window;

        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const userStoryContract = new ethers.Contract(userStoryContractAddress, userStoryContractABI, signer);
            /* Listening on Event and passing received Event into State */
            userStoryContract.on("UserStoryCreated", (from, timestamp, message) => {
                /* Set User's Message from Wave Event */
                setAllUserStories((previousUserStories) => {
                    return [
                        ...previousUserStories, {
                            address: from,
                            timestamp: new Date(timestamp * 1000),
                            message: message
                        }
                    ]
                });
            });
        }

        /*
        return (
            () => {
                if (userStoryContract) {
                    userStoryContract.off("UserStoryCreated", onUserStoryCreated);
                }
            }
        );
        */
    }, []);

    const connectWallet = async () => {
        try {
            const {ethereum} = window;
            if (!ethereum) {
                alert("A Wallet like MetaMask is required");
                return;
            }
            /* Asking User to give Access to their Wallet */
            const accounts = await ethereum.request({
                method: "eth_requestAccounts"
            });
            console.log("Wallet connected with Account", accounts[0]);
            setCurrentAccount(accounts[0]);
            /* Listening on Wallet Event when Account is changed */
            ethereum.on("accountsChanged", async () => {
                /* Getting List of connected Accounts */
                const _accounts = await ethereum.request({
                    method: "eth_accounts"
                });
                setCurrentAccount(_accounts[0]);
            });
        } catch (err) {
            setError(err);
            console.error(error);
        }
    }

    const checkIfWalletIsConnected = async () => {
        try {
            const {ethereum} = window;
            if (!ethereum) {
                console.log("A Wallet like Metamask has to be installed");
                return;
            } else {
                console.log("The Ethereum Object exists", ethereum);
            }
            /* Checking if Application is authorized to access the User's Wallet */
            const accounts = await ethereum.request({
                method: "eth_accounts"
            });
            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized Account:", account);
                setCurrentAccount(account);
                /* Initialize all User Stories */
                retrieveAllUserStories().catch(console.error);
            } else {
                console.log("No authorized Account found");
            }
        } catch (err) {
            setError(err);
            console.error(error);
        }
    }

    const storeUserStory = async () => {
        try {
            const {ethereum} = window;
            if (ethereum) {


                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const userStoryContract = new ethers.Contract(userStoryContractAddress, userStoryContractABI, signer);

                /* Execute the Function `wave` from the Smart Contract */
                const storeUserStoryTransaction = await userStoryContract.storeUserStory(
                    description,
                    functionalComplexity,
                    effortEstimation,
                    {
                        /* Makes the User pay a set Amount of Gas of 420.000 to ensure that the Transaction has enough Gas to pass */
                        /* If the Transaction does not use all the Gas in the Transaction it will automatically be refunded */
                        gasLimit: 420000
                    }
                );
                await storeUserStoryTransaction.wait();
                console.log("Transaction has been added to Block", storeUserStoryTransaction.hash);
            } else {
                console.log("Ethereum Object does not exist");
            }
        } catch (err) {
            setError(err);
            console.error(error);
        }
    }

    const retrieveAllUserStories = async () => {
        try {
            const {ethereum} = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const userStoryContract = new ethers.Contract(userStoryContractAddress, userStoryContractABI, signer);
                /* Call Read Function `retrieveAllUserStories` from the Smart Contract */
                const userStories = await userStoryContract.retrieveAllUserStory();
                if (userStories) {
                    /* Formatting Timestamp from the Struct `UserStory` */
                    let userStoriesFormatted = [];
                    userStories.forEach((userStory) => {
                        userStoriesFormatted.push({
                            creator: userStory.creator,
                            userStoryNumber: userStory.userStoryNumber,
                            description: userStory.description,
                            functionalComplexity: userStory.functionalComplexity,
                            effortEstimation: userStory.effortEstimation,
                            timestamp: new Date(userStory.timestamp * 1000),
                            isDone: userStory.isDone
                        });
                    });
                    setAllUserStories(userStoriesFormatted);
                }
            } else {
                console.log("Ethereum Object does not exist");
            }
        } catch (err) {
            setError(err);
            console.error(error.message);
        }
    }

    /* Pop a Error Message if User is not on Testnet Rinkeby */
    if (error && error.name === "UnsupportedChainIdError") {
        return (
            <div>
                <h2>Please connect to Testnet Rinkeby</h2>
                <p>
                    This decentralized Application only works on the Testnet Rinkeby
                </p>
            </div>
        );
    }

    /* Shorten a given Wallet Address */
    const shortenAddress = (address) => {
        return (`${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
    };

    /* If User has not connected their Wallet to the Application */
    if (!currentAccount) {
        return (
            <div>
                <h1>Welcome to Agile Development DAO</h1>
                <button onClick={connectWallet}>
                    Connect Wallet
                </button>
            </div>
        );
    }

    if (currentAccount) {
        return (
            <div>
                <h1>Agile DAO</h1>
                <p>Congratulations on being a Member of the Agile DAO</p>
                <div>
                    <div>
                        <h2>Member List</h2>
                        <p>
                            Account: {shortenAddress(currentAccount)}
                        </p>
                    </div>
                    <div>
                        <h2>Active User Stories</h2>
                        {
                            allUserStories && allUserStories.map((userStory, index) => {
                                return (
                                    <div key={index}>
                                        <h5>{userStory.userStoryNumber}</h5>
                                        <h5>{userStory.description}</h5>
                                    </div>
                                );
                            })
                        }
                    </div>
                    {
                        /* If there is a current Account render this Button */
                        currentAccount && (
                            <React.Fragment>
                                <h2>Create a User Story</h2>
                                <input
                                    value={description}
                                    onChange={(event => setDescription(event.target.value))}
                                />
                                <input
                                    value={functionalComplexity}
                                    onChange={(event => setFunctionalComplexity(event.target.value))}
                                />
                                <input
                                    value={effortEstimation}
                                    onChange={(event => setEffortEstimation(event.target.value))}
                                />

                                <button onClick={storeUserStory}>
                                    Create
                                </button>
                            </React.Fragment>
                        )
                    }
                </div>
            </div>
        );
    }
};

export default App;

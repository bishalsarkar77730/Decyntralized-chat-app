import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
// Internal Import
import {
  CheckIfWalletConnected,
  connectWallet,
  convertTime,
  connectingWithContract,
} from "../Utils/apiFeature";

export const ChatAppContect = React.createContext();
export const ChatAppProvider = ({ children }) => {
  //UseState
  const [account, setAccount] = useState("");
  const [username, setUserName] = useState("");
  const [friendLists, setFriendLists] = useState([]);
  const [friendMsg, setFriendMsg] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLists, setUserLists] = useState([]);
  const [error, setError] = useState("");

  // Chat User Data
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUserAddress, setCurrentUserAddress] = useState("");

  const router = useRouter();

  //Fetch data time of page loading
  const fetchData = async () => {
    try {
      // Get Contract
      const contract = await connectingWithContract();
      // Get Account
      const connectAccount = await connectWallet();
      setAccount(connectAccount);
      // Get User Name
      const userName = await contract.getUsername(connectAccount);
      setUserName(userName);
      // Get My Friend List
      const friendLists = await contract.getMyFriendList();
      setFriendLists(friendLists);
      //   Get All App User List
      const userList = await contract.getAllAppUser();
      setUserLists(userList);
    } catch (error) {
      setError("Please Install and Connect your Wallet");
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // Read message
  const readMessage = async (friendAddress) => {
    try {
      const contract = await connectingWithContract();
      const read = await contract.readMessage(friendAddress);
      setFriendMsg(read);
    } catch (error) {
      setError("Currently you didn't have any Message");
    }
  };

  //   Create Account
  const createAccount = async ({ name, accountAddress }) => {
    try {
      if (name || accountAddress)
        return setError("Name & Account must be available");
      const contract = await connectingWithContract();
      const getCreatedUser = await contract.createAccount(name);
      setLoading(true);
      await getCreatedUser.wait();
      setLoading(false);
      window.location.reload();
    } catch (error) {
      setError("Error While creating your account please reload your browser");
    }
  };

  //   Add Your Friends
  const addFriends = async ({ name, accountAddress }) => {
    try {
      if (name || accountAddress)
        return setError("please Provide name and account address both");
      const contract = await connectingWithContract();
      const addMyFriend = await contract.addFriend(accountAddress, name);
      setLoading(true);
      await addMyFriend.wait();
      setLoading(false);
      router.push("/");
      window.location.reload();
    } catch (error) {
      setError(
        "Something wentt Wrong while adding friends, try again affter Some time"
      );
    }
  };

  //   Send Message to Your Friend
  const sendMessage = async ({ msg, address }) => {
    try {
      if (msg || address) return setError("please Type your Message");
      const contract = await connectingWithContract();
      const addMessage = await contract.sendMessage(address, msg);
      setLoading(true);
      await addMessage.wait();
      setLoading(false);
      window.location.reload();
    } catch (error) {
      setError("pleasae reload and try again");
    }
  };

  // Read Info
  const readUser = async (userAddress) => {
    const contract = await connectingWithContract();
    const userName = await contract.getUsername(userAddress);
    setCurrentUserName(userName);
    setCurrentUserAddress(userAddress);
  };

  return (
    <ChatAppContect.Provider
      value={{
        readMessage,
        createAccount,
        addFriends,
        sendMessage,
        readUser,
        account,
        username,
        friendLists,
        friendMsg,
        loading,
        userLists,
        error,
        currentUserName,
        currentUserAddress,
      }}
    >
      {children}
    </ChatAppContect.Provider>
  );
};

import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { CoinList } from './config/api';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const Crypto = createContext();

const CryptoContext = ( {children} ) => {

    const [ currency, setCurrency ] = useState("USD");
    const [ symbol, setSymbol ] = useState("$");
    const [ coins, setCoins ] = useState([])
    const [ loading, setLoading ] = useState(false)
    const [ user, setUser ] = useState(null)
    const [ watchlist, setWatchlist ] = useState([])
    const [ alert, setAlert ] = useState({ 
        open: false,
        message: "",
        type: "success",
    })

    useEffect(() => {
        if(user) {
            const coinRef = doc(db, "watchlist", user.uid);

            const unsubscribe = onSnapshot(coinRef,(coin) => {
                if(coin.exists()){
                    setWatchlist(coin.data().coins)
                }else{
                    console.log("No Items in Watchlist")
                }
            });
            return() => {
                unsubscribe();
            }
        }
    },[user]);


    useEffect(() => {
        if(currency === "USD"){
            setSymbol("$")
        }else if(currency === "INR"){
            setSymbol("₹")
        }
    },[currency])

    useEffect(() => {
        onAuthStateChanged(auth, user => {
            if(user) setUser(user);
            else setUser(null)
        })
    },[])

    console.log(user)

    const fetchCoins = async() => {
        setLoading(true);
        const { data } = await axios.get(CoinList(currency))  //using { data } is destructuring data object as we get it. Another way of doing this is to remove { } and below access the data by saying data.data.
        setCoins(data)
        setLoading(false)
    };

    return (
        <Crypto.Provider value={{watchlist, setWatchlist, currency, user, symbol, setCurrency,coins, setCoins,loading, setLoading, fetchCoins, alert, setAlert}}>
            {children}
        </Crypto.Provider>
    )
}

export const CryptoState = () => {
    return useContext(Crypto)
}
export default CryptoContext


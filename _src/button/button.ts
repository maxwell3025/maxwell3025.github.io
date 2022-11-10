import { initializeApp } from "@firebase/app"
import { getDatabase, ref, runTransaction, onValue } from '@firebase/database'
import * as d3 from "d3";

const firebaseConfig = {
    apiKey: "AIzaSyBTdt5AHj_bWQeyZ4wif_dQB2vrWMQxmgU",
    authDomain: "website-counter-8d17e.firebaseapp.com",
    databaseURL: "https://website-counter-8d17e-default-rtdb.firebaseio.com",
    projectId: "website-counter-8d17e",
    storageBucket: "website-counter-8d17e.appspot.com",
    messagingSenderId: "747480479544",
    appId: "1:747480479544:web:11e686d632b0829d5cf3cd",
    measurementId: "G-WTQ2EQM18Y"
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

var counterref = ref(database,'counter');

var counterText = d3.select("#counter");

function increment(){
    runTransaction(counterref, post=>post+1);
}

function decrement(){
    runTransaction(counterref, post=>post-1);
}

window.onload = () => {
    d3.select("#increase-button").on("click", ()=>
    {
        increment();
    })
    d3.select("#decrease-button").on("click", ()=>
    {
        decrement();
    })
    onValue(counterref, value=>{
        counterText.text(value.val());
    });
}
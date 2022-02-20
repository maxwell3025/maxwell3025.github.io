import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";
import { Database,getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-database.js";

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

var wallDatabase = ref(database, "/wall/");

var wallData;

var messageElems;

var wallDiv;
function refresh(){
    wallData = get(wallDatabase).then(snapshot => {
        wallData = snapshot.val();
        bindData();
        return snapshot;
    })
    .catch(error => {
        console.error(error);
    });
}
function loop(){
    bindData();
    console.log(wallData);
}

function bindData(){
    messageElems = wallDiv.selectAll(".msg")
    .data(wallData.messages)
    .enter()
    .append("div")
    .attr("class", "msg")
    .text(message=>message)
    .merge(messageElems);
}

window.onload = ()=>{
    wallDiv = d3.select("#wall");

    messageElems = wallDiv.selectAll(".msg");

    refresh();
    setInterval(loop, 500);
}
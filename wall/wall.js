import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";
import { getDatabase, ref, get, runTransaction, onValue, child, set } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-database.js";

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

var msgCount;
//render message data
function bindData(){
    messageElems = wallDiv.selectAll(".msg")
    .data(wallData.messages)
    .enter()
    .append("div")
    .classed("msg", true)
    .style("left", message=>`calc(var(--scale) * ${message.x/100})`)
    .style("top", message=>`calc(var(--scale) * ${message.y/100})`)
    .text(message=>message.text)
    .merge(messageElems);
}
//begin process of fetching data from server
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

function postMessage(msgText, x, y){
    set(child(wallDatabase, `messages/${msgCount}`), {
        text: msgText,
        x: x,
        y: y
    });
    runTransaction(child(wallDatabase, "messageCount"), count=>count+1);
}


function loop(){
}

onValue(child(wallDatabase, "messageCount"), count=>{msgCount = count.val()});

var winDimensions;
var pointer;

window.onload = ()=>{
    wallDiv = d3.select("#wall");

    winDimensions = wallDiv.node().getBoundingClientRect();
    messageElems = wallDiv.selectAll(".msg");
    wallDiv.on("mousedown", event => {
        let rawPointer = d3.pointer(event, wallDiv.node());
        pointer = {
            x: rawPointer[0]/winDimensions.height*100,
            y: rawPointer[1]/winDimensions.height*100
        }
        postMessage("hello", pointer.x, pointer.y);
    })
    refresh();
    setInterval(loop, 500);
}
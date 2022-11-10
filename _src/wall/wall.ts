import { initializeApp } from "@firebase/app";
import { getDatabase, ref, get, runTransaction, onValue, child, set } from "@firebase/database";
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

const ProgramState = {
    Default: "Default",
    Creating: "Creating"
}

var state = ProgramState.Default;

var wallDatabase = ref(database, "/wall/");

var wallData;

var messageElems;

var wallDiv;

var msgCount;

var pointer;

var templateNote;

var tempPosition;

var scale;
//render message data
function bindData(){
    messageElems = wallDiv.selectAll(".msg")
    .data(wallData.messages)
    .enter()
    .append("div")
    .classed("msg", true)
    .classed("note", true)
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
        x: x - 10,
        y: y - 10
    });
    runTransaction(child(wallDatabase, "messageCount"), count=>count+1);
    refresh();
}

function post(){
    templateNote
    .style('display', 'none');
    let noteText = templateNote.property('value');
    if(noteText.trim() != ""){
        postMessage(noteText, tempPosition.x, tempPosition.y);
    }
    templateNote.property('value', "")
}

function loop(){
}

function updatePointer(event){
    let rawPointer = d3.pointer(event, wallDiv.node());
    pointer = {
        x: rawPointer[0]/scale*100,
        y: rawPointer[1]/scale*100
    }
}

onValue(child(wallDatabase, "messageCount"), count=>{msgCount = count.val()});

window.onload = ()=>{
    wallDiv = d3.select("#wall");
    scale = wallDiv.node().getBoundingClientRect().height;
    messageElems = wallDiv.selectAll(".msg");

    templateNote = wallDiv.append("textarea")
    .style('display', 'none')
    wallDiv.on("keydown", event=>{
        if(event.code == 'Enter'){
            if(state == ProgramState.Creating){
                state = ProgramState.Default;
                post();
            }
        }
    })

    wallDiv.on("mousedown", event => {
        updatePointer(event);
        if(state == ProgramState.Default){
            state = ProgramState.Creating;
            tempPosition = pointer;
            templateNote = templateNote
            .classed("note", true)
            .style("left", `calc(var(--scale) * ${(pointer.x-10)/100})`)
            .style("top", `calc(var(--scale) * ${(pointer.y-10)/100})`)
            .attr("maxlength", 200)
            .attr("rows", 8)
            .style('display', 'block')

            setTimeout(()=>{
                templateNote.node().focus();
            },0)
            // postMessage("hello", pointer.x, pointer.y);
        }
    });

    wallDiv.on("mousemove", event=>{
        updatePointer(event);
        if((event.buttons&1) == 1){
            tempPosition.x += event.movementX/scale*100;
            tempPosition.y += event.movementY/scale*100;
            templateNote
            .style("left", `calc(var(--scale) * ${(tempPosition.x-10)/100})`)
            .style("top", `calc(var(--scale) * ${(tempPosition.y-10)/100})`)
        }
    })

    refresh();
    setInterval(loop, 500);
}
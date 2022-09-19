let games_url = "https://api.dev.vauhtijuoksu.fi/gamedata"
let info_url = "https://api.dev.vauhtijuoksu.fi/stream-metadata";
let gonator_url = "https://api.dev.vauhtijuoksu.fi/donations";

const ACTIVITY_TIMER = 15000;

const settings = {
    "sponsors": false,
    "top_text": "Vauhtijuoksu ry",
    "bonus_text": "Vauhtiväylä",
    "charity": false,
    "simple_icons": true,
}

const colors = {
    "text": "#efdbc8",
    "text_highlight": "#f1e3d8",
    "icons": "#f1c9a2",
    "logo_main": "#e32c02",
    "logo_secondary": "#fd8605",
    "logo_border": "#28020f",
    "main": "#a94343",
    "secondary": "#db6735",
    "bar_empty": "#bd4e33",
    "bar_fill": "#d28546",
    "borders": "#5c2424"
}

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}
docReady(function() {
    let elements = document.querySelectorAll('.color1');
    for(let i=0; i<elements.length; i++){
        elements[i].style.backgroundColor = colors["main"];
    }
    elements = document.querySelectorAll('.color2');
    for(let i=0; i<elements.length; i++){
        elements[i].style.backgroundColor = colors["secondary"];
    }
    elements = document.querySelectorAll('.color3');
    for(let i=0; i<elements.length; i++){
        elements[i].style.backgroundColor = colors["bar_empty"];
    }
    elements = document.querySelectorAll('.color4');
    for(let i=0; i<elements.length; i++){
        elements[i].style.backgroundColor = colors["bar_fill"];
    }
    elements = document.querySelectorAll("div");
    for(let i=0; i<elements.length; i++){
        elements[i].style.borderColor = colors["borders"];
    }
    document.body.style.color = colors["text"]
    elements = document.querySelectorAll(".highlight");
    for(let i=0; i<elements.length; i++){
        elements[i].style.color = colors["text_highlight"];
    }
    elements = document.querySelectorAll(".icon");
    for(let i=0; i<elements.length; i++){
        elements[i].style.color = colors["icons"];
    }
    set_logo()
    if (settings["simple_icons"]){
        let element = document.getElementById("console");
        if (element) {
            element.style.display = "none";
        }
        element = document.getElementById("char");
        if (element) {
            element.style.display = "none";
        }
        element = document.getElementById("clock");
        if (element) {
            element.style.display = "none";
        }
        elements = document.querySelectorAll(".skull");
        for(let i=0; i<elements.length; i++){
            elements[i].style.display = "none";
        }
    } else {
        let element = document.getElementById("console_name");
        if (element) {
            element.style.display = "none";
        }
        element = document.getElementById("simple_clock");
        if (element) {
            element.style.display = "none";
        }
        element = document.getElementById("simple_game");
        if (element) {
            element.style.display = "none";
        }
        elements = document.querySelectorAll(".simple_skull");
        for(let i=0; i<elements.length; i++){
            elements[i].style.display = "none";
        }
    }
    if (!settings["charity"]){
        let element = document.getElementById("bar-bar");
        if (element) {
            element.style.display = "none";
        }
        element = document.getElementById("incentivesboard");
        if (element) {
            element.style.display = "none";
        }
        element = document.getElementById("scheduleboard");
        if (element) {
            element.style.height = "800px";
        }

    }
    if (!settings["sponsors"]){
        let element = document.getElementById("sponsors");
        if (element) {
            element.style.display = "none";
        }
    } else {
        let element = document.getElementById("side_event_info");
        if (element) {
            element.style.display = "none";
        }
    }
});

logoget = 0
function set_logo() {
    let element = document.querySelector(".vauhtissvg")
    if (element){
        let logo = element.getSVGDocument()
        if (logo){
            logo.getElementById("main").setAttribute("fill", colors["logo_main"]);
            logo.getElementById("secondarytop").setAttribute("fill", colors["logo_secondary"]);
            logo.getElementById("secondarybottom").setAttribute("fill", colors["logo_secondary"]);
            logo.getElementById("border").setAttribute("stroke", colors["logo_border"]);
        } else {
            logoget += 1
            if (logoget < 1000) {
                setTimeout(set_logo, 1);
            }
        }
    }
}
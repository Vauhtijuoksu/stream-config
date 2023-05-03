let info_url = "https://api.dev.vauhtijuoksu.fi/stream-metadata"

let rate = 0
let sensor = 1
let heart
let fails = 0



function getRate() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", info_url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var info = JSON.parse(xhr.responseText);
            rate = info.heart_rates[sensor-1]
            ratetxt.textContent = rate
            setTimeout(getRate, 1000);
        }
    }
    xhr.send();
}
function initRate(s) {
    sensor = s
    heart = document.getElementById("heart2")
    ratetxt = document.getElementById("rate")
    getRate()
    animate()
}

function animate() {
    let time = 500
    if (rate > 30){
        time = 60000 / rate
        heart.style.display = "block"
        setTimeout(hide, 150)
    }
    setTimeout(animate, time)
}

function hide() {
    heart.style.display = "none"
}
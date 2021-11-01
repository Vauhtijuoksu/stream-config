let sensors_root = "http://vauhtisraspi.local:8000/"

let rate = 0
let sensor = 1
let heart
let fails = 0

function getRate() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", sensors_root + "sensor" + sensor.toString() + ".txt");
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            let response = xhr.responseText;
            if (response){
                rate = parseInt(response)
                ratetxt.textContent = rate
                fails = 0
            } else {
                fails += 1
                if (fails > 10){
                    ratetxt.textContent = ""
                    rate = 0
                }
            }
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
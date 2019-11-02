let games_url = "https://cors-anywhere.herokuapp.com/https://vauhtijuoksu.otit.fi/api/games"
let info_url = "https://cors-anywhere.herokuapp.com/https://vauhtijuoksu.otit.fi/api/status";

let games = null;

function getGames() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", games_url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            games = JSON.parse(xhr.responseText);
            updateStatus();
        }
    }
    xhr.send();
}

function cap(s) {
    if (s == null || s.length < 2) {
        return s;
    }
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function updateStatus() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", info_url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var info = JSON.parse(xhr.responseText);
            updateInfo(info);
            setTimeout(updateStatus, 2000);
        }
    }
    xhr.send();
}

function updateInfo(info) {
    if (games == null) {
        return;
    }
    game = games[info.game];
    document.getElementById("player").innerHTML = cap(game.player);
    document.getElementById("game").innerHTML = cap(game.game);
    document.getElementById("category").innerHTML = cap(game.category);
    document.getElementById("estimate").innerHTML = "arvio: " + game.duration;
    //document.getElementById("console").innerHTML = cap(info.console);
    //document.getElementById("year").innerHTML = info.year;
    var deathcount = document.getElementById("deathcount");
    if (deathcount && info.death1 !== null) {
        deathcount.innerHTML = info.death1;
    }
}
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

function updateStatus() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", info_url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var info = JSON.parse(xhr.responseText);
            updateInfo(info);
        }
    }
    xhr.send();
}

function updateInfo(info) {
    if (games == null) {
        return;
    }
    game = games[info.game];
    document.getElementById("player").innerHTML = game.player;
    document.getElementById("game").innerHTML = game.game;
    document.getElementById("category").innerHTML = game.category;
    document.getElementById("estimate").innerHTML = game.duration;
    //document.getElementById("console").innerHTML = info.console;
    //document.getElementById("year").innerHTML = info.year;
    document.getElementById("deathcount").innerHTML = info.death1;
}
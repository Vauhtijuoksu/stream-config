let games_url = "https://vauhtijuoksu.fi/api/games"
let info_url = "https://vauhtijuoksu.fi/api/status";

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

function formatTime(dateStr) {
    var date = new Date(dateStr);
    return "Klo " + date.toLocaleTimeString("en-SE", { timeStyle: "short"});
}

function formatEstimate(estimate) {
    return "Arvio " + estimate;
}

function updateField(elementId, data, format) {
    var element = document.getElementById(elementId);
    if (element) {
        if (data) {
            if (format) {
                data = format(data);
            }
            element.innerHTML = data;
            element.style.display = "initial";
        }
        else {
            element.style.display = "none";
        }
    }
    return element;
}

function updateDonationbar(current, goal) {
    var element = document.getElementById('bar-bar');
    var percent = (current / goal) * 100;
    element.style.width = `${percent}%`;
}

function updateStatus() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", info_url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var info = JSON.parse(xhr.responseText);
            updateInfo(info);
            updateDonationbar(500, info.goal); // TODO: Get donation amount from gonator
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
    let playerElement = updateField("playername", game.player, cap);
    if (playerElement) {
        if (game.player && game.player.length > 12) {
            playerElement.className = 'longname';
        } else {
            playerElement.className = '';
        }
    }
    updateField("game", game.game, cap);
    updateField("category", game.category, cap);
    updateField("estimate", game.duration, formatEstimate);
    // updateField("time", game.start, formatTime);
    var consYear = [game.device, game.year].filter(p => p).join(", ")
    updateField("release", consYear, cap);
    updateField("deathcount", info.death1);
    updateField("deathcount2", info.death2);
    updateField("deathcount3", info.death3);
}

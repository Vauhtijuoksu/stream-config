let games_url = "https://vauhtijuoksu.otit.fi/api/games"
let info_url = "https://vauhtijuoksu.otit.fi/api/status";

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
    updateField("player", game.player, cap);
    updateField("game", game.game, cap);
    updateField("category", game.category, cap);
    updateField("estimate", game.duration, formatEstimate);
    updateField("time", game.start, formatTime);
    var consYear = [game.device, game.year].filter(p => p).join(", ")
    updateField("console", consYear, cap);
    updateField("deathcount", info.death1);
}

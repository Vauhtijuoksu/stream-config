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

function updateImage(elementId, data, path) {
    var element = document.getElementById(elementId);
    if (element) {
        if (data) {
            element.style.backgroundImage = "url('" + path + data + "')";
        }
        else {
            element.style.display = "none";
        }
    }
    return element;
}

function updateDeath(player, data) {
    var counter = document.getElementById(("deathcounter" + player).toString());
    if (data == -1){
        counter.style.display = "none";

    } else {
        counter.style.display = "block";
        for (var i = 0; i < counter.childNodes.length; i++) {
            if (counter.childNodes[i].className == "counter") {
                counter.childNodes[i].innerHTML = data;
                break;
            }
        }
    }
    return counter;
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

function checkLongname(element, data, chars) {
    if (element) {
        if (data && data.length > chars) {
            element.className = 'longname';
        } else {
            element.className = '';
        }
    }

}

function updateInfo(info) {
    if (games == null) {
        return;
    }
    game = games[info.game];
    let playerElement = updateField("playername", game.player);
    checkLongname(playerElement, game.player, 20)
    let gameElement = updateField("game", game.game);
    checkLongname(gameElement, game.game, 22)
    let categoryElement = updateField("category", game.category);
    checkLongname(categoryElement, game.category, 20)
    updateField("estimate", game.duration, formatEstimate);
    updateImage("char", game.image, "https://www.vauhtijuoksu.fi/static/img/gamespecifics/");
    updateImage("console", game.device + ".png", "img/consoles/");
    updateField("release", game.year);
    updateDeath(1, info.death1);
    updateDeath(2, info.death2);
    updateDeath(3, info.death3);
    updateDeath(4, info.death4);
}

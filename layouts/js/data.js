let games_url = "https://vauhtijuoksu.fi/api/games"
let info_url = "https://vauhtijuoksu.fi/api/status";
let gonator_url = "https://gonator.vauhtijuoksu.fi/getDonations";

let games = null;
let goal = null;
let donation_cache = [];

function getGames() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", games_url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            games = JSON.parse(xhr.responseText);
            updateStatus();
            updateGonator();
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

function updateDonations(gonations) {
    let sum = 0;
    let donations = [];
    for (donation of gonations) {
        sum += donation.Amount;
        if (donation.Name != "Anonyymi") {
            donations.push(donation);
        }
    }

    if (donations.length == donation_cache.length) {
        return sum;
    }
    // Update latest donations list
    donation_cache = donations;
    const activityDiv = document.getElementById('activities');
    activityDiv.innerHTML = '';
    for (donation of donations.reverse()) {
        var child = document.createElement('div');
        var text = document.createTextNode(`${donation.Name}: ${donation.Amount}€`);
        child.appendChild(text);
        child.id = donation.DonationId
        child.className = 'donation';
        activityDiv.appendChild(child);
    }   

    return sum;
}

function updateDonationbar(current) {
    if (goal == null) {
        return;
    }
    var element = document.getElementById('bar-bar');
    var percent = (current / goal) * 100;
    element.style.width = `${percent}%`;
}

function updateGonator() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", gonator_url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var donations = JSON.parse(xhr.responseText);
            const sum = updateDonations(donations);
            updateDonationbar(sum);
            setTimeout(updateGonator, 5000);
        }
    }
    xhr.send()
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
    var element = document.getElementById(("deathcounter" + player).toString());
    if (element) {
        if (data == -1) {
            element.style.display = "none";

        } else {
            element.style.display = "block";
            for (var i = 0; i < counter.childNodes.length; i++) {
                if (element.childNodes[i].className == "counter") {
                    element.childNodes[i].innerHTML = data;
                    break;
                }
            }
        }
    }
    return element;
}
function updateStatus() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", info_url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var info = JSON.parse(xhr.responseText);
            updateInfo(info);
            goal = info.goal;
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

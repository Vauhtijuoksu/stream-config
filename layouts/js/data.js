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
    for (donation of donations) {
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

let games_url = "https://vauhtijuoksu.fi/api/games"
let info_url = "https://vauhtijuoksu.fi/api/status";
let gonator_url = "https://gonator.vauhtijuoksu.fi/getDonations";


let games = null;
let current = 0;
let goal = null;
let shown_donations = [];

let donationsInitialized = false;

let activityRotationDisabled = false;
let activityRotationTimeout = null;
let idletexts = [""]
let current_idletext = 0

const ACTIVITY_TIMER = 15000;

function getGames() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", games_url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            games = JSON.parse(xhr.responseText);
            updateStatus();
            setTimeout(updateGonator, 500);
            rotateActivities();
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

/**
 * Update the donations list to DOM
 * - Ignores donations by "Anonyymi"
 * - Does not update unless new donations are found
 */
function updateDonations(gonations) {
    let sum = 0;
    let donations = [];
    for (donation of gonations) {
        sum += donation.Amount;
        if (donation.Name != "Anonyymi") {
            donations.push(donation);
        }
    }

    const activityDiv = document.getElementById('activities');

    if (donations.length == shown_donations.length || !donationsInitialized) {
        if (!activityRotationDisabled) {
            activityDiv.innerHTML = '';
            activityDiv.innerText = idletexts[current_idletext]
        }
        if (!donationsInitialized) {
            shown_donations = donations.reverse();
        }
        return sum;
    }

    activityDiv.innerHTML = '';
    // Update latest donations list
    
    let i = 0;

    for (donation of donations.reverse()) {
        var child = document.createElement('div');
        var text = document.createTextNode(`${donation.Name}:  ${donation.Amount}€`);
        child.appendChild(text);
        child.id = donation.DonationId;
        child.className = 'donation';

        // Add class the New entries in donations list
        if (!shown_donations.find((d) => d.DonationId == donation.DonationId)) {
            child.classList.add('new');
        }
        activityDiv.appendChild(child);
        var divider = document.createElement('div');
        text = document.createTextNode(">");
        divider.appendChild(text);
        divider.className = 'divider';
        activityDiv.appendChild(divider);
        i++;
        if (i > 15) {
            break;
        }
    }
    
    shown_donations = donations.reverse();

    // Show donations list immediately
    let classList = activityDiv.classList.toString();
    activityDiv.classList.remove('previous', 'next');
    activityDiv.classList.add('current', 'forced');
    if (activityRotationDisabled) {
        clearTimeout(activityRotationTimeout);
    }
    activityRotationDisabled = true;
    activityRotationTimeout = setTimeout(() => {
        activityDiv.className = classList;
        activityDiv.classList.remove('forced');
        activityRotationDisabled = false;
        rotateActivities();
    }, 45000);

    return sum;
}

/**
 * Updates the donation bar with the currently donated amount and the current goal 
 */
function updateDonationbar(newSum) {
    if (goal == null) {
        return;
    }


    const updateCurrent = (target) => {
        const diff = target - current;
        if (diff > 0) {
            let timeout = 10000 / diff;
            if (timeout < 30) {
                current = Math.round(current + (30 / timeout));
                timeout = 30;
            } else {
                current++;
            }
            // console.log(timeout, current, target);
            var sumElement = document.getElementById('sum');
            sumElement.innerText = `${current}€`

            setTimeout(updateCurrent, timeout, target);
        }
    }

    if (donationsInitialized) {
        updateCurrent(newSum);
    } else {
        current = newSum;
        var sumElement = document.getElementById('sum');
        sumElement.innerText = `${current}€`
    }
    
    
    var goalElement = document.getElementById('goal');
    goalElement.innerText = `${goal}€`
    var element = document.getElementById('bar-bar');
    var percent = (current / goal) * 100;
    element.style.width = `${percent}%`;
}

var activityIndex = 0;
/**
 * Rotates the activity that is currently displayed in the #activity div
 */
function rotateActivities() {
    if (activityRotationDisabled) return;

    let activities = document.getElementById('activity').children;
    activityIndex++;

    if (activityIndex >= activities.length) {
        activityIndex = 0;
    }
    let outSlide = activities[activityIndex];

    let nextIndex = activityIndex - 1;
    if (nextIndex < 0) {
        nextIndex = activities.length - 1;
    }
    let nextSlide = activities[nextIndex];

    let inIndex = activityIndex + 1
    if (inIndex >= activities.length) {
        inIndex = 0;
    }
    let inSlide = activities[inIndex];

    let slideTime = inSlide.dataset.slidetime;
    // TODO: Fix when there's only two
    // TODO: Allow hiding some or displaying for a longer time temporarily
    if (nextSlide.id === 'activities'){
        current_idletext += 1;
        if (current_idletext >= idletexts.length) {
            current_idletext = 0
        }
    }
    inSlide.classList.replace('next', 'current');
    outSlide.classList.replace('current', 'previous');
    nextSlide.classList.replace('previous', 'next');
    setTimeout(rotateActivities, slideTime);
}

/**
 * Fetches donations from the Gonator API and updates to UI
 */
function updateGonator() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", gonator_url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var donations = JSON.parse(xhr.responseText);
            const sum = updateDonations(donations);
            updateDonationbar(sum);
            donationsInitialized = true;
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
            for (var i = 0; i < element.childNodes.length; i++) {
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
            idletexts = info.motds
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
function updateSchedule(elementID, games, current, count, offset){
    var element = document.getElementById(elementID);
    if (element){
        var txt = ""
        for (var i = 0; i < count; i++){
            if (i+current+offset >= games.length){
                break
            }
            var game = games[current+i+offset];
            txt += "<div class='schedulerow'>"
            txt += "<div class='scheduletime'>" + game.start.split(" ")[1].slice(0,5) + "</div>"
            txt += "<div class='schedulegame'>" + game.game  + "</div>"
            txt += "<div class='schedulecategory'>" + game.category  + "</div>"
            txt += "<div class='scheduleplayer'>" + game.player +"</div>"
            txt += "<div class='divider'>" + ">" +"</div>"
            txt += "</div>"
        }
        element.innerHTML = txt;
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
    updateSchedule("setupschedule", games, info.game, 4, 0);
    updateSchedule("schedule", games, info.game, 4, 1);
    updateDeath(1, info.death1);
    updateDeath(2, info.death2);
    updateDeath(3, info.death3);
    updateDeath(4, info.death4);
}

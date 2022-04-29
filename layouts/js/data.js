let games_url = "https://api.dev.vauhtijuoksu.fi/gamedata"
let info_url = "https://api.dev.vauhtijuoksu.fi/stream-metadata";
let gonator_url = "https://api.dev.vauhtijuoksu.fi/donations";


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
        sum += donation.amount;
        if (donation.name != "Anonyymi") {
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
        var text = document.createTextNode(`${donation.name}:  ${donation.amount} e`);
        child.appendChild(text);
        child.id = donation.id;
        child.className = 'donation';

        // Add class the New entries in donations list
        if (!shown_donations.find((d) => d.id == donation.id)) {
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
            sumElement.innerText = `${current} e`

            setTimeout(updateCurrent, timeout, target);
        }
    }

    if (donationsInitialized) {
        updateCurrent(newSum);
    } else {
        current = newSum;
        var sumElement = document.getElementById('sum');
        sumElement.innerText = `${current} e`
    }
    
    
    var goalElement = document.getElementById('goal');
    goalElement.innerText = `${goal} e`
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
            goal = info.donation_goal;
            idletexts = info.donatebar_info
            setTimeout(updateStatus, 500);
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
function updateSchedule(elementID, current, count, offset){
    var element = document.getElementById(elementID);
    if (element){
        var txt = ""
        for (var i = 0; i < count; i++){
            if (i+current+offset >= games.length){
                break
            }
            var game = games[current+i+offset];
            let player = game.player.split(",").join(" & ")
            var date = new Date(game.start_time)
            txt += "<div class='schedulerow'>"
            txt += "<div class='scheduletime'>" + date.toTimeString().substring(0,5) + "</div>"
            txt += "<div class='schedulegame'>" + game.game + "</div>"
            txt += "<div class='schedulecategory'>" + game.category  + "</div>"
            txt += "<div class='scheduleplayer'>" + player +"</div>"
            txt += "<div class='divider'>" + ">" +"</div>"
            txt += "<div class='warnings'>"
            if (game["meta"] !== "" && game["meta"] !== null){
                let meta = game["meta"].split(",")
                for (let m in meta){
                    txt += "<div class='warning w-" + meta[m] + "'></div>"
                }
            }
            txt += "</div>"
            txt += "</div>"
        }
        element.innerHTML = txt;
    }
}

function updateInfo(info) {
    if (games == null) {
        return;
    }
   // console.log(info)
    if (info.timers.length > 0){
        runtimer = info.timers[0] // Only 1 timer currently pls.
        if (runtimer.start_time != null){
            timer_start = new Date(runtimer.start_time)
        } else {
            timer_start = null
        }
        if (runtimer.end_time != null){
            timer_end = new Date(runtimer.end_time);
        } else {
            timer_end = null
        }

    }
    let current = 0
    for (let g in games){
        if (games[g].id === info.current_game_id){
            game = games[g]
            current = parseInt(g)
            break
        }
    }
    var start = new Date(game.start_time)
    var end = new Date(game.end_time)
    // TODO: count estimate betterer..
    var estimate = new Date(end.getTime()-start.getTime())
    estimate = new Date(estimate.getTime() + estimate.getTimezoneOffset() * 60000)
    var estimatestring = ""
    if (estimate.getHours() > 0){
        estimatestring += String(estimate.getHours()) + "h "
    }
    if (estimate.getMinutes() > 0){
        estimatestring += String(estimate.getMinutes()) + "min"
    }

    let player = game.player.split(",").join(" & ")
    let playerElement = updateField("playername", player);
    checkLongname(playerElement, player, 13)
    let gameElement = updateField("game", game.game);
    checkLongname(gameElement, game.game, 20)
    let categoryElement = updateField("category", game.category);
    checkLongname(categoryElement, game.category, 20)
    updateField("estimate", estimatestring, formatEstimate);
    updateImage("char", game.img_filename, "img/char/");
    updateImage("console", game.device + ".png", "img/consoles/");
    updateField("release", game.published);
    updateSchedule("setupschedule", current, 4, 0);
    updateSchedule("schedule", current, 4, 1);
    updateDeath(1, info.counters[0]);
    updateDeath(2, info.counters[1]);
    updateDeath(3, info.counters[2]);
    updateDeath(4, info.counters[3]);
}

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}
docReady(function() {
    make_timer()
});

let timer_start = null   // Date.now()
let timer_end = null

function make_timer(){
    let timer = "<div id='timer'>"
    timer += "<div id='t-h1' class='num'></div><div id='t-h2' class='num'>0</div><div>:</div>"
    timer += "<div id='t-m1' class='num'>0</div><div id='t-m2' class='num'>0</div><div>:</div>"
    timer += "<div id='t-s1' class='num'>0</div><div id='t-s2' class='num'>0</div><div class='smallnum'>.</div>"
    timer += "<div id='t-ms1' class='num smallnum'>0</div><div id='t-ms2' class='num smallnum'>0</div>"
    timer += "</div>"
    var element = document.getElementById("time");
    if (element !== null){
        element.innerHTML += timer;
        setInterval(update_time, 10)
    }
}

function update_time(){
    let time_now = 0
    let h1 = 0
    let h2 = 0
    let m1 = 0
    let m2 = 0
    let s1 = 0
    let s2 = 0
    let ms1 = 0
    let ms2 = 0

    if (timer_start !== null){
        if (timer_end === null) {
            let now = Date.now()
            time_now = (now - timer_start) / 1000
        } else {
            time_now = (timer_end - timer_start) / 1000
        }
        let remain = time_now
        let hours = Math.floor(remain / (60 * 60))
        remain -= hours * 60 * 60
        let minutes = Math.floor(remain / (60))
        remain -= minutes * 60
        let seconds = Math.floor(remain)
        remain -= seconds
        remain = Math.floor(remain * 100)
        h1 = Math.floor(hours / 10)
        h2 = hours % 10
        m1 = Math.floor(minutes / 10)
        m2 = minutes % 10
        s1 = Math.floor(seconds / 10)
        s2 = seconds % 10
        ms1 = Math.floor(remain / 10)
        ms2 = remain % 10
    }
    if (h1 > 0){
        document.getElementById("t-h1").innerHTML = h1
    } else {
        document.getElementById("t-h1").innerHTML = ""
    }
    document.getElementById("t-h2").innerHTML = h2
    document.getElementById("t-m1").innerHTML = m1
    document.getElementById("t-m2").innerHTML = m2
    document.getElementById("t-s1").innerHTML = s1
    document.getElementById("t-s2").innerHTML = s2
    document.getElementById("t-ms1").innerHTML = ms1
    document.getElementById("t-ms2").innerHTML = ms2
}

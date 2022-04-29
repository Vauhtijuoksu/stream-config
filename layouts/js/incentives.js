let incentives_url = "https://api.dev.vauhtijuoksu.fi/incentives";
let incIndex = 0;

const carousel_time = 12000;
// uncomment to use test data.
//incentives_url = "js/test.json";
let igames
getiGames()
function getiGames() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", games_url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            igames = JSON.parse(xhr.responseText);
        }
    }
    xhr.send();
}

function initIncentives() {
    getIncentives((incentives) => {
        updateIncentives(incentives);
        incIndex = 0;
        incentive_carousel();
    });
}

function incentive_carousel() {
    incIndex++;
    const slides = document.getElementById("incentives").children;

    if (incIndex > slides.length) {
        setTimeout(initIncentives, carousel_time);
        return;
    }

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    var slide = slides[incIndex-1]
    slide.style.display = "block";
    setTimeout(incentive_carousel, carousel_time);
}


function getIncentives(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", incentives_url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            incentives = JSON.parse(xhr.responseText);
            callback(incentives);
        }
    }
    xhr.send();
}


function updateIncentives(incentives) {
    var html = "";
    for (const i in incentives){
        const incentive = incentives[i];
        if (incentive.end_time.endsWith('GMT')) {
            incentive.end_time += '+0300';
        }
        if (new Date(incentive.end_time) > Date.now()) {
            var id = incentive.id.toString();
            var div = "";
            let gamename = ""
            for (let g in igames){
                if (igames[g].id === incentive.game_id){
                    gamename = igames[g].game
                    break
                }
            }
            div += `<div class="incentive-game">${gamename}</div>`;
            div += `<div class="incentive-title">${incentive.title}</div>`;

            if (incentive.type === "option"){

                div += formatOptionsList(incentive.status);
            } else if (incentive.type === "milestone") {
                let amount = incentive.total_amount
                const goal = parseFloat(incentive.milestones[0]); // TODO: fix for using multiple milestones
                // Bar is a nice way to show this
                const barGoal = document.createElement('div');
                barGoal.classList.add('bargoal');
                barGoal.textContent = `${goal} e`;
                const bar = document.createElement('div');
                bar.classList.add('bar');
                if (amount >= goal){
                    bar.classList.add('success');
                }
                bar.style = `width:${amount / goal * 100}%;`;
                bar.textContent = `${ formatMoney(amount) }  e`;
                div += '<div class="bar-container">';
                div += barGoal.outerHTML;
                div += bar.outerHTML;
                div += '</div>';
            } else if (incentive.type === "open") {
                if (incentive.status.length > 0) {
                    div += formatOptionsList(incentive.status);
                } else {
                    div += 'Tälle kannustimelle ei ole vielä ehdotuksia!'
                }
            }
            html += `<div><div class="incentive" id="${incentive.id}">${div}</div></div>`;
        }
    }
    document.getElementById("incentives").innerHTML = html;
}

function formatOptionsList(options) {
    options.sort(function(a,b){return b.amount - a.amount;})
    return '<div class="incentive-options">' + 
        options.slice(0,7).map(
            option => `<div class="incentive-option">${option.option}: ${ formatMoney(option.amount)} e</div>`
        ).join('\n') +
        '</div>';
}

function formatMoney(money) {
    if (money - parseInt(money) == 0) {
        return parseInt(money)
    }
    else {
        return money.toFixed(2)
    }
}
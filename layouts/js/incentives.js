let incentives_url = "https://vauhtijuoksu.otit.fi/api/incentives";
let incIndex = 0;

const carousel_time = 6000;
// uncomment to use test data.
//incentives_url = "js/test.json";
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
    for (const i in incentives.incentives){
        const incentive = incentives.incentives[i];
        if (incentive.endtime.endsWith('GMT')) {
            incentive.endtime += '+0300';
        }
        if (new Date(incentive.endtime) > Date.now()) {
            var id = incentive.id.toString();
            var div = "";
            div += `<div class="incentive-game">${cap(incentive.game)}</div>`;
            div += `<div class="incentive-title">${cap(incentive.title)}</div>`;

            if (incentive.type === "option"){
                const options = incentive.parameters.split('/').map(
                    (option, index) => {
                        const num = index.toString();
                        let amount = 0;
                        if (incentives.amount[id] && incentives.amount[id][num]) {
                            amount = incentives.amount[id][num];
                        }
                        return {name: option, amount: amount};
                    }
                ).sort(function(a,b){return b.amount - a.amount;});

                // Just list the options and their amounts here
                div += formatOptionsList(options);
            } else if (incentive.type === "upgrade") {
                let amount = 0
                const goal = parseFloat(incentive.parameters);
                if (incentives.amount[id] && incentives.amount[id][null]) {
                    amount = incentives.amount[id][null];
                }

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
                bar.textContent = `${amount} e`;
                div += '<div class="bar-container">';
                div += barGoal.outerHTML;
                div += bar.outerHTML;
                div += '</div>';
            } else if (incentive.type === "open") {

                if (incentives.amount[id]) {
                    let options = Object.entries(incentives.amount[id]).map(o => ({name: o[0], amount: o[1]}));
                    options.sort(function(a,b){return b.amount - a.amount;});
                    div += formatOptionsList(options);
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
    return '<div class="incentive-options">' + 
        options.slice(0,7).map(
            option => `<div class="incentive-option">${cap(option.name)}: ${option.amount} e</div>`
        ).join('\n') +
        '</div>';
}
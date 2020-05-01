let incentives_url = "https://vauhtijuoksu.otit.fi/api/incentives";
// uncomment to use test data.
//incentives_url = "js/test.json";


let incentives = null;

var incIndex = 0;
function incentive_carousel() {
    var slides = document.getElementById("incentives").children;
    for (var i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    incIndex++;
    if (incIndex > slides.length) { incIndex = 1; }
    var slide = slides[incIndex-1]
    slide.style.display = "block";
    var time = 6000;
    setTimeout(getIncentives, time);
}


function getIncentives() {


    let xhr = new XMLHttpRequest();
    xhr.open("GET", incentives_url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            incentives = JSON.parse(xhr.responseText);
            updateIncentives()
            incentive_carousel()
        }
    }
    xhr.send();
}


function updateIncentives() {
    var html = "";
    for (const i in incentives.incentives){
        const incentive = incentives.incentives[i];
        if (new Date(incentive.endtime) > Date.now()) {
            var id = incentive.id.toString();
            var div = "";
            div += `<div class="incentive_title">${incentive.game}: ${incentive.title}</div>`;

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
                div += barGoal.outerHTML;
                div += bar.outerHTML;
            } else if (incentive.type === "open") {

                if (incentives.amount[id]) {
                    let options = Object.entries(incentives.amount[id]).map(o => ({name: o[0], amount: o[1]}));
                    options.sort(function(a,b){return b[1] - a[1];});
                    div += formatOptionsList(options);
                } else {
                    div += 'Tälle kannustimelle ei ole vielä ehdotuksia!'
                }
            }
            html += `<div class="incentive" id="${incentive.id}">${div}</div>`;
        }
    }
    document.getElementById("incentives").innerHTML = html;
}

function formatOptionsList(options) {
    return '<ol class="incentive_options">' + 
        options.map(
        option => `<li>${option.name}: ${option.amount} e</li>`
        ).join('\n') +
        '</ol>';
}
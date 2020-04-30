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
            var id = incentive.id
            var div = "";
            div += '<div class="incentive_game">' + incentive.game + '</div>';
            div += '<div class="incentive_title">' + incentive.title + '</div>';
            div += '<div class="incentive_info">' + incentive.info + '</div>';
            if (incentive.type === "option"){
                var order = [];
                for (var o in incentive.parameters.split("/")){
                    var amount = 0
                    if (incentives.amount[id.toString()]){
                        if (incentives.amount[id.toString()][(parseInt(o)+1).toString()]){
                            amount = incentives.amount[id.toString()][(parseInt(o)+1).toString()]
                        }
                    }
                    order.push([o, amount])

                }
                order.sort(function(a,b){return b[1] - a[1];});
                for (var j=0; j < order.length; j++){
                    var o = order[j][0];
                    var amount = 0;
                    var max = 1;

                    if (incentives.amount[id.toString()]){
                        if (incentives.amount[id.toString()][(parseInt(o)+1).toString()]){
                            amount = incentives.amount[id.toString()][(parseInt(o)+1).toString()]
                        }
                    }
                    if (incentives.max[id.toString()]){
                        max = incentives.max[id.toString()]
                    }


                    div += '<div class="bargoal">' + amount + 'e</div>';
                    div += '<div class="bar" style="width:' + parseFloat(amount) /  parseFloat(max)  * 100 + '%'
                    if (parseFloat(amount) >= parseFloat(max)){
                        div += '; background-color: #00f6ff'
                    }
                    div += '">' + incentive.parameters.split("/")[o] + '</div>';
                }
            }
            else if (incentive.type === "upgrade"){
                var amount = 0
                var max = incentive.parameters
                if (incentives.amount[id.toString()]){
                    if (incentives.amount[id.toString()][null]){
                        amount = incentives.amount[id.toString()][null]
                    }
                }


                div += '<div class="bargoal">' + max + 'e</div>';
                div += '<div class="bar" style="width:' + parseFloat(amount) /  parseFloat(max)  * 100 + '%'
                if (parseFloat(amount) >= parseFloat(max)){
                    div += '; background-color: #00f6ff'
                }
                div += '">' + amount + 'e</div>';

            }

            else if (incentive.type === "open"){
                if (i.toString() in Object.keys(incentives.amount) ){
                    var keys = Object.keys(incentives.amount[id]);

                    var order = [];
                    for (var e in incentives.amount[id]){
                        var amount = 0
                        if (incentives.amount[id.toString()]){
                            if (incentives.amount[id.toString()][e]){
                                amount = incentives.amount[id.toString()][e]
                            }
                        }
                        order.push([e, amount])

                    }
                    order.sort(function(a,b){return b[1] - a[1];});
                    for (var j=0; j < order.length; j++){
                        var o = order[j][0];
                        var amount = 0;
                        var max = 1;

                        if (incentives.amount[id.toString()]){
                            if (incentives.amount[id.toString()][o]){
                                amount = incentives.amount[id.toString()][o]
                            }
                        }
                        if (incentives.max[id.toString()]){
                            max = incentives.max[id.toString()]
                        }


                        div += '<div class="bargoal">' + amount + 'e</div>';
                        div += '<div class="bar" style="width:' + parseFloat(amount) /  parseFloat(max)  * 100 + '%'
                        if (parseFloat(amount) >= parseFloat(max)){
                            div += '; background-color: #00f6ff'
                        }
                        div += '">' + o + '</div>';
                    }
                } else {
                    div += 'Tälle kannustimelle ei ole vielä ehdotuksia!'
                }
            }
            div += '</div>'
            html += '<div>' + div + '</div>'
        }
    }
    document.getElementById("incentives").innerHTML = html;
}

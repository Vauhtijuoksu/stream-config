const scrnsize = 1080
let scrollpos = scrnsize


let html = ''
for (let i = 0; i < credits.length; i++){
    html += '<div class="' + credits[i]["type"] + '">'+ credits[i]["text"] + '</div>'
}
document.getElementById('scroll').innerHTML = html
document.getElementById('end').innerHTML = endtext


let opacity = 0;
let do_fadein



let do_scroll = setInterval(scrollup, 5)
function scrollup(){
    scrollpos -= (scrnsize/scrolltime)*0.005
    document.getElementById('scroll').style.top = scrollpos + "px"
    if (scrollpos < -document.getElementById('scroll').offsetHeight){

        clearInterval(do_scroll)
        do_fadein = setInterval(fadein, 10)
    }
}

function fadein(){
   document.getElementById("end").style.opacity = opacity;
   opacity += 0.003;
   if (opacity > 1){
       document.getElementById("end").style.opacity = 1;
        clearInterval(do_fadein)

   }
}

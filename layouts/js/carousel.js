var slideIndex = 0;

function initCarousel() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "carousel.html");
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            document.getElementById("sponsors").innerHTML = xhr.responseText;
            carousel();
        }
    }
    xhr.send();
}

function carousel() {
    var slides = document.getElementById("sponsors").children;
    for (var i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) { slideIndex = 1; }
    var slide = slides[slideIndex-1]
    slide.style.display = "block";
    var time = slide.dataset.slidetime * 1000;
    setTimeout(carousel, time);
}
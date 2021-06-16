function hamToggle() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
        document.getElementsByID("hamburger").innerHTML = "<i class='fa fa-home'></i>";
    } else {
        x.className = "topnav";
        document.getElementsByID("hamburger").innerHTML = "<i class='fa fa-bars'></i>";
    }
}

var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
    //navbar hide when scroll up on mobile
    var currentScrollPos = window.pageYOffset;
    if (window.pageYOffset > 98 && document.getElementById("myTopnav").className == "topnav" && window.innerWidth <= 800) {
        if (prevScrollpos > currentScrollPos) {
            document.getElementById("myTopnav").style.top = "0";
        } else {
            document.getElementById("myTopnav").style.top = "-64px";
        }
    } else {
        document.getElementById("myTopnav").style.top = "0";
    }
    prevScrollpos = currentScrollPos;
}
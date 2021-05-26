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
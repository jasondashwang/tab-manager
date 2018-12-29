// Fill in what happens inside your popup.html
// Example, clicking "Remember Page" will parse the current URL information and save it.

var mySavedTabs = [];

// Collects the current tab's URL
function simple(){
    console.log("clicked");
    chrome.tabs.getSelected(null,function(tab) {
        var tablink = tab.url;

        if (document.getElementById("hehe").innerHTML == tablink){
            document.getElementById("hehe").innerHTML = "moo!";
            document.getElementById("openLink").disabled = true;
        } else{
            document.getElementById("hehe").innerHTML = tablink;
            document.getElementById("openLink").disabled = false;
        }
    });
}

// Opens the saved URL in a new tab
function myOpen(){
    window.open(document.getElementById("hehe").innerHTML)
}

// Saves the saved URL in a local list
function saveCurrentTab(){
    if (!document.getElementById("openLink").disabled){
        mySavedTabs.push(document.getElementById("hehe").innerHTML)
    }
    console.log(mySavedTabs);
}


// Activate all the buttons
document.getElementById("clickMe").addEventListener('click',simple);
document.getElementById("openLink").addEventListener('click',myOpen);
document.getElementById("saveTab").addEventListener('click',saveCurrentTab);



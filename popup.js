// Fill in what happens inside your popup.html
// Example, clicking "Remember Page" will parse the current URL information and save it.

var mySavedTabs = [];
var myTabDict = {};

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
    var url = document.getElementById("hehe").innerHTML
    var folder = document.getElementById("newName").value
    if (!document.getElementById("openLink").disabled){
        mySavedTabs.push(url)
    }

    // try to put it into the dictionary instead
    if (createNewFolder(folder)){
        console.log("folder created")
        addTabToFolder(url, folder)
    }

    console.log(myTabDict)
}

// creates a new Folder for tabs
function createNewFolder(key){
    if (myTabDict[key]){
        return false;
    } else {
        myTabDict[key] = []
        return true;
    }
}

function addTabToFolder(url, folder){
    myTabDict[folder].push(url)
}

// use the myTabDict keys to populate a dropdown menu to select 
// an existing folder to save the current URL to
// function selectFolder(){
//     var select = document.getElementById("example-select");
//     for(folder in myTabDict) {
//         select.options[select.options.length] = new Option(myTabDict[folder], folder);
//     }
//     var selected = select.options[select.selectedIndex].text;
//     console.log(selected)
//     return selected;
// }

// Activate all the buttons
document.getElementById("clickMe").addEventListener('click',simple);
document.getElementById("openLink").addEventListener('click',myOpen);
document.getElementById("saveTab").addEventListener('click',saveCurrentTab);




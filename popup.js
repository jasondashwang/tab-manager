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
            document.getElementById("hehe").innerHTML = "https://google.com";
            //document.getElementById("openLinks").disabled = true;
        } else{
            document.getElementById("hehe").innerHTML = tablink;
            //document.getElementById("openLinks").disabled = false;
        }
    });
}

// Opens the saved URL in a new tab
function myOpen(){
    //window.open(document.getElementById("hehe").innerHTML)

    // var select = document.getElementById("example-select");
    // folder = select.options[select.selectedIndex].text

    var folder = document.getElementById("newName").value

    if (folder != ""){
        console.log(folder)
        openAllTabsFromFolder(folder)
    }
}

// Opens all the tabs from a folder in a new window
function openAllTabsFromFolder(folder){
    
    chrome.windows.create({
        url: myTabDict[folder]
    });
    // below will open tabs in the same window
    
    // for(url in myTabDict[folder]) {
    //     chrome.tabs.create({
    //         url: myTabDict[folder][url]
    //     });
    // }
}

// Saves the saved URL in a local list
function saveCurrentTab(){
    var url = document.getElementById("hehe").innerHTML
    var folder = document.getElementById("newName").value
    // if (!document.getElementById("openLinks").disabled){
    //     mySavedTabs.push(url)
    // }

    // if you don't write a folder name, it'll use the selected one
    // from the dropdown
    if (folder == ""){
        var select = document.getElementById("example-select");
        folder = select.options[select.selectedIndex].text
    }
    
    // try to put it into the dictionary instead
    if (createNewFolder(folder)){
        populateSelection();
    }
    addTabToFolder(url, folder)

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
function populateSelection(){
    var select = document.getElementById("example-select");
    select.options.length = 0; // reset the selections
    for(folder in myTabDict) {
        select.options[select.options.length] = new Option(folder, folder);
    }
}


// Activate all the buttons
document.getElementById("clickMe").addEventListener('click',simple);
document.getElementById("openLinks").addEventListener('click',myOpen);
document.getElementById("saveTab").addEventListener('click',saveCurrentTab);




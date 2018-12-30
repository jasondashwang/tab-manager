// Fill in what happens inside your popup.html
// Example, clicking "Remember Page" will parse the current URL information and save it.

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

// Opens the saved URLs in a new tab
function myOpen(){
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

    // if you don't write a folder name, it'll use the selected one
    // from the dropdown
    if (folder == ""){
        var select = document.getElementById("example-select");
        folder = select.options[select.selectedIndex].text
    }
    
    // try to put it into the dictionary
    if (createNewFolder(folder)){
        populateSelection();
    }
    if (!myTabDict[folder].includes(url)){
        addTabToFolder(url, folder)
        saveData();
    }
    console.log(myTabDict)
}

// Saves all the tabs from the current window into a folder
function saveWindow(){
    var folder = document.getElementById("newName").value
    if (folder == ""){
        var select = document.getElementById("example-select");
        folder = select.options[select.selectedIndex].text
    }
    
    // try to put it into the dictionary instead
    if (createNewFolder(folder)){
        populateSelection();
    }

    chrome.windows.getAll({populate:true},function(windows){
        windows.forEach(function(window){
          window.tabs.forEach(function(tab){
            //collect all of the urls here
            console.log(tab.url);

            // make sure you're not adding repeats
            if (!myTabDict[folder].includes(tab.url)){
                addTabToFolder(tab.url, folder)
                saveData();
            }
          });
        });
      });
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

// delete all the contents of a folder, and the folder itself
function deleteFolder(){
    var badFolder = document.getElementById("newName").value;
    delete myTabDict[badFolder];
    saveData();
    populateSelection();
    console.log(myTabDict)
}

function saveData(){
    chrome.storage.local.set({'tabDict': myTabDict}, function() {
        console.log('Value is set to ' + myTabDict);
      });
}

// Activate all the buttons
document.getElementById("clickMe").addEventListener('click',simple);
document.getElementById("openLinks").addEventListener('click',myOpen);
document.getElementById("saveTab").addEventListener('click',saveCurrentTab);
document.getElementById("saveWindow").addEventListener('click',saveWindow);
document.getElementById("delFolder").addEventListener('click',deleteFolder);

// Get the tabs from storage and set them. 
chrome.storage.local.get(['tabDict'], function(result) {
    console.log('Value currently is ' + result["tabDict"]);
    if (result["tabDict"]){
        myTabDict = result["tabDict"];
        populateSelection();
    }
  });



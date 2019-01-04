// Fill in what happens inside your popup.html
// Example, clicking "Remember Page" will parse the current URL information and save it.

var myTabDict = {};

// Collects the current tab's URL
function createNewFolder(){
    var folder = document.getElementById("newName").value;
    tryCreateNewFolder(folder);
    updateFolders();
}

// creates a new Folder for tabs
function tryCreateNewFolder(key){
    if (myTabDict[key]){
        alert("Folder name already taken! Try a different one.");
        return false;
    } else {
        myTabDict[key] = []
        return true;
    }
}

function showTabsInFolder(folder){

    // hide the folders view and show the urls view
    toggle_visibility("folders-homepage");
    toggle_visibility("urls");
    // populate the urls view with the urls in the current folder
    updateURLS(folder);
    // title the current folder name
    document.getElementById("curr-folder-name").innerHTML = folder;

}

// Opens all the tabs from a folder in a new window
function openAllTabsFromFolder(){
    var folder = document.getElementById("curr-folder-name").innerHTML

    if (folder != ""){
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
}

// Saves the saved URL in a local list
function saveCurrentTab(){
    chrome.tabs.getSelected(null,function(tab) {
        var url = tab.url;

        var folder = document.getElementById("curr-folder-name").innerHTML

        if (!myTabDict[folder].includes(url)){
            addTabToFolder(url, folder)
            saveData();
            updateURLS(folder);
        }        
    });
    
}

// Saves all the tabs from the current window into a folder
function saveWindow(){
    var folder = document.getElementById("curr-folder-name").innerHTML

    chrome.windows.getAll({populate:true},function(windows){
        windows.forEach(function(window){
            //collect all of the urls here
          window.tabs.forEach(function(tab){

            // make sure you're not adding repeats
            if (!myTabDict[folder].includes(tab.url)){
                addTabToFolder(tab.url, folder)
                saveData();
                updateURLS(folder); // here so that I can see all the tabs without needing exit
            }
          });
        });
      });
      // why can't i see the urls appear? seems more efficient to have it here, but...
      // updateURLS(folder);
}

function addTabToFolder(url, folder){
    myTabDict[folder].push(url)
}

// delete all the contents of a folder, and the folder itself
function deleteFolder(){
    var badFolder = document.getElementById("newName").value;
    delete myTabDict[badFolder];
    saveData();
    updateFolders();
}

function deleteURL(folder, url){

    var index = myTabDict[folder].indexOf(url);
    myTabDict[folder].splice(index, 1);
    saveData();
    updateURLS(folder);
}

function saveData(){
    chrome.storage.local.set({'tabDict': myTabDict}, function() {
        console.log('Value is set to ' + myTabDict);
      });
}

// Switch between Folders list view and within folder view
function toggle_visibility(id) {
    var e = document.getElementById(id);
    if(e.style.display == 'block')
       e.style.display = 'none';
    else
       e.style.display = 'block';
}

// This will populate the folders-homepage with the current available ones
// modify this to be applicable for both folders and urls?
function makeUL(array) {
    // Create the list element:
    var list = document.createElement('ul');

    for(var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = document.createElement('li');

        var btn = document.createElement("button");
        btn.className = ".folders"; 
        btn.value = array[i];
        var t = document.createTextNode(array[i]);
        btn.appendChild(t);
        btn.addEventListener("click", function(){
            showTabsInFolder(this.value)
        });

        // Set its contents:
        item.appendChild(btn);

        // Add it to the list:
        list.appendChild(item);
    }
    
    // Finally, return the constructed list:
    return list;
}

function makeULforURLS(array) {
    // Create the list element:
    var list = document.createElement('ul');

    for(var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = document.createElement('li');

        item.id = array[i]
        // item.value = array[i];
        console.log(array[i])
        
        item.appendChild(document.createTextNode(array[i]));

        // Add it to the list:
        list.appendChild(item);
    }
    
    // Finally, return the constructed list:
    return list;
}

function updateFolders(){
    // first remove all the list items, then populate it with the existing folder names
    // Get the <ul> element with id="folders-list"
    var list = document.getElementById("folders-list");

    // As long as <ul> has a child node, remove it
    while (list.hasChildNodes()) {   
        list.removeChild(list.firstChild);
    }
    document.getElementById('folders-list').appendChild(makeUL(Object.keys(myTabDict)));
}

function updateURLS(folder){
    var list = document.getElementById("urls-list");

    // As long as <ul> has a child node, remove it
    while (list.hasChildNodes()) {   
        list.removeChild(list.firstChild);
    }
    document.getElementById('urls-list').appendChild(makeULforURLS(myTabDict[folder]));
    createRemoveURLOption();
}

function createRemoveURLOption(){
    // Create a "close" button and append it to each list item
    var myNodelist = document.getElementById("urls-list").getElementsByTagName("LI");
    var i;
    for (i = 0; i < myNodelist.length; i++) {
        var span = document.createElement("SPAN");
        var txt = document.createTextNode("\u00D7");
        span.className = "close";
        span.appendChild(txt);
        myNodelist[i].appendChild(span);
    }

    // Click on a close button to hide the current list item
    var close = document.getElementsByClassName("close");
    var i;
    for (i = 0; i < close.length; i++) {
        close[i].onclick = function() {
            var list = document.getElementById("urls-list");
            var currFolder = document.getElementById("curr-folder-name").innerHTML
            var div = this.parentElement;
            console.log(div.id)
            // div.style.display = "none";
            // list.removeChild(div);
            deleteURL(currFolder, div.id);

    }
    }
}

$(document).ready(function() {
    // Activate all the buttons
    $("#createFolder").click(createNewFolder);
    $("#openLinks").click(openAllTabsFromFolder);
    $("#saveTab").click(saveCurrentTab);
    $("#saveWindow").click(saveWindow);
    $("#delFolder").click(deleteFolder);
    $("#openFoldersView").click(function(){
        toggle_visibility("folders-homepage");
        toggle_visibility("urls");
    }); //back button

    // Get the tabs from storage and set them. 
    chrome.storage.local.get(['tabDict'], function(result) {
        console.log('Value currently is ' + result["tabDict"]);
        
        // if there is data, set it to the current dictionary value
        if (result["tabDict"]){
            myTabDict = result["tabDict"];
            updateFolders();
        }
    });
});

  


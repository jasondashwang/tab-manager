// Fill in what happens inside your popup.html
// Example, clicking "Remember Page" will parse the current URL information and save it.

var myTabDict = {};

// Collects the current tab's URL
function createNewFolder(){
    console.log("clicked");
    var folder = document.getElementById("newName").value;
    console.log(folder);
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
    console.log("will show tabs in the folder: ")
    console.log(folder)

    toggle_visibility("folders-homepage");
    toggle_visibility("urls");
    updateURLS(folder);
    document.getElementById("curr-folder-name").innerHTML = folder;

}

// Opens the saved URLs in a new tab
function myOpen(){
    var folder = document.getElementById("curr-folder-name").innerHTML

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
    chrome.tabs.getSelected(null,function(tab) {
        var url = tab.url;

        var folder = document.getElementById("curr-folder-name").innerHTML

        if (!myTabDict[folder].includes(url)){
            addTabToFolder(url, folder)
            saveData();
            updateURLS(folder);
        }
        console.log(myTabDict)
        
    });
    
}

// Saves all the tabs from the current window into a folder
function saveWindow(){
    var folder = document.getElementById("curr-folder-name").innerHTML

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
      // why can't i see the urls appear?
      updateURLS(folder);
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
    console.log(myTabDict)
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

        // Set its contents:
        // console.log(array[array]) //undefined
        // console.log(array[i]) // #
        // console.log(array[array[i]]) //#
        // console.log(array.array) //undefined
        
        console.log(array)
        item.appendChild(document.createTextNode(array[i]));

        // Add it to the list:
        list.appendChild(item);
    }
    
    // Finally, return the constructed list:
    return list;
}


function updateFolders(){
    // first remove all the list items, then populate it with the existing
    // folder names
    // Get the <ul> element with id="myList"
    var list = document.getElementById("folders-list");

    // As long as <ul> has a child node, remove it
    while (list.hasChildNodes()) {   
        list.removeChild(list.firstChild);
    }
    document.getElementById('folders-list').appendChild(makeUL(Object.keys(myTabDict)));
    //addListeners(); //delete
}

function updateURLS(folder){
    var list = document.getElementById("urls-list");

    // As long as <ul> has a child node, remove it
    while (list.hasChildNodes()) {   
        list.removeChild(list.firstChild);
    }
    document.getElementById('urls-list').appendChild(makeULforURLS(myTabDict[folder]));
}

// Activate all the buttons
document.getElementById("createFolder").addEventListener('click',createNewFolder);
document.getElementById("openLinks").addEventListener('click',myOpen);
document.getElementById("saveTab").addEventListener('click',saveCurrentTab);
document.getElementById("saveWindow").addEventListener('click',saveWindow);
document.getElementById("delFolder").addEventListener('click',deleteFolder);
document.getElementById("openFoldersView").addEventListener('click',function(){
    toggle_visibility("folders-homepage");
    toggle_visibility("urls");
}); //back button

// Get the tabs from storage and set them. 
chrome.storage.local.get(['tabDict'], function(result) {
    console.log('Value currently is ' + result["tabDict"]);
    if (result["tabDict"]){
        myTabDict = result["tabDict"];
        updateFolders();
    }
  });



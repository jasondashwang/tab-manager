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
        myTabDict[key] = {
            urlList: [],
            urlSet: []
        };
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
            url: myTabDict[folder].urlSet
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
        var myURL = {
            url: tab.url,
            title: tab.title
        };
        
        var folder = document.getElementById("curr-folder-name").innerHTML
        if (!myTabDict[folder].urlSet.includes(myURL.url)){
            addTabToFolder(myURL, folder)
            saveData();
            updateURLS(folder);
        }        
    });
    
}

// Saves all the tabs from the current window into a folder
function saveWindow(){
    var folder = document.getElementById("curr-folder-name").innerHTML

    chrome.windows.getCurrent({populate:true},function(window){
        // windows.forEach(function(window){
            //collect all of the urls here
          window.tabs.forEach(function(tab){

            var myURL = {
                url: tab.url,
                title: tab.title
            };

            // make sure you're not adding repeats
            if (!myTabDict[folder].urlSet.includes(myURL.url)){
                addTabToFolder(myURL, folder)
                saveData();
                updateURLS(folder); // here so that I can see all the tabs without needing exit
            }
          });
        // });
      });
      // why can't i see the urls appear? seems more efficient to have it here, but...
      // updateURLS(folder);
}

function addTabToFolder(url, folder){
    myTabDict[folder].urlList.push(url);
    myTabDict[folder].urlSet.push(url.url)
}

// delete all the contents of a folder, and the folder itself
function deleteFolder(){
    var badFolder = document.getElementById("newName").value;
    delete myTabDict[badFolder];
    saveData();
    updateFolders();
}

// url is the actual url
function deleteURL(folder, url){

    // remove the URL from the "set"
    var indexSet = myTabDict[folder].urlSet.indexOf(url);
    myTabDict[folder].urlSet.splice(index, 1);
    // remove the urlObject from the urlList
    var index = searchForURLAndReturnIndex(myTabDict[folder].urlList, url)
    myTabDict[folder].urlList.splice(index, 1);
    saveData();
    updateURLS(folder);
}

function searchForURLAndReturnIndex(a, obj){
    for (var i = 0; i < a.length; i++) {
        // if the url of the urlObject matches the url
        if (a[i].url === obj) {
            return i;
        }
    }
    return -1;
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
        btn.className = "folder-buttons"; 
        btn.value = array[i];
        var t = document.createTextNode(array[i]);
        btn.appendChild(t);
        btn.addEventListener("click", function(){
            showTabsInFolder(this.value)
        });

        // this seems to be the only place I can access and set the attributes and styles of these buttons
        // var hexArray = ['#5FAAF2','#288FF2','#027BF0', '#9CC9F6', '#F9CEE7', '#EEA1CD', '#E68BBE', '#FDE4FZ', '#F4B8DA']
        // var randomColor = hexArray[Math.floor(Math.random() * hexArray.length)];
        // btn.style.backgroundColor = randomColor;

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

        var content = document.createElement('a');

        content.setAttribute('href',array[i].url);

        content.innerHTML = array[i].title

        item.id = array[i].url
        
        item.appendChild(content);

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
    if (myTabDict[folder].urlList.length != 0){
        document.getElementById('urls-list').appendChild(makeULforURLS(myTabDict[folder].urlList));
        createRemoveURLOption();
    }
    
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
        span.style.color = "red";
        myNodelist[i].appendChild(span);
    }

    // Click on a close button to hide the current list item
    var close = document.getElementsByClassName("close");
    var i;
    for (i = 0; i < close.length; i++) {
        close[i].onclick = function() {
            var currFolder = document.getElementById("curr-folder-name").innerHTML
            var div = this.parentElement;
            // div.id is just the url itself
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

  


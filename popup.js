/**
 * The main dictionary that stores all the data. An example of the structure is:
 * 
 * var myTabDict = {
        folder_name: {
            urlList: [{title:'Hello - Google Search', url: 'https://www.google.com/search?q=Hello'}],
            urlSet: ["https://www.google.com/search?q=hello"]
        }
    }
 * 
 * folder_name is a string
 * urlList is a list of myURL Objects. It is only ever defined and creates in saveCurrentTab and saveWindow.
 * urlSet is a list of URL strings.
 * 
 * An example of the myURL Object structure is:
 * 
 * var myURL = {
            url: "https://www.google.com/search?q=hello",
            title: 'Hello - Google Search'
        };
 * 
 */
var myTabDict = {};

/**
 * This is used when renaming folders.
 */
var tempSavedFolderName = "";

/**
 * Trims excess whitespace off the ends of the input, and if the
 * input is empty, alerts user. Otherwise, creates a new folder 
 * according to the input value of the "newName", and updates 
 * the list of folders
 */
function createNewFolder(){
    var folder = document.getElementById("newName").value;
    var folderName = folder.trim();
    if (folderName !== ""){
        tryCreateNewFolder(folderName);
        updateFolders();
    }else{
        alert("Can't have a folder name with all whitespace.")
    }
}

/**
 * If doesn't already exist, creates a new folder in the dictionary. Initializes a
 * urlList (a list of myURL Objects) and a urlSet (a list of url strings) for this folder.
 * 
 * @param  {string} folder The name of the folder
 */
function tryCreateNewFolder(folder){
    if (myTabDict[folder]){
        alert("Folder name already taken! Try a different one.");
        return false;
    } else {
        myTabDict[folder] = {
            urlList: [],
            urlSet: []
        };
        return true;
    }
}

/**
 * Renames a folder by creating a new one with the new name, 
 * saving the contents of the current folder to it, and then deleting 
 * the initial folder.
 * 
 * @param  {string} currFolder The current name of the folder
 * @param  {string} newFolder The name the folder will be changed to
 */
function renameFolder(currFolder, newFolder){
    
    myTabDict[newFolder] = myTabDict[currFolder]
    delete myTabDict[currFolder];
    saveData();
    updateFolders();
    tempSavedFolderName = "";
}

/**
 * Hides the Folders div and Shows the URLs div within a particular folder.
 * Populates the list of urls for that folder. Also activates functionality
 * to rename the current folder through mouse events.
 * 
 * @param  {string} folder The name of the folder to open
 */
function showTabsInFolder(folder){

    // folders-homepage starts out being visible, and urls being invisible
    toggle_visibility("folders-homepage");
    toggle_visibility("urls");
    // populate the urls view with the urls in the current folder
    updateURLS(folder);
    // title the current folder name
    document.getElementById("curr-folder-name").innerHTML = folder;

    // add functionality to rename the folder:

    // mouseover to be able to edit the content
    document.getElementById("curr-folder-name").addEventListener("mouseover", function(){
        this.contentEditable='true';
        // change the cursor so you know you can click there
        $("#curr-folder-name").css({"cursor":"pointer"});
    });

    // click to save the current folder name for later, and change background to "edit-mode"
    document.getElementById("curr-folder-name").addEventListener("click", function(){
        this.style.backgroundColor = "lightblue";
        tempSavedFolderName = this.innerHTML
    });

    // click elsewhere to rename the folder
    $("#curr-folder-name").off('focusout').on('focusout', function() { // off because it was firing n+1 times
        this.contentEditable='false';
        this.style.backgroundColor = "white";
        if (tempSavedFolderName !== this.innerHTML){
            if(tryCreateNewFolder(this.innerHTML)){
                renameFolder(tempSavedFolderName, this.innerHTML);
                updateURLS(this.innerHTML)
            }
            else{
                this.style.backgroundColor = "lightblue";
                this.contentEditable='true';
            }
        }
    });

    // or press enter to rename the folder
    document.getElementById("curr-folder-name").addEventListener("keydown", function(e){
        // if you pressed "enter"
        if (e.keyCode === 13) {
            e.preventDefault();
            // all you need to do is prevent it from adding an enter line
            // and "focusout" of it so that the other event handler does the 
            // renaming work
            this.contentEditable='false';
        }
    });

}

/**
 * Opens all the tabs from the current folder in a new window
 */
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

/**
 * Saves the currently active tab in the open folder
 */
function saveCurrentTab(){
    chrome.tabs.getSelected(null,function(tab) {
        // create url object
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


/**
 * Saves all the tabs from the current window into currently open folder
 */
function saveWindow(){
    var folder = document.getElementById("curr-folder-name").innerHTML

    chrome.windows.getCurrent({populate:true},function(window){
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
      });
      // why can't i see the urls appear? seems more efficient to have it here, but...
      // updateURLS(folder);
}

/**
 * Adds a website to a particular folder.
 * 
 * @param  {myURL} url The URL Object of the current tab
 * @param  {string} folder The current folder where the tab will be saved
 */
function addTabToFolder(url, folder){
    myTabDict[folder].urlList.push(url);
    myTabDict[folder].urlSet.push(url.url)
}

/**
 * Deletes all the contents of a folder, and the folder itself.
 * Saves the data and updates front-end view.
 */
function deleteFolder(){
    var badFolder = document.getElementById("newName").value;
    delete myTabDict[badFolder];
    saveData();
    updateFolders();
}

/**
 * Deletes the url string from the folder's set, and deletes the myURL Object
 * from the folder's list. Saves the data, and updates the front-end view.
 * 
 * @param  {string} folder The folder from which to remove the URL
 * @param  {string} url The actual url string
 */
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

/**
 * Used by deleteURL to find the index of the myURL Object within the 
 * urlList of URLObjects. If it doesn't exist within the list, then returns
 * -1.
 * 
 * @param  {list} a The list in which to search
 * @param  {myURL} obj The object to look for
 */
function searchForURLAndReturnIndex(a, obj){
    for (var i = 0; i < a.length; i++) {
        // if the url of the urlObject matches the url
        if (a[i].url === obj) {
            return i;
        }
    }
    return -1;
}

/**
 * Saves the myTabDict in local Chrome storage.
 */
function saveData(){
    chrome.storage.local.set({'tabDict': myTabDict}, function() {
        console.log('Value is set to ' + myTabDict);
      });
}

/**
 * Switch between All Folders list view and Within-Folder (URLS) list view
 * 
 * @param  {string} id The HTML Object id whose view to change
 */
function toggle_visibility(id) {
    var e = document.getElementById(id);
    if(e.style.display == 'block')
       e.style.display = 'none';
    else
       e.style.display = 'block';
}


/**
 * Populates the folder-homepage with the currently available folders. Creates
 * a <ul> list and for each folder in the myTabDict, creates a button list item.
 * Each button represents a folder and has an onClick function to show the urls
 * in it's respective folder.
 * 
 * @param  {list} array The list of folders to be displayed
 */
function makeUL(array) {
    // Create the list element:
    var list = document.createElement('ul');
    list.className = "folders-list-ul";

    for(var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = document.createElement('li');
        item.style.padding = "5px";
        item.className = "folders-list-li";

        // create the button
        var btn = document.createElement("button");
        btn.className = "folder-buttons"; 
        btn.value = array[i];
        btn.appendChild(document.createTextNode(array[i]));

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

/**
 * Populates the url page with the urls within the current folder. Creates
 * a <ul> list and for each url in the folder, creates a hyperlinked <a> list item.
 * Each list item displays the title of the website, and is hyperlinked with the url.
 * 
 * @param  {list} array The list of urls in the current folder to be displayed
 */
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

/**
 * Updates the folders-homepage front-end view. Removes all the current list items
 * and regenerates the list based on the current folders in the myTabDict. It also
 * calls a function to style the folder buttons.
 */
function updateFolders(){
    // Get the <ul> element with id="folders-list"
    var list = document.getElementById("folders-list");

    // As long as <ul> has a child node, remove it
    while (list.hasChildNodes()) {   
        list.removeChild(list.firstChild);
    }
    document.getElementById('folders-list').appendChild(makeUL(Object.keys(myTabDict)));
    modifyFolderButtons();
}

/**
 * Updates the within-folder-urls front-end view. Removes all the current list items
 * and regenerates the list based on the current urls in the folder. For each list item (website),
 * it also creates an "x" to remove it individually.
 * 
 * @param  {string} folder
 */
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

/**
 * For each url in the urls list on the front-end-view, adds a red "x" with the 
 * capability to individually remove that URL from the folder.
 */
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

/**
 * Adds styling to the folder buttons; runs each time folders must be refreshed.
 */
function modifyFolderButtons(){
    $('.folder-buttons').css({"color":"#4582ec", 'height': '50px', 'width': '70px',
     'border-radius': '10px', "font-size" : "12px"});
     
    $('.folders-list-ul').css({"list-style": "none", "display": "block"});
    $('.folders-list-li').css({"display": "inline-block"});

}
/**
 * Finds the favicon for the given website, and creates and 
 * returns it as an image element. 
 * @param  {string} url
 */
function getAndCreateFavicon(url){
    var favicon = document.createElement('img');
    // get the url of favicon using favIconUrl function
    favicon.src = url + "/favicon.ico";
    // document.body.appendChild(favicon);
    return favicon;
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

  


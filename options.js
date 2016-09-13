// Depends on previously included parsepapa.js

function log(text) {
    var status = document.getElementById('status');
    status.textContent = text;
    setTimeout(function() {
      status.textContent = '';
    }, 3000);
}
// Saves options to chrome.storage
function save_options() {
  var jargonMapText = document.getElementById('jargonMapText').value;
  var parseResults = Papa.parse(jargonMapText);

  parseResults.data
	  .filter(function(row){return row.length!=2})
	  .forEach(function(row){parseResults.errors.push("Each row needs 'jargonElement,translation' (2 elements); but row contained: '" + row + "' (" + row.length + " elements)")});

  if( parseResults.errors.length != 0 ) {
	  log(parseResults.errors.join('\n'));
  } else {
	  var jargonMap = {};
	  parseResults.data.forEach(function(row){
		  jargonMap[row[0]] = row[1];
	  });
	  console.log(jargonMap);
	  console.log(jargonMapText);

	  chrome.storage.sync.set({
	    jargonMapText : jargonMapText,
	    jargonMap : jargonMap
	  }, function() {
	    // Update status to let user know options were saved.
	    log('Options Saved.');
	  });
  }
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
	jargonMapText: '',
    jargonMap: {}
  }, function(items) {
    document.getElementById('jargonMapText').value = items.jargonMapText;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);

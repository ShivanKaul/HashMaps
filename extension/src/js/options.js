// Citation: https://developer.chrome.com/extensions/optionsV2
// Saves options to chrome.storage.sync.
function save_options() {
  var home = document.getElementById('home').value;
  var work = document.getElementById('work').value;

  chrome.storage.sync.set({
    homeAddress: home,
    workAddress: work
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Addresses saved!';
    setTimeout(function() {
      status.textContent = '';
    }, 1250);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    homeAddress: '',
    workAddress: ''
  }, function(items) {
    document.getElementById('home').value = items.homeAddress;
    document.getElementById('work').value = items.workAddress;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
  save_options);
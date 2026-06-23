// Citation: https://developer.chrome.com/extensions/optionsV2
// Saves options to chrome.storage.sync.

/** Saves the home and work addresses entered by the user. */
const save_options = () => {
  const home = document.getElementById('home').value;
  const work = document.getElementById('work').value;

  chrome.storage.sync.set(
    {
      homeAddress: home,
      workAddress: work,
    },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Addresses saved!';
      setTimeout(() => {
        status.textContent = '';
      }, 1250);
    },
  );
};

/**
 * Restores the saved home and work addresses from chrome.storage into the
 * form fields.
 */
const restore_options = () => {
  chrome.storage.sync.get(
    {
      homeAddress: '',
      workAddress: '',
    },
    (items) => {
      document.getElementById('home').value = items.homeAddress;
      document.getElementById('work').value = items.workAddress;
    },
  );
};

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

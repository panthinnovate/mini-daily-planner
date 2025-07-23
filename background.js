chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.notify) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Pomodoro Timer',
      message: msg.notify
    });
  }
});
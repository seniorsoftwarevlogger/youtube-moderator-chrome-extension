function EventEmitter() {
  const listeners = [];

  function addEventListener(callback) {
    listeners.push(callback);
  }
  function removeEventListener(callback) {}
  function emit() {
    listeners.forEach(function(callback) {
      callback();
    });
  }

  return {
    emit,
    addEventListener,
    removeEventListener
  };
}

const eventEmitter = new EventEmitter();

let isLoading = false;

window.addEventListener("click", function(event) {
  if (event.target.className === "troll-button") {
    saveComment(event.target);
  }
});

function init() {
  addButtons();

  const ytLoader = document.querySelector(
    "ytcp-animatable.ytcp-comments-section"
  );

  // Options for the observer (which mutations to observe)
  const config = { attributes: false, childList: true, subtree: true };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(function(mutationsList, observer) {
    addButtons();
  });

  // Start observing the target node for configured mutations
  observer.observe(ytLoader, config);

  // // Later, you can stop observing
  // observer.disconnect();
}

// eventEmitter.addEventListener(addButtons);

function saveComment(node) {
  const parent = node.parentNode.parentNode;
  const comment = parent.querySelector(
    "ytcp-comment-expander #content #content-text"
  ).innerText;
  const name = parent.querySelector("#name");
  const channel = name.href;
  // const username = name.querySelector("yt-formatted-string").innerText;

  chrome.storage.local.get([channel], function(trollComments) {
    let comments = [];

    if (trollComments && trollComments[channel]) {
      comments = trollComments[channel];
    }

    comments.push(comment);

    chrome.storage.local.set({ [channel]: comments }, function() {
      console.info("Saved!");
    });
  });
}

function addButtons() {
  const buttons = document.querySelectorAll(
    "ytcp-menu-renderer:not(.troll-found)#action-menu.style-scope.ytcp-comment"
  );

  buttons.forEach(function(refNode) {
    refNode.className += " troll-found";
    const div = document.createElement("div");
    const counterContainer = document.createElement("span");
    const popoverContainer = document.createElement("div");
    const popoverContent = document.createElement("div");

    counterContainer.innerText = "0";
    counterContainer.className = "troll-counter";

    popoverContainer.className = "popover__wrapper";
    popoverContent.className = "popover__content";

    div.innerHTML = "👹";
    div.className = "troll-button";

    popoverContainer.appendChild(counterContainer);
    popoverContainer.appendChild(popoverContent);
    div.appendChild(popoverContainer);
    refNode.after(div);

    const parentNode = refNode.parentNode.parentNode;
    const channelLink = parentNode.querySelector("#name").href;

    chrome.storage.local.get([channelLink], function(trollComments) {
      if (trollComments && trollComments[channelLink]) {
        counterContainer.innerText = trollComments[channelLink].length;
        popoverContent.innerHTML = trollComments[channelLink]
          .map(
            trollComment =>
              `<div class="popover__comment">${trollComment}</div>`
          )
          .join("");
      }
    });
  });
}

window.setTimeout(function() {
  init();
}, 5000);

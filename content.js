(function () {
  const ext = typeof browser !== "undefined" ? browser : chrome;
  let emojiList;
  fetch(ext.runtime.getURL("res.json"))
    .then((response) => response.json())
    .then((response) => {
      emojiList = new Map(Object.entries(response));
      emojiList = new Map([...emojiList].filter((k, v) => k[0].length <= 2));
    })
    .then(() => main());

  function main() {
    function processNodes() {
      const nodes = document.querySelectorAll("p,span,h1,h2,h3,h4,h5,h6");
      for (const node of nodes) {
        if (node.dataset.emojiDisplayProcessed === "1") continue;
        let replaced = false;
        for (const [ASCII, imgURL] of emojiList.entries()) {
          if (
            node.parentElement &&
            node.innerText &&
            node.innerText.includes(ASCII) &&
            !node.innerHTML.includes('{"')
          ) {
            node.innerHTML = node.innerHTML.replace(
              new RegExp(ASCII, "g"),
              `<img src="${ext.runtime.getURL(
                imgURL
              )}" style="vertical-align: middle; position: relative; top: -1px;" width="18" height="18">`
            );
            replaced = true;
          }
        }
        if (replaced) {
          node.dataset.emojiDisplayProcessed = "1";
        }
      }
    }

    processNodes();

    let throttleTimeout = null;
    const observer = new MutationObserver(() => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        processNodes();
        throttleTimeout = null;
      }, 300);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", () => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        processNodes();
        throttleTimeout = null;
      }, 500);
    });
    window.addEventListener("pageshow", processNodes);
  }
})();

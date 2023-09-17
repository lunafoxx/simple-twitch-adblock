const enableCheckbox = document.querySelector("#enable-checkbox");
const debugCheckbox = document.querySelector("#debug-checkbox");

async function init() {
    // wtf is this api
    enableCheckbox.checked = (await browser.storage.sync.get("adblock-enabled"))["adblock-enabled"] ?? true;
    debugCheckbox.checked = (await browser.storage.sync.get("debug-enabled"))["debug-enabled"] ?? false;

    enableCheckbox.addEventListener("change", function () {
        browser.storage.sync.set({
            "adblock-enabled": enableCheckbox.checked
        });
    }, true);

    debugCheckbox.addEventListener("change", function () {
        browser.storage.sync.set({
            "debug-enabled": debugCheckbox.checked
        });
    }, true);
}

init();

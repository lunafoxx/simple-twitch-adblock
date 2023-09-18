const enableCheckbox = document.querySelector("#enable-checkbox");
const debugCheckbox = document.querySelector("#debug-checkbox");
const permissionsMessage = document.querySelector("#no-permissions");
const permissionsButton = document.querySelector("#permissions-button");

permissionsButton.addEventListener("click", requestPermissions, true);

async function requestPermissions() {
    browser.permissions.request({ origins: ["*://www.twitch.tv/*"] });
    window.close();
}

async function init() {
    const hasPermissions = await browser.permissions.contains({ origins: ["*://www.twitch.tv/*"] });
    if (!hasPermissions) {
        permissionsMessage.className = "";
    }

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

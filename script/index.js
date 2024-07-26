let mainVideo = null;
let miniVideo = null;
let miniVideoContainer = null;
let adText = null;
let muteButton = null;
let volumeSlider = null;
let customSlider = null;

let blocking = false;
let restoreVolume = null;
let href = "";

let enabled;
let debugEnabled;

main();

// ==== MAIN LOOP ==== //
async function main() {
    // my brother in christ
    enabled = (await browser.storage.sync.get("adblock-enabled"))["adblock-enabled"] ?? true;
    debugEnabled = (await browser.storage.sync.get("debug-enabled"))["debug-enabled"] ?? false;

    if (!enabled) return;

    setInterval(async function () {
        if (href !== location.href) {
            newPage();
        }

        if (!mainVideo) {
            return;
        }

        adText = document.querySelector("span[data-test-selector=ad-banner-default-text]");

        if (adText && !blocking) {
            startBlocking();
        }

        if (!adText && blocking) {
            stopBlocking();
        }
    }, 500);
}

// ==== HELPERS ==== //
function log(msg) {
    if (debugEnabled) {
        if (typeof msg === "string") {
            console.log(`[Simple Twitch Adblocker] ${msg}`);
        } else {
            console.log(msg);
        }
    }
}

function resetRefs() {
    miniVideo = null;
    miniVideoContainer = null;
    adText = null;
    muteButton = null;
    volumeSlider = null;
    customSlider = null;

    restoreVolume = null;
}

function volumeHandler() {
    if (blocking) {
        mainVideo.muted = true;
    }
}

// ==== EVENTS ==== //
function newPage() {
    href = location.href;
    log(`Page loaded: ${href}`);
    blocking = false;
    resetRefs();
    mainVideo = document.querySelector("div[data-a-target=video-player][data-a-player-type=site] video");
    log("Main player:")
    log(mainVideo);
    mainVideo.addEventListener("volumechange", volumeHandler, false);
}

function startBlocking() {
    blocking = true;
    log("Ads starting...");

    miniVideo = document.querySelector(".pbyp-player-instance video");
    miniVideoContainer = document.querySelector(".picture-by-picture-player");
    muteButton = document.querySelector("button[data-a-target=player-mute-unmute-button]");
    volumeSlider = document.querySelector("input[data-a-target=player-volume-slider]");

    if (!miniVideo) {
        adText.textContent = "No mini player found -- auto muting instead. ";
        restoreVolume = mainVideo.volume;
        mainVideo.muted = true;

        if (muteButton && volumeSlider) {
            muteButton.style.cssText = "display: none !important;";
            volumeSlider.style.cssText = "display: none !important;";
        }
        return;
    }

    adText.textContent = "Blocking ads. ";
    mainVideo.insertAdjacentElement("afterend", miniVideo);

    miniVideo.muted = false;
    miniVideo.volume = mainVideo.volume;
    mainVideo.muted = true;

    if (miniVideoContainer) {
        miniVideoContainer.style.cssText = "display: none !important;";
    }

    if (muteButton && volumeSlider) {
        muteButton.style.cssText = "display: none !important;";
        volumeSlider.style.cssText = "display: none !important;";

        customSlider = document.createElement("input");
        customSlider.type = "range";
        customSlider.min = 0;
        customSlider.max = 1;
        customSlider.step = 0.01;
        customSlider.value = miniVideo.volume;
        customSlider.className = "STA__custom-slider";

        customSlider.addEventListener("input", function () {
            miniVideo.volume = customSlider.value;
        }, false);

        muteButton.insertAdjacentElement("afterend", customSlider);
    }
}

function stopBlocking() {
    blocking = false;
    log("Ads ending...");

    if (restoreVolume) {
        mainVideo.muted = restoreVolume === 0;
        mainVideo.volume = restoreVolume;
    }

    if (miniVideo) {
        mainVideo.muted = miniVideo.volume === 0;
        mainVideo.volume = miniVideo.volume;
        miniVideo.remove();
    }

    if (muteButton) {
        muteButton.style.cssText = "";
    }

    if (volumeSlider) {
        volumeSlider.style.cssText = "";
    }

    if (customSlider) {
        customSlider.remove();
    }

    resetRefs();
}

log("Loaded");

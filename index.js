const mainVideo = document.querySelector("div[data-test-selector=video-player__video-container] video");
let miniVideo = null;
let miniVideoContainer = null;
let adText = null;
let muteButton = null;
let volumeSlider = null;
let customSlider = null;
let volumeHandler = null;

let blocking = false;

function main() {
    if (!mainVideo) {
        console.error("Simple Twitch Adblocker: Could not find main video player.");
        return;
    }

    setInterval(function () {
        adText = document.querySelector("span[data-test-selector=ad-banner-default-text]");

        if (adText && !blocking) {
            miniVideo = document.querySelector("div[data-test-selector=picture-by-picture-player-container] video");
            miniVideoContainer = document.querySelector("div[data-test-selector=picture-by-picture-player-background]");
            muteButton = document.querySelector("button[data-a-target=player-mute-unmute-button]");
            volumeSlider = document.querySelector("input[data-a-target=player-volume-slider]");

            blocking = true;

            if (!miniVideo) {
                adText.textContent = "No mini player found -- auto muting instead. ";
                mainVideo.muted = true;
                return;
            }

            adText.textContent = "Blocking ads. ";
            mainVideo.insertAdjacentElement("afterend", miniVideo);

            miniVideo.muted = false;
            miniVideo.volume = mainVideo.volume;
            mainVideo.muted = true;

            volumeHandler = () => {
                if (!blocking) return;
                mainVideo.muted = true;
            };
            mainVideo.addEventListener("volumechange", volumeHandler, false);

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

            return;
        }

        if (!adText && blocking) {
            blocking = false;

            if (volumeHandler) {
                mainVideo.removeEventListener("volumechange", volumeHandler, false);
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

            miniVideo = null;
            miniVideoContainer = null;
            adText = null;
            muteButton = null;
            volumeSlider = null;
            customSlider = null;
            volumeHandler = null;
        }
    }, 500);
}

main();

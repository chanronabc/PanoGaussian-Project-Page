document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".site-header");
    const togglePlaybackBtn = document.getElementById("toggle-playback-btn");
    const copyBibtexBtn = document.getElementById("copy-bibtex-btn");
    const bibtexCode = document.getElementById("bibtex-code");
    const videos = Array.from(document.querySelectorAll(".sync-video"));

    const syncHeaderState = () => {
        if (!header) {
            return;
        }
        header.classList.toggle("scrolled", window.scrollY > 8);
    };

    let areVideosPlaying = false;
    const updatePlaybackLabel = () => {
        if (!togglePlaybackBtn) {
            return;
        }
        togglePlaybackBtn.textContent = areVideosPlaying ? "Pause all videos" : "Play all videos";
    };

    if (togglePlaybackBtn && videos.length > 0) {
        updatePlaybackLabel();

        togglePlaybackBtn.addEventListener("click", async () => {
            if (areVideosPlaying) {
                videos.forEach((video) => video.pause());
                areVideosPlaying = false;
                updatePlaybackLabel();
                return;
            }

            const anchorTime = videos[0].currentTime;
            const playbackResults = await Promise.allSettled(
                videos.map((video) => {
                    video.currentTime = anchorTime;
                    return video.play();
                })
            );

            areVideosPlaying = playbackResults.some((result) => result.status === "fulfilled");
            updatePlaybackLabel();
        });

        videos.forEach((video) => {
            video.addEventListener("play", () => {
                areVideosPlaying = videos.some((item) => !item.paused);
                updatePlaybackLabel();
            });

            video.addEventListener("pause", () => {
                areVideosPlaying = videos.some((item) => !item.paused);
                updatePlaybackLabel();
            });
        });
    }

    if (copyBibtexBtn && bibtexCode) {
        copyBibtexBtn.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(bibtexCode.textContent.trim());
                const originalLabel = copyBibtexBtn.textContent;
                copyBibtexBtn.textContent = "Copied";
                window.setTimeout(() => {
                    copyBibtexBtn.textContent = originalLabel;
                }, 1800);
            } catch (error) {
                console.error("Failed to copy BibTeX", error);
            }
        });
    }

    syncHeaderState();
    window.addEventListener("scroll", syncHeaderState, { passive: true });
});

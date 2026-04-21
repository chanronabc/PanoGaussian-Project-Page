document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const revealNodes = document.querySelectorAll(".reveal");
  const togglePlaybackButton = document.getElementById("toggle-playback-btn");
  const syncVideos = Array.from(document.querySelectorAll(".sync-video"));
  const triptychVideo = document.getElementById("triptych-carousel-video");
  const triptychSource = document.getElementById("triptych-carousel-source");
  const triptychTitle = document.getElementById("triptych-carousel-title");
  const triptychDescription = document.getElementById("triptych-carousel-description");
  const triptychIndicator = document.getElementById("triptych-carousel-indicator");
  const triptychPrevButton = document.getElementById("triptych-prev-btn");
  const triptychNextButton = document.getElementById("triptych-next-btn");

  const syncHeaderState = () => {
    if (!header) {
      return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  syncHeaderState();
  window.addEventListener("scroll", syncHeaderState, { passive: true });

  if (revealNodes.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -30px 0px"
      }
    );

    revealNodes.forEach((node) => revealObserver.observe(node));
  }

  const triptychPlaylist = [
    {
      title: "Scene 0",
      description: "Column order: LayerPano3D | Scene4U | DreamScene360 | Ours",
      src: "static/videos/comparison_quad_scene0.mp4",
      poster: "static/images/output_images/comparison_quad_scene0_first_frame.png"
    },
    {
      title: "Scene 2",
      description: "Column order: LayerPano3D | Scene4U | DreamScene360 | Ours",
      src: "static/videos/comparison_quad_scene2.mp4",
      poster: "static/images/output_images/comparison_quad_scene2_first_frame.png"
    },
    {
      title: "Scene 4",
      description: "Column order: LayerPano3D | Scene4U | DreamScene360 | Ours",
      src: "static/videos/comparison_quad_scene4.mp4",
      poster: "static/images/output_images/comparison_quad_scene4_first_frame.png"
    },
    {
      title: "Scene 5",
      description: "Column order: LayerPano3D | Scene4U | DreamScene360 | Ours",
      src: "static/videos/comparison_quad_scene5.mp4",
      poster: "static/images/output_images/comparison_quad_scene5_first_frame.png"
    },
    {
      title: "Scene 6",
      description: "Column order: LayerPano3D | Scene4U | DreamScene360 | Ours",
      src: "static/videos/comparison_quad_scene6.mp4",
      poster: "static/images/output_images/comparison_quad_scene6_first_frame.png"
    },
    {
      title: "Scene 7",
      description: "Column order: LayerPano3D | Scene4U | DreamScene360 | Ours",
      src: "static/videos/comparison_quad_scene7.mp4",
      poster: "static/images/output_images/comparison_quad_scene7_first_frame.png"
    },
    {
      title: "Scene 8",
      description: "Column order: LayerPano3D | Scene4U | DreamScene360 | Ours",
      src: "static/videos/comparison_quad_scene8.mp4",
      poster: "static/images/output_images/comparison_quad_scene8_first_frame.png"
    },
    {
      title: "Scene 9",
      description: "Column order: LayerPano3D | Scene4U | DreamScene360 | Ours",
      src: "static/videos/comparison_quad_scene9.mp4",
      poster: "static/images/output_images/comparison_quad_scene9_first_frame.png"
    }
  ];

  let triptychIndex = 0;

  const updateTriptychIndicator = () => {
    if (!triptychIndicator) {
      return;
    }
    triptychIndicator.textContent = `${triptychIndex + 1} / ${triptychPlaylist.length}`;
  };

  const applyTriptychSlide = async (nextIndex) => {
    if (!triptychVideo || !triptychSource || triptychPlaylist.length === 0) {
      return;
    }

    const normalizedIndex = (nextIndex + triptychPlaylist.length) % triptychPlaylist.length;
    const slide = triptychPlaylist[normalizedIndex];
    const wasPlaying = !triptychVideo.paused;

    triptychIndex = normalizedIndex;

    if (triptychTitle) {
      triptychTitle.textContent = slide.title;
    }
    if (triptychDescription) {
      triptychDescription.textContent = slide.description;
    }
    updateTriptychIndicator();

    triptychVideo.pause();
    triptychVideo.setAttribute("poster", slide.poster);
    triptychSource.src = slide.src;
    triptychVideo.load();

    if (!wasPlaying) {
      return;
    }

    try {
      await triptychVideo.play();
    } catch (error) {
      console.error("Failed to autoplay switched triptych slide", error);
    }
  };

  if (triptychVideo && triptychSource && triptychPrevButton && triptychNextButton) {
    updateTriptychIndicator();

    triptychPrevButton.addEventListener("click", () => {
      applyTriptychSlide(triptychIndex - 1);
    });

    triptychNextButton.addEventListener("click", () => {
      applyTriptychSlide(triptychIndex + 1);
    });
  }

  let areVideosPlaying = false;

  const updatePlaybackLabel = () => {
    if (!togglePlaybackButton) {
      return;
    }
    togglePlaybackButton.textContent = areVideosPlaying ? "Pause comparison" : "Play comparison";
  };

  if (togglePlaybackButton && syncVideos.length > 0) {
    updatePlaybackLabel();

    togglePlaybackButton.addEventListener("click", async () => {
      if (areVideosPlaying) {
        syncVideos.forEach((video) => video.pause());
        areVideosPlaying = false;
        updatePlaybackLabel();
        return;
      }

      const anchorTime = syncVideos[0].currentTime;
      const results = await Promise.allSettled(
        syncVideos.map((video) => {
          video.currentTime = anchorTime;
          return video.play();
        })
      );

      areVideosPlaying = results.some((result) => result.status === "fulfilled");
      updatePlaybackLabel();
    });

    syncVideos.forEach((video) => {
      video.addEventListener("play", () => {
        areVideosPlaying = syncVideos.some((item) => !item.paused);
        updatePlaybackLabel();
      });

      video.addEventListener("pause", () => {
        areVideosPlaying = syncVideos.some((item) => !item.paused);
        updatePlaybackLabel();
      });
    });
  }
});

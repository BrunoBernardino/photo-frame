(() => {
  const chosenImages = [];
  const videoTransitionInMS = 3000;
  const transitionInMS = 15000;
  let currentImageIndex = -1;
  let slideshowTimeout = null;

  const filesInput = document.getElementById('files');
  const thumbnailsWrapper = document.getElementById('thumbnails');
  const playButton = document.getElementById('play');
  const slideshowWrapper = document.getElementById('slideshow');
  const mainWrapper = document.getElementById('main');
  const videoWrapper = document.getElementById('video-player');
  const videoElement = document.getElementById('video');

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const removeExtensionFromFileName = (fileName) => {
    return fileName.split('.').slice(0, -1).join('.');
  };

  const chooseFiles = (event) => {
    const files = event.target.files;

    chosenImages.length = 0;

    while (thumbnailsWrapper.firstChild) {
      thumbnailsWrapper.removeChild(thumbnailsWrapper.firstChild);
    }

    const chosenVideos = [];

    Array.from(files).forEach((file) => {
      if (file.type.match('video.*')) {
        // NOTE: These become unavailable after about a minute, but it's a mobile webkit bug: https://bugs.webkit.org/show_bug.cgi?id=228683
        const videoUrl = URL.createObjectURL(file);
        chosenVideos.push({ name: file.name, url: videoUrl, type: file.type });
      }
    });

    Array.from(files).forEach((file) => {
      if (!file.type.match('image.*')) {
        return;
      }

      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.alt = file.name;
      const span = document.createElement('span');
      span.className = 'thumbnail';
      span.insertBefore(img, null);

      const video = chosenVideos.find((_video) =>
        removeExtensionFromFileName(_video.name) === removeExtensionFromFileName(file.name)
      );

      if (video) {
        span.className = `${span.className} with-video`;
      }

      thumbnailsWrapper.insertBefore(span, null);

      chosenImages.push({ name: file.name, url: img.src, type: file.type, video });
    });
  };

  const showNextImage = () => {
    if (currentImageIndex === (chosenImages.length - 1)) {
      startSlideshow();
      return;
    }

    videoWrapper.style.opacity = 0;
    slideshowWrapper.style.opacity = 0;

    setTimeout(() => {
      slideshowWrapper.style.opacity = 1;
    }, 500);

    setTimeout(() => {
      const chosenImage = chosenImages[++currentImageIndex];

      window.loadImage(
        chosenImage.url,
        () => {
          slideshowWrapper.style.backgroundImage = `url(${chosenImage.url})`;
          slideshowTimeout = setTimeout(showNextImage, transitionInMS);
        },
        {
          maxWidth: window.screen.availWidth,
          maxHeight: window.screen.availHeight,
          contain: true,
          orientation: true,
        },
      );

      if (chosenImage.video) {
        videoElement.src = chosenImage.video.url;
        videoWrapper.load();

        setTimeout(() => {
          videoWrapper.style.opacity = 1;
          slideshowWrapper.style.backgroundImage = '';
        }, videoTransitionInMS);
      }
    }, 200);
  };

  const startSlideshow = (event) => {
    if (event && typeof event.preventDefault !== 'undefined') {
      event.preventDefault();
    }

    clearTimeout(slideshowTimeout);
    shuffle(chosenImages);
    currentImageIndex = -1;

    try {
      if (typeof document.body.requestFullscreen !== 'undefined') {
        document.body.requestFullscreen();
      }
    } catch (error) {
      console.log(`Request for fullscreen denied: ${error}`);
    }

    mainWrapper.style.display = 'none';
    slideshowWrapper.style.display = 'flex';

    showNextImage();
  };

  const stopSlideshow = () => {
    mainWrapper.style.display = 'block';
    slideshowWrapper.style.display = 'none';
    clearTimeout(slideshowTimeout);
  };

  filesInput.addEventListener('change', chooseFiles, false);
  playButton.addEventListener('click', startSlideshow, false);
  slideshowWrapper.addEventListener('click', stopSlideshow, false);
  videoWrapper.addEventListener('click', stopSlideshow, false);
  videoElement.addEventListener('click', stopSlideshow, false);
})();

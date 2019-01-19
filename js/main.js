(() => {
  const chosenImages = [];
  const transitionInMS = 10000;
  let currentImageIndex = -1;
  let slideshowTimeout = null;

  const filesInput = document.getElementById('files');
  const thumbnailsWrapper = document.getElementById('thumbnails');
  const playButton = document.getElementById('play');
  const slideshowWrapper = document.getElementById('slideshow');
  const mainWrapper = document.getElementById('main');

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const chooseFiles = (event) => {
    const files = event.target.files;

    chosenImages.length = 0;

    while (thumbnailsWrapper.firstChild) {
      thumbnailsWrapper.removeChild(thumbnailsWrapper.firstChild);
    }

    Array.from(files).forEach((file) => {
      if (!file.type.match('image.*')) {
        return;
      }

      window.loadImage(
        file,
        (canvas) => {
          const img = document.createElement('img');
          img.src = canvas.toDataURL();
          img.alt = file.name;
          const span = document.createElement('span');
          span.className = 'thumbnail';
          span.insertBefore(img, null);
          thumbnailsWrapper.insertBefore(span, null);

          chosenImages.push(img.src);
        },
        {
          maxWidth: window.screen.availWidth,
          maxHeight: window.screen.availHeight,
          contain: true,
          orientation: true,
        },
      );
    });
  };

  const showNextImage = () => {
    if (currentImageIndex === (chosenImages.length - 1)) {
      startSlideshow();
      return;
    }

    slideshowWrapper.style.opacity = 0;

    setTimeout(() => {
      slideshowWrapper.style.opacity = 1;
    }, 500);

    setTimeout(() => {
      slideshowWrapper.style.backgroundImage = `url(${chosenImages[++currentImageIndex]})`;
      slideshowTimeout = setTimeout(showNextImage, transitionInMS);
    }, 200);
  };

  const startSlideshow = (event) => {
    if (event && typeof event.preventDefault !== 'undefined') {
      event.preventDefault();
    }

    clearTimeout(slideshowTimeout);
    shuffle(chosenImages);
    currentImageIndex = -1;

    if (typeof document.body.requestFullscreen !== 'undefined') {
      document.body.requestFullscreen();
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
})();

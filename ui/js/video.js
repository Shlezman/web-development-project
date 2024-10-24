const video = document.getElementById('Video');
video.muted = true;
video.addEventListener('click', () => {
if (video.paused) {
    video.play();
} else {
    video.pause();
}
});
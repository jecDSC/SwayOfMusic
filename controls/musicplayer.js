document.addEventListener("DOMContentLoaded", function () {
  const songSelector = document.getElementById("songSelector");
  const audioPlayer = document.getElementById("audioPlayer");
  const volumeSlider = document.getElementById("volumeSlider");
  const musicPlayer = document.getElementById("musicPlayer");
  const togglePlayerBtn = document.getElementById("togglePlayerBtn");

  if (!songSelector) {
    console.error("Error: Song selector not found!");
  }
  if (!audioPlayer) {
    console.error("Error: Audio player element not found!");
  }
  if (!volumeSlider) {
    console.error("Error: Volume slider not found!");
  }
  if (!musicPlayer) {
    console.error("Error: Music player container not found!");
  }
  if (!togglePlayerBtn) {
    console.error("Error: Toggle button not found!");
  }

  if (audioPlayer && volumeSlider) {
    audioPlayer.volume = parseFloat(volumeSlider.value);
  }

  if (songSelector && audioPlayer) {
    songSelector.addEventListener("change", function () {
      const selectedSong = this.value;

      if (selectedSong) {
        audioPlayer.src = selectedSong;
        audioPlayer.play().catch((error) => {
          console.warn("Autoplay was prevented or an error occurred:", error);
        });
      } else {
        audioPlayer.pause();
        audioPlayer.src = "";
      }
    });
  }

  if (volumeSlider && audioPlayer) {
    volumeSlider.addEventListener("input", function () {
      audioPlayer.volume = parseFloat(this.value);
    });
  }

  if (musicPlayer && togglePlayerBtn) {
    togglePlayerBtn.innerHTML = "&raquo;";

    togglePlayerBtn.addEventListener("click", function () {
      musicPlayer.classList.toggle("tucked");

      if (musicPlayer.classList.contains("tucked")) {
        this.innerHTML = "&laquo;";
      } else {
        this.innerHTML = "&raquo;";
      }
    });
  }
});

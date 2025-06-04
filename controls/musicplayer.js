document.addEventListener("DOMContentLoaded", function () {
  // Get all necessary elements once the DOM is loaded
  const songSelector = document.getElementById("songSelector");
  const audioPlayer = document.getElementById("audioPlayer");
  const volumeSlider = document.getElementById("volumeSlider");
  const musicPlayer = document.getElementById("musicPlayer"); // For tucking
  const togglePlayerBtn = document.getElementById("togglePlayerBtn"); // For tucking

  // --- Safety checks: Ensure all elements were found ---
  if (!songSelector) {
    console.error("Error: Song selector not found!");
    // return; // Stop execution if critical elements are missing
  }
  if (!audioPlayer) {
    console.error("Error: Audio player element not found!");
    // return;
  }
  if (!volumeSlider) {
    console.error("Error: Volume slider not found!");
    // return;
  }
  if (!musicPlayer) {
    console.error("Error: Music player container not found!");
    // return;
  }
  if (!togglePlayerBtn) {
    console.error("Error: Toggle button not found!");
    // return;
  }

  // --- Initialize Volume ---
  // Check if audioPlayer and volumeSlider exist before setting initial volume
  if (audioPlayer && volumeSlider) {
    audioPlayer.volume = parseFloat(volumeSlider.value); // Ensure value is a float
  }

  // --- Song Selection Logic ---
  if (songSelector && audioPlayer) {
    songSelector.addEventListener("change", function () {
      const selectedSong = this.value; // 'this' refers to songSelector

      if (selectedSong) {
        audioPlayer.src = selectedSong;
        audioPlayer.play().catch((error) => {
          // Autoplay might be blocked by the browser, log error
          console.warn("Autoplay was prevented or an error occurred:", error);
          // You might want to provide a play button if autoplay fails
        });
      } else {
        audioPlayer.pause();
        audioPlayer.src = "";
      }
    });
  }

  // --- Volume Control Logic ---
  if (volumeSlider && audioPlayer) {
    volumeSlider.addEventListener("input", function () {
      audioPlayer.volume = parseFloat(this.value); // 'this' refers to volumeSlider
    });
  }

  // --- Toggle Player Visibility Logic ---
  if (musicPlayer && togglePlayerBtn) {
    // Set initial button text based on whether player starts tucked
    // (Assuming it doesn't start tucked based on current HTML/CSS)
    togglePlayerBtn.innerHTML = "&raquo;"; // Symbol to "tuck"

    togglePlayerBtn.addEventListener("click", function () {
      musicPlayer.classList.toggle("tucked");

      // Change button text/icon based on state
      if (musicPlayer.classList.contains("tucked")) {
        this.innerHTML = "&laquo;"; // Symbol to "open" (points inwards from edge)
      } else {
        this.innerHTML = "&raquo;"; // Symbol to "tuck" (points towards edge)
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll(".toggle-btn");
  const contentSections = document.querySelectorAll(".content-section");

  toggleButtons.forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const targetId = button.getAttribute("data-target");
        const targetSection = document.getElementById(targetId);

        // Only show the target section
        if (targetSection) {
          targetSection.style.display = "block";
        }

        // Hide the button after it's clicked
        button.style.display = "none"; // Add this line
      },
      { once: true }
    ); // Option to make the event listener run only once (alternative)
  });

  // Initially hide all sections
  contentSections.forEach((section) => {
    section.style.display = "none";
  });
});

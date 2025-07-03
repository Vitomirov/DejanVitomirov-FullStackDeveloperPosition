import React, { useState, useEffect } from "react";

function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Checks scroll position and toggles visibility of the button
  const toggleVisibility = () => {
    // Show button if pageYOffset (or scrollY) is greater than 300 pixels
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scrolls the window to the top with a smooth animation
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll animation
    });
  };

  // Add and remove scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    // Cleanup: remove event listener when component unmounts
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return (
    <button
      className={`back-to-top-arrow ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
      title="Idi na vrh" // Tooltip for accessibility
    >
      &#x2191; {/* Unicode character for an upward arrow */}
    </button>
  );
}

export default BackToTop;

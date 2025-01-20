/****************************************
 * 1. TYPEWRITER EFFECT
 ****************************************/
const typedTextSpan = document.getElementById("typewriter");
const textArray = [
  "build reliable Java microservices.",
  "develop practical enterprise solutions.",
  "craft scalable Java applications.",
  "create efficient cloud-native systems.",
  "work on distributed architectures.",
  "optimise backend systems for performance.",
  "design APIs for seamless integrations.",
  "maintain robust microservice ecosystems.",
  "solve complex problems with Java.",
  "implement secure and scalable solutions.",
  "integrate third-party services with precision.",
  "write clean and maintainable Java code.",
  "develop backend systems for modern applications.",
  "contribute to cloud-based enterprise platforms.",
  "collaborate on innovative software projects.",
  "streamline workflows through automation.",
  "ensure high availability in distributed systems.",
  "enhance application reliability and performance.",
  "implement cutting-edge Java technologies."
];
  
const typingDelay = 100;
const erasingDelay = 50;
const newTextDelay = 3000; // Pause between text
let textArrayIndex = 0;
let charIndex = 0;
let currentFadeInterval = null;

function type() {
  if (!typedTextSpan) return; // Safety check

  if (charIndex < textArray[textArrayIndex].length) {
    typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
    charIndex++;
    setTimeout(type, typingDelay);
  } else {
    // Pause, then erase
    setTimeout(erase, newTextDelay);
  }
}

function erase() {
  if (!typedTextSpan) return;

  if (charIndex > 0) {
    typedTextSpan.textContent = textArray[textArrayIndex].substring(
      0,
      charIndex - 1
    );
    charIndex--;
    setTimeout(erase, erasingDelay);
  } else {
    // Move to next text, or loop
    textArrayIndex = (textArrayIndex + 1) % textArray.length;
    setTimeout(type, typingDelay);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (typedTextSpan && textArray.length) {
    setTimeout(type, newTextDelay);
  }
  
  // Add dark mode toggle listener
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (typedTextSpan && textArray.length) {
    setTimeout(type, newTextDelay);
  }
  
  // Add dark mode toggle listener
  const musicToggle = document.getElementById('musicToggle');
  if (musicToggle) {
    musicToggle.addEventListener('click', toggleMusic);
  }
});

/****************************************
 * 2. DARK MODE TOGGLE
 ****************************************/
function toggleDarkMode() {
  const isDarkMode = document.body.classList.contains('dark-mode');
  document.body.classList.toggle('dark-mode');
  
  // Play appropriate sound at lower volume
  const toggleSound = document.getElementById(isDarkMode ? 'toggleOff' : 'toggleOn');
  if (toggleSound) {
    toggleSound.volume = 0.3; // Set volume to 30%
    toggleSound.currentTime = 0;
    toggleSound.play().catch(error => console.log("Sound play prevented:", error));
  }
  
  // Save preference to localStorage
  localStorage.setItem('darkMode', !isDarkMode);
  
  // Update toggle icon
  const toggleIcon = document.querySelector('.toggle-icon');
  toggleIcon.textContent = !isDarkMode ? '☀️' : '🌗';
}

// Check for saved theme preference when page loads
document.addEventListener('DOMContentLoaded', () => {
  const savedDarkMode = localStorage.getItem('darkMode');
  
  if (savedDarkMode === 'true') {
    document.body.classList.add('dark-mode');
    document.querySelector('.toggle-icon').textContent = '☀️';
  }
});

/****************************************
 * 3. SCROLL-BASED SECTION ANIMATIONS
 *    (Intersection Observer)
 ****************************************/
function animateOnScroll() {
  const elements = document.querySelectorAll("[data-animate]");

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  elements.forEach(el => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", animateOnScroll);

/****************************************
 * 4. FOOTER COPYRIGHT YEAR
 ****************************************/
document.getElementById("year").textContent = new Date().getFullYear();

/****************************************
 * 5. CHATBOT
 ****************************************/
const chatForm = document.getElementById("chat-form");
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");

let currentUserQuestion = ""; // store the last user question

// Fade in the form on DOM load
document.addEventListener("DOMContentLoaded", () => {
  if (chatForm) {
    // Add a small delay so the fade feels smoother
    setTimeout(() => {
      chatForm.classList.add("show");
    }, 200);
  }
});

if (chatForm && chatMessages && userInput) {
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    // Store the user's question
    currentUserQuestion = message;

    // Clear input and show loader
    userInput.value = "";
    chatMessages.innerHTML = "";
    const loader = document.querySelector('.loader');
    loader.style.display = 'grid';

    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await response.json();

      // Hide loader
      loader.style.display = 'none';

      // If we got a valid response from the bot
      if (data && data.response) {
        displayBotMessage(data.response);
      } else {
        displayBotMessage("Oops, something went wrong. Please try again.");
      }
    } catch (error) {
      // Hide loader
      loader.style.display = 'none';
      console.error("Error:", error);
      displayBotMessage("Error connecting to chatbot. Please try again.");
    }
  });
}

/**
 * displayBotMessage: Clears old content, 
 * shows the user's question in grey, 
 * then fades in lines from the bot's response.
 */
function displayBotMessage(botText) {
  // Clear previous Q&A
  chatMessages.innerHTML = "";

  // Insert user question in small grey italics
  const questionEl = document.createElement("div");
  questionEl.classList.add("user-question");
  questionEl.textContent = currentUserQuestion;
  chatMessages.appendChild(questionEl);

  // Split bot text by lines
  const lines = botText.split(/\r?\n/);

  let delay = 0;
  lines.forEach((line) => {
    // Create a new div for each line
    const lineEl = document.createElement("div");
    lineEl.classList.add("bot-line");
    lineEl.textContent = line;

    // Append it to chatMessages but hidden
    chatMessages.appendChild(lineEl);

    // Fade in each line with a staggered delay
    setTimeout(() => {
      lineEl.classList.add("fade-in");
    }, delay);

    // Increase delay for next line
    delay += 500;
  });
}

/****************************************
 * 6. MUSIC TOGGLE
 ****************************************/
function fadeOut(audio, duration) {
    return new Promise((resolve) => {
        if (currentFadeInterval) {
            clearInterval(currentFadeInterval);
        }
        
        const initialVolume = audio.volume;
        const step = initialVolume / (duration / 50);
        
        currentFadeInterval = setInterval(() => {
            if (audio.volume - step > 0) {
                audio.volume -= step;
            } else {
                audio.volume = 0;
                clearInterval(currentFadeInterval);
                currentFadeInterval = null;
                resolve();
            }
        }, 50);
    });
}

function fadeIn(audio, duration) {
    return new Promise((resolve) => {
        if (currentFadeInterval) {
            clearInterval(currentFadeInterval);
        }
        
        const targetVolume = 0.2;
        audio.volume = 0;
        
        const step = targetVolume / (duration / 50);
        
        currentFadeInterval = setInterval(() => {
            if (audio.volume + step < targetVolume) {
                audio.volume += step;
            } else {
                audio.volume = targetVolume;
                clearInterval(currentFadeInterval);
                currentFadeInterval = null;
                resolve();
            }
        }, 50);
    });
}

function toggleMusic() {
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    
    const isMuted = musicToggle.classList.contains('music-muted');
    musicToggle.classList.toggle('music-muted');
    
    // Play toggle sound at lower volume
    const toggleSound = document.getElementById(isMuted ? 'toggleOn' : 'toggleOff');
    if (toggleSound) {
        toggleSound.volume = 0.3;
        // Use promise chain for iOS
        const playPromise = toggleSound.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => console.log("Sound play prevented:", error));
        }
    }
    
    // Update toggle icon
    const toggleIcon = document.querySelector('.music-icon');
    toggleIcon.textContent = !isMuted ? '🔇' : '🔊';
    
    // Handle music playback with promise
    if (!isMuted) {
        const fadePromise = fadeOut(bgMusic, 1000);
        fadePromise.then(() => bgMusic.pause());
    } else {
        bgMusic.play()
            .then(() => fadeIn(bgMusic, 1000))
            .catch(error => {
                console.log("Music play prevented:", error);
                // Revert state if play fails
                musicToggle.classList.add('music-muted');
                toggleIcon.textContent = '🔇';
            });
    }
    
    localStorage.setItem('musicMuted', !isMuted);
}

// Check for saved music preference when page loads
document.addEventListener('DOMContentLoaded', () => {
  const savedMusicMuted = localStorage.getItem('musicMuted');
  const musicToggle = document.getElementById('musicToggle');
  const bgMusic = document.getElementById('bgMusic');
  
  // Set initial volume but don't play yet
  bgMusic.volume = 0.2;
  
  // Set initial state without playing
  if (savedMusicMuted === 'true') {
    musicToggle.classList.add('music-muted');
    document.querySelector('.music-icon').textContent = '🔇';
  } else {
    document.querySelector('.music-icon').textContent = '🔊';
  }
  
  // Add touch event listener specifically for iOS
  musicToggle.addEventListener('touchend', function(e) {
    e.preventDefault(); // Prevent double-firing on iOS
    toggleMusic();
  });
});

// Welcome Modal Handler
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("welcomeModal");
  const modalButton = modal.querySelector(".modal-button");
  
  // Check if user has visited before
  if (!localStorage.getItem("hasVisited")) {
    // Show modal with slight delay for smooth transition
    setTimeout(() => {
      modal.classList.add("show");
    }, 500);
    
    // Store that user has visited
    localStorage.setItem("hasVisited", "true");
  }
  
  // Close modal when button is clicked
  modalButton.addEventListener("click", () => {
    modal.classList.remove("show");
    // Remove modal from DOM after animation
    setTimeout(() => {
      modal.remove();
    }, 300);
  });
});

function initMobileMenu() {
  const hamburger = document.getElementById('hamburgerBtn');
  const navMenu = document.querySelector('.nav-menu');
  const menuLinks = document.querySelectorAll('.nav-menu a');

  function toggleMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  }

  // Toggle menu on hamburger click
  hamburger.addEventListener('click', toggleMenu);

  // Close menu when clicking a link
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && 
        !navMenu.contains(e.target) && 
        navMenu.classList.contains('active')) {
      toggleMenu();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  // ... your other existing code
});

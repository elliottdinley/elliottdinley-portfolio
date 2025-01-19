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
const newTextDelay = 1500; // Pause between text
let textArrayIndex = 0;
let charIndex = 0;

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

/****************************************
 * 2. DARK MODE TOGGLE
 ****************************************/
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  
  // Save preference to localStorage
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
  
  // Update toggle icon
  const toggleIcon = document.querySelector('.toggle-icon');
  toggleIcon.textContent = isDarkMode ? '☀️' : '🌗';
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

    // Store the user's question so we can show it above bot's answer
    currentUserQuestion = message;

    // Clear out the input
    userInput.value = "";

    // Actually call your Netlify function with the user's question
    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await response.json();

      // If we got a valid response from the bot
      if (data && data.response) {
        // Show the bot's message
        displayBotMessage(data.response);
      } else {
        displayBotMessage("Oops, something went wrong. Please try again.");
      }
    } catch (error) {
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

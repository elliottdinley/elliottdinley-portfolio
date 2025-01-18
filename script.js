/****************************************
 * 1. TYPEWRITER EFFECT
 ****************************************/
const typedTextSpan = document.getElementById("typewriter");
const textArray = [
  "build scalable microservices",
  "love solving problems",
  "am an Associate Java Developer"
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
});

/****************************************
 * 2. DARK MODE TOGGLE
 ****************************************/
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

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
 * 5. CHATBOT: SUBMIT FORM, CALL NETLIFY FUNC
 ****************************************/
const chatForm = document.getElementById("chat-form");
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");

if (chatForm && chatMessages && userInput) {
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    // Display user message in chat window
    displayMessage(message, "user");
    userInput.value = "";

    // Send request to Netlify function
    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await response.json();

      if (data && data.response) {
        displayMessage(data.response, "bot");
      } else {
        displayMessage(
          "Oops, something went wrong with the chatbot. Please try again.",
          "bot"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      displayMessage("Error connecting to chatbot. Please try again.", "bot");
    }
  });
}

function displayMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  if (sender === "user") {
    messageDiv.classList.add("user-message");
  } else {
    messageDiv.classList.add("bot-message");
  }
  messageDiv.textContent = text;
  chatMessages.appendChild(messageDiv);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

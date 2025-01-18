// =======================================
// 1. Automatic Year for Footer
// =======================================
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// =======================================
// 2. Dark Mode Toggle
// =======================================
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// =======================================
// 3. Simple Parallax Background
// =======================================
window.addEventListener("scroll", function () {
  const parallaxBg = document.querySelector("[data-parallax-bg]");
  if (!parallaxBg) return;
  const scrollY = window.pageYOffset;
  // Adjust factor for desired speed
  parallaxBg.style.transform = `translateY(${scrollY * 0.4}px)`;
});

// =======================================
// 4. Intersection Observer for Fade-Ins
// =======================================
const faders = document.querySelectorAll("[data-animate]");

const appearOptions = {
  threshold: 0.1,
};

const appearOnScroll = new IntersectionObserver((entries, appearOnScroll) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in-view");
    appearOnScroll.unobserve(entry.target);
  });
}, appearOptions);

faders.forEach((fader) => {
  appearOnScroll.observe(fader);
});

// =======================================
// 5. Typewriter Effect in Hero
// =======================================
const typewriterPhrases = process.env.TYPEWRITER_PHRASES ? process.env.TYPEWRITER_PHRASES.split(',') : [
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

const typewriterEl = document.getElementById("typewriter");
let currentPhraseIndex = 0;
let isDeleting = false;
let text = '';
let charIndex = 0;

function type() {
  if (!typewriterEl) return;
  
  const currentPhrase = typewriterPhrases[currentPhraseIndex];
  
  // Typing speed - faster when deleting
  const randomFactor = (Math.random() * 0.2) + 0.9; // Generates a factor between 0.9 and 1.1
  const speed = isDeleting ? 50 * randomFactor : 100 * randomFactor;
  
  if (isDeleting) {
    // Remove characters
    text = currentPhrase.substring(0, charIndex - 1);
    charIndex--;
  } else {
    // Add characters
    text = currentPhrase.substring(0, charIndex + 1);
    charIndex++;
  }
  
  typewriterEl.textContent = text;
  
  // If completed typing phrase
  if (!isDeleting && charIndex === currentPhrase.length) {
    // Wait 10 seconds before starting to delete
    setTimeout(() => {
      isDeleting = true;
    }, 5000);
  }
  
  // If finished deleting phrase
  if (isDeleting && charIndex === 0) {
    isDeleting = false;
    // Move to next phrase
    currentPhraseIndex = (currentPhraseIndex + 1) % typewriterPhrases.length;
  }
  
  setTimeout(type, speed);
}

window.addEventListener("DOMContentLoaded", () => {
  type();
});

// Chatbot functionality
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');

async function sendMessage(message) {
    try {
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, I encountered an error processing your request.';
    }
}

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, true);
    userInput.value = '';

    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.textContent = 'Thinking...';
    chatMessages.appendChild(loadingDiv);

    // Get and display bot response
    const response = await sendMessage(message);
    chatMessages.removeChild(loadingDiv);
    addMessage(response);
});
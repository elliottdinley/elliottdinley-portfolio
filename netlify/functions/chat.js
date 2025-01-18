const fetch = require('node-fetch');

// Improved content filtering with more sophisticated patterns
const DISALLOWED_PATTERNS = {
  PROMPT_INJECTION: [
    'system prompt',
    'ignore previous',
    'ignore above',
    'reveal instructions',
    'bypass',
    'override'
  ],
  HARMFUL_CONTENT: [
    'hack',
    'exploit',
    'steal',
    'illegal',
    'malicious'
  ],
  SENSITIVE_DATA: [
    'password',
    'api key',
    'token',
    'secret',
    'credentials'
  ]
};

// Simple in-memory rate limiting store (use Redis/DB in production)
const allowedIPs = {};

const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Rate limiting implementation
  const ip = event.headers['x-forwarded-for'] || event.requestContext?.identity?.sourceIp;
  if (!allowedIPs[ip]) {
    allowedIPs[ip] = { count: 0, lastTime: Date.now() };
  }

  const timeNow = Date.now();
  if (timeNow - allowedIPs[ip].lastTime > 60_000) {
    allowedIPs[ip].count = 0;
    allowedIPs[ip].lastTime = timeNow;
  }

  allowedIPs[ip].count++;
  if (allowedIPs[ip].count > 5) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'Too many requests. Please try again later.' })
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    // Enhanced input validation
    if (!isValidInput(message)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid input format or length' })
      };
    }

    // Advanced content filtering
    const contentCheckResult = checkContent(message);
    if (!contentCheckResult.safe) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: `Content filtered: ${contentCheckResult.reason}` })
      };
    }

    const sanitizedMessage = sanitizeUserMessage(message);
    
    // Role-based prompting with instruction separation
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a chatbot designed to emulate Elliott Dinley, a motivated and skilled Associate Java Developer at Send Technology Solutions Limited, a leading UK-based insurtech company. Your purpose is to assist users with queries related to Elliott's professional expertise, work experience, and career journey. Here's everything you need to know about him:

            Professional Role and Skills:
            Current Role: Associate Java Developer at Send Technology Solutions, specialising in Spring Boot microservices, Java development, and Agile practices.
            Primary Expertise:
            Java, Spring Framework, and Git for scalable and maintainable software development.
            Microservices architecture and cloud-native infrastructure (AWS).
            Collaborative workflows using CI/CD pipelines and Agile methodologies.
            Technical Proficiencies:
            Back-end and front-end development (e.g., HTML5, responsive UI frameworks).
            Software Development Life Cycle (SDLC), from planning and development to testing and deployment.
            Cloud computing principles and orchestration.
            Career Journey and Highlights:
            Transitioned from Apprentice Developer to Associate Java Developer in January 2025, reflecting strong professional growth.
            During his apprenticeship, Elliott:
            Delivered sprint commitments with both back-end and front-end contributions.
            Gained hands-on experience managing databases for internal and client environments.
            Built distributed systems using Spring Boot and managed collaborative feature integration using Git.
            Work Experience Beyond Send:
            Redesigned actuarial pricing models using Python and Streamlit during a work experience project, praised by leadership for innovation and independence.
            Gained insights into actuarial workflows and predictive modelling during an internship at Aviva.
            Achievements and Professional Development:
            Received accolades for problem-solving abilities, technical aptitude, and ability to operate independently under pressure.
            Demonstrated commitment to learning and growing in software development by completing a Level 4 Apprenticeship in Computer Software Engineering with Multiverse.
            Work Philosophy:
            Values collaboration, innovation, and continuous improvement in software solutions.
            Committed to creating efficient, secure, and user-friendly applications that meet business needs.
            Additional Context:
            Elliott's career journey showcases a strong foundation in technology and a passion for solving complex problems.
            As a professional, he maintains a formal and precise tone, adhering to British English spelling in written communication.
            When responding to queries, reflect Elliott's professional tone and technical precision, providing clear, insightful, and contextually appropriate answers.`
          },
          {
            role: 'user',
            content: sanitizedMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    
    // Enhanced response filtering
    const botReply = data.choices[0].message.content;
    const responseCheck = checkContent(botReply);
    
    if (!responseCheck.safe) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          response: 'I apologise, but I cannot provide that information.',
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ response: botReply }),
    };
  } catch (error) {
    console.error('Error details:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request' }),
    };
  }
};

function isValidInput(message) {
  return (
    typeof message === 'string' &&
    message.length >= 1 &&
    message.length <= 1000 &&
    /^[\x20-\x7E\s]*$/.test(message) // Only printable ASCII characters
  );
}

function sanitizeUserMessage(msg) {
  return msg
    .replace(/[<>{}]/g, '') // Remove potential HTML/script tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/\\/g, '') // Remove backslashes
    .trim();
}

function checkContent(msg) {
  const lower = msg.toLowerCase();
  
  // Check for prompt injections
  const hasPromptInjection = DISALLOWED_PATTERNS.PROMPT_INJECTION.some(pattern => 
    lower.includes(pattern)
  );
  if (hasPromptInjection) {
    return { safe: false, reason: 'Potential prompt injection detected' };
  }

  // Check for harmful content
  const hasHarmfulContent = DISALLOWED_PATTERNS.HARMFUL_CONTENT.some(pattern => 
    lower.includes(pattern)
  );
  if (hasHarmfulContent) {
    return { safe: false, reason: 'Harmful content detected' };
  }

  // Check for sensitive data requests
  const hasSensitiveData = DISALLOWED_PATTERNS.SENSITIVE_DATA.some(pattern => 
    lower.includes(pattern)
  );
  if (hasSensitiveData) {
    return { safe: false, reason: 'Sensitive data request detected' };
  }

  return { safe: true };
}

module.exports = { handler };

// Floating Chatbot Widgets JavaScript

// ========== Robot Chatbot (First Bot) ==========
const robotWidget = document.getElementById('robot-chatbot-widget');
const robotToggle = document.getElementById('robot-toggle');

// Robot chatbot layers for parallax effect
const robotLayers = [
    {
        id: "robot-hair",
        initialOffset: { x: 0, y: -18 },
        maxOffset: 4,
        reverse: true
    },
    {
        id: "robot-head",
        initialOffset: { x: 0, y: 4 },
        maxOffset: 4
    },
    {
        id: "robot-face",
        initialOffset: { x: 0, y: 7 },
        maxOffset: 8
    },
    {
        id: "robot-expression",
        initialOffset: { x: 0, y: 7 },
        maxOffset: 12
    }
].map((layer) => ({
    ...layer,
    element: document.getElementById(layer.id)
}));

const robotContainer = document.getElementById('robot-chatbot-container');
let robotContainerRect = robotContainer ? robotContainer.getBoundingClientRect() : null;
let robotMaxDistance = robotContainer ? Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2) / 2 : 0;
let robotMouseX = window.innerWidth / 2;
let robotMouseY = window.innerHeight / 2;

// Initialize robot layers
if (robotContainer) {
    robotLayers.forEach((layer) => {
        if (layer.element) {
            const { x, y } = layer.initialOffset;
            layer.element.style.setProperty("--offset-x", `${x}px`);
            layer.element.style.setProperty("--offset-y", `${y}px`);
        }
    });
}

// Robot parallax update
function updateRobotParallax() {
    if (!robotContainer || robotLayers.length === 0) return;
    
    const centerX = robotContainerRect.left + robotContainerRect.width / 2;
    const centerY = robotContainerRect.top + robotContainerRect.height / 2;
    
    const dx = robotMouseX - centerX;
    const dy = robotMouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;
    
    const influence = Math.min(distance / robotMaxDistance, 1);
    const dirX = dx / distance;
    const dirY = dy / distance;
    
    robotLayers.forEach((layer) => {
        if (layer.element) {
            const { x: initialX, y: initialY } = layer.initialOffset;
            const factor = layer.reverse ? -1 : 1;
            const offsetX = dirX * layer.maxOffset * influence * factor;
            const offsetY = dirY * layer.maxOffset * influence * factor;
            
            layer.element.style.setProperty("--offset-x", `${initialX + offsetX}px`);
            layer.element.style.setProperty("--offset-y", `${initialY + offsetY}px`);
        }
    });
}

// Robot animation loop
function robotAnimate() {
    updateRobotParallax();
    requestAnimationFrame(robotAnimate);
}

// Mouse tracking for robot
document.addEventListener("mousemove", (e) => {
    robotMouseX = e.clientX;
    robotMouseY = e.clientY;
});

window.addEventListener("resize", () => {
    if (robotContainer) {
        robotContainerRect = robotContainer.getBoundingClientRect();
        robotMaxDistance = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2) / 2;
    }
});

// Start robot animation
if (robotContainer) {
    robotAnimate();
}

// Robot blink functionality
const robotBlinkConfig = {
    minInterval: 5000,
    maxInterval: 10000,
    closeSpeed: 100,
    closedDuration: 150,
    openSpeed: 150
};

const robotLeftEye = document.getElementById("robot-eye-l");
const robotRightEye = document.getElementById("robot-eye-r");

function robotBlink() {
    if (!robotLeftEye || !robotRightEye) return;
    
    const leftBox = robotLeftEye.getBBox();
    const rightBox = robotRightEye.getBBox();
    const leftCenterY = leftBox.y + leftBox.height / 2;
    const rightCenterY = rightBox.y + rightBox.height / 2;
    
    robotLeftEye.style.transformOrigin = `${leftBox.x + leftBox.width / 2}px ${leftCenterY}px`;
    robotRightEye.style.transformOrigin = `${rightBox.x + rightBox.width / 2}px ${rightCenterY}px`;
    
    robotLeftEye.style.transition = `transform ${robotBlinkConfig.closeSpeed}ms ease-out`;
    robotRightEye.style.transition = `transform ${robotBlinkConfig.closeSpeed}ms ease-out`;
    robotLeftEye.style.transform = "scaleY(0.1)";
    robotRightEye.style.transform = "scaleY(0.1)";
    
    setTimeout(() => {
        robotLeftEye.style.transition = `transform ${robotBlinkConfig.openSpeed}ms ease-out`;
        robotRightEye.style.transition = `transform ${robotBlinkConfig.openSpeed}ms ease-out`;
        robotLeftEye.style.transform = "scaleY(1)";
        robotRightEye.style.transform = "scaleY(1)";
    }, robotBlinkConfig.closeSpeed + robotBlinkConfig.closedDuration);
}

function robotBlinkAnimate() {
    const randomDelay = Math.random() * (robotBlinkConfig.maxInterval - robotBlinkConfig.minInterval) + robotBlinkConfig.minInterval;
    setTimeout(() => {
        robotBlink();
        robotBlinkAnimate();
    }, randomDelay);
}

if (robotLeftEye && robotRightEye) {
    robotBlinkAnimate();
}

// Robot toggle functionality - opens AI assistant panel
if (robotToggle) {
    robotToggle.addEventListener('click', () => {
        if (aiPanel) {
            aiPanel.classList.toggle('active');
            if (aiPanel.classList.contains('active') && aiMessageInput) {
                setTimeout(() => aiMessageInput.focus(), 100);
            }
        }
    });
}


// ========== AI Chatbot (Panel only, opened by robot) ==========
const aiWidget = document.getElementById('ai-chatbot-widget');
const aiPanel = document.getElementById('ai-panel');
const aiClose = document.getElementById('ai-close');
const aiChatContainer = document.getElementById('aiChatContainer');
const aiMessageInput = document.getElementById('aiMessageInput');
const aiSendButton = document.getElementById('aiSendButton');
const aiTypingIndicator = document.getElementById('aiTypingIndicator');

// AI Chat functionality
function createAIMessageElement(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${isUser ? 'U' : 'AI'}</div>
        <div class="message-bubble">${content}</div>
    `;
    
    return messageDiv;
}

function addAIMessage(content, isUser = false) {
    if (!aiChatContainer) return;
    const messageElement = createAIMessageElement(content, isUser);
    aiChatContainer.appendChild(messageElement);
    aiChatContainer.scrollTop = aiChatContainer.scrollHeight;
}

function showAITypingIndicator() {
    if (aiTypingIndicator) {
        aiTypingIndicator.classList.add('active');
        if (aiChatContainer) {
            aiChatContainer.scrollTop = aiChatContainer.scrollHeight;
        }
    }
}

function hideAITypingIndicator() {
    if (aiTypingIndicator) {
        aiTypingIndicator.classList.remove('active');
    }
}

function simulateAIResponse(userMessage) {
    showAITypingIndicator();
    
    setTimeout(() => {
        hideAITypingIndicator();
        const responses = [
            "I understand you're asking about " + userMessage + ". Could you elaborate?",
            "That's an interesting point about " + userMessage + ". Let me help you with that.",
            "I've analyzed your message about " + userMessage + ". Here's what I think...",
            "Thanks for your question about " + userMessage + ". Let me provide some insights.",
            "Regarding " + userMessage + ", I can help you with that. Here's what I found..."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addAIMessage(randomResponse);
    }, Math.random() * 1000 + 1500);
}

function handleAISendMessage() {
    if (!aiMessageInput) return;
    const message = aiMessageInput.value.trim();
    if (message) {
        addAIMessage(message, true);
        aiMessageInput.value = '';
        simulateAIResponse(message);
    }
}

// AI close functionality
if (aiClose) {
    aiClose.addEventListener('click', () => {
        aiPanel.classList.remove('active');
    });
}

// AI send message handlers
if (aiSendButton) {
    aiSendButton.addEventListener('click', handleAISendMessage);
}

if (aiMessageInput) {
    aiMessageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAISendMessage();
        }
    });
}

// Initialize AI chatbot with welcome message
setTimeout(() => {
    if (aiChatContainer) {
        addAIMessage("Hello! I'm your AI assistant. How can I help you today?");
    }
}, 500);

// Close panels when clicking outside
document.addEventListener('click', (e) => {
    if (aiPanel && aiPanel.classList.contains('active')) {
        if (!aiWidget.contains(e.target) && !robotWidget.contains(e.target) && !aiPanel.contains(e.target)) {
            aiPanel.classList.remove('active');
        }
    }
});


document.addEventListener('DOMContentLoaded', () => {

    const chatWrapper = document.createElement('div');
    chatWrapper.id = 'chatbot-wrapper';
    document.body.appendChild(chatWrapper);

    fetch('chatbot.html')
        .then(response => response.text())
        .then(data => {
            chatWrapper.innerHTML = data;
            initializeChatbot();
        })
        .catch(error => console.error('Error loading chatbot HTML:', error));
});


function initializeChatbot() {
    // --- DOM Elements ---
    const toggleButton = document.getElementById('chatbot-toggle-button');
    const chatContainer = document.getElementById('chatbot-container');
    const closeButton = document.getElementById('chatbot-close-btn');
    const messageContainer = document.getElementById('chatbot-messages');
    const chatForm = document.getElementById('chatbot-form');
    const inputField = document.getElementById('chatbot-input');

    // --- Knowledge Base (No changes here) ---
    const knowledgeBase = {
        // ... same knowledge base as before
       "cost|price|investment|how much": "The launch price for a unit in Project Ananta starts at ₹32,50,000, with a 25% down payment of ₹8,12,500. We also offer flexible payment plans and have tie-ups with major banks for easy home loans. For a full breakdown, please download the Investment Plan from our website.",
    "amenities|facilities|features": "Project Ananta offers exclusive amenities like a luxury swimming pool, a state-of-the-art gym, a community hall, a dedicated children's play area, and landscaped gardens. For your peace of mind, we provide 24/7 security with CCTV surveillance and power backup.",
    "benefits|returns|guarantee|buyback|rental": "Investors enjoy a guaranteed monthly rental of ₹25,000 for the first 3 years. Key benefits include a lifetime free maintenance contract, a buyback guarantee with assured appreciation after 5 years, and 15 days of complimentary stay annually with food & beverage credits.",
    "location|where|address": "Project Ananta is strategically located in Datia, Madhya Pradesh. It's situated near the main highway, offering excellent connectivity. The project is just a 10-minute drive from the Datia Railway Station and is in close proximity to the renowned Pitambara Peeth temple. For a detailed map, please visit the Location section on our website.",
    "contact|phone|email|touch": "You can reach our sales team via phone at <a href='tel:+911234567890'>+91 123 456 7890</a> or by email at <a href='mailto:invest@globaloneconsulting.com'>invest@globaloneconsulting.com</a>. You can also schedule a call back using the contact form on our website.",
    "possession|when|ready|completion": "The project construction is on schedule. Possession for the first phase of units is planned for Q4 2025, which is within 24 months from the launch.",
    "highlights|units|towers|size": "Project Ananta consists of 5 luxury towers, with a total of 460 units. We offer two configurations: 1BHK (50 sqm) and spacious 3BHK (135 sqm) apartments, designed for modern living.",
    "rera|approval|legal": "Yes, Project Ananta is a fully RERA-approved project. Our RERA registration number is MP/RERA/PROJECT/XXXX/2023. All legal approvals and titles are clear and can be reviewed on the official RERA portal.",
    "developer|builder|who": "Project Ananta is a flagship project by 'Global One Properties', a reputed developer with over 20 years of experience in delivering high-quality residential and commercial projects across India.",
    "visit|sample flat|see": "Absolutely! Our sample flat is ready for viewing. You can schedule a site visit by contacting our sales team or by booking a slot through our website. We are open for visits from 10 AM to 6 PM, seven days a week.",
    "hello|hi|hey": "Hello! I am the Ananta Assistant. How can I help you with Project Ananta today?",
    "thanks|thank you": "You're welcome! Feel free to ask if anything else comes to mind.",
    "bye|goodbye": "Goodbye! We look forward to hearing from you soon. Have a great day!"
    };
    const defaultResponse = "I'm sorry, I can only answer questions about Project Ananta. Please try asking about the price, location, or amenities. For other inquiries, please use the contact form.";

    // --- Functions ---
    const toggleChat = (forceOpen = false, forceClose = false) => {
        const isVisible = chatContainer.classList.contains('visible');
        if (forceClose || (isVisible && !forceOpen)) {
            chatContainer.classList.remove('visible');
        } else {
            chatContainer.classList.add('visible');
            inputField.focus();
            if(messageContainer.children.length === 0) {
                 setTimeout(() => displayMessage(knowledgeBase["hello|hi|hey"], 'bot'), 500);
            }
        }
    };
    
    // ... displayMessage, showTypingIndicator, getBotResponse, handleFormSubmit functions are unchanged ...
    const displayMessage = (message, sender) => {
        const typingIndicator = messageContainer.querySelector('.typing-indicator');
        if (typingIndicator) typingIndicator.remove();
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        messageDiv.innerHTML = message;
        messageContainer.appendChild(messageDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    };
    const showTypingIndicator = () => {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        messageContainer.appendChild(typingDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    };
    const getBotResponse = (userInput) => {
        const lowerInput = userInput.toLowerCase();
        let response = defaultResponse;
        for (const keywords in knowledgeBase) {
            const keywordArray = keywords.split('|');
            if (keywordArray.some(keyword => lowerInput.includes(keyword))) {
                response = knowledgeBase[keywords];
                break;
            }
        }
        setTimeout(() => {
            showTypingIndicator();
            setTimeout(() => displayMessage(response, 'bot'), 1200);
        }, 500);
    };
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const userInput = inputField.value.trim();
        if (userInput) {
            displayMessage(userInput, 'user');
            inputField.value = '';
            getBotResponse(userInput);
        }
    };


    // --- Event Listeners ---
    toggleButton.addEventListener('click', () => toggleChat());
    closeButton.addEventListener('click', () => toggleChat(false, true));
    chatForm.addEventListener('submit', handleFormSubmit);

    // --- ADDED: Logic for one-time automatic pop-up ---
    const autoOpenChat = () => {
        // Check sessionStorage to see if the bot has already auto-opened
        const hasAutoOpened = sessionStorage.getItem('anantaChatAutoOpened');

        if (!hasAutoOpened) {
            // Wait 5 seconds before opening the chat
            setTimeout(() => {
                toggleChat(true); // Force open the chat
                // Set the flag in sessionStorage so it doesn't open again
                sessionStorage.setItem('anantaChatAutoOpened', 'true');
            }, 5000); // 5000 milliseconds = 5 seconds
        }
    };

    // Call the auto-open function
    autoOpenChat();
}
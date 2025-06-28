// Hero sentence animation
// In your index.html <script> tag
const backendUrl = 'http://localhost:3000/api/contact'; 
const paragraphContainer = document.getElementById('hero-paragraph-container');
if (paragraphContainer) {
    const originalP = paragraphContainer.querySelector('p');
    if (originalP) {
        const fullText = originalP.textContent;
        const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
        originalP.innerHTML = '';
        sentences.forEach((sentence, index) => {
            const span = document.createElement('span');
            span.className = 'hero-sentence';
            span.textContent = sentence.trim();
            originalP.appendChild(span);
            setTimeout(() => {
                span.classList.add('visible');
            }, (index * 1200) + 1000);
        });
    }
}

// Scroll to Top button
const scrollToTopButton = document.querySelector('.scroll-to-top');
if (scrollToTopButton) {
    window.addEventListener('scroll', () => {
        scrollToTopButton.classList.toggle('visible', window.pageYOffset > 300);
    });
    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Counter animation
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        element.textContent = Math.ceil(start).toLocaleString('en-IN');
        if (start >= target) {
            element.textContent = target.toLocaleString('en-IN');
            clearInterval(timer);
        }
    }, 16);
    if (target === 0) element.textContent = '0';
}
const counters = document.querySelectorAll('.counter-value');
const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.target, 10);
            animateCounter(entry.target, target);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
counters.forEach(counter => counterObserver.observe(counter));

// NEW: About Section Animation
const aboutSection = document.getElementById('about');
const aboutContent = document.getElementById('about-content');
const aboutObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            aboutContent.classList.add('visible');
            aboutSection.classList.add('visible');
            const listItems = aboutSection.querySelectorAll('.list-item');
            listItems.forEach((item, index) => {
                item.style.transitionDelay = `${index * 100}ms`;
            });
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });
if (aboutSection) {
    aboutObserver.observe(aboutSection);
}

// NEW: 3D Tilt Effect for Info Cards
const infoCards = document.querySelectorAll('.info-card');
infoCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const { width, height } = rect;
        const rotateX = (y / height - 0.5) * -15;
        const rotateY = (x / width - 0.5) * 15;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
});


  const contactForm = document.getElementById('main-contact-form');
    const statusMessage = document.getElementById('form-status-message');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent the default form submission

            statusMessage.textContent = 'Sending...';
            statusMessage.style.color = 'white';

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    statusMessage.textContent = result.message;
                    statusMessage.style.color = '#4ade80'; // Green for success
                    contactForm.reset();
                } else {
                    statusMessage.textContent = result.message || 'An error occurred.';
                    statusMessage.style.color = '#f87171'; // Red for error
                }
            } catch (error) {
                console.error('Form submission error:', error);
                statusMessage.textContent = 'Failed to send message. Please check your connection.';
                statusMessage.style.color = '#f87171';
            }
        });
    }

    // Update the year in the footer
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }


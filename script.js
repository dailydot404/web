// Quick Javascript interactions for the DailyDot Landing Page

document.addEventListener('DOMContentLoaded', () => {
    
    // Smooth scroll for anchor navigation links
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Account for the fixed navbar height dynamically
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Interaction Tracker to log what features visitors focus on
    const sections = document.querySelectorAll('.feature-section');
    const options = {
        root: null,
        threshold: 0.3 // Trigger when 30% of the section is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log(`User is viewing section: ${entry.target.id}`);
            }
        });
    }, options);

    sections.forEach(section => {
        observer.observe(section);
    });
});
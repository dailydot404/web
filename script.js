document.addEventListener('DOMContentLoaded', () => {
    
    // Smooth scroll for navbar anchor links
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Tracker for feature visibility
    const sections = document.querySelectorAll('.feature-split');
    const options = {
        root: null,
        threshold: 0.3
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

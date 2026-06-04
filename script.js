document.querySelectorAll('.carousel-side').forEach(container => {
    let index = 0;
    const slides = container.querySelector('.slides');
    const total = slides.children.length;
    
    // Automatically change slide every 4 seconds
    setInterval(() => {
        index = (index + 1) % total;
        slides.style.transform = `translateX(-${index * 100}%)`;
    }, 4000);
});

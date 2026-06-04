document.querySelectorAll('.carousel-side').forEach(container => {
    const slides = container.querySelector('.slides');
    const dotsContainer = container.querySelector('.dots-container');
    const total = slides.children.length;
    let index = 0;

    // Create dots
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => showSlide(i);
        dotsContainer.appendChild(dot);
    }

    function showSlide(i) {
        index = i;
        slides.style.transform = `translateX(-${index * 100}%)`;
        container.querySelectorAll('.dot').forEach((d, idx) => {
            d.className = 'dot' + (idx === index ? ' active' : '');
        });
    }

    // Auto-advance
    setInterval(() => {
        showSlide((index + 1) % total);
    }, 4000);
});

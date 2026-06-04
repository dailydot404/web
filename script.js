document.querySelectorAll('.carousel-side').forEach(container => {
    let index = 0;
    const slides = container.querySelector('.slides');
    const total = slides.children.length;
    setInterval(() => {
        index = (index + 1) % total;
        slides.style.transform = `translateX(-${index * 100}%)`;
    }, 4000);
});

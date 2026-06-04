// Global variables for the modal navigation
window.currentGallery = [];
window.currentIndex = 0;

// Initialize all carousels
document.querySelectorAll('.carousel-side').forEach(container => {
    const slides = container.querySelector('.slides');
    const dotsContainer = container.querySelector('.dots-container');
    const images = Array.from(slides.querySelectorAll('img'));
    const total = images.length;
    let index = 0;

    // 1. Create Navigation Dots
    images.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.onclick = (e) => { 
            e.stopPropagation(); 
            showSlide(i); 
        };
        dotsContainer.appendChild(dot);
    });

    // 2. Logic to show specific slide
    function showSlide(i) {
        index = i;
        slides.style.transform = `translateX(-${index * 100}%)`;
        container.querySelectorAll('.dot').forEach((d, idx) => {
            d.className = 'dot' + (idx === index ? ' active' : '');
        });
    }

    // 3. Auto-advance logic
    setInterval(() => {
        index = (index + 1) % total;
        showSlide(index);
    }, 4000);

    // 4. Click image to open Modal
    images.forEach(img => {
        img.onclick = () => {
            const gallery = images.map(i => i.src);
            openModal(img.src, gallery);
        };
    });
});

// Modal Global Functions
function openModal(imgSrc, gallery) {
    window.currentGallery = gallery;
    window.currentIndex = gallery.indexOf(imgSrc);
    const modal = document.getElementById('lightbox');
    document.getElementById('lightbox-img').src = imgSrc;
    modal.style.display = 'flex';
}

function closeModal() { 
    document.getElementById('lightbox').style.display = 'none'; 
}

function changeSlide(direction) {
    window.currentIndex = (window.currentIndex + direction + window.currentGallery.length) % window.currentGallery.length;
    document.getElementById('lightbox-img').src = window.currentGallery[window.currentIndex];
}

// Close modal when clicking outside the image
document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeModal();
});

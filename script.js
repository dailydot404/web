document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    const sections = document.querySelectorAll('section[id]');
    const revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
        );

        revealElements.forEach((element) => revealObserver.observe(element));
    } else {
        revealElements.forEach((element) => element.classList.add('is-visible'));
    }

    if (!navbar) return;

    const navHeight = () => navbar.offsetHeight;
    const closeMobileNav = () => window.SiteLayout?.navApi?.closeMobileNav?.();

    anchorLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            e.preventDefault();
            closeMobileNav();

            const targetPosition =
                targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight();

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth',
            });

            history.replaceState(null, '', targetId);
        });
    });

    const navSectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    function updateActiveNav() {
        const scrollPos = window.scrollY + navHeight() + 40;
        let currentId = '';

        sections.forEach((section) => {
            if (section.offsetTop <= scrollPos) {
                currentId = section.id;
            }
        });

        navSectionLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxGalleryName = lightbox.querySelector('.lightbox-gallery-name');
    const lightboxCounter = lightbox.querySelector('.lightbox-counter');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxBackdrop = lightbox.querySelector('.lightbox-backdrop');
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');
    const screenshotButtons = document.querySelectorAll('.screenshot-wrapper');

    let lastFocusedElement = null;
    let gallerySlides = [];
    let currentIndex = 0;
    let galleryName = '';

    function getSlideFromButton(button) {
        const img = button.querySelector('img');
        if (!img) return null;

        return {
            src: img.currentSrc || img.src,
            alt: img.alt,
        };
    }

    function buildGalleryFromButton(button) {
        const showcase = button.closest('.image-showcase');
        if (!showcase) return [getSlideFromButton(button)].filter(Boolean);

        return Array.from(showcase.querySelectorAll('.screenshot-wrapper'))
            .map(getSlideFromButton)
            .filter(Boolean);
    }

    function updateNavButtons() {
        const hasMultiple = gallerySlides.length > 1;
        lightboxPrev.hidden = !hasMultiple;
        lightboxNext.hidden = !hasMultiple;
        lightboxPrev.disabled = !hasMultiple;
        lightboxNext.disabled = !hasMultiple;
    }

    function showSlide(index) {
        if (!gallerySlides.length) return;

        currentIndex = (index + gallerySlides.length) % gallerySlides.length;
        const slide = gallerySlides[currentIndex];

        lightboxImage.src = slide.src;
        lightboxImage.alt = slide.alt;
        lightboxCaption.textContent = slide.alt;
        lightboxGalleryName.textContent = galleryName;
        lightboxCounter.textContent = `${currentIndex + 1} / ${gallerySlides.length}`;
    }

    function openLightbox(button) {
        gallerySlides = buildGalleryFromButton(button);
        if (!gallerySlides.length) return;

        const showcase = button.closest('.image-showcase');
        galleryName = showcase?.dataset.gallery || 'Screenshots';

        const buttonsInGallery = showcase
            ? Array.from(showcase.querySelectorAll('.screenshot-wrapper'))
            : [button];
        currentIndex = Math.max(0, buttonsInGallery.indexOf(button));

        lastFocusedElement = button;
        showSlide(currentIndex);
        updateNavButtons();

        lightbox.hidden = false;
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');
        lightboxClose.focus();
    }

    function closeLightbox() {
        lightbox.hidden = true;
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImage.removeAttribute('src');
        gallerySlides = [];
        currentIndex = 0;
        document.body.classList.remove('lightbox-open');

        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    }

    function showPrevious() {
        showSlide(currentIndex - 1);
    }

    function showNext() {
        showSlide(currentIndex + 1);
    }

    screenshotButtons.forEach((button) => {
        button.addEventListener('click', () => openLightbox(button));
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxBackdrop.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevious();
    });
    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        showNext();
    });

    document.addEventListener('keydown', (e) => {
        if (lightbox.hidden) return;

        if (e.key === 'Escape') {
            closeLightbox();
            return;
        }

        if (gallerySlides.length <= 1) return;

        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            showPrevious();
        }

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            showNext();
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    const sections = document.querySelectorAll('section[id]');

    const navHeight = () => navbar.offsetHeight;

    function closeMobileNav() {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
    }

    function openMobileNav() {
        navLinks.classList.add('open');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('nav-open');
    }

    navToggle.addEventListener('click', () => {
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    });

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

    document.addEventListener('click', (e) => {
        if (
            navLinks.classList.contains('open') &&
            !navLinks.contains(e.target) &&
            !navToggle.contains(e.target)
        ) {
            closeMobileNav();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileNav();
        }
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

    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
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
    }

    const FORMSPREE_URL = 'https://formspree.io/f/mqeogpop';
    const inquiryModal = document.getElementById('inquiry-modal');
    const inquiryForm = document.getElementById('inquiry-form');
    if (inquiryModal && inquiryForm) {
    const inquiryFormView = document.getElementById('inquiry-form-view');
    const inquirySuccessView = document.getElementById('inquiry-success-view');
    const inquiryError = document.getElementById('inquiry-error');
    const inquirySubmit = document.getElementById('inquiry-submit');
    const inquiryDone = document.getElementById('inquiry-done');
    const inquiryClose = inquiryModal.querySelector('.inquiry-close');
    const inquiryBackdrop = inquiryModal.querySelector('.inquiry-backdrop');
    const inquiryTriggers = document.querySelectorAll('.open-inquiry');

    let inquiryLastFocused = null;

    function showInquiryFormView() {
        inquiryFormView.hidden = false;
        inquirySuccessView.hidden = true;
        inquiryError.hidden = true;
        inquiryError.textContent = '';
    }

    function openInquiryModal() {
        closeMobileNav();
        showInquiryFormView();
        inquiryLastFocused = document.activeElement;
        inquiryModal.hidden = false;
        inquiryModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('inquiry-open');
        const firstField = document.getElementById('inquiry-name');
        if (firstField) firstField.focus();
    }

    function closeInquiryModal() {
        inquiryModal.hidden = true;
        inquiryModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('inquiry-open');
        if (inquiryLastFocused) {
            inquiryLastFocused.focus();
            inquiryLastFocused = null;
        }
    }

    inquiryTriggers.forEach((trigger) => {
        trigger.addEventListener('click', openInquiryModal);
    });

    inquiryClose.addEventListener('click', closeInquiryModal);
    inquiryBackdrop.addEventListener('click', closeInquiryModal);
    inquiryDone.addEventListener('click', closeInquiryModal);

    inquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        inquiryError.hidden = true;
        inquiryError.textContent = '';

        if (!inquiryForm.reportValidity()) {
            return;
        }

        inquirySubmit.disabled = true;
        inquirySubmit.textContent = 'Sending…';

        try {
            const response = await fetch(FORMSPREE_URL, {
                method: 'POST',
                body: new FormData(inquiryForm),
                headers: { Accept: 'application/json' },
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const message = data.error || 'Something went wrong. Please try again.';
                throw new Error(message);
            }

            inquiryForm.reset();
            inquiryFormView.hidden = true;
            inquirySuccessView.hidden = false;
            inquiryDone.focus();
        } catch (error) {
            inquiryError.textContent = error.message || 'Unable to send. Please try again.';
            inquiryError.hidden = false;
        } finally {
            inquirySubmit.disabled = false;
            inquirySubmit.textContent = 'Send inquiry';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (inquiryModal.hidden) return;
        if (e.key === 'Escape') {
            closeInquiryModal();
        }
    });
    }
});

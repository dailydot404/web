(function (global) {
    const FORMSPREE_URL = 'https://formspree.io/f/mqeogpop';

    let modal = null;
    let form = null;
    let formView = null;
    let successView = null;
    let errorEl = null;
    let submitBtn = null;
    let lastFocusedElement = null;

    function mountModal() {
        if (document.getElementById('inquiry-modal')) {
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
<div id="inquiry-modal" class="inquiry-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="inquiry-title">
    <button type="button" class="inquiry-backdrop" aria-label="Close form"></button>
    <div class="inquiry-panel">
        <button type="button" class="inquiry-close" aria-label="Close form">&times;</button>
        <div id="inquiry-form-view">
            <h2 id="inquiry-title">Join the MVP Pilot</h2>
            <p class="inquiry-lead">Tell us about your center and we&rsquo;ll reach out with free early-access details.</p>
            <form class="inquiry-form" id="inquiry-form" novalidate>
                <div class="inquiry-field">
                    <label for="inquiry-name">Name</label>
                    <input id="inquiry-name" name="name" type="text" autocomplete="name" required>
                </div>
                <div class="inquiry-field">
                    <label for="inquiry-email">Email</label>
                    <input id="inquiry-email" name="email" type="email" autocomplete="email" required>
                </div>
                <div class="inquiry-field">
                    <label for="inquiry-daycare">Daycare name</label>
                    <input id="inquiry-daycare" name="daycare" type="text" autocomplete="organization">
                </div>
                <div class="inquiry-field">
                    <label for="inquiry-message">Message</label>
                    <textarea id="inquiry-message" name="message" rows="4" placeholder="Optional — tell us about your center or what you&rsquo;d like to see."></textarea>
                </div>
                <input class="inquiry-honeypot" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">
                <p class="inquiry-error" id="inquiry-error" hidden></p>
                <button type="submit" class="btn btn-primary inquiry-submit">Send inquiry</button>
            </form>
        </div>
        <div id="inquiry-success-view" class="inquiry-success-view" hidden>
            <h2>Thanks &mdash; we got it!</h2>
            <p>We&rsquo;ll review your inquiry and get back to you at the email you provided.</p>
            <button type="button" class="btn btn-secondary" id="inquiry-success-close">Close</button>
        </div>
    </div>
</div>`.trim();

        document.body.appendChild(wrapper.firstElementChild);

        modal = document.getElementById('inquiry-modal');
        form = document.getElementById('inquiry-form');
        formView = document.getElementById('inquiry-form-view');
        successView = document.getElementById('inquiry-success-view');
        errorEl = document.getElementById('inquiry-error');
        submitBtn = form.querySelector('.inquiry-submit');

        modal.querySelector('.inquiry-backdrop').addEventListener('click', closeInquiry);
        modal.querySelector('.inquiry-close').addEventListener('click', closeInquiry);
        document.getElementById('inquiry-success-close').addEventListener('click', closeInquiry);
        form.addEventListener('submit', handleSubmit);

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.classList.contains('is-open')) {
                closeInquiry();
            }
        });
    }

    function showError(message) {
        errorEl.textContent = message;
        errorEl.hidden = false;
    }

    function clearError() {
        errorEl.textContent = '';
        errorEl.hidden = true;
    }

    function openInquiry(trigger) {
        mountModal();
        clearError();
        formView.hidden = false;
        successView.hidden = true;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send inquiry';

        lastFocusedElement = trigger || document.activeElement;

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('inquiry-open');
        global.SiteLayout?.navApi?.closeMobileNav?.();

        const nameInput = document.getElementById('inquiry-name');
        if (nameInput) {
            nameInput.focus();
        }
    }

    function closeInquiry() {
        if (!modal) return;

        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('inquiry-open');

        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        clearError();

        if (!form.reportValidity()) {
            return;
        }

        const formData = new FormData(form);
        const payload = {
            name: formData.get('name'),
            email: formData.get('email'),
            daycare: formData.get('daycare') || '',
            message: formData.get('message') || '',
            _subject: 'DailyDotKids MVP pilot inquiry',
        };

        if (formData.get('_gotcha')) {
            closeInquiry();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';

        try {
            const response = await fetch(FORMSPREE_URL, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
                const message =
                    typeof body.error === 'string'
                        ? body.error
                        : 'Something went wrong. Please try again or email dailydot404@gmail.com.';
                showError(message);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send inquiry';
                return;
            }

            form.reset();
            formView.hidden = true;
            successView.hidden = false;
            document.getElementById('inquiry-success-close').focus();
        } catch (_) {
            showError('Network error. Please check your connection and try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send inquiry';
        }
    }

    function isInquiryTrigger(element) {
        if (!element) return false;
        if (element.matches('.inquiry-cta, .open-inquiry, a[href="#inquiry"]')) return true;
        if (element.matches('a[href^="mailto:"]')) {
            const href = element.getAttribute('href') || '';
            return (
                href.includes('dailydot404@gmail.com') &&
                !element.classList.contains('inquiry-ignore')
            );
        }
        return false;
    }

    document.addEventListener(
        'click',
        (event) => {
            const trigger = event.target.closest('a, button');
            if (!isInquiryTrigger(trigger)) return;

            event.preventDefault();
            event.stopPropagation();
            openInquiry(trigger);
        },
        true,
    );

    global.InquiryModal = { open: openInquiry, close: closeInquiry };
})();

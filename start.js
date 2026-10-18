(function () {
  var API_BASE = window.DDK_API_BASE || 'https://dailydot-prod.nn.r.appspot.com';
  var TERMS_VERSION = '2026-08';

  var form = document.getElementById('start-form');
  var success = document.getElementById('start-success');
  var errorEl = document.getElementById('start-error');
  var submitBtn = document.getElementById('start-submit');
  var passwordInput = document.getElementById('password');
  var togglePassword = document.getElementById('toggle-password');
  var timezoneSelect = document.getElementById('timezone');

  if (!form) return;

  if (window.DDK && typeof window.DDK.track === 'function') {
    window.DDK.track('start_view', {
      page_path: window.location.pathname,
      referrer: document.referrer || '',
    });
  }

  // Prefill from email / UTM query params
  try {
    var params = new URLSearchParams(window.location.search || '');
    var centre = params.get('centre') || params.get('daycare') || '';
    var email = params.get('email') || '';
    var tz = params.get('tz') || params.get('timezone') || '';
    if (centre) {
      var daycareInput = document.getElementById('daycareName');
      if (daycareInput) daycareInput.value = centre;
    }
    if (email) {
      var emailInput = document.getElementById('ownerEmail');
      if (emailInput) emailInput.value = email;
    }
    if (tz && timezoneSelect) {
      var opt = Array.prototype.find.call(timezoneSelect.options, function (o) {
        return o.value === tz;
      });
      if (opt) timezoneSelect.value = tz;
    } else if (timezoneSelect && typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      try {
        var guessed = Intl.DateTimeFormat().resolvedOptions().timeZone;
        var match = Array.prototype.find.call(timezoneSelect.options, function (o) {
          return o.value === guessed;
        });
        if (match) timezoneSelect.value = guessed;
      } catch (e) {
        /* ignore */
      }
    }
  } catch (e) {
    /* ignore */
  }

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
      var show = passwordInput.type === 'password';
      passwordInput.type = show ? 'text' : 'password';
      togglePassword.textContent = show ? 'Hide' : 'Show';
      togglePassword.setAttribute('aria-pressed', show ? 'true' : 'false');
    });
  }

  function showError(msg) {
    if (!errorEl) return;
    errorEl.hidden = false;
    errorEl.textContent = msg || 'Something went wrong. Please try again.';
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.hidden = true;
    errorEl.textContent = '';
  }

  function track(name, params) {
    if (window.DDK && typeof window.DDK.track === 'function') {
      window.DDK.track(name, params || {});
    }
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    clearError();

    var daycareName = (document.getElementById('daycareName').value || '').trim();
    var ownerEmail = (document.getElementById('ownerEmail').value || '').trim();
    var ownerPhone = (document.getElementById('ownerPhone').value || '').trim();
    var address = (document.getElementById('address').value || '').trim();
    var timezone = document.getElementById('timezone').value;
    var password = document.getElementById('password').value || '';
    var acceptedTerms = document.getElementById('acceptedTerms').checked;

    if (!daycareName || !ownerEmail || !ownerPhone || !address || !timezone) {
      showError('Centre name, email, phone, address, and timezone are required.');
      track('start_submit_error', { reason: 'missing_fields' });
      return;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters.');
      track('start_submit_error', { reason: 'password_short' });
      return;
    }
    if (!acceptedTerms) {
      showError('Please agree to the Terms of Service.');
      track('start_submit_error', { reason: 'terms' });
      return;
    }

    track('start_submit', {
      page_path: window.location.pathname,
      form_id: 'start-form',
    });

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating…';

    fetch(API_BASE + '/api/public/free-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        daycareName: daycareName,
        ownerEmail: ownerEmail,
        ownerPhone: ownerPhone,
        address: address,
        timezone: timezone,
        password: password,
        acceptedTerms: true,
        termsVersion: TERMS_VERSION,
      }),
    })
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (data) {
            if (!res.ok) {
              throw new Error(data.message || data.error || 'Signup failed (' + res.status + ')');
            }
            return data;
          });
      })
      .then(function () {
        form.hidden = true;
        if (success) {
          success.hidden = false;
          success.classList.add('is-visible');
        }
        track('start_success', { src: 'start.html' });
        track('free_signup_success', { src: 'start.html' });
      })
      .catch(function (err) {
        showError(err && err.message ? err.message : 'Signup failed. Please try again.');
        track('start_submit_error', {
          reason: 'api',
          message: err && err.message ? String(err.message).slice(0, 120) : 'unknown',
        });
        submitBtn.disabled = false;
        submitBtn.textContent = 'Start free';
      });
  });
})();

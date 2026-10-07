(function () {
  var API_BASE = window.DDK_API_BASE || 'https://dailydot-prod.nn.r.appspot.com';
  var TERMS_VERSION = '2026-08';

  var form = document.getElementById('start-form');
  var success = document.getElementById('start-success');
  var errorEl = document.getElementById('start-error');
  var submitBtn = document.getElementById('start-submit');

  if (!form) return;

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
    if (tz) {
      var tzSelect = document.getElementById('timezone');
      if (tzSelect) {
        var opt = Array.prototype.find.call(tzSelect.options, function (o) {
          return o.value === tz;
        });
        if (opt) tzSelect.value = tz;
      }
    }
  } catch (e) {
    /* ignore */
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

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    clearError();

    var daycareName = (document.getElementById('daycareName').value || '').trim();
    var ownerEmail = (document.getElementById('ownerEmail').value || '').trim();
    var ownerPhone = (document.getElementById('ownerPhone').value || '').trim();
    var address = (document.getElementById('address').value || '').trim();
    var timezone = document.getElementById('timezone').value;
    var password = document.getElementById('password').value || '';
    var confirmPassword = document.getElementById('confirmPassword').value || '';
    var acceptedTerms = document.getElementById('acceptedTerms').checked;

    if (!daycareName || !ownerEmail || !ownerPhone || !address || !timezone) {
      showError('Centre name, email, phone, address, and timezone are required.');
      return;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }
    if (!acceptedTerms) {
      showError('Please agree to the Terms of Service.');
      return;
    }

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
        return res.json().catch(function () {
          return {};
        }).then(function (data) {
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
        if (window.DDK && typeof window.DDK.track === 'function') {
          window.DDK.track('free_signup_success', { src: 'start.html' });
        }
      })
      .catch(function (err) {
        showError(err && err.message ? err.message : 'Signup failed. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Start free';
      });
  });
})();

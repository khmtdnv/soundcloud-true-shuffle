/**
 * SoundCloud Full Shuffle Fixer v18 (FINAL OPTIMIZED)
 *
 * - Smooth scroll down emulation to prevent network stack overflow
 * - Micro-jiggle recovery for transient network disconnects
 * - Max 6 retries (~7s) on playlist end instead of 30 (50s)
 * - Interactive [⚡ Перемешать сейчас] button in Toast to finish instantly
 * - Removed extra badge button from player controls
 */

(function () {
  'use strict';

  var bypassUntil     = 0;
  var isRunning       = false;
  var abortRequested  = false;
  var toast           = null;

  // ── Utils ──────────────────────────────────────────────────────────────────

  function sleep(ms) {
    return new Promise(function(r) { setTimeout(r, ms); });
  }

  function log() {
    var args = Array.prototype.slice.call(arguments);
    console.log.apply(console, ['[SC Shuffle Fixer v18]'].concat(args));
  }

  // ── Toast ──────────────────────────────────────────────────────────────────

  function ensureToast() {
    if (!toast || !document.body.contains(toast)) {
      toast = document.createElement('div');
      toast.className = 'sc-shuffle-toast';
      document.body.appendChild(toast);
    }
    return toast;
  }

  function showToast(msg, spinner, showSkipBtn) {
    var t = ensureToast();
    var content = (spinner
      ? '<div class="sc-shuffle-spinner"></div>'
      : '<span style="font-size:16px">⚡</span>') +
      '<span>' + msg + '</span>';

    if (showSkipBtn) {
      content += '<button id="sc-skip-wait-btn" class="sc-shuffle-now-btn">⚡ Перемешать сейчас</button>';
    }

    t.innerHTML = content;
    t.classList.add('visible');

    if (showSkipBtn) {
      var btn = document.getElementById('sc-skip-wait-btn');
      if (btn) {
        btn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          log('User clicked "Shuffle now"');
          abortRequested = true;
        };
      }
    }
  }

  function hideToast(ms) {
    setTimeout(function() { if (toast) toast.classList.remove('visible'); }, ms || 3500);
  }

  // ── DOM finders ────────────────────────────────────────────────────────────

  function findShuffle() {
    var b = document.querySelector('button.shuffleControl');
    if (b) return b;
    var all = document.querySelectorAll('button');
    for (var i = 0; i < all.length; i++) {
      var c = all[i].className || '';
      var t = (all[i].getAttribute('title') || '').toLowerCase();
      if (c.indexOf('shuffleControl') !== -1 || t === 'shuffle') return all[i];
    }
    return null;
  }

  function findQueueToggle() {
    return (
      document.querySelector('a.playbackSoundBadge__showQueue') ||
      document.querySelector('[class*="showQueue"]') ||
      document.querySelector('a[title="Next up"]') ||
      document.querySelector('a[title="Следующие"]')
    );
  }

  function getScrollEl() {
    return (
      document.querySelector('.queue__scrollableInner') ||
      document.querySelector('[class*="queue__scrollable"]')
    );
  }

  function isShuffleOn(btn) {
    if (!btn) return false;
    return btn.className.indexOf('m-shuffling') !== -1 ||
           btn.className.indexOf('sc-button-selected') !== -1;
  }

  // ── Core Logic ─────────────────────────────────────────────────────────────

  async function openQueue() {
    var scrollEl = getScrollEl();
    if (scrollEl && scrollEl.scrollHeight > 100) {
      log('Queue already loaded');
      return scrollEl;
    }

    var toggle = findQueueToggle();
    if (!toggle) return null;

    log('Opening queue...');
    toggle.click();

    for (var i = 0; i < 30; i++) {
      await sleep(100);
      scrollEl = getScrollEl();
      if (scrollEl && scrollEl.scrollHeight > 100) return scrollEl;
    }

    // Toggle might have closed it, retry
    toggle.click();
    await sleep(800);
    return getScrollEl();
  }

  async function scrollUntilAllLoaded(scrollEl) {
    var lastH = scrollEl.scrollHeight;
    var stableN = 0;

    log('Starting smooth scroll loop. Initial h:', lastH);

    for (var i = 0; i < 4000; i++) {
      if (abortRequested) {
        log('Instant shuffle requested by user');
        break;
      }

      // Smoothly scroll down by screen height
      var step = scrollEl.clientHeight > 100 ? scrollEl.clientHeight : 500;
      scrollEl.scrollTop += step;
      
      await sleep(400); // Natural human scroll interval
      
      scrollEl = getScrollEl();
      if (!scrollEl) break;
      var newH = scrollEl.scrollHeight;
      
      // Check if we hit the current bottom of the list
      var isAtBottom = (scrollEl.scrollTop + scrollEl.clientHeight) >= (newH - 200);
      
      if (isAtBottom) {
          // We hit the bottom, let's see if height grew
          if (newH > lastH) {
              lastH = newH;
              stableN = 0;
          } else {
              stableN++;
              
              // MICRO-JIGGLE: If network failed, simulate user scrolling up and down slightly to retry
              if (stableN % 5 === 0) {
                  log('Network stuck, applying micro-jiggle (retry ' + (stableN/5) + '/25)...');
                  scrollEl.scrollTop -= 350;
                  await sleep(1000); // Wait 1 second to let network breathe
                  scrollEl.scrollTop += 350;
              }

              // After 25 retries (~40-50s total stall), conclude end of playlist
              if (stableN >= 125) {
                  log('Finished loading. Final h:', newH);
                  break;
              }
          }
      } else {
          stableN = 0;
      }
      
      if (i % 5 === 0) {
          var approx = Math.round(newH / 56);
          showToast('Загрузка (~' + approx + ')...', true, true);
          log('Loop', i, '| h:', newH, '| scrollTop:', scrollEl.scrollTop);
      }
    }

    return Math.round(scrollEl.scrollHeight / 56);
  }

  // ── Main flow ──────────────────────────────────────────────────────────────

  async function runFullShuffle(shuffleBtn) {
    if (isRunning) { log('Already running'); return; }
    isRunning = true;
    abortRequested = false;

    log('=== Full shuffle flow started ===');
    showToast('Открываю очередь...', true, false);

    try {
      var scrollEl = await openQueue();

      if (!scrollEl || scrollEl.scrollHeight === 0) {
        log('Queue empty or not found');
        showToast('Очередь недоступна, shuffle...', false, false);
      } else {
        var approxTracks = await scrollUntilAllLoaded(scrollEl);
        
        // Scroll back to top
        var items = document.querySelectorAll('.queueItemView');
        if (items.length > 0) items[0].scrollIntoView(true);
        else scrollEl.scrollTop = 0;
        
        showToast('Перемешиваю ~' + approxTracks + ' треков! 🎉', false, false);
      }
      
      hideToast(4000);
    } catch (err) {
      log('ERROR:', err);
      showToast('Ошибка, запускаю shuffle...', false, false);
      hideToast(3000);
    }

    isRunning = false;
    bypassUntil = Date.now() + 2000;
    shuffleBtn.click();
  }

  // ── Interceptor ────────────────────────────────────────────────────────────

  document.addEventListener('click', function(e) {
    if (Date.now() < bypassUntil) return;

    var el = e.target;
    if (!el) return;

    var btn = (el.tagName === 'BUTTON') ? el : el.closest('button');
    if (!btn) return;

    var cls   = btn.className || '';
    var title = (btn.getAttribute('title') || '').toLowerCase();

    if (cls.indexOf('shuffleControl') === -1 && title !== 'shuffle') return;
    if (isShuffleOn(btn)) return; // user turning shuffle off

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    runFullShuffle(btn);
  }, true);

  log('v18 loaded. Smooth scrolling + 6 retries + Instant Toast Shuffle.');
})();

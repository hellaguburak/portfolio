/**
 * BURAK HELLAGU PORTFOLIO - CORE INTERACTIVITY
 * Horizontal Sliders, Ambient Glows, Click Ripples, Scroll Parallax
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initScrollAnimations();
  initFormHandler();
  initSmoothScroll();
  initParallaxBackground();
  initPortfolioSlider();
  initInteractivePortfolioCards();
  initPortfolioHeaderScrollAnimation();
  initExperienceSyncScroll();
  initMouseGlowAndRipples();
  initSmokeTypography();
  initSuiTransition();
  initCardReflections();
  initHeroScrollAnimation();
  initMinimapNavigation();
  initViewfinderDynamics();
  initHeaderScrollSpy();
  initPhilosophyStoryboard();
  initProjectGalleryModal();
});

/**
 * Sticky Header Scroll Behavior
 */
function initStickyHeader() {
  const header = document.getElementById('site-header');
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  handleScroll();
}

/**
 * Scroll Animations using Intersection Observer API
 */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-title');
  
  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  };
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  revealElements.forEach(el => {
    revealObserver.observe(el);
  });
}

/**
 * Background Text Parallax Effect
 */
function initParallaxBackground() {
  const text1 = document.getElementById('scroll-text-1');
  const text2 = document.getElementById('scroll-text-2');
  
  if (!text1 && !text2) return;
  
  let lastScrollY = window.scrollY;
  let ticking = false;
  
  const updateParallax = () => {
    if (text1) {
      const offset1 = (lastScrollY - 600) * 0.12;
      text1.style.transform = `translateX(${offset1}px)`;
    }
    if (text2) {
      const offset2 = (lastScrollY - 2000) * -0.1;
      text2.style.transform = `translateX(${offset2}px)`;
    }
    ticking = false;
  };
  
  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });
  
  updateParallax();
}

/**
 * 3D Horizontal Portfolio Slider Logic (Scroll-Snap and Custom Progress Bar/Drag Navigation)
 */
function initPortfolioSlider() {
  const track = document.getElementById('portfolio-track');
  const prevBtn = document.getElementById('slider-prev-btn');
  const nextBtn = document.getElementById('slider-next-btn');
  const viewport = document.getElementById('portfolio-slider-view');
  
  if (!track) return;
  
  const originalSlides = track.querySelectorAll('.portfolio-slide-card');
  const originalCount = originalSlides.length;
  if (originalCount === 0) return;
  
  // Clone all slides once to make an infinite loop
  originalSlides.forEach(slide => {
    const clone = slide.cloneNode(true);
    track.appendChild(clone);
  });
  
  const allSlides = track.querySelectorAll('.portfolio-slide-card');
  
  let currentIndex = 0;
  let currentX = 0;
  let isSnapping = false;
  let isHovered = false;
  let isVisible = false;
  let resumeTimeout = null;
  let activeFrame = null;
  
  // Extra-slow drift speed (pixels per frame)
  const driftSpeed = 0.16;

  const updateSlideTransitions = () => {
    const viewportCenter = window.innerWidth / 2;
    
    allSlides.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenter - viewportCenter);
      
      const maxDist = 380; // Distance over which transition happens
      
      if (distance < maxDist) {
        const factor = 1 - (distance / maxDist);
        const easeFactor = Math.sin(factor * Math.PI / 2); // Sine ease out for smoothness
        
        const scale = 0.82 + (0.18 * easeFactor);   // 0.82 to 1.00
        const opacity = 0.42 + (0.58 * easeFactor); // 0.42 to 1.00
        
        card.style.transform = `scale(${scale})`;
        card.style.opacity = opacity;
        card.style.filter = 'none';
      } else {
        card.style.transform = 'scale(0.82)';
        card.style.opacity = 0.42;
        card.style.filter = 'none';
      }
    });
  };

  const getStepSize = () => {
    const isMobile = window.innerWidth <= 768;
    return isMobile ? 344 : 616;
  };

  const tick = () => {
    if (!isVisible) return;
    
    const stepSize = getStepSize();
    const halfTrackWidth = originalCount * stepSize;
    
    if (!isSnapping && !isHovered) {
      currentX -= driftSpeed;
      
      // Seamless wrap-around
      if (Math.abs(currentX) >= halfTrackWidth) {
        currentX += halfTrackWidth;
      }
      
      track.style.transition = 'none';
      track.style.transform = `translateX(${currentX}px)`;
    }
    
    updateSlideTransitions();
    activeFrame = requestAnimationFrame(tick);
  };

  const startTick = () => {
    isVisible = true;
    if (!activeFrame) {
      activeFrame = requestAnimationFrame(tick);
    }
  };

  const stopTick = () => {
    isVisible = false;
    if (activeFrame) {
      cancelAnimationFrame(activeFrame);
      activeFrame = null;
    }
  };

  const handleInteraction = () => {
    isSnapping = true;
    if (resumeTimeout) clearTimeout(resumeTimeout);
    
    resumeTimeout = setTimeout(() => {
      // Transition finished, disable snappy transition mode and resume slow drift
      track.style.transition = 'none';
      allSlides.forEach(slide => slide.style.transition = '');
      isSnapping = false;
    }, 8000); // Resume flow after 8 seconds of inactivity
  };

  const snapToCurrentIndex = () => {
    const stepSize = getStepSize();
    currentX = -currentIndex * stepSize;
    
    track.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform = `translateX(${currentX}px)`;
    
    // Add smooth transition to slides during snap
    allSlides.forEach(slide => {
      slide.style.transition = 'opacity 0.8s, transform 0.8s, filter 0.8s';
    });
    
    handleInteraction();
  };

  // Click listeners for prev/next buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
      } else {
        currentIndex = originalCount - 1; // Wrap around index
      }
      snapToCurrentIndex();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < originalCount - 1) {
        currentIndex++;
      } else {
        currentIndex = 0; // Wrap around index
      }
      snapToCurrentIndex();
    });
  }

  // Hover detection & Trackpad two-finger scroll
  let wheelCooldown = false;
  if (viewport) {
    viewport.addEventListener('mouseenter', () => {
      isHovered = true;
    });
    viewport.addEventListener('mouseleave', () => {
      isHovered = false;
    });

    viewport.addEventListener('wheel', (e) => {
      const absDeltaX = Math.abs(e.deltaX);
      const absDeltaY = Math.abs(e.deltaY);
      
      // If horizontal scrolling is dominant
      if (absDeltaX > 16 && absDeltaX > absDeltaY) {
        e.preventDefault();
        
        if (wheelCooldown) return;
        
        // Lock immediately to prevent fast trackpad events from bypassing cooldown
        wheelCooldown = true;
        
        if (e.deltaX > 16) {
          // Scroll right -> next slide
          if (currentIndex < originalCount - 1) {
            currentIndex++;
          } else {
            currentIndex = 0;
          }
          snapToCurrentIndex();
          triggerCooldown();
        } else if (e.deltaX < -16) {
          // Scroll left -> prev slide
          if (currentIndex > 0) {
            currentIndex--;
          } else {
            currentIndex = originalCount - 1;
          }
          snapToCurrentIndex();
          triggerCooldown();
        }
      }
    }, { passive: false });

    // Touch swipe detection with vertical axis lock stabilization
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].screenX;
      touchStartY = e.touches[0].screenY;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      const minSwipeDistance = 60; // minimum distance in pixels
      
      // Ensure horizontal swipe is dominant and passes threshold
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
        if (diffX < 0) {
          // Swiped left -> next slide
          if (currentIndex < originalCount - 1) {
            currentIndex++;
          } else {
            currentIndex = 0;
          }
          snapToCurrentIndex();
        } else {
          // Swiped right -> prev slide
          if (currentIndex > 0) {
            currentIndex--;
          } else {
            currentIndex = originalCount - 1;
          }
          snapToCurrentIndex();
        }
      }
    }
  }

  function triggerCooldown() {
    wheelCooldown = true;
    setTimeout(() => {
      wheelCooldown = false;
    }, 850); // Increased to 850ms to perfectly filter touchpad gesture inertia
  }

  // Observer to start scrolling when portfolio page is in view
  const portfolioSection = document.getElementById('portfolio');
  if (portfolioSection) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startTick();
        } else {
          stopTick();
        }
      });
    }, { threshold: 0.02 });
    sectionObserver.observe(portfolioSection);
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    if (!isSnapping) {
      const stepSize = getStepSize();
      currentX = -currentIndex * stepSize;
    }
  });
}

/**
 * Awwwards-style Interactive Portfolio Cards (SVG Liquid Wave Filter + 3D Magnetic Parallax)
 * Inspired by Obys Agency (https://experiment.obys.agency/)
 */
function initInteractivePortfolioCards() {
  const cards = document.querySelectorAll('.portfolio-slide-card');
  if (cards.length === 0) return;

  cards.forEach((card) => {
    const title = card.querySelector('.portfolio-title');
    const desc = card.querySelector('.portfolio-desc');
    const imgContainer = card.querySelector('.portfolio-img-container');

    if (!imgContainer) return;

    // 3D Parallax movement matching the mouse cursor
    card.addEventListener('mousemove', (e) => {
      if (!card.classList.contains('active-slide')) return;

      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

      // Set snappy transition during mouse move for smooth trailing
      card.style.transition = 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.1s ease-out, filter 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
      imgContainer.style.transition = 'transform 0.1s ease-out';
      if (title) title.style.transition = 'transform 0.1s ease-out';
      if (desc) desc.style.transition = 'transform 0.1s ease-out';

      // 3D Tilt Card
      card.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-5px) scale(1.0)`;
      
      // Translate Image (follows mouse)
      imgContainer.style.transform = `translateX(${x * 20}px) translateY(${y * 20}px)`;

      // Translate Titles opposite to mouse (layered parallax depth!)
      if (title) {
        title.style.transform = `translateX(${-x * 12}px) translateY(${-y * 12}px)`;
      }
      if (desc) {
        desc.style.transform = `translateX(${-x * 8}px) translateY(${-y * 8}px)`;
      }
    });

    // Reset layout on mouse leave
    card.addEventListener('mouseleave', () => {
      // Set soft transition on exit to center elements smoothly
      card.style.transition = 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
      imgContainer.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      if (title) title.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      if (desc) desc.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

      card.style.transform = 'scale(1.0) perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0deg)';
      imgContainer.style.transform = 'translateX(0px) translateY(0px)';
      if (title) title.style.transform = 'translateX(0px) translateY(0px)';
      if (desc) desc.style.transform = 'translateX(0px) translateY(0px)';
    });
  });
}

/**
 * Interactive Ambient Glow Follower and Click Ripple Effect
 */
function initMouseGlowAndRipples() {
  const glow = document.getElementById('cursor-glow');
  
  // Mouse movement glow tracking and particle trail
  if (glow) {
    let hasMoved = false;
    let lastTime = 0;
    
    const createParticle = (x, y) => {
      const particle = document.createElement('div');
      particle.className = 'mouse-particle';
      
      // Randomize particle sizes and trajectories
      const size = Math.random() * 6 + 3; // 3px to 9px
      const lifetime = Math.random() * 400 + 400; // 400ms to 800ms
      const dx = (Math.random() - 0.5) * 80; // random horizontal drift -40px to 40px
      const dy = (Math.random() - 0.5) * 80; // random vertical drift
      
      particle.style.setProperty('--size', `${size}px`);
      particle.style.setProperty('--lifetime', `${lifetime}ms`);
      particle.style.setProperty('--dx', `${dx}px`);
      particle.style.setProperty('--dy', `${dy}px`);
      
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      document.body.appendChild(particle);
      
      // Remove element from DOM after animation completes
      setTimeout(() => {
        particle.remove();
      }, lifetime);
    };
    
    window.addEventListener('mousemove', (e) => {
      if (!hasMoved) {
        glow.classList.add('active');
        hasMoved = true;
      }
      
      window.requestAnimationFrame(() => {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
      });
      
      const now = Date.now();
      if (now - lastTime > 25) { // Spawn at most one particle every 25ms to balance visuals & performance
        createParticle(e.clientX, e.clientY);
        lastTime = now;
      }
    });
    
    // Dim down on normal hover, flash brightly on click
    window.addEventListener('mousedown', () => {
      glow.classList.add('click-active');
    });
    
    window.addEventListener('mouseup', () => {
      glow.classList.remove('click-active');
    });
    
    window.addEventListener('mouseleave', () => {
      glow.classList.remove('click-active');
    });
  }
  
  // Click ripple (Water droplet wave effect)
  window.addEventListener('click', (e) => {
    if (e.target.closest('a') || e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('select')) {
      return;
    }
    
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 800);
  });
  
  // Language Selector toggle
  const langTr = document.getElementById('lang-tr');
  const langEn = document.getElementById('lang-en');
  
  if (langTr && langEn) {
    const setLanguage = (lang) => {
      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const websiteInput = document.getElementById('form-website');
      const msgInput = document.getElementById('form-message');
      const submitBtn = document.getElementById('btn-submit-form');
      
      if (lang === 'tr') {
        document.body.classList.add('lang-tr');
        langTr.classList.add('active');
        langEn.classList.remove('active');
        
        // Update placeholders to Turkish
        if (nameInput) nameInput.placeholder = 'Adınız Soyadınız';
        if (emailInput) emailInput.placeholder = 'e-posta@ornek.com';
        if (websiteInput) websiteInput.placeholder = 'https://firma.com';
        if (msgInput) msgInput.placeholder = 'Proje detaylarını kısaca açıklayın...';
        if (submitBtn) submitBtn.querySelector('.lang-tr').textContent = 'Talebi Gönder';
      } else {
        document.body.classList.remove('lang-tr');
        langEn.classList.add('active');
        langTr.classList.remove('active');
        
        // Update placeholders to English
        if (nameInput) nameInput.placeholder = 'John Doe';
        if (emailInput) emailInput.placeholder = 'john@example.com';
        if (websiteInput) websiteInput.placeholder = 'https://mycompany.com';
        if (msgInput) msgInput.placeholder = 'Briefly describe your objectives...';
        if (submitBtn) submitBtn.querySelector('.lang-en').textContent = 'Send Request';
      }
    };
    
    langTr.addEventListener('click', () => setLanguage('tr'));
    langEn.addEventListener('click', () => setLanguage('en'));
  }
}

/**
 * Contact Form Interaction & Mock Submission
 */
function initFormHandler() {
  const form = document.getElementById('portfolio-contact-form');
  if (!form) return;
  
  let selectedMethod = 'email';
  const tabBtns = form.querySelectorAll('.contact-method-tabs .tab-btn');
  const submitBtn = document.getElementById('btn-submit-form');
  
  // Handle tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      selectedMethod = btn.getAttribute('data-method');
      const isTr = document.body.classList.contains('lang-tr');
      
      if (selectedMethod === 'email') {
        submitBtn.classList.remove('whatsapp-style');
        submitBtn.innerHTML = isTr ? `<span>E-posta Talebi Gönder</span>` : `<span>Send Email Request</span>`;
      } else {
        submitBtn.classList.add('whatsapp-style');
        const waIcon = `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 0.5rem; display: inline-block; vertical-align: middle;"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.623-1.023-5.086-2.885-6.948C16.69 1.997 14.236.97 11.621.97c-5.437 0-9.862 4.371-9.866 9.8.001 1.942.512 3.834 1.48 5.53l-.988 3.605 3.8-.95z"/></svg>`;
        submitBtn.innerHTML = isTr ? 
          `<span>${waIcon} WhatsApp ile Gönder</span>` : 
          `<span>${waIcon} Send via WhatsApp</span>`;
      }
    });
  });
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const website = document.getElementById('form-website').value || 'Belirtilmedi / Not specified';
    
    const interestSelect = document.getElementById('form-interest');
    const interest = interestSelect.options[interestSelect.selectedIndex].text;
    
    const message = document.getElementById('form-message').value;
    const isTr = document.body.classList.contains('lang-tr');
    
    submitBtn.disabled = true;
    
    if (selectedMethod === 'whatsapp') {
      submitBtn.innerHTML = isTr ? 'WhatsApp\'a Yönlendiriliyor...' : 'Redirecting to WhatsApp...';
      
      const waText = `*Yeni Portfolyo Mesajı* \n\n` +
        `👤 *İsim:* ${name}\n` +
        `✉️ *E-posta:* ${email}\n` +
        `🌐 *Web Sitesi:* ${website}\n` +
        `💼 *İlgi Alanı:* ${interest}\n\n` +
        `📝 *Mesaj:* \n${message}`;
        
      const encodedText = encodeURIComponent(waText);
      const waUrl = `https://wa.me/905423349165?text=${encodedText}`;
      
      window.open(waUrl, '_blank');
      
      setTimeout(() => {
        if (isTr) {
          form.innerHTML = `
            <div class="form-success-container" style="text-align: center; padding: 2rem 0;">
              <div class="success-icon" style="font-size: 3rem; color: var(--accent-blue); margin-bottom: 1.5rem;">✓</div>
              <h3 style="margin-bottom: 1rem; color: #ffffff;">WhatsApp'a Aktarıldı</h3>
              <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 1.5rem;">
                Teşekkürler, ${name}! Talebiniz derlendi ve WhatsApp'a aktarıldı. Açılan pencerede "Gönder" tuşuna basarak sohbete başlayabilirsiniz.
              </p>
              <a href="${waUrl}" target="_blank" class="btn btn-primary" style="display: inline-block; padding: 0.6rem 1.2rem; font-size: 0.85rem; border-radius: 4px; text-decoration: none;">WhatsApp'ı Tekrar Aç</a>
            </div>
          `;
        } else {
          form.innerHTML = `
            <div class="form-success-container" style="text-align: center; padding: 2rem 0;">
              <div class="success-icon" style="font-size: 3rem; color: var(--accent-blue); margin-bottom: 1.5rem;">✓</div>
              <h3 style="margin-bottom: 1rem; color: #ffffff;">Transferred to WhatsApp</h3>
              <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 1.5rem;">
                Thank you, ${name}! Your request has been compiled and transferred. You can start the chat and click "Send" in the opened window.
              </p>
              <a href="${waUrl}" target="_blank" class="btn btn-primary" style="display: inline-block; padding: 0.6rem 1.2rem; font-size: 0.85rem; border-radius: 4px; text-decoration: none;">Open WhatsApp Again</a>
            </div>
          `;
        }
      }, 800);
      
    } else {
      // Email submission
      submitBtn.innerHTML = isTr ? 'E-posta Gönderiliyor...' : 'Sending Email...';
      
      const formData = new FormData(form);
      const accessKey = formData.get('access_key');
      
      // If access key is placeholder, do a mock submission for offline/local testing
      if (accessKey === 'YOUR_ACCESS_KEY_HERE') {
        setTimeout(() => {
          showEmailSuccess(name, email, isTr);
        }, 1200);
      } else {
        // Send real AJAX post request to Web3Forms
        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            showEmailSuccess(name, email, isTr);
          } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = isTr ? 'Tekrar Dene (Hata)' : 'Try Again (Error)';
            alert(isTr ? 'Form gönderilirken bir hata oluştu: ' + data.message : 'Error sending form: ' + data.message);
          }
        })
        .catch(err => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = isTr ? 'Tekrar Dene (Hata)' : 'Try Again (Error)';
          console.error('Email send error:', err);
        });
      }
    }
  });

  function showEmailSuccess(name, email, isTr) {
    if (isTr) {
      form.innerHTML = `
        <div class="form-success-container" style="text-align: center; padding: 2rem 0;">
          <div class="success-icon" style="font-size: 3rem; color: var(--accent-blue); margin-bottom: 1.5rem;">✓</div>
          <h3 style="margin-bottom: 1rem; color: #ffffff;">Talebiniz E-posta İle Alındı</h3>
          <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary);">
            Teşekkürler, ${name}! Mesajınız başarıyla e-posta kutuma ulaştı. <strong>${email}</strong> adresi üzerinden en geç 24 saat içerisinde size geri dönüş sağlayacağım.
          </p>
        </div>
      `;
    } else {
      form.innerHTML = `
        <div class="form-success-container" style="text-align: center; padding: 2rem 0;">
          <div class="success-icon" style="font-size: 3rem; color: var(--accent-blue); margin-bottom: 1.5rem;">✓</div>
          <h3 style="margin-bottom: 1rem; color: #ffffff;">Request Received via Email</h3>
          <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary);">
            Thank you, ${name}! Your message has successfully reached my inbox. I will reply to you at <strong>${email}</strong> within 24 hours.
          </p>
        </div>
      `;
    }
  }
}

/**
 * Smooth Scrolling Helper with sticky nav offset
 */
function initSmoothScroll() {
  const transitionEl = document.getElementById('sui-transition');
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top;
        const viewportHeight = window.innerHeight;
        const elementHeight = targetElement.offsetHeight;
        let offsetPosition = elementPosition + window.pageYOffset - (viewportHeight - elementHeight) / 2;
        
        if (targetId === '#hero') {
          offsetPosition = 0;
        } else {
          // Keep within scrollable limits
          const maxScroll = document.documentElement.scrollHeight - viewportHeight;
          offsetPosition = Math.max(0, Math.min(maxScroll, offsetPosition));
        }
        
        if (transitionEl) {
          // 1. Reset states and display transition overlay
          transitionEl.style.display = 'flex';
          transitionEl.classList.remove('split-reveal');
          
          // Force layout reflow
          void transitionEl.offsetWidth;
          
          // 2. Sweep up from the bottom
          transitionEl.classList.add('active-sweep');
          
          // 3. Wait for sweep animation to complete (600ms)
          setTimeout(() => {
            // Scroll instantly to the target section in the background
            window.scrollTo({
              top: offsetPosition,
              behavior: 'auto'
            });
            
            // 4. Split open to reveal the section
            transitionEl.classList.add('split-reveal');
            
            // 5. Clean up after reveal animation completes (650ms)
            setTimeout(() => {
              transitionEl.classList.remove('active-sweep', 'split-reveal');
            }, 650);
            
          }, 600);
        } else {
          // Fallback if transition overlay is missing
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

/**
 * Sui-style Page Load Entrance Animation
 */
function initSuiTransition() {
  const transitionEl = document.getElementById('sui-transition');
  if (!transitionEl) return;
  
  // Wait a small delay to ensure loading state is stable, then split reveal
  setTimeout(() => {
    transitionEl.classList.add('split-reveal');
    
    // Clean up classes after split animation finishes
    setTimeout(() => {
      transitionEl.classList.remove('active-sweep', 'split-reveal');
    }, 650);
  }, 300);
}

/**
  * Smoke Typography - Splits words & letters in headers, dissolving them into smoke on hover.
  */
function initSmokeTypography() {
  const headings = document.querySelectorAll('.section-title');
  const vowelsRegex = /[^aeiouyæœøıiöüşâêîûoöuü]*[aeiouyæœøıiöüşâêîûoöuü]+(?:[^aeiouyæœøıiöüşâêîûoöuü](?![aeiouyæœøıiöüşâêîûoöuü]))*/gi;
  
  const splitTextNodes = (node) => {
    // 3 = Text Node
    if (node.nodeType === 3) {
      const text = node.textContent;
      if (text.trim() === '') return;
      
      const span = document.createElement('span');
      span.className = 'smoke-container';
      
      const words = text.split(/(\s+)/);
      span.innerHTML = words.map(word => {
        if (word.trim() === '') return word; // Space directly
        
        // Split word into syllables using regex
        const syllables = word.match(vowelsRegex) || [word];
        const syllableSpans = syllables.map(syllable => `<span class="smoke-syllable">${syllable}</span>`).join('');
        return `<span class="smoke-word">${syllableSpans}</span>`;
      }).join('');
      
      node.parentNode.replaceChild(span, node);
    } else if (node.nodeType === 1 && !node.classList.contains('smoke-container')) {
      const children = Array.from(node.childNodes);
      children.forEach(child => splitTextNodes(child));
    }
  };
  
  headings.forEach(heading => splitTextNodes(heading));
}

/**
 * Glassmorphic Card Reflections (Hover mouse-glow and scroll-shine sweeps)
 */
function initCardReflections() {
  const cards = document.querySelectorAll('.glass-card, .award-card');
  if (cards.length === 0) return;
  
  cards.forEach(card => {
    // Disable hover transitions during active mouse tracking for lag-free 3D tilt response
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate cursor position relative to the center of the card
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Subtly rotate card up to 4 degrees in 3D perspective
      const rotateX = ((centerY - y) / centerY) * 4;
      const rotateY = ((x - centerX) / centerX) * 4;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
    
    // Smoothly restore transition styles and reset transforms on mouse leave
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.4s ease, box-shadow 0.4s ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
  
  // Scroll tracking to translate the diagonal silver reflection sweep
  const updateScrollShine = () => {
    const viewHeight = window.innerHeight;
    
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      // Only execute calculations if card is visible inside viewport to maintain high scroll performance
      if (rect.bottom > 0 && rect.top < viewHeight) {
        const cardCenter = rect.top + rect.height / 2;
        // Calculate factor from -1 (moved above screen) to 1 (below screen)
        const scrollFactor = (cardCenter / viewHeight - 0.5) * 2;
        card.style.setProperty('--scroll-shine', `${scrollFactor * 100}%`);
      }
    });
  };
  
  window.addEventListener('scroll', updateScrollShine, { passive: true });
  updateScrollShine(); // Initial trigger on page load
}

/**
 * Hero Video Scroll-Driven Collapse Animation
 * Staged scroll motion:
 * Stage 1: Side videos slide horizontally underneath the center video (scroll 0 to 160px)
 * Stage 2: Center video shrinks and disappears under text headers (scroll 160px to 340px)
 */
function initHeroScrollAnimation() {
  const middleText = document.getElementById('hero-middle-text');
  
  const updateHeroScroll = () => {
    const scrollY = window.scrollY;
    
    // Unified progress factor (0 to 1 over 450px of scroll)
    const progress = Math.min(1, Math.max(0, scrollY / 450));
    
    // Set variable on root document element so all selectors can reference it
    document.documentElement.style.setProperty('--scroll-progress', progress);
    
    // Calculate middle text opacity: fades in between 0.15 and 0.5, then remains at 1
    if (middleText) {
      let middleOpacity = 0;
      if (progress > 0.15) {
        middleOpacity = Math.min(1, (progress - 0.15) / 0.35);
      }
      middleText.style.opacity = middleOpacity;
      middleText.style.transform = `translate(-50%, -50%) scale(${0.95 + middleOpacity * 0.05})`;
    }
  };
  
  window.addEventListener('scroll', updateHeroScroll, { passive: true });
  updateHeroScroll(); // Run once on startup
}

/**
 * Real-time dynamic analog camera graphics
 * Drives the ticking frame coordinates index
 */
function initViewfinderDynamics() {
  // Central viewfinder numbers ticker
  const numbersEl = document.querySelector('.outer-line-numbers');
  let base = 234556;
  if (numbersEl) {
    setInterval(() => {
      base += Math.floor(Math.random() * 2) + 1;
      if (base > 234999) base = 234556;
      numbersEl.textContent = String(base).split('').join(' ');
    }, 120);
  }
}

/**
 * Floating Left Minimap Section Tracking Navigation
 * Synchronizes scroll position with active vertical navigation elements
 */
function initMinimapNavigation() {
  const nav = document.querySelector('.minimap-nav');
  if (!nav) return;
  
  const items = Array.from(nav.querySelectorAll('.minimap-item'));
  const sections = items.map(item => document.getElementById(item.getAttribute('data-section'))).filter(Boolean);
  const titleItems = Array.from(document.querySelectorAll('.minimap-title-item'));
  
  if (items.length === 0 || sections.length === 0) return;
  
  // Track active section on scroll
  const updateMinimapActive = () => {
    let currentActiveIdx = 0;
    const scrollPosition = window.scrollY + window.innerHeight / 3; // Trigger threshold
    
    sections.forEach((section, idx) => {
      if (scrollPosition >= section.offsetTop) {
        currentActiveIdx = idx;
      }
    });
    
    // Update active class on left navigation items
    items.forEach((item, idx) => {
      if (idx === currentActiveIdx) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    // Update active class on right side title items
    titleItems.forEach((titleItem, idx) => {
      if (idx === currentActiveIdx) {
        titleItem.classList.add('active');
      } else {
        titleItem.classList.remove('active');
      }
    });

    // Toggle dark-style when active section is the light about/philosophy section
    const activeSection = sections[currentActiveIdx];
    const titleNav = document.querySelector('.minimap-title-display');
    if (activeSection && (activeSection.id === 'about' || activeSection.id === 'experience')) {
      nav.classList.add('dark-style');
      if (titleNav) titleNav.classList.add('dark-style');
    } else {
      nav.classList.remove('dark-style');
      if (titleNav) titleNav.classList.remove('dark-style');
    }
  };
  
  // Click handler to smooth scroll to section (centered vertically)
  items.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = item.getAttribute('data-section');
      if (sectionId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const section = document.getElementById(sectionId);
        if (section) {
          const viewportHeight = window.innerHeight;
          const sectionHeight = section.offsetHeight;
          let targetScrollTop = section.offsetTop - (viewportHeight - sectionHeight) / 2;
          
          // Limit boundaries
          const maxScroll = document.documentElement.scrollHeight - viewportHeight;
          targetScrollTop = Math.max(0, Math.min(maxScroll, targetScrollTop));
          
          window.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });
  
  // Bind scroll event listener
  window.addEventListener('scroll', updateMinimapActive, { passive: true });
  updateMinimapActive(); // Run once on load
}

/**
 * Top Header Navigation scroll spy tracking
 */
function initHeaderScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');
  const sections = Array.from(navLinks)
    .map(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        return document.getElementById(href.substring(1));
      }
      return null;
    })
    .filter(Boolean);

  if (navLinks.length === 0 || sections.length === 0) return;

  const updateActiveLink = () => {
    let currentIdx = 0;
    const scrollPosition = window.scrollY + window.innerHeight / 3;

    sections.forEach((section, idx) => {
      if (scrollPosition >= section.offsetTop) {
        currentIdx = idx;
      }
    });

    navLinks.forEach((link, idx) => {
      if (idx === currentIdx) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink(); // Run once on startup
}

/**
 * Section 01: Philosophy Interactive Storyboard Animation
 */
function initPhilosophyStoryboard() {
  const section = document.querySelector('.storyboard-section');
  if (!section) return;

  const textLeft = section.querySelector('.text-left');
  const textRight = section.querySelector('.text-right');
  const photoWrapper = section.querySelector('.storyboard-photo-wrapper');
  const cornerAbout = section.querySelector('#corner-about');
  const cornerFocus = section.querySelector('#corner-focus');
  const cornerPhilosophy = section.querySelector('#corner-philosophy');
  const cornerExperiment = section.querySelector('#corner-experiment');
  const imgElement = section.querySelector('#storyboard-gif-img');

  if (!textLeft || !textRight || !photoWrapper || !cornerAbout || !cornerFocus || !cornerPhilosophy || !cornerExperiment || !imgElement) return;

  // 1. GIF-like photo cycling loop using new 16 artboard JPEG files
  const images = [];
  for (let i = 1; i <= 16; i++) {
    images.push(`assets/storyboard/board_${i}.jpg`);
  }
  // Shuffle the images array so they cycle in a randomized stop-motion order
  images.sort(() => Math.random() - 0.5);

  let currentImgIdx = 0;
  let gifInterval = null;

  const startGifLoop = () => {
    if (gifInterval) return;
    gifInterval = setInterval(() => {
      currentImgIdx = (currentImgIdx + 1) % images.length;
      imgElement.src = images[currentImgIdx];
    }, 350); // 350ms speed for energetic stop-motion cycling
  };

  const stopGifLoop = () => {
    if (gifInterval) {
      clearInterval(gifInterval);
      gifInterval = null;
    }
  };

  // Run observer to pause/play loop based on visibility
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startGifLoop();
      } else {
        stopGifLoop();
      }
    });
  }, { threshold: 0.02 });
  observer.observe(section);

  // Helper utility to compute organic opacity and translation offsets couple with scroll progress
  const getProgressState = (p, start, end) => {
    if (p < start) return { opacity: 0, y: 15 };
    if (p > end) return { opacity: 1, y: 0 };
    const opacity = (p - start) / (end - start);
    const y = (1 - opacity) * 15;
    return { opacity, y };
  };

  // 2. Scroll Animation Calculations (Scale photo and slide words)
  const handleScroll = () => {
    const rect = section.getBoundingClientRect();
    const sectionHeight = rect.height;
    
    // Start tracking scroll progress earlier when section enters the viewport
    const startThreshold = window.innerHeight * 0.7;
    const scrollOffset = startThreshold - rect.top;
    const scrollRange = sectionHeight - window.innerHeight + startThreshold;
    
    if (scrollOffset < 0) {
      updateStoryboard(0);
    } else if (scrollOffset > scrollRange) {
      updateStoryboard(1);
    } else {
      const progress = scrollOffset / scrollRange;
      updateStoryboard(progress);
    }
  };

  const updateStoryboard = (p) => {
    // scale goes from 0.52 to 1.05
    const scale = 0.52 + p * 0.53;
    photoWrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;

    // Dynamic morphing: Transitions from square (1:1 ratio) to vertical rectangle (1:1.39 ratio) based on current width
    const photoFrame = photoWrapper.querySelector('.storyboard-photo-frame');
    if (photoFrame) {
      const currentWidth = photoWrapper.offsetWidth || 280;
      const targetHeight = currentWidth + (p * currentWidth * 0.39);
      photoFrame.style.height = `${targetHeight}px`;
    }

    // Slide words from completely off-screen to form a cohesive unified title "Structure & Essence" centered over the photo
    const offScreenOffset = window.innerWidth / 2 + 150; // Guarantees starting completely off-screen
    const leftX = -offScreenOffset + (p * (offScreenOffset - 12));
    const rightX = offScreenOffset - (p * (offScreenOffset - 12));
    
    textLeft.style.transform = `translateY(-50%) translateX(${leftX}px)`;
    textRight.style.transform = `translateY(-50%) translateX(${rightX}px)`;
    
    // Dynamic letter spacing: starts wide (0.35em) and contracts to standard tight alignment (-0.04em)
    const letterSpacing = 0.35 - (p * 0.39);
    textLeft.querySelector('.storyboard-title').style.letterSpacing = `${letterSpacing}em`;
    textRight.querySelector('.storyboard-title').style.letterSpacing = `${letterSpacing}em`;
    
    // Sequential reveals of the 4 description boxes
    // Box 1: About (reaches full visibility at p=0.35)
    const state1 = getProgressState(p, 0.05, 0.35);
    cornerAbout.style.opacity = state1.opacity;
    cornerAbout.style.transform = `translateY(${state1.y}px)`;
    if (state1.opacity > 0.05) {
      cornerAbout.classList.add('visible');
    } else {
      cornerAbout.classList.remove('visible');
    }

    // Box 2: Focus & AI Integration (reaches full visibility at p=0.6)
    const state2 = getProgressState(p, 0.3, 0.6);
    cornerFocus.style.opacity = state2.opacity;
    cornerFocus.style.transform = `translateY(${state2.y}px)`;
    if (state2.opacity > 0.05) {
      cornerFocus.classList.add('visible');
    } else {
      cornerFocus.classList.remove('visible');
    }

    // Box 3: Philosophy (reaches full visibility at p=0.8)
    const state3 = getProgressState(p, 0.55, 0.8);
    cornerPhilosophy.style.opacity = state3.opacity;
    cornerPhilosophy.style.transform = `translateY(${state3.y}px)`;
    if (state3.opacity > 0.05) {
      cornerPhilosophy.classList.add('visible');
    } else {
      cornerPhilosophy.classList.remove('visible');
    }

    // Box 4: AI & Active Experimentation (reaches full visibility at p=0.98)
    const state4 = getProgressState(p, 0.75, 0.98);
    cornerExperiment.style.opacity = state4.opacity;
    cornerExperiment.style.transform = `translateY(${state4.y}px)`;
    if (state4.opacity > 0.05) {
      cornerExperiment.classList.add('visible');
    } else {
      cornerExperiment.classList.remove('visible');
    }
  };

  // Disable scroll animations on mobile/tablet since the layout is static (prevents style jumping and conflicts)
  const isMobileOrTablet = window.innerWidth <= 991;
  if (!isMobileOrTablet) {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Trigger initial check
  } else {
    // Reset all inline styles on mobile to ensure static visibility and clean styling
    photoWrapper.style.opacity = '1';
    photoWrapper.style.transform = '';
    if (textLeft && textRight) {
      textLeft.style.opacity = '1';
      textLeft.style.transform = '';
      textRight.style.opacity = '1';
      textRight.style.transform = '';
    }
    cornerAbout.style.opacity = '1';
    cornerAbout.style.transform = '';
    cornerPhilosophy.style.opacity = '1';
    cornerPhilosophy.style.transform = '';
    if (cornerFocus) {
      cornerFocus.style.opacity = '1';
      cornerFocus.style.transform = '';
    }
    if (cornerExperiment) {
      cornerExperiment.style.opacity = '1';
      cornerExperiment.style.transform = '';
    }
  }
}

/**
 * Fullscreen Project Showcase Gallery Modal
 */
function initProjectGalleryModal() {
  const toTurkishUppercase = (str) => {
    return str
      .replace(/i/g, 'İ')
      .replace(/ı/g, 'I')
      .toUpperCase();
  };

  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close');
  const backdrop = document.getElementById('modal-backdrop');
  const modalContainer = modal.querySelector('.modal-container');
  const contentWrapper = modal.querySelector('.modal-content-wrapper');
  const modalTitle = document.getElementById('modal-project-title');
  const modalDesc = document.getElementById('modal-project-desc');
  const galleryContent = document.getElementById('modal-gallery-content');
  const projectFooter = document.getElementById('modal-project-footer');
  const cards = document.querySelectorAll('.portfolio-slide-card');
  
  // Lightbox Zoom elements
  const lightbox = document.getElementById('zoom-lightbox');
  const lightboxImg = document.getElementById('zoom-lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  
  let database = {};
  
  // Fetch local database mapping project IDs to images/videos (with cache-busting version)
  fetch('assets/projects/database.json?v=17.52')
    .then(res => res.json())
    .then(data => {
      database = data;
    })
    .catch(err => {
      console.warn('Failed to load project database.json. Modal will use fallback covers.', err);
    });

  // Intercept clicks on project cards
  let activeCardIndex = -1;
  const cardsArray = Array.from(cards);

  const openProjectModal = (card) => {
    const titleEl = card.querySelector('.portfolio-title');
    const titleText = titleEl ? titleEl.textContent.trim() : '';
    activeCardIndex = cardsArray.findIndex(c => c.querySelector('.portfolio-title').textContent.trim() === titleText);
    if (activeCardIndex === -1) return;

    const link = card.querySelector('.portfolio-link');
    if (!link) return;

    const title = card.querySelector('.portfolio-title').textContent.trim();
    
    // Extract clean description lines
    const descEn = card.querySelector('.portfolio-desc .lang-en').textContent.trim();
    const descTr = card.querySelector('.portfolio-desc .lang-tr').textContent.trim();
    
    const coverImg = card.querySelector('.portfolio-img').src;
    
    // Parse gallery ID from Behance URL
    const href = link.getAttribute('href');
    let galleryId = null;
    if (href) {
      const match = href.match(/\/gallery\/(\d+)/);
      if (match) {
        galleryId = match[1];
      }
    }
    
    // Reset scroll in modal container before loading content
    if (modalContainer) {
      modalContainer.scrollTop = 0;
    }
    
    // Clear old content
    galleryContent.innerHTML = '';
    
    // Set title and description
    modalTitle.innerHTML = toTurkishUppercase(title);
    modalDesc.innerHTML = `<span class="lang-en">${descEn}</span><span class="lang-tr">${descTr}</span>`;
    
    // Dynamic dominant color background setup
    let modules = [];
    let dominantColor = "rgba(8, 8, 7, 0.96)"; // default fallback
    
    if (galleryId && database[galleryId]) {
      const projectData = database[galleryId];
      if (Array.isArray(projectData)) {
        modules = projectData;
      } else if (typeof projectData === 'object') {
        modules = projectData.modules || [];
        dominantColor = projectData.dominantColor || dominantColor;
      }
    }
    
    // Override background color for Tadelle Light (206242029) to be pure black
    if (galleryId === '206242029') {
      dominantColor = "#000000";
    }
    if (contentWrapper) {
      contentWrapper.style.backgroundColor = dominantColor;
      
      // Clean up any previously added project-ID classes
      const classesToRemove = Array.from(contentWrapper.classList).filter(c => c.startsWith('project-'));
      classesToRemove.forEach(c => contentWrapper.classList.remove(c));
      contentWrapper.classList.remove('light-bg', 'dark-bg');
      
      if (galleryId) {
        contentWrapper.classList.add(`project-${galleryId}`);
      }
      
      let isLight = false;
      const col = dominantColor.toLowerCase().trim();
      if (col.startsWith('#')) {
        let hex = col.replace('#', '');
        if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        if (hex.length === 6) {
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          isLight = luminance > 0.68;
        }
      } else if (col.startsWith('hsla') || col.startsWith('hsl')) {
        const match = col.match(/,\s*(\d+)%\s*(?:,|\))/);
        if (match) {
          const lightness = parseInt(match[1], 10);
          isLight = lightness > 72;
        }
      } else {
        isLight = col === 'ffffff' || col === 'd6d0ab' || col === 'e2e2e2' || col === 'e0e0dc';
      }

      if (isLight) {
        contentWrapper.classList.add('light-bg');
      } else {
        contentWrapper.classList.add('dark-bg');
      }
    }
    
    // Toggle flush layout class for seamless spacing (Behance style)
    let flushLayout = false;
    if (galleryId && database[galleryId] && typeof database[galleryId] === 'object') {
      flushLayout = !!database[galleryId].flushLayout;
    }
    if (flushLayout) {
      galleryContent.classList.add('flush-layout');
    } else {
      galleryContent.classList.remove('flush-layout');
    }
    
    // Populate sub-images/videos from database, or fallback to cover
    if (modules.length > 0) {
      let displayModules = modules;

      // Helper to inject a stylized case-study text block with inline EN/TR toggle
      const injectStoryBlock = (titleEn, titleTr, textEn, textTr) => {
        const storyBlock = document.createElement('div');
        storyBlock.className = 'modal-project-story';
        
        const isTr = document.body.classList.contains('lang-tr');
        
        storyBlock.innerHTML = `
          <div class="lang-en">
            <h4 class="story-title">${titleEn}</h4>
            <p class="story-text">${textEn}</p>
          </div>
          <div class="lang-tr">
            <h4 class="story-title">${titleTr}</h4>
            <p class="story-text">${textTr}</p>
          </div>
          <div class="story-lang-toggle">
            <button type="button" class="story-lang-btn btn-en ${!isTr ? 'active' : ''}">EN</button>
            <span class="story-lang-divider">|</span>
            <button type="button" class="story-lang-btn btn-tr ${isTr ? 'active' : ''}">TR</button>
          </div>
        `;
        
        const btnEn = storyBlock.querySelector('.btn-en');
        const btnTr = storyBlock.querySelector('.btn-tr');
        
        btnEn.addEventListener('click', (e) => {
          e.stopPropagation();
          const globalEn = document.getElementById('lang-en');
          if (globalEn) globalEn.click();
          // Update all local toggles in the view
          document.querySelectorAll('.story-lang-btn.btn-en').forEach(b => b.classList.add('active'));
          document.querySelectorAll('.story-lang-btn.btn-tr').forEach(b => b.classList.remove('active'));
        });
        
        btnTr.addEventListener('click', (e) => {
          e.stopPropagation();
          const globalTr = document.getElementById('lang-tr');
          if (globalTr) globalTr.click();
          // Update all local toggles in the view
          document.querySelectorAll('.story-lang-btn.btn-tr').forEach(b => b.classList.add('active'));
          document.querySelectorAll('.story-lang-btn.btn-en').forEach(b => b.classList.remove('active'));
        });
        
        galleryContent.appendChild(storyBlock);
      };
      
      // Special case: for Tadelle Light (Bikini season, ID 206242029)
      if (galleryId === '206242029') {
        const titleEn = "TADELLA ZERO SUGAR";
        const titleTr = "TADELLA ŞEKERSİZ";
        const textEn = `In 2017, Tadelle launched its zero-sugar chocolate just in time for the summer season. Understanding the common concern among women during this period, whether they’ll look good in a bikini, we developed a creative solution to alleviate that fear.<br><br>I conceptualized and designed a campaign centered around the anxiety women feel about fitting into their bikinis. The idea was simple yet impactful: bikinis with fearsome-looking faces, accompanied by the reassuring message, "Relax, Tadelle Zero Sugar is out."`;
        const textTr = `2017 yılında Tadelle, yaz sezonuna denk gelecek şekilde şekersiz çikolatasını piyasaya sürdü. Bu dönemde kadınlar arasında sıkça görülen endişeyi, yani bikininin içinde iyi görünüp görünmeyeceklerini anlayarak, bu korkuyu hafifletmek için yaratıcı bir çözüm geliştirdik.<br><br>Kadınların bikini giyme konusundaki endişelerini merkezine alan bir kampanya tasarladım. Fikir basit ama etkiliydi: Korkutucu yüz ifadelerine sahip bikiniler ve yanlarında rahatlatıcı bir mesaj: "Rahat ol, Tadelle Şekersiz Çıktı."`;
        
        injectStoryBlock(titleEn, titleTr, textEn, textTr);
      }

      // Special case: for Getir (ID 227451137)
      if (galleryId === '227451137') {
        const titleEn = "THE VISUAL JOURNEY OF A GLOBAL PIONEER";
        const titleTr = "KÜRESEL BİR ÖNCÜNÜN GÖRSEL YOLCULUĞU";
        const textEn = "Founded in Turkey as the pioneer of ultra-fast grocery delivery, Getir rapidly transformed into a global success story, achieving unicorn and subsequently decacorn status. During this exponential expansion stretching from Istanbul to major metropolises like London, Berlin, Amsterdam, and New York, I took on design responsibilities shaping the brand's visual universe. Leading design efforts across Turkey, Europe, and the US markets, I drove the localization of Getir's friendly and dynamic visual identity on a global scale and oversaw high-visibility executions such as the Citi Field stadium branding.";
        const textTr = "Türkiye'de doğan ve ultra hızlı teslimat modelinin dünyadaki öncüsü olan Getir, kısa sürede küresel bir başarı hikayesine dönüşerek önce unicorn, ardından decacorn unvanını kazandı. İstanbul'dan başlayıp Londra, Berlin, Amsterdam ve New York gibi dünya metropollerine uzanan bu agresif büyüme sürecinde, markanın görsel dünyasını ve tasarım dilini şekillendiren kreatif ekibin içerisinde yer aldım. Türkiye, Avrupa ve ABD pazarlarındaki lansman süreçlerinde tasarım sorumluluğunu üstlenerek, Getir'in samimi ve dinamik marka kimliğinin küresel ölçekte yerelleştirilmesine ve Citi Field stadyum entegrasyonu gibi yüksek görünürlüklü projelerin hayata geçirilmesine katkı sağladım.";
        
        injectStoryBlock(titleEn, titleTr, textEn, textTr);
      }

      // Special case: for Letgo (ID 80040463)
      if (galleryId === '80040463') {
        const titleEn = "LETGO #ITEMSFORSTUDENTS";
        const titleTr = "LETGO #ÖĞRENCİYEEŞYA";
        const textEn = "At letgo, we launched the \"#ItemsForStudents\" (Öğrenciye Eşya) social solidarity movement to support students facing difficulties setting up their new homes. As part of this initiative, we introduced a \"Free Items\" category in our app, enabling people to list their excess belongings so students can receive them completely free of charge.<br><br>We aim to raise awareness against both the financial struggles associated with student life and the societal prejudices regarding renting homes to students. Users can easily list their spare items in this category to support a student nearby. This movement garnered massive engagement and positive feedback across Turkey.<br><br>#ItemsForStudents turned into a nationwide wave of kindness, strengthening sharing and solidarity. And it all started with a video...";
        const textTr = "Letgo olarak, öğrencilerin ev kurma süreçlerindeki zorluklara destek olmak için \"Öğrenciye Eşya\" adlı sosyal dayanışma hareketini başlattık. Bu kapsamda, uygulamamızda \"Ücretsiz Eşya\" kategorisini kullanıma açarak, ihtiyaç fazlası eşyaların öğrencilere ücretsiz olarak ulaşmasını sağlıyoruz.<br><br>Hem öğrencilikle özdeşleşen maddi sıkıntılar hem de toplumun \"öğrenciye ev verme\" konusundaki önyargılarına karşı bir farkındalık oluşturmayı hedefliyoruz. Kullanıcılar, ihtiyaç fazlası eşyalarını bu kategoriye ekleyerek, yakınlardaki bir öğrenciye destek olabiliyor. Bu hareketimiz, Türkiye genelinde büyük ilgi gördü.<br><br>#ÖğrenciyeEşya, paylaşım ve dayanışmayı güçlendiren bir iyilik hareketine dönüştü! Her şey bir video ile başladı...";
        
        injectStoryBlock(titleEn, titleTr, textEn, textTr);
      }

      // Special case: for Pineapple NFT (ID 999999999)
      if (galleryId === '999999999') {
        const titleEn = "PINEAPPLE NFT COLLECTION";
        const titleTr = "PINEAPPLE NFT KOLEKSİYONU";
        const textEn = "Inspired by the digital art and collectibility ecosystem of the NFT era, I developed a character design project generated from a single base form. Using a pineapple as the foundation, I superimposed various social archetypes, pop culture references, and digital identities. Featuring distinct personas such as the devil, the snob, the king, the tech-addict, the nasty, and the boy, this collection showcases my digital illustration and character serialization skills. The project stands as a creative experiment demonstrating how a single visual blueprint can be transformed into a diverse collection of narrative-driven digital assets through distinct accessories and details.";
        const textTr = "NFT çağının dijital sanat ve koleksiyonculuk ekosisteminden ilham alarak, tek bir temel formdan türetilen bir karakter tasarımı projesi geliştirdim. Temel olarak bir ananası kullanarak; üzerine çeşitli sosyal arketipleri, popüler kültür referanslarını ve dijital kimlikleri yerleştirdim. Şeytan, züppe, kral, teknoloji bağımlısı, yaramaz ve çocuk gibi farklı karakterleri barındıran bu koleksiyon, dijital illüstrasyon ve karakter serileştirme becerilerimi sergiliyor. Proje, farklı aksesuarlar ve detaylar aracılığıyla tek bir görsel şablonun hikaye odaklı, çeşitli bir dijital varlık koleksiyonuna nasıl dönüştürülebileceğini gösteren yaratıcı bir deney niteliğindedir.";
        
        injectStoryBlock(titleEn, titleTr, textEn, textTr);
      }

      // Special case: for Graphic Activism (ID 888888888)
      if (galleryId === '888888888') {
        const titleEn = "SOCIAL RESPONSIBILITY & GRAPHIC ACTIVISM";
        const titleTr = "SOSYAL SORUMLULUK & GRAFİK AKTİVİZM";
        const textEn = "Design is not merely a tool for commercial objectives; it is a powerful language of social advocacy voicing contemporary issues, human rights, and the relationship between technology and society. This collection compiles poster designs created under the umbrella of social responsibility. Centered on modern crises such as the impact of artificial intelligence on human values, digital isolation, and the irrational empathy of human nature, these works represent graphic activism experiments that merge conceptual thinking with visual craftsmanship. Each piece aims to raise social awareness and invite the audience to reflect on the deeper meanings of being human.";
        const textTr = "Tasarım, sadece ticari hedeflere hizmet eden bir araç değil; toplumsal meselelere, insan haklarına ve teknoloji ile toplum ilişkisine ses veren güçlü bir sosyal savunuculuk dilidir. Bu koleksiyonda, sosyal sorumluluk temaları altında ele aldığım afiş çalışmalarımı bir araya getirdim. Yapay zekanın insani değerler üzerindeki etkisi, dijitalleşmenin getirdiği yalnızlaşma ve insan doğasının irrasyonel şefkati gibi çağdaş krizleri merkezine alan bu işler, kavramsal düşünceyi görsel zanaatla birleştiren birer grafik aktivizm deneyidir. Her bir çalışma, toplumsal farkındalık yaratmayı ve izleyiciyi insan olmanın derin anlamları üzerine düşünmeye davet etmeyi amaçlar.";
        
        injectStoryBlock(titleEn, titleTr, textEn, textTr);
      }
      
      let sectionHeaderCount = 0;
      displayModules.forEach(mod => {
        if (mod.type === 'image') {
          const img = document.createElement('img');
          img.src = mod.src;
          img.alt = title;
          img.loading = 'lazy';
          if (mod.src.includes('image_4.png') || mod.src.includes('image_6.png') || mod.src.includes('image_20.png') || mod.src.includes('image_22.png')) {
            img.classList.add('shrunk-image');
          }
          galleryContent.appendChild(img);
        } else if (mod.type === 'activism-poster') {
          const posterWrapper = document.createElement('div');
          posterWrapper.className = 'modal-poster-wrapper';
          
          const img = document.createElement('img');
          img.src = mod.src;
          img.alt = mod.brief;
          img.className = 'modal-poster-img';
          img.loading = 'lazy';
          
          const labelContainer = document.createElement('div');
          labelContainer.className = 'activism-label';
          
          const spacedBrief = mod.brief.split('').map(char => char === ' ' ? '&nbsp;&nbsp;' : char).join(' ');
          
          labelContainer.innerHTML = `
            <div class="label-year-col">
              <div class="label-text-element text-delay-1 year-top">${mod.year.substring(0, 2)}</div>
              <div class="label-text-element text-delay-1 year-bottom">${mod.year.substring(2, 4)}</div>
            </div>
            
            <div class="label-right-area">
              <div class="label-top-row">
                <div class="label-category">
                  <div class="label-text-element text-delay-2 value-text">Social Responsibility and Graphic Activism</div>
                </div>
                <div class="label-creative-header">
                  <div class="label-text-element text-delay-3 flex-center-wrapper">
                    <span class="rotated-label">CREATIVE</span>
                  </div>
                </div>
                <div class="label-name">
                  <div class="label-text-element text-delay-3 name-first">B U R A K</div>
                  <div class="label-text-element text-delay-3 name-last">H E L L E G U</div>
                </div>
                <div class="label-strategy-header">
                  <div class="label-text-element text-delay-4 flex-center-wrapper">
                    <span class="rotated-label">STRATEGY</span>
                  </div>
                </div>
              </div>
              
              <div class="label-bottom-row">
                <div class="label-brief-header">
                  <div class="label-text-element text-delay-3 flex-center-wrapper">
                    <span class="rotated-label">BRIEF</span>
                  </div>
                </div>
                <div class="label-brief-value">
                  <span class="label-text-element text-delay-4">${spacedBrief}</span>
                </div>
              </div>
            </div>
          `;
          
          posterWrapper.appendChild(img);
          posterWrapper.appendChild(labelContainer);
          galleryContent.appendChild(posterWrapper);
        } else if (mod.type === 'video') {
          const videoContainer = document.createElement('div');
          videoContainer.className = 'modal-video-container';
          if (mod.src) {
            videoContainer.innerHTML = `
              <video class="modal-video-player" src="${mod.src}" autoplay loop muted playsinline controls style="width: 100%; display: block; border-radius: 6px;"></video>
            `;
          } else {
            videoContainer.innerHTML = mod.embed;
          }
          galleryContent.appendChild(videoContainer);
        } else if (mod.type === 'text') {
          const textBlock = document.createElement('div');
          textBlock.className = 'modal-text-module';
          textBlock.innerHTML = `
            <div class="lang-en">${mod.textEn}</div>
            <div class="lang-tr">${mod.textTr}</div>
          `;
          galleryContent.appendChild(textBlock);
        } else if (mod.type === 'credits') {
          const creditsBlock = document.createElement('div');
          creditsBlock.className = 'modal-credits-module modal-text-module';
          creditsBlock.innerHTML = `
            <div class="lang-en">${mod.textEn}</div>
            <div class="lang-tr">${mod.textTr}</div>
          `;
          galleryContent.appendChild(creditsBlock);
        } else if (mod.type === 'section-header') {
          sectionHeaderCount++;
          const projectNoStr = sectionHeaderCount.toString().padStart(2, '0');
          const headerBlock = document.createElement('div');
          headerBlock.className = 'modal-section-header modal-section-grid';
          
          let locationEn = mod.locationEn || 'GLOBAL';
          let locationTr = mod.locationTr || 'GLOBAL';
          if (mod.flag === 'uk') {
            locationEn = 'UNITED KINGDOM';
            locationTr = 'BİRLEŞİK KRALLIK';
          } else if (mod.flag === 'us') {
            locationEn = 'UNITED STATES';
            locationTr = 'AMERİKA BİRLEŞİK DEVLETLERİ';
          } else if (mod.flag === 'tr') {
            locationEn = 'TURKEY';
            locationTr = 'TÜRKİYE';
          }

          const disciplineEn = mod.disciplineEn || 'ADVERTISING / CREATIVE';
          const disciplineTr = mod.disciplineTr || 'REKLAM / YARATICI';
          const tagEn = mod.tagEn || 'NEW PROJECT';
          const tagTr = mod.tagTr || 'YENİ PROJE';

          headerBlock.innerHTML = `
            <div class="border-line-top"></div>
            <div class="border-line-bottom"></div>
            <div class="border-line-left"></div>
            <div class="border-line-right"></div>
            <div class="border-line-middle-v"></div>
            <div class="border-line-middle-h"></div>
            
            <div class="grid-col-left">
              <div class="grid-title">
                <span class="lang-en">${mod.labelEn || mod.titleEn}</span>
                <span class="lang-tr">${mod.labelTr || mod.titleTr}</span>
              </div>
            </div>
            <div class="grid-col-right">
              <div class="grid-row-top">
                <div class="grid-discipline">
                  <span class="lang-en">${disciplineEn}</span>
                  <span class="lang-tr">${disciplineTr}</span>
                </div>
                <div class="grid-tag">
                  <span class="lang-en">${tagEn}</span>
                  <span class="lang-tr">${tagTr}</span>
                </div>
              </div>
              <div class="grid-row-bottom">
                <div class="grid-location">
                  <span class="lang-en">${locationEn}</span>
                  <span class="lang-tr">${locationTr}</span>
                </div>
                <div class="grid-number">${projectNoStr}</div>
              </div>
            </div>
          `;
          galleryContent.appendChild(headerBlock);
        }
      });
    } else {
      // Fallback: render the cover image
      const fallbackImg = document.createElement('img');
      fallbackImg.src = coverImg;
      fallbackImg.alt = title;
      galleryContent.appendChild(fallbackImg);
    }
    
    // Populate footer area
    projectFooter.innerHTML = `
      <div class="footer-details-grid">
        <div class="footer-detail-item">
          <span class="footer-detail-label">Project / Proje</span>
          <span class="footer-detail-value">${title}</span>
        </div>
        <div class="footer-detail-item">
          <span class="footer-detail-label">Creative / Kreatif</span>
          <span class="footer-detail-value">
            <span class="lang-en">Burak Hellagu</span>
            <span class="lang-tr">Burak Hellagü</span>
          </span>
        </div>
      </div>
      <button class="modal-contact-cta-btn" id="modal-footer-contact-btn">
        <span class="lang-en">Start a Project &rsaquo;</span>
        <span class="lang-tr">Proje Başlatın &rsaquo;</span>
      </button>
    `;

    // Bind click handler for Contact button
    const footerContactBtn = document.getElementById('modal-footer-contact-btn');
    if (footerContactBtn) {
      footerContactBtn.addEventListener('click', () => {
        closeModal();
        setTimeout(() => {
          const contactSection = document.getElementById('contact');
          if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 400);
      });
    }
    
    // Force update of language overlays for new button nodes inside the footer
    if (typeof updateLanguageDisplay === 'function') {
      updateLanguageDisplay();
    }
    
    // Set up scroll-reveal IntersectionObserver inside modal container
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          
          if (entry.target.classList.contains('modal-video-container')) {
            const iframe = entry.target.querySelector('iframe');
            if (iframe && iframe.src && !iframe.src.includes('autoplay=')) {
              let separator = iframe.src.includes('?') ? '&' : '?';
              iframe.setAttribute('allow', 'autoplay');
              iframe.src = iframe.src + separator + 'autoplay=1&muted=1';
            }
          }
          
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: modalContainer,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.02
    });
    
    // Observe all elements inside the gallery container
    setTimeout(() => {
      const revealItems = galleryContent.querySelectorAll('img, .modal-video-container, .modal-section-header, .modal-text-module, .activism-label');
      revealItems.forEach(item => {
        revealObserver.observe(item);
      });
    }, 50);
    
    // Bind click-to-zoom event listeners on newly generated image nodes
    setTimeout(() => {
      const images = galleryContent.querySelectorAll('img');
      images.forEach(img => {
        img.addEventListener('click', (e) => {
          e.stopPropagation();
          lightboxImg.src = img.src;
          lightbox.classList.add('active');
          lightbox.setAttribute('aria-hidden', 'false');
        });
      });
    }, 100);
    
    // Open modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    
    // Focus close button
    setTimeout(() => {
      closeBtn.focus();
    }, 100);
  };

  // Bind click handlers to cards via delegation on the track parent
  const trackElement = document.getElementById('portfolio-track');
  if (trackElement) {
    trackElement.style.cursor = 'pointer';
    trackElement.addEventListener('click', (e) => {
      const card = e.target.closest('.portfolio-slide-card');
      if (card) {
        e.preventDefault();
        openProjectModal(card);
      }
    });
  }
  
  const closeModal = () => {
    // Pause standard videos and clear dynamic content to stop all iframes, youtube/vimeo, and audio
    const videos = modal.querySelectorAll('video');
    videos.forEach(video => {
      try {
        video.pause();
      } catch (e) {}
    });

    if (galleryContent) {
      galleryContent.innerHTML = '';
    }

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };
  
  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
  };
  
  const showPrevProject = () => {
    if (activeCardIndex === -1) return;
    let prevIndex = activeCardIndex - 1;
    if (prevIndex < 0) {
      prevIndex = cardsArray.length - 1;
    }
    openProjectModal(cardsArray[prevIndex]);
  };

  const showNextProject = () => {
    if (activeCardIndex === -1) return;
    let nextIndex = activeCardIndex + 1;
    if (nextIndex >= cardsArray.length) {
      nextIndex = 0;
    }
    openProjectModal(cardsArray[nextIndex]);
  };

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  if (modalContainer) {
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) {
        closeModal();
      }
    });
  }

  // Prev/Next buttons
  const prevBtn = document.getElementById('modal-prev-btn');
  const nextBtn = document.getElementById('modal-next-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showPrevProject();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showNextProject();
    });
  }

  // Vertical Contact link next to design area
  const modalVerticalContact = document.getElementById('modal-vertical-contact');
  if (modalVerticalContact) {
    modalVerticalContact.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
      setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 400);
    });
  }
  
  // Close Lightbox click handlers
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', closeLightbox);
  
  // Close on Escape / Navigate on Arrow keys
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox.classList.contains('active')) {
        closeLightbox();
      } else if (modal.classList.contains('active')) {
        closeModal();
      }
    } else if (modal.classList.contains('active') && !lightbox.classList.contains('active')) {
      if (e.key === 'ArrowLeft') {
        showPrevProject();
      } else if (e.key === 'ArrowRight') {
        showNextProject();
      }
    }
  });

  // Helper to open project modal by title name
  window.openProjectByName = (name) => {
    const targetCard = Array.from(cards).find(card => {
      const titleEl = card.querySelector('.portfolio-title');
      return titleEl && titleEl.textContent.trim().toLowerCase() === name.toLowerCase();
    });
    if (targetCard) {
      openProjectModal(targetCard);
    }
  };

  // Intercept click on award cards to open inside the page instead of Behance
  const awardCards = document.querySelectorAll('.award-card');
  awardCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      
      let targetProject = null;
      if (card.classList.contains('award-posterheroes')) {
        targetProject = 'Poster Heroes';
      } else if (card.classList.contains('award-effie')) {
        targetProject = 'Letgo';
      } else if (card.classList.contains('award-genckirmizi')) {
        targetProject = 'Öğrenci Filmleri';
      } else if (card.classList.contains('award-kristalelma') || card.classList.contains('award-epica')) {
        targetProject = 'Tadelle';
      }
      
      if (targetProject) {
        window.openProjectByName(targetProject);
      }
    });
  });
}

/**
 * Real-time Scroll-linked Portfolio Header Animations
 * Animates the expanding horizontal lines, sliding labels, and fade/shift of large titles
 */
function initPortfolioHeaderScrollAnimation() {
  const header = document.getElementById('portfolio-architect-header');
  if (!header) return;

  const lines = header.querySelectorAll('.architect-header-line');
  const titleTop = header.querySelector('.title-top');
  const titleBottom = header.querySelector('.title-bottom');
  const labelLeft = header.querySelector('.small-text-left');
  const labelRight = header.querySelector('.small-text-right');

  const updateHeaderAnimation = () => {
    const rect = header.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Start animating when the top of the header enters viewport
    // End animating when the top of the header reaches 25% of viewport height
    const startOffset = viewportHeight;
    const endOffset = viewportHeight * 0.25;

    const currentPos = rect.top;

    let progress = 0;
    if (currentPos <= startOffset) {
      progress = (startOffset - currentPos) / (startOffset - endOffset);
      progress = Math.max(0, Math.min(1, progress)); // Clamp between 0 and 1
    }

    // Apply animations inline to match scroll progress smoothly
    lines.forEach(line => {
      line.style.transform = `scaleX(${progress})`;
      line.style.transition = 'none';
    });

    if (titleTop) {
      titleTop.style.opacity = progress;
      titleTop.style.transform = `translateY(${(1 - progress) * 20}px)`;
      titleTop.style.transition = 'none';
    }
    if (titleBottom) {
      titleBottom.style.opacity = progress;
      titleBottom.style.transform = `translateY(${(1 - progress) * 20}px)`;
      titleBottom.style.transition = 'none';
    }

    if (labelLeft) {
      labelLeft.style.opacity = progress;
      labelLeft.style.transform = `translateX(${(1 - progress) * -80}px)`;
      labelLeft.style.transition = 'none';
    }
    if (labelRight) {
      labelRight.style.opacity = progress;
      labelRight.style.transform = `translateX(${(1 - progress) * 80}px)`;
      labelRight.style.transition = 'none';
    }
  };

  window.addEventListener('scroll', updateHeaderAnimation, { passive: true });
  window.addEventListener('resize', updateHeaderAnimation, { passive: true });
  updateHeaderAnimation(); // Run initial state check
}

/**
 * Synchronized Scroll and Active Scaling for Experience Roles & Awards
 * Scrolling the left timeline automatically scrolls the right awards,
 * and sets active (scaled up, high contrast) states on current elements.
 */
function initExperienceSyncScroll() {
  const rolesScroll = document.getElementById('roles-scroll-container');
  const awardsScroll = document.getElementById('awards-scroll-container');
  
  if (!rolesScroll || !awardsScroll) return;

  let isScrollingRoles = false;
  let isScrollingAwards = false;

  const updateActiveStates = () => {
    // 1. Calculate active role (closest to container top threshold with boundary snapping)
    const roleItems = rolesScroll.querySelectorAll('.timeline-item');
    const maxRolesScroll = rolesScroll.scrollHeight - rolesScroll.clientHeight;
    let activeRoleIndex = 0;
    
    if (rolesScroll.scrollTop >= maxRolesScroll - 15) {
      activeRoleIndex = roleItems.length - 1;
    } else if (rolesScroll.scrollTop <= 10) {
      activeRoleIndex = 0;
    } else {
      const rolesContainerRect = rolesScroll.getBoundingClientRect();
      const rolesTargetY = rolesContainerRect.top + 40; // 40px top threshold offset
      let minDistanceRole = Infinity;
      
      roleItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const dist = Math.abs(rect.top - rolesTargetY);
        
        if (dist < minDistanceRole) {
          minDistanceRole = dist;
          activeRoleIndex = index;
        }
      });
    }

    roleItems.forEach((item, index) => {
      if (index === activeRoleIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // 2. Calculate active award (closest to container top threshold with boundary snapping)
    const awardCards = awardsScroll.querySelectorAll('.award-card');
    const maxAwardsScroll = awardsScroll.scrollHeight - awardsScroll.clientHeight;
    let activeAwardIndex = 0;

    if (awardsScroll.scrollTop >= maxAwardsScroll - 15) {
      activeAwardIndex = awardCards.length - 1;
    } else if (awardsScroll.scrollTop <= 10) {
      activeAwardIndex = 0;
    } else {
      const awardsContainerRect = awardsScroll.getBoundingClientRect();
      const awardsTargetY = awardsContainerRect.top + 40; // 40px top threshold offset
      let minDistanceAward = Infinity;

      awardCards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const dist = Math.abs(rect.top - awardsTargetY);

        if (dist < minDistanceAward) {
          minDistanceAward = dist;
          activeAwardIndex = index;
        }
      });
    }

    awardCards.forEach((card, index) => {
      if (index === activeAwardIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  };

  // Sync scroll left -> right
  rolesScroll.addEventListener('scroll', () => {
    if (isScrollingAwards) return;
    isScrollingRoles = true;
    
    const progress = rolesScroll.scrollTop / (rolesScroll.scrollHeight - rolesScroll.clientHeight);
    awardsScroll.scrollTop = progress * (awardsScroll.scrollHeight - awardsScroll.clientHeight);
    
    updateActiveStates();
    
    requestAnimationFrame(() => {
      isScrollingRoles = false;
    });
  }, { passive: true });

  // Sync scroll right -> left
  awardsScroll.addEventListener('scroll', () => {
    if (isScrollingRoles) return;
    isScrollingAwards = true;

    const progress = awardsScroll.scrollTop / (awardsScroll.scrollHeight - awardsScroll.clientHeight);
    rolesScroll.scrollTop = progress * (rolesScroll.scrollHeight - rolesScroll.clientHeight);

    updateActiveStates();

    requestAnimationFrame(() => {
      isScrollingAwards = false;
    });
  }, { passive: true });

  // Update hover mouse glows on awards for the stack
  const awardCards = awardsScroll.querySelectorAll('.award-card');
  awardCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }, { passive: true });
  });

  // Intercept scroll wheel events inside the experience grid container (columns + gutter)
  // to scroll the timeline and awards in sync.
  const experienceGrid = document.getElementById('experience-grid');
  if (experienceGrid) {
    experienceGrid.addEventListener('wheel', (e) => {
      const maxScroll = rolesScroll.scrollHeight - rolesScroll.clientHeight;
      const isAtTop = rolesScroll.scrollTop <= 0;
      const isAtBottom = rolesScroll.scrollTop >= maxScroll;

      if (e.deltaY > 0 && !isAtBottom) {
        e.preventDefault();
        rolesScroll.scrollTop += e.deltaY;
      } else if (e.deltaY < 0 && !isAtTop) {
        e.preventDefault();
        rolesScroll.scrollTop += e.deltaY;
      }
    }, { passive: false });
  }

  // Initial trigger
  setTimeout(updateActiveStates, 100);
}


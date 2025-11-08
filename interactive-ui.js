// Interactive UI Enhancements for Sparsh NFC
// Adds animations, transitions, and smooth interactions across all pages

// Smooth scroll behavior
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#!') {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Add fade-in animation to elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with fade-in class
    document.querySelectorAll('.fade-in, .feature-badge, section').forEach(el => {
        observer.observe(el);
    });

    // Add interactive hover effects to buttons
    document.querySelectorAll('.cta-primary, .cta-secondary, button, a[class*="cta"]').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.2s ease';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
        });
        btn.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1.05)';
        });
    });

    // Add loading states to forms
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                const originalText = submitBtn.textContent || submitBtn.value;
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.7';
                submitBtn.style.cursor = 'not-allowed';
                
                // Restore after timeout if form doesn't redirect
                setTimeout(() => {
                    if (!form.hasAttribute('data-redirecting')) {
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = '1';
                        submitBtn.style.cursor = 'pointer';
                        if (submitBtn.textContent) {
                            submitBtn.textContent = originalText;
                        } else {
                            submitBtn.value = originalText;
                        }
                    }
                }, 5000);
            }
        });
    });

    // Add real-time form validation feedback
    document.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('invalid')) {
                validateField(this);
            }
        });
    });

    // Add floating label effect
    document.querySelectorAll('.form-input').forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label && input.value) {
            label.classList.add('active');
        }
        
        input.addEventListener('focus', function() {
            if (label) label.classList.add('active');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value && label) label.classList.remove('active');
        });
    });

    // Add ripple effect to buttons
    document.querySelectorAll('button, .cta-primary, .cta-secondary, a[class*="cta"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add page transition animation (skip if marked no-transition)
    document.querySelectorAll('a[href]:not([href^="#"]):not([href^="javascript:"]):not([href^="mailto:"]):not([href^="tel:"])').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.classList.contains('no-transition')) return;
            if (this.hostname === window.location.hostname || !this.hostname) {
                const targetUrl = this.href;
                if (targetUrl && !targetUrl.includes('#')) {
                    e.preventDefault();
                    document.body.style.opacity = '0';
                    document.body.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => {
                        window.location.href = targetUrl;
                    }, 300);
                }
            }
        });
    });

    // Mobile menu fallback (if page hasn't bound handlers)
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    let mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');

    // Create a backdrop if missing
    if (!mobileMenuBackdrop && mobileMenu) {
        mobileMenuBackdrop = document.createElement('div');
        mobileMenuBackdrop.id = 'mobile-menu-backdrop';
        mobileMenuBackdrop.className = 'lg:hidden fixed inset-0 bg-slate-900/40 z-30 opacity-0 pointer-events-none transition-opacity duration-300';
        mobileMenuBackdrop.style.top = '0';
        document.body.appendChild(mobileMenuBackdrop);
    }

    if (mobileMenuBtn && mobileMenu && !mobileMenuBtn.dataset.bound) {
        mobileMenuBtn.dataset.bound = 'true';

        // Ensure menu starts closed
        if (!mobileMenu.classList.contains('-translate-x-full')) {
            mobileMenu.classList.add('-translate-x-full');
        }

        const toggle = () => {
            const isOpen = !mobileMenu.classList.contains('-translate-x-full');
            if (isOpen) {
                mobileMenu.classList.add('-translate-x-full');
                mobileMenu.classList.add('pointer-events-none');
                mobileMenuBackdrop && mobileMenuBackdrop.classList.add('opacity-0', 'pointer-events-none');
                menuIcon && menuIcon.classList.remove('hidden');
                closeIcon && closeIcon.classList.add('hidden');
                document.body.style.overflow = '';
            } else {
                mobileMenu.classList.remove('-translate-x-full');
                mobileMenu.classList.remove('pointer-events-none');
                mobileMenuBackdrop && mobileMenuBackdrop.classList.remove('opacity-0', 'pointer-events-none');
                menuIcon && menuIcon.classList.add('hidden');
                closeIcon && closeIcon.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                // Update cart count badge in mobile menu if available
                if (typeof getCartCount === 'function') {
                    const count = getCartCount();
                    const mobileCartCount = document.getElementById('mobile-cart-count');
                    if (mobileCartCount) {
                        mobileCartCount.textContent = count;
                        mobileCartCount.style.display = count > 0 ? 'inline-flex' : 'none';
                    }
                }
            }
            mobileMenuBtn.setAttribute('aria-expanded', String(!isOpen));
        };

        mobileMenuBtn.addEventListener('click', toggle);
        mobileMenuBtn.setAttribute('aria-controls', 'mobile-menu');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');

        if (mobileMenuBackdrop) {
            mobileMenuBackdrop.addEventListener('click', () => {
                if (!mobileMenu.classList.contains('-translate-x-full')) toggle();
            });
        }

        // Close when resizing to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024 && !mobileMenu.classList.contains('-translate-x-full')) {
                toggle();
            }
        });

        // Close menu when clicking on menu items (except toggles)
        mobileMenu.querySelectorAll('.mobile-menu-item').forEach(item => {
            item.addEventListener('click', function() {
                if (!this.id || !this.id.includes('toggle')) {
                    if (!mobileMenu.classList.contains('-translate-x-full')) toggle();
                }
            });
        });

        // Optional: bind submenu toggles if present
        const shopToggle = document.getElementById('mobile-shop-toggle');
        const learnToggle = document.getElementById('mobile-learn-toggle');
        const shopSubmenu = document.getElementById('mobile-shop-submenu');
        const learnSubmenu = document.getElementById('mobile-learn-submenu');
        if (shopToggle && shopSubmenu) {
            shopToggle.addEventListener('click', function() {
                shopSubmenu.classList.toggle('hidden');
                const svg = this.querySelector('svg');
                svg && svg.classList.toggle('rotate-180');
            });
        }
        if (learnToggle && learnSubmenu) {
            learnToggle.addEventListener('click', function() {
                learnSubmenu.classList.toggle('hidden');
                const svg = this.querySelector('svg');
                svg && svg.classList.toggle('rotate-180');
            });
        }
    }
});

// Field validation function
function validateField(field) {
    const isValid = field.checkValidity();
    
    if (isValid) {
        field.classList.remove('invalid');
        field.classList.add('valid');
        const errorMsg = field.parentNode.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    } else {
        field.classList.remove('valid');
        field.classList.add('invalid');
        showFieldError(field);
    }
}

// Show field error message
function showFieldError(field) {
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) return;
    
    const errorMsg = document.createElement('span');
    errorMsg.className = 'error-message text-red-500 text-xs mt-1 block';
    errorMsg.textContent = field.validationMessage || 'Please fill in this field correctly.';
    field.parentNode.appendChild(errorMsg);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    /* Fade-in animation */
    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in-visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Ripple effect */
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    /* Form validation styles */
    .form-input.valid {
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    
    .form-input.invalid {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    /* Loading spinner */
    .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    /* Pulse animation */
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
    
    .pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    /* Smooth transitions for interactive elements */
    button, a, .cta-primary, .cta-secondary {
        position: relative;
        overflow: hidden;
    }
    
    /* Card hover effects */
    .feature-badge:hover {
        transform: translateY(-5px);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    /* Input focus effects */
    .form-input:focus {
        transform: scale(1.01);
        transition: transform 0.2s ease;
    }

    /* Click-through for cart badge to not block adjacent buttons */
    #cart-count-badge { pointer-events: none; }
    /* Ensure mobile menu btn stays above sibling elements */
    #mobile-menu-btn { position: relative; z-index: 70; }

    /* Mobile improvements */
    @media (max-width: 640px) {
        #cart-count-badge {
            top: 3px !important;
            right: 4px !important;
            width: 22px !important;
            height: 22px !important;
            font-size: 12px !important;
            z-index: 100 !important;
        }
        .quantity-input {
            min-width: 64px;
            padding: 0.5rem 0.75rem;
        }
        .mobile-menu-item, #mobile-menu button, #mobile-menu a {
            min-height: 48px;
        }
    }
`;

document.head.appendChild(style);

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.interactiveUI = {
        validateField,
        showFieldError
    };
}


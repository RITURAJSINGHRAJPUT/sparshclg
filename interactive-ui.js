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

    // Add page transition animation
    document.querySelectorAll('a[href]:not([href^="#"]):not([href^="javascript:"]):not([href^="mailto:"]):not([href^="tel:"])').forEach(link => {
        link.addEventListener('click', function(e) {
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
`;

document.head.appendChild(style);

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.interactiveUI = {
        validateField,
        showFieldError
    };
}


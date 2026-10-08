document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. AURORA CANVAS BACKGROUND
    // =========================================================================
    const canvas = document.getElementById('aurora-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let W, H, orbs = [], mouse = { x: 0, y: 0 };
    let isDark = localStorage.getItem('theme') !== 'light';

    if (canvas && ctx) {
        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        class Orb {
            constructor() {
                this.x = Math.random() * W;
                this.y = Math.random() * H;
                this.r = 160 + Math.random() * 260; // 160-420px radius, soft and diffuse
                this.vx = (Math.random() - 0.5) * 0.25;
                this.vy = (Math.random() - 0.5) * 0.25;
                // Single restrained hue family (cobalt/indigo, ~222-234) so the
                // background reads as a quiet ambient wash rather than a
                // multicolor glow.
                this.hue = 222 + Math.random() * 12;
                this.alpha = 0.15 + Math.random() * 0.15;
                this.alphaDir = Math.random() > 0.5 ? 0.002 : -0.002;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Drift slightly towards/away from mouse
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                this.x += dx * 0.0002;
                this.y += dy * 0.0002;

                if (this.x < -this.r) this.x = W + this.r;
                if (this.x > W + this.r) this.x = -this.r;
                if (this.y < -this.r) this.y = H + this.r;
                if (this.y > H + this.r) this.y = -this.r;

                this.alpha += this.alphaDir;
                if (this.alpha > 0.3 || this.alpha < 0.08) this.alphaDir *= -1;
            }
            draw() {
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
                const maxAlpha = isDark ? this.alpha : this.alpha * 0.35; // Support dark/light mode
                gradient.addColorStop(0, `hsla(${this.hue}, 70%, 58%, ${maxAlpha})`);
                gradient.addColorStop(1, `hsla(${this.hue}, 70%, 58%, 0)`);
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < 5; i++) orbs.push(new Orb());

        function drawFrame() {
            ctx.clearRect(0, 0, W, H);
            orbs.forEach(orb => {
                orb.update();
                orb.draw();
            });
            requestAnimationFrame(drawFrame);
        }
        drawFrame();
    }

    // =========================================================================
    // 2. CUSTOM CURSOR
    // =========================================================================
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    let cursorX = 0, cursorY = 0, ringX = 0, ringY = 0;

    if (cursorDot && cursorRing) {
        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            cursorDot.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        });

        function renderCursor() {
            ringX += (cursorX - ringX) * 0.13;
            ringY += (cursorY - ringY) * 0.13;
            cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
            requestAnimationFrame(renderCursor);
        }
        renderCursor();

        const interactiveSelectors = '.glass-card, a, button, .gallery-item, .project-card';
        document.querySelectorAll(interactiveSelectors).forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    // =========================================================================
    // 3. THEME TOGGLE
    // =========================================================================
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        const themeIcon = document.getElementById('theme-icon');
        const themeLabel = document.getElementById('theme-label');

        function renderThemeControl(theme) {
            if (themeIcon) themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
            if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
        }

        const currentTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        isDark = currentTheme === 'dark';
        renderThemeControl(currentTheme);

        themeBtn.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            theme = theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            isDark = theme === 'dark';
            renderThemeControl(theme);
        });
    }

    // =========================================================================
    // 4. HAMBURGER MOBILE MENU
    // =========================================================================
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    
    function closeMobileNav() {
        if (hamburger && mobileNav) {
            hamburger.classList.remove('open');
            mobileNav.classList.remove('open');
        }
    }
    
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mobileNav.classList.toggle('open');
        });

        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileNav);
        });
    }

    // =========================================================================
    // 5. SCROLL REVEAL (IntersectionObserver)
    // =========================================================================
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));

    // =========================================================================
    // 6. GPA BAR ANIMATION
    // =========================================================================
    const gpaBar = document.getElementById('gpa-bar');
    if (gpaBar) {
        const gpaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const percentage = (3.86 / 4) * 100;
                    gpaBar.style.width = `${percentage}%`;
                    gpaObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        gpaObserver.observe(gpaBar.parentElement || gpaBar);
    }

    // =========================================================================
    // 7. ACTIVE NAV LINK ON SCROLL
    // =========================================================================
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav a');
    const mainNav = document.getElementById('main-nav');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href')?.includes(current)) {
                link.classList.add('active');
            }
        });

        if (mainNav) {
            mainNav.classList.toggle('scrolled', window.scrollY > 40);
        }
    });

    // =========================================================================
    // 8. TYPING EFFECT
    // =========================================================================
    const roles = [
        'Information Systems Student', 
        'UI/UX Designer', 
        'Data Analyst', 
        'Business Intelligence Analyst', 
        'Quality Assurance Staff', 
        'GIS Analyst'
    ];
    const heroDesc = document.querySelector('.hero-desc');
    
    if (heroDesc) {
        const typedContainer = document.createElement('div');
        typedContainer.className = 'typed-container';
        
        const typedSpan = document.createElement('span');
        typedSpan.className = 'typed-text';
        
        const cursorSpan = document.createElement('span');
        cursorSpan.className = 'cursor';
        cursorSpan.textContent = '|';
        cursorSpan.style.animation = 'blink 1s infinite';
        
        typedContainer.appendChild(typedSpan);
        typedContainer.appendChild(cursorSpan);
        heroDesc.parentNode.insertBefore(typedContainer, heroDesc);
        
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        function typeEffect() {
            const currentRole = roles[roleIndex];
            if (isDeleting) {
                typedSpan.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typedSpan.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
            }
            
            let typeSpeed = isDeleting ? 50 : 100;
            
            if (!isDeleting && charIndex === currentRole.length) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typeSpeed = 500; // Pause before typing next
            }
            setTimeout(typeEffect, typeSpeed);
        }
        typeEffect();
    }

    // =========================================================================
    // 9. PROJECT IMAGE CAROUSEL
    // =========================================================================
    function initCarousels() {
        document.querySelectorAll('.carousel-container').forEach(container => {
            const track = container.querySelector('.carousel-track');
            const slides = container.querySelectorAll('.carousel-slide');
            const dotsContainer = container.querySelector('.carousel-dots');
            const dots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];
            let currentIndex = 0;
            let autoInterval;

            if (!track || slides.length === 0) return;

            // Caption bar showing what the current slide is (pulled from each
            // image's alt text so we don't have to duplicate labels in HTML).
            let captionText = null;
            const hasCaptions = Array.from(slides).some(s => s.querySelector('img')?.getAttribute('alt'));
            if (hasCaptions) {
                const caption = document.createElement('div');
                caption.className = 'carousel-caption';
                captionText = document.createElement('span');
                captionText.className = 'carousel-caption-text';
                caption.appendChild(captionText);
                container.appendChild(caption);
            }

            function updateCaption() {
                if (!captionText) return;
                const img = slides[currentIndex]?.querySelector('img');
                captionText.textContent = img?.getAttribute('alt') || '';
            }

            // Always resolves to a valid index, first slide (00/01) included.
            function goToSlide(index) {
                currentIndex = (index + slides.length) % slides.length;
                track.style.transform = `translateX(-${currentIndex * 100}%)`;
                dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
                updateCaption();
            }

            function nextSlide() { goToSlide(currentIndex + 1); }
            function prevSlide() { goToSlide(currentIndex - 1); }

            function startAuto() {
                if (slides.length > 1) autoInterval = setInterval(nextSlide, 4000);
            }

            function stopAuto() {
                clearInterval(autoInterval);
            }

            dots.forEach((dot, i) => dot.addEventListener('click', () => {
                stopAuto();
                goToSlide(i);
                startAuto();
            }));

            // Manual prev/next arrow buttons (only when there's more than one slide).
            if (slides.length > 1) {
                const prevBtn = document.createElement('button');
                prevBtn.className = 'carousel-nav carousel-nav-prev';
                prevBtn.setAttribute('aria-label', 'Previous image');
                prevBtn.innerHTML = '&#8249;';
                const nextBtn = document.createElement('button');
                nextBtn.className = 'carousel-nav carousel-nav-next';
                nextBtn.setAttribute('aria-label', 'Next image');
                nextBtn.innerHTML = '&#8250;';

                prevBtn.addEventListener('click', (e) => { e.stopPropagation(); stopAuto(); prevSlide(); startAuto(); });
                nextBtn.addEventListener('click', (e) => { e.stopPropagation(); stopAuto(); nextSlide(); startAuto(); });

                container.appendChild(prevBtn);
                container.appendChild(nextBtn);

                // Drag / swipe support (mouse + touch via Pointer Events).
                let dragStartX = 0;
                let dragging = false;

                track.addEventListener('pointerdown', (e) => {
                    dragging = true;
                    dragStartX = e.clientX;
                    stopAuto();
                    track.style.transition = 'none';
                });

                track.addEventListener('pointermove', (e) => {
                    if (!dragging) return;
                    const delta = e.clientX - dragStartX;
                    track.style.transform = `translateX(calc(-${currentIndex * 100}% + ${delta}px))`;
                });

                function endDrag(e) {
                    if (!dragging) return;
                    dragging = false;
                    track.style.transition = '';
                    const delta = (e.clientX || 0) - dragStartX;
                    if (Math.abs(delta) > 8) {
                        const activeSlide = slides[currentIndex];
                        if (activeSlide) activeSlide.dataset.dragged = 'true';
                    }
                    if (delta < -50) nextSlide();
                    else if (delta > 50) prevSlide();
                    else goToSlide(currentIndex);
                    startAuto();
                }

                track.addEventListener('pointerup', endDrag);
                track.addEventListener('pointerleave', () => { if (dragging) endDrag({ clientX: dragStartX }); });
            }

            container.addEventListener('mouseenter', stopAuto);
            container.addEventListener('mouseleave', startAuto);

            goToSlide(0); // always start on the first slide (00/01)

            // Only auto-advance while the carousel is actually visible on
            // screen, so slides don't silently cycle through off-screen cards.
            if (slides.length > 1) {
                const visibilityObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            goToSlide(0);
                            startAuto();
                        } else {
                            stopAuto();
                        }
                    });
                }, { threshold: 0.4 });
                visibilityObserver.observe(container);
            }
        });
    }
    initCarousels();

    // =========================================================================
    // UML & DIAGRAMS FILTER
    // =========================================================================
    const umlFilterBtns = document.querySelectorAll('.uml-filter-btn');
    const umlItems = document.querySelectorAll('.uml-item');

    umlFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            umlFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            umlItems.forEach(item => {
                const match = filter === 'all' || item.getAttribute('data-category') === filter;
                item.classList.toggle('uml-hidden', !match);
            });
        });
    });

    // =========================================================================
    // 10 & 14. PROJECT DETAIL MODAL & DATA
    // =========================================================================
    const projectData = {
        'ikn-vegetation': `
            <h2>Vegetation Cover Change Analysis in IKN</h2>
            <div class="modal-meta">Team | GIS / Remote Sensing | Google Earth Engine, Sentinel-2, Random Forest</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A spatiotemporal remote sensing study measuring vegetation cover change in Ibu Kota Nusantara (IKN) between April 2024 and April 2026, built as part of a Kapita Selekta Sistem Informasi group project. The pipeline runs entirely in Google Earth Engine and classifies land cover using the smileRandomForest algorithm.</p>
                <p><a href="https://ibukotanusantara.codaxiom.com/" target="_blank">Live WebGIS Demo</a></p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Rapid land conversion during the development of Indonesia's new capital city makes it difficult to track how much vegetation cover has actually changed over time without a systematic, image-based monitoring approach.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Built a cloud-based classification pipeline comparing two cloud-masked Sentinel-2 composites (April 2024 and April 2026), trained a smileRandomForest classifier on labeled ground truth points, and published the results as an interactive WebGIS.</p>
            </div>
            <div class="modal-section">
                <h3>Methodology</h3>
                <div class="modal-step">
                    <div class="modal-step-num">01</div>
                    <div>
                        <h4>Image Acquisition & SCL Masking</h4>
                        <p>Sentinel-2 Level-2A imagery (COPERNICUS/S2_SR_HARMONIZED) filtered for the IKN area of interest. Cloud masking applied using SCL bits 3, 8, 9, 10, and 11 to eliminate clouds and persistent shadows.</p>
                        <div class="modal-tech-tags"><span>SCL Bit Filter</span><span>2024 vs 2026</span></div>
                    </div>
                </div>
                <div class="modal-step">
                    <div class="modal-step-num">02</div>
                    <div>
                        <h4>Feature Engineering & Spectral Indices</h4>
                        <p>Calculated NDVI (vegetation density) and NDBI (built-up density) spectral indices, combined into an 8-band input stack (B2, B3, B4, B8, B11, B12, NDVI, NDBI).</p>
                        <div class="modal-tech-tags"><span>NDVI & NDBI</span><span>8 Input Bands</span></div>
                    </div>
                </div>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Cloud-free bi-temporal composites for April 2024 and April 2026.</li>
                    <li>Supervised classification using smileRandomForest trained on ground truth points.</li>
                    <li>8-band feature stack combining raw spectral bands with NDVI and NDBI.</li>
                    <li>Interactive WebGIS for exploring vegetation change across the AOI.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Collected and labeled ground truth points for classifier training and validation.</li>
                    <li>Performed image acquisition and cloud/shadow masking in Google Earth Engine.</li>
                    <li>Generated the analysis-ready bi-temporal Sentinel-2 composites.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>Google Earth Engine</span><span>Sentinel-2</span><span>smileRandomForest</span><span>JavaScript</span><span>WebGIS</span>
                </div>
            </div>
        `,
        'flood-gis': `
            <h2>Flood Risk Analysis WebGIS Samarinda</h2>
            <div class="modal-meta">Individual | GIS | QGIS, WebGIS, Buffer Analysis, Vercel</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A comprehensive WebGIS application mapping flood emergency response centers and flood risk zones in Samarinda, providing spatial insights for emergency planning.</p>
                <p><a href="https://web-gis-samarinda-flood-emergency-s.vercel.app/index.html" target="_blank">Live Demo Available</a></p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Samarinda frequently faces flooding issues, and the lack of accessible, visualized spatial data made it difficult for residents and emergency responders to identify safe zones and optimal routes efficiently.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Developed an interactive web-based Geographic Information System (WebGIS) that visualizes flood risk areas, response facilities, and spatial relationships to assist in disaster mitigation.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Interactive map interface with toggleable layers.</li>
                    <li>Spatial overlay showing the intersection of high-risk flood zones and residential areas.</li>
                    <li>Proximity and buffer analysis mapping safe distances from rivers.</li>
                    <li>Responsive design deployed via Vercel for public access.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Sourcing and preprocessing spatial datasets using QGIS.</li>
                    <li>Conducting buffer, proximity, and spatial overlay analysis.</li>
                    <li>Developing the front-end web application embedding the spatial data.</li>
                    <li>Deploying the final product to a cloud hosting environment.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>QGIS</span><span>WebGIS</span><span>HTML/CSS/JS</span><span>Vercel</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Handling large shapefiles and GeoJSON data without performance bottlenecks required careful optimization. I learned advanced QGIS processing techniques and spatial web optimization.</p>
            </div>
        `,
        'qgis-samarinda': `
            <h2>QGIS Spatial Analysis Practicum · Samarinda</h2>
            <div class="modal-meta">Individual | GIS / Spatial Analysis | QGIS</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A set of hands-on QGIS practicum exercises applied to real-world Samarinda datasets, covering buffer/proximity analysis, DEM elevation modeling, NDVI vegetation mapping, and statistical reporting.</p>
            </div>
            <div class="modal-section">
                <h3>Techniques Covered</h3>
                <ul>
                    <li>Buffer and proximity analysis around key spatial features.</li>
                    <li>DEM (Digital Elevation Model) elevation analysis.</li>
                    <li>NDVI vegetation density mapping.</li>
                    <li>Statistical summary and reporting of spatial data.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Sourcing and preprocessing raster and vector datasets.</li>
                    <li>Running the analysis workflows and producing styled output maps.</li>
                    <li>Documenting methodology and results in an individual lab report.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>QGIS</span><span>DEM</span><span>NDVI</span><span>Buffer Analysis</span>
                </div>
            </div>
        `,
        'qgis-nairobi': `
            <h2>QGIS Spatial Analysis Practicum · Nairobi</h2>
            <div class="modal-meta">Individual | GIS / Spatial Analysis | QGIS</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A QGIS practicum exercise applying area-based spatial analysis and NDVI vegetation density mapping to real-world Nairobi, Kenya datasets.</p>
            </div>
            <div class="modal-section">
                <h3>Techniques Covered</h3>
                <ul>
                    <li>Area-based spatial analysis of the Nairobi region.</li>
                    <li>NDVI vegetation density mapping.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Sourcing and preprocessing raster and vector datasets.</li>
                    <li>Running the analysis workflows and producing styled output maps.</li>
                    <li>Documenting methodology and results in an individual lab report.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>QGIS</span><span>NDVI</span><span>Spatial Analysis</span>
                </div>
            </div>
        `,
        'qgis-kenya': `
            <h2>QGIS Spatial Analysis Practicum · Kenya</h2>
            <div class="modal-meta">Individual | GIS / Spatial Analysis | QGIS</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A QGIS practicum exercise performing country-level DEM (Digital Elevation Model) elevation analysis on Kenya's terrain.</p>
            </div>
            <div class="modal-section">
                <h3>Techniques Covered</h3>
                <ul>
                    <li>DEM elevation analysis at the national scale.</li>
                    <li>Terrain visualization and interpretation.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Sourcing and preprocessing DEM raster data.</li>
                    <li>Running the elevation analysis and producing a styled output map.</li>
                    <li>Documenting methodology and results in an individual lab report.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>QGIS</span><span>DEM</span>
                </div>
            </div>
        `,
        'qgis-bandung': `
            <h2>QGIS Spatial Analysis Practicum · Bandung</h2>
            <div class="modal-meta">Individual | GIS / Spatial Analysis | QGIS</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A QGIS practicum exercise mapping landslide susceptibility in Bandung to identify high-risk terrain zones.</p>
            </div>
            <div class="modal-section">
                <h3>Techniques Covered</h3>
                <ul>
                    <li>Landslide susceptibility mapping.</li>
                    <li>Risk zone classification based on slope and terrain factors.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Sourcing and preprocessing terrain and slope datasets.</li>
                    <li>Running the susceptibility analysis and producing a styled output map.</li>
                    <li>Documenting methodology and results in an individual lab report.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>QGIS</span><span>Landslide Susceptibility</span>
                </div>
            </div>
        `,
        'qgis-usa': `
            <h2>QGIS Spatial Analysis Practicum · USA</h2>
            <div class="modal-meta">Individual | GIS / Spatial Analysis | QGIS</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A QGIS practicum exercise producing statistical and choropleth maps to visualize regional data patterns across the United States.</p>
            </div>
            <div class="modal-section">
                <h3>Techniques Covered</h3>
                <ul>
                    <li>Statistical data joining and classification.</li>
                    <li>Choropleth mapping for regional pattern visualization.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Sourcing and preprocessing statistical and vector datasets.</li>
                    <li>Running the classification workflow and producing a styled choropleth map.</li>
                    <li>Documenting methodology and results in an individual lab report.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>QGIS</span><span>Choropleth Mapping</span>
                </div>
            </div>
        `,
        'bi-sales': `
            <h2>Sales Dashboard</h2>
            <div class="modal-meta">Individual | BI/Analytics | Power BI</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A single-page Power BI dashboard built to give a quick, at-a-glance view of core retail sales metrics.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Stakeholders needed a simple, fast-loading dashboard to check overall sales health without navigating through multiple pages.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Designed one consolidated dashboard view combining revenue trends, top-performing products, and regional sales comparisons.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Single-view summary of revenue, product, and regional KPIs.</li>
                    <li>Visual trend indicators for quick interpretation.</li>
                    <li>Basic filtering and slicers.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Data cleaning and transformation using Power Query.</li>
                    <li>Building the dashboard layout and visualizations.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>Power BI</span><span>Power Query</span><span>Data Visualization</span>
                </div>
            </div>
        `,
        'bi-salesper': `
            <h2>Sales Performance Dashboard with Drilling Analysis (UAS)</h2>
            <div class="modal-meta">Individual | BI/Analytics | Power BI</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A dynamic 3-page Power BI dashboard built for the final exam (UAS), designed to monitor and analyze sales performance across multiple regions, featuring interactive drill-down capabilities for deeper granular insights.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Stakeholders needed a consolidated view of massive sales datasets that allowed them to easily transition from a high-level overview down to individual transaction and product-level details.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Built a structured 3-page Power BI dashboard that employed drilling analysis, enabling seamless navigation through data hierarchies (Year > Quarter > Month > Day, and Region > Country > City).</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Executive summary view with top-level KPIs.</li>
                    <li>Drill-down and drill-through actions to view granular data.</li>
                    <li>Dynamic filtering and slicers for custom report generation.</li>
                    <li>Time-intelligence metrics (YTD, MoM growth).</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Data cleaning and transformation using Power Query.</li>
                    <li>Designing the relational data model for optimal querying.</li>
                    <li>Writing DAX measures for complex business logic.</li>
                    <li>Designing an intuitive user interface and visual narrative.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>Power BI</span><span>DAX</span><span>Power Query</span><span>Data Visualization</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Creating performant DAX queries over millions of rows was challenging. The project significantly improved my understanding of DAX optimization and user-centric dashboard design.</p>
            </div>
        `,
        'bi-dashboard-jobs': `
            <h2>Job Application Analysis Dashboard with Star Schema</h2>
            <div class="modal-meta">Individual | BI/Analytics | Star Schema, Power BI</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>An analytical dashboard focused on tracking and evaluating job market trends and application success rates, built upon a robust Star Schema data model.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Job application data was scattered across disparate flat files, making it nearly impossible to correlate candidate skills with industry demands efficiently.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Engineered a robust Star Schema data model separating fact (applications, outcomes) and dimension tables (dates, skills, companies, roles) to power a high-performance Power BI dashboard.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Optimized Star Schema architecture for fast report rendering.</li>
                    <li>Skill-gap analysis visualization.</li>
                    <li>Application conversion rate tracking across different hiring stages.</li>
                    <li>Industry and geographic trend heatmaps.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Designing the logical and physical data model.</li>
                    <li>Transforming raw flat files into structured Fact and Dimension tables.</li>
                    <li>Developing the BI presentation layer.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>Power BI</span><span>Data Modeling</span><span>Star Schema</span><span>ETL</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Handling many-to-many relationships (e.g., applicants having multiple skills) required bridge tables. It cemented my foundational knowledge of dimensional modeling.</p>
            </div>
        `,
        'bi-clustering': `
            <h2>Clustering Analysis: Economy vs Happiness</h2>
            <div class="modal-meta">Individual | BI/Analytics | Power BI, Clustering, Data Analysis</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A BI project applying clustering analysis to explore the relationship between a country's economic indicators and its citizens' reported happiness index, delivered as an interactive Power BI dashboard.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Understanding global well-being requires moving beyond simple GDP metrics to find hidden groupings of nations with similar socio-economic and psychological profiles.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Cleaned and analyzed global datasets, applied clustering to segment countries into distinct profiles, then built a Power BI dashboard to visualize and explore the results interactively.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Country clusters segmented by economic and happiness indicators.</li>
                    <li>Interactive scatter and geographical visualizations of resulting clusters.</li>
                    <li>Statistical profiling of each cluster within the dashboard.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>End-to-end execution from data sourcing to final dashboard.</li>
                    <li>Performing the clustering analysis and preparing the data model.</li>
                    <li>Designing the Power BI dashboard and interpreting the results into insights.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>Power BI</span><span>Clustering</span><span>Data Analysis</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Dealing with scale differences between GDP and survey scores required careful feature scaling. I learned the critical importance of preprocessing in unsupervised machine learning.</p>
            </div>
        `,
        'bi-retail': `
            <h2>Retail Sales Performance Dashboard</h2>
            <div class="modal-meta">Individual | BI/Analytics | Power BI</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A comprehensive business intelligence dashboard tracking key retail metrics like revenue, profit margins, inventory turnover, and customer demographics.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Retail managers lacked a centralized tool to monitor real-time store performance, leading to delayed responses in inventory management and marketing strategies.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Created an intuitive Power BI dashboard that aggregates daily POS data, providing actionable insights into top-selling products, underperforming regions, and seasonal trends.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Interactive KPI scorecards.</li>
                    <li>Product category performance matrix.</li>
                    <li>Geographical sales distribution maps.</li>
                    <li>Trend line forecasting.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>ETL processes to load raw retail data.</li>
                    <li>Building visualizations tailored to executive and operational stakeholders.</li>
                    <li>Implementing dynamic security/role-level access concepts in design.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>Power BI</span><span>Data Visualization</span><span>Retail Analytics</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Balancing information density with readability was key. I adopted a minimalist UI approach that highlighted actionable data over purely aesthetic visuals.</p>
            </div>
        `,
        'bi-eu-analysis': `
            <h2>Comparative Analysis of LGBT Experiences Across EU Countries</h2>
            <div class="modal-meta">Individual | BI/Analytics | Comparative Analysis, Data Storytelling</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A compelling data storytelling project analyzing survey data regarding the experiences, discrimination, and rights of LGBT individuals across various European Union nations.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Survey data containing thousands of responses needed to be synthesized into an understandable narrative to highlight disparities in human rights across the EU.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Applied advanced comparative analysis and data storytelling techniques to visualize the contrasts between progressive and conservative regions within the EU.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Deep dive into specific socio-economic indicators and discrimination metrics.</li>
                    <li>Comparative visualizations highlighting stark regional contrasts.</li>
                    <li>Narrative flow designed to educate and drive awareness.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Data cleaning of complex categorical survey results.</li>
                    <li>Designing visualizations that respectfully and accurately portray sensitive data.</li>
                    <li>Crafting the analytical narrative and presenting the findings.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>Data Storytelling</span><span>Excel/Tableau/PowerBI</span><span>Statistical Analysis</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Working with subjective survey data required rigorous statistical validation to avoid misinterpretation. It honed my skills in ethical data reporting.</p>
            </div>
        `,
        'quickwash': `
            <h2>QuickWash · Laundry Data Mockup App</h2>
            <div class="modal-meta">Individual | Application | Visual Studio, Database</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A simple clickable desktop mockup built in Visual Studio for a laundry service concept, connected to a database for basic data handling.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Needed a quick way to prototype what a laundry service's data-entry interface could look like and behave like, without building a fully production-ready system.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Built a lightweight, interactive UI mockup wired to a database, allowing basic data operations to demonstrate the concept.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Clickable interface built in Visual Studio.</li>
                    <li>Basic data operations: save, retrieve, and delete records.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Designing the mockup UI in Visual Studio.</li>
                    <li>Connecting the interface to a database for basic data handling.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>Visual Studio</span><span>Database</span><span>CRUD</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Notes</h3>
                <p>This is a simple proof-of-concept mockup, not a fully implementable laundry management system — it only handles basic save, retrieve, and delete operations.</p>
            </div>
        `,
        'booq-oop': `
            <h2>BooQ – Desktop Library Application</h2>
            <div class="modal-meta">Team | Application | Java, OOP, Netbeans</div>
            <div class="modal-section">
                <img src="asset/images/booq_oop_fotosamadosen.png" alt="BooQ Presentation" style="width:100%; border-radius:8px; margin-bottom:1rem;">
                <h3>Overview</h3>
                <p>A collaborative project building a comprehensive desktop-based library management system applying strict Object-Oriented Programming (OOP) principles in Java.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Traditional library systems lack modularity, making them hard to maintain or expand. The objective was to build a system heavily utilizing encapsulation, inheritance, and polymorphism.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Designed and programmed 'BooQ' using Java in Netbeans, modeling real-world entities (Books, Members, Transactions) as interconnected Java classes.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Book inventory management.</li>
                    <li>Member borrowing and returning logic with automated fine calculation.</li>
                    <li>Search and filter functionalities.</li>
                    <li>GUI built with Java Swing.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Collaborating on the UML Class Diagram design.</li>
                    <li>Implementing core OOP classes and database connectivity.</li>
                    <li>UI design implementation using Netbeans GUI builder.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>Java</span><span>OOP</span><span>Netbeans</span><span>Java Swing</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Synchronizing code across a team before using advanced version control taught me the importance of modular architecture and clear interface contracts between classes.</p>
            </div>
        `,
        'medimind': `
            <h2>MediMind Mobile Health App</h2>
            <div class="modal-meta">Team | Application | Mobile App, UI-UX, Figma</div>
            <div class="modal-section">
                <img src="asset/images/medimind_fotokelompok.jpg" alt="MediMind Team" style="width:100%; border-radius:8px; margin-bottom:1rem;">
                <h3>Overview</h3>
                <p>A mobile health application prototype focused on mental health tracking and telemedicine, featuring a highly researched and tested UI/UX design.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Mental health apps often suffer from clinical, uninviting interfaces that deter regular user engagement.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Designed 'MediMind', prioritizing a calming, intuitive user experience. The app integrates mood tracking, meditation resources, and professional consultation booking.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Interactive high-fidelity prototype created in Figma.</li>
                    <li>Calming color psychology applied to UI components.</li>
                    <li>User flow optimized for minimal friction during consultation booking.</li>
                    <li>Daily mood journaling interface.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Conducting user research and defining user personas.</li>
                    <li>Creating wireframes and translating them into high-fidelity designs.</li>
                    <li>Prototyping interactions and conducting usability testing.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>Figma</span><span>UI/UX Design</span><span>Prototyping</span><span>User Research</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Iterating based on user feedback revealed that users prefer simpler navigation over feature-rich home screens. It deeply ingrained a user-first design mindset.</p>
            </div>
        `,
        'atethat': `
            <h2>AteThat Food Business Venture</h2>
            <div class="modal-meta">Team | Business | Entrepreneurship, Competitor Analysis, Pitch Deck</div>
            <div class="modal-section">
                <div style="display:flex; gap:10px; margin-bottom:1rem;">
                    <img src="asset/images/atethat_kelompok.jpg" alt="AteThat Team" style="width:48%; border-radius:8px;">
                    <img src="asset/images/atethat_fotosamaasesor.jpeg" alt="AteThat Assessment" style="width:48%; border-radius:8px;">
                </div>
                <h3>Overview</h3>
                <p>A comprehensive business venture project encompassing the ideation, market research, and pitching of a novel food business concept named 'AteThat'.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Entering the highly saturated F&B market requires a unique value proposition and a robust, data-backed business strategy to secure initial validation and funding.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Developed a complete business plan and pitch deck for AteThat, grounded in extensive competitor analysis and targeted market segmentation.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>In-depth competitor and SWOT analysis.</li>
                    <li>Detailed financial projections and break-even analysis.</li>
                    <li>Go-to-market strategy and marketing plan.</li>
                    <li>Professional pitch deck presented to industry assessors.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Leading the competitor analysis and market research phases.</li>
                    <li>Designing the pitch deck for maximum visual and narrative impact.</li>
                    <li>Presenting the financial and operational plans to assessors.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>Business Strategy</span><span>Pitch Deck</span><span>Market Analysis</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Defending the business model against assessors taught me how to think critically under pressure and the importance of having airtight data to back up business assumptions.</p>
            </div>
        `,
        'saladish': `
            <h2>Saladish Healthy Food Business</h2>
            <div class="modal-meta">Team | Business | BMC, Marketing, Financial Analysis</div>
            <div class="modal-section">
                <img src="asset/images/saladish_fotokelompokdosen.jpg" alt="Saladish Team" style="width:100%; border-radius:8px; margin-bottom:1rem;">
                <h3>Overview</h3>
                <p>A structured business development project focusing on a healthy food startup, 'Saladish', utilizing the Business Model Canvas (BMC) framework.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Health-conscious consumers often struggle to find affordable, quick, and genuinely healthy food options. The project needed to structure a viable business around solving this pain point.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Mapped out a complete business strategy using the Business Model Canvas, detailing value propositions, customer relationships, revenue streams, and cost structures.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Comprehensive Business Model Canvas (BMC).</li>
                    <li>Targeted digital marketing strategy plan.</li>
                    <li>Supply chain and cost structure analysis.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Developing the financial models and pricing strategies.</li>
                    <li>Drafting the marketing and customer acquisition plan.</li>
                    <li>Collaborating on the overarching BMC structure.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>BMC</span><span>Financial Modeling</span><span>Marketing Strategy</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Estimating realistic customer acquisition costs without historical data required creative proxy metrics. It vastly improved my strategic business planning skills.</p>
            </div>
        `,
        'study-easy': `
            <h2>Study Easy · AI Study Companion</h2>
            <div class="modal-meta">Team | Business | Technology-Based Entrepreneurship</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A technology-based entrepreneurship venture (Kewirausahaan Berbasis Teknologi) proposing an AI-powered study companion that turns any learning material into whatever format helps a student learn best.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Students often receive dense study materials but lack the time or a consistent method to turn them into something easy to review, memorize, or test themselves on.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Proposed a product where users simply send in their study material and the AI generates a summary, flashcards, a podcast, or a quiz from it, letting each student study in the format that suits them.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>AI-generated summaries from uploaded materials.</li>
                    <li>Auto-generated flashcards for quick review.</li>
                    <li>Podcast-style audio conversion of the material.</li>
                    <li>Auto-generated quizzes for self-testing.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Contributing to the business concept and value proposition.</li>
                    <li>Helping shape the product's core feature set and pitch materials.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>AI Product</span><span>Business Plan</span><span>Tech Entrepreneurship</span>
                </div>
            </div>
        `,
        'bpmn-modeling': `
            <h2>Business Process Modeling & Redesign: Dyah's Salon</h2>
            <div class="modal-meta">Team | Process/BPMN | BPMN 2.0, Bizagi, Draw.io</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A process engineering project combining BPMN 2.0 modeling with a real-world Business Process Redesign (BPR) case study, applied to modernize the operations of a local business, Dyah's Salon.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>The salon struggled with manual booking conflicts, inefficient inventory tracking, and long customer wait times, resulting in bottlenecks and redundant work.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Used Bizagi and Draw.io to diagram the 'As-Is' processes in BPMN 2.0 notation, identified bottlenecks, and modeled an optimized 'To-Be' process integrating digital booking and streamlined inventory protocols.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Detailed modeling of pools, lanes, events, and gateways.</li>
                    <li>'As-Is' vs 'To-Be' process mapping with root-cause analysis.</li>
                    <li>Cost-benefit analysis for proposed technological integrations.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Conducting on-site observations and interviews with the business owner.</li>
                    <li>Drafting the BPMN diagrams ensuring strict adherence to notation standards.</li>
                    <li>Proposing and presenting the final process redesign.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>BPMN 2.0</span><span>Bizagi</span><span>Draw.io</span><span>Process Mapping</span><span>BPR</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Translating academic BPR frameworks into practical, affordable solutions for a small business, while keeping the BPMN notation accurate, taught me to align IT solutions with what a business can realistically adopt.</p>
            </div>
        `,
        'testing-paper': `
            <h2>Testing & Implementation Research Paper</h2>
            <div class="modal-meta">Team | Research | Research Paper, Software Testing, QA</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>An academic research paper exploring modern methodologies in software testing, Quality Assurance (QA), and implementation strategies in agile environments.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Rapid deployment cycles in software engineering often compromise code quality. The research aimed to identify optimal testing frameworks to mitigate this.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Authored a comprehensive paper analyzing the efficacy of automated vs. manual testing, CI/CD pipelines, and best practices for seamless implementation.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Literature review of current QA standards.</li>
                    <li>Comparative study of testing frameworks (e.g., Selenium, JUnit).</li>
                    <li>Proposed framework for continuous testing integration.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Researching automated testing tools and their market adoption.</li>
                    <li>Drafting sections on Continuous Integration methodologies.</li>
                    <li>Editing and formatting the final academic paper.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>Software QA</span><span>Agile</span><span>Academic Research</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Synthesizing technical documentation into a cohesive academic narrative improved my technical writing and deepened my appreciation for robust QA practices.</p>
            </div>
        `,
        'sentiment-analysis': `
            <h2>Sentiment Analysis of Google & Shopee Reviews</h2>
            <div class="modal-meta">Team | Analytics/Research | Python, NLP, Sentiment Analysis</div>
            <div class="modal-section">
                <img src="asset/images/sentimen_analysis_fotokelompokdandosen.png" alt="Sentiment Analysis Team" style="width:100%; border-radius:8px; margin-bottom:1rem;">
                <h3>Overview</h3>
                <p>A Natural Language Processing (NLP) project scraping and analyzing customer reviews from Google and Shopee to extract actionable sentiment insights for brands.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Companies receive thousands of unstructured text reviews daily, making it impossible to manually gauge overall customer satisfaction and pinpoint specific issues.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Developed a Python script to scrape reviews, preprocess the text, and apply machine learning models to classify sentiments as positive, neutral, or negative.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Web scraping pipelines for extracting e-commerce reviews.</li>
                    <li>Text tokenization, stop-word removal, and stemming/lemmatization.</li>
                    <li>Sentiment classification using Naive Bayes and VADER.</li>
                    <li>Data visualization using word clouds and distribution graphs.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Writing the text preprocessing logic in Python.</li>
                    <li>Training and evaluating the sentiment classification models.</li>
                    <li>Visualizing the results using Matplotlib and WordCloud.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>Python</span><span>NLP</span><span>NLTK</span><span>Machine Learning</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Handling slang, emojis, and localized Indonesian terms in reviews required building custom dictionaries. It highlighted the complexities of real-world NLP applications.</p>
            </div>
        `,
        'yappy': `
            <h2>Yappy · AI Persona Chat App</h2>
            <div class="modal-meta">Team | Application / System Design | UML, System Design</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A system design project for Yappy, a chat application where users converse with customizable AI-driven character personas rather than a single generic assistant.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Most chat apps offer one flat conversational experience. Users wanted the ability to pick and interact with distinct AI personas, each with its own personality and conversation style.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Modeled the full application logic in UML, from user-facing use cases (selecting a persona, starting a chat, managing conversation history) through the class structure and the message-exchange sequence between user, app, and AI persona.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Use case diagram covering persona selection, chat sessions, and account management.</li>
                    <li>Class diagram defining the relationship between users, personas, and conversations.</li>
                    <li>Sequence diagram detailing the request/response flow for a chat message.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>UI/UX design for the persona selection and chat interface flows.</li>
                    <li>Contributing to the use case and sequence diagram design.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>UML</span><span>System Design</span><span>UI/UX</span>
                </div>
            </div>
        `,
        'homo-erectus': `
            <h2>Homo Erectus · Social Media App</h2>
            <div class="modal-meta">Team | Application / OOP Case Study | UML, OOP</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>An object-oriented programming case study modeling a social media application, covering user interactions, content sharing, and system behavior through structured UML documentation.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Designing a social platform's underlying system requires clearly defined objects and behaviors before any code is written, covering how users, posts, and interactions relate to one another.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Produced a full set of UML documentation, use case diagrams and scenarios, a class diagram, activity diagrams, and supporting flowcharts, modeling core social media features like posting, following, and engagement.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Use case diagram and detailed use case scenarios for core user journeys.</li>
                    <li>Class diagram defining the object relationships within the platform.</li>
                    <li>Activity diagrams modeling step-by-step user and system behavior.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Drafting use case scenarios and the class diagram.</li>
                    <li>Documenting activity flows for key user interactions.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>OOP</span><span>UML</span><span>System Design</span>
                </div>
            </div>
        `
    };

    window.openModal = function(projectId) {
        const modal = document.getElementById('project-modal');
        const modalBody = document.getElementById('modal-body');
        
        if (modal && modalBody && projectData[projectId]) {
            modalBody.innerHTML = projectData[projectId];
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
            initModalGallery();
        }
    };

    window.closeModal = function() {
        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            // Close if clicking the overlay itself (not content)
            if (e.target === modalOverlay) window.closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.closeModal();
    });

    // =========================================================================
    // IMAGE LIGHTBOX (click any project/UML image to view full size)
    // =========================================================================
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    // =========================================================================
    // CONTACT FORM (mailto fallback — no backend attached)
    // =========================================================================
    window.handleFormSubmit = function(btn) {
        const nameEl = document.getElementById('contact-name');
        const emailEl = document.getElementById('contact-email');
        const msgEl = document.getElementById('contact-message');
        const note = document.getElementById('contact-form-note');

        const name = nameEl ? nameEl.value.trim() : '';
        const email = emailEl ? emailEl.value.trim() : '';
        const message = msgEl ? msgEl.value.trim() : '';

        const setNote = (text, type) => {
            if (!note) return;
            note.textContent = text;
            note.className = 'contact-form-note' + (type ? ' ' + type : '');
        };

        if (!name || !email || !message) {
            setNote('Please fill in your name, email, and message first.', 'error');
            return;
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setNote('Please enter a valid email address.', 'error');
            return;
        }

        const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
        const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
        window.location.href = `mailto:najmakhonsa@gmail.com?subject=${subject}&body=${body}`;
        setNote('Opening your email app to send this message…', 'success');
    };

    window.openLightbox = function(src, alt) {


        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeLightbox = function(e) {
        if (e && e.target && e.target.tagName === 'IMG' && e.target.id === 'lightbox-img') return;
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            lightboxImg.src = '';
        }
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) window.closeLightbox();
    });

    // UML grid images
    document.querySelectorAll('.uml-item img').forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            window.openLightbox(img.src, img.alt);
        });
    });

    // Project carousel images (all cards, including single-image ones)
    document.querySelectorAll('.carousel-slide').forEach(slide => {
        slide.addEventListener('click', () => {
            if (slide.dataset.dragged === 'true') { slide.dataset.dragged = 'false'; return; }
            const img = slide.querySelector('img');
            if (img) window.openLightbox(img.src, img.alt);
        });
    });

    // Certification & other standalone document images
    document.querySelectorAll('.cert-image').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => window.openLightbox(img.src, img.alt));
    });

    // =========================================================================
    // 11. MODAL GALLERY (Lightbox style navigation inside modal)
    // =========================================================================
    function initModalGallery() {
        const galleryTrack = document.querySelector('#project-modal .modal-gallery-track');
        const gallerySlides = document.querySelectorAll('#project-modal .modal-gallery-slide');
        const prevBtn = document.querySelector('#project-modal .gallery-prev');
        const nextBtn = document.querySelector('#project-modal .gallery-next');
        const indicator = document.querySelector('#project-modal .gallery-indicator');
        
        if (!galleryTrack || gallerySlides.length === 0) return;
        
        let gIndex = 0;
        function updateGallery() {
            galleryTrack.style.transform = `translateX(-${gIndex * 100}%)`;
            if (indicator) {
                indicator.textContent = `${gIndex + 1} / ${gallerySlides.length}`;
            }
        }
        
        if (prevBtn) {
            prevBtn.onclick = () => {
                gIndex = (gIndex - 1 + gallerySlides.length) % gallerySlides.length;
                updateGallery();
            };
        }
        if (nextBtn) {
            nextBtn.onclick = () => {
                gIndex = (gIndex + 1) % gallerySlides.length;
                updateGallery();
            };
        }
        updateGallery();
    }

    // =========================================================================
    // 12. ANIMATED COUNTERS
    // =========================================================================
    const counters = document.querySelectorAll('[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = +entry.target.getAttribute('data-count');
                const suffix = entry.target.getAttribute('data-suffix') || '';
                let count = 0;
                const duration = 2000; // ms
                const increment = target / (duration / 16); // assuming 60fps
                
                const updateCount = () => {
                    count += increment;
                    if (count < target) {
                        entry.target.innerText = Math.ceil(count) + suffix;
                        requestAnimationFrame(updateCount);
                    } else {
                        entry.target.innerText = target + suffix;
                    }
                };
                updateCount();
                counterObserver.unobserve(entry.target);
            }
        });
    });
    counters.forEach(c => counterObserver.observe(c));

    // =========================================================================
    // 13. FORM HANDLER
    // =========================================================================
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            if (btn) {
                const originalText = btn.innerText;
                btn.innerText = 'Sending...';
                btn.disabled = true;
                
                // Simulate network request
                setTimeout(() => {
                    btn.innerText = 'Sent Successfully!';
                    form.reset();
                    
                    setTimeout(() => {
                        btn.innerText = originalText;
                        btn.disabled = false;
                    }, 3000);
                }, 1500);
            }
        });
    }
    /* Tempel di PALING BAWAH script.js */
(function () {
  function preparePrint() {
    // 1. Muat semua gambar yang masih lazy-load
    document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
      img.loading = 'eager';
    });

    // 2. Angka statistik langsung ke nilai akhir (bukan 0)
    document.querySelectorAll('.stat-num[data-count]').forEach(function (el) {
      var n = parseFloat(el.dataset.count);
      var d = parseInt(el.dataset.decimals || '0', 10);
      el.textContent = n.toFixed(d) + (el.dataset.suffix || '');
    });

    // 3. Bar IPK terisi (3.86 dari 4.00)
    var bar = document.getElementById('gpa-bar');
    if (bar) bar.style.width = (3.86 / 4 * 100) + '%';

    // 4. Semua elemen reveal ditampilkan
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  window.addEventListener('beforeprint', preparePrint);
})();


});

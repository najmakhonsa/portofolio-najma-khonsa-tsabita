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
                    const percentage = (3.85 / 4) * 100;
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
            
            function goToSlide(index) {
                currentIndex = index;
                track.style.transform = `translateX(-${currentIndex * 100}%)`;
                dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
            }
            
            function nextSlide() {
                goToSlide((currentIndex + 1) % slides.length);
            }
            
            function startAuto() {
                autoInterval = setInterval(nextSlide, 4000);
            }
            
            function stopAuto() {
                clearInterval(autoInterval);
            }
            
            dots.forEach((dot, i) => dot.addEventListener('click', () => {
                stopAuto();
                goToSlide(i);
                startAuto();
            }));
            
            container.addEventListener('mouseenter', stopAuto);
            container.addEventListener('mouseleave', startAuto);
            
            if (slides.length > 1) startAuto();
        });
    }
    initCarousels();

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
        'bi-dashboard-sales': `
            <h2>Sales Performance Dashboard with Drilling Analysis</h2>
            <div class="modal-meta">Individual | BI/Analytics | Power BI</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A dynamic Power BI dashboard designed to monitor and analyze sales performance across multiple regions, featuring interactive drill-down capabilities for deeper granular insights.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Stakeholders needed a consolidated view of massive sales datasets that allowed them to easily transition from a high-level overview down to individual transaction and product-level details.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Built a structured Power BI dashboard that employed drilling analysis, enabling seamless navigation through data hierarchies (Year > Quarter > Month > Day, and Region > Country > City).</p>
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
            <div class="modal-meta">Individual | BI/Analytics | Python, Data Analysis, Clustering</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A data science project utilizing unsupervised machine learning (K-Means Clustering) to analyze the relationship between a country's economic indicators and its citizens' reported happiness index.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Understanding global well-being requires moving beyond simple GDP metrics to find hidden groupings of nations with similar socio-economic and psychological profiles.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Developed a Python-based analysis pipeline to clean global datasets, perform exploratory data analysis, and apply K-Means clustering to segment countries into distinct profiles.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Data preprocessing, handling missing values, and normalization.</li>
                    <li>Elbow method and Silhouette score for determining optimal cluster count.</li>
                    <li>Scatter plot and geographical visualizations of resulting clusters.</li>
                    <li>Statistical profiling of each cluster.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>End-to-end execution from data sourcing to final visualization.</li>
                    <li>Writing Python scripts using Pandas, Scikit-learn, and Seaborn.</li>
                    <li>Interpreting the clustering results to form meaningful business/societal insights.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>Python</span><span>Pandas</span><span>Scikit-learn</span><span>Seaborn</span>
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
        'desktop-vbnet': `
            <h2>Desktop Application VB.Net Database System</h2>
            <div class="modal-meta">Individual | Application | VB.Net, MySQL, Visual Studio</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A fully functional desktop management application developed using VB.Net, designed to handle CRUD operations via a centralized MySQL database.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Small businesses often rely on error-prone spreadsheets for data entry. A dedicated application was needed to ensure data integrity and provide a user-friendly interface.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Developed a Windows Forms application linked to a MySQL backend (via XAMPP), providing a robust system for data entry, retrieval, and reporting.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Secure login authentication system.</li>
                    <li>Complete CRUD (Create, Read, Update, Delete) functionality.</li>
                    <li>Data validation and error handling to prevent SQL injection.</li>
                    <li>Report generation modules.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Designing the UI in Visual Studio.</li>
                    <li>Writing the backend logic and database connection strings in VB.Net.</li>
                    <li>Structuring the MySQL database tables.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>VB.Net</span><span>MySQL</span><span>XAMPP</span><span>Visual Studio</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Managing state and asynchronous database calls in a desktop environment was challenging but highly rewarding. It solidified my understanding of client-server architectures.</p>
            </div>
        `,
        'booq-oop': `
            <h2>BooQ – Desktop Library Application</h2>
            <div class="modal-meta">Team | Application | Java, OOP, Netbeans</div>
            <div class="modal-section">
                <img src="asset/images/booq_oop_fotosamadosen.jpg" alt="BooQ Presentation" style="width:100%; border-radius:8px; margin-bottom:1rem;">
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
                    <img src="asset/images/atethat_fotosamaasesor.jpg" alt="AteThat Assessment" style="width:48%; border-radius:8px;">
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
        'bpmn-modeling': `
            <h2>BPMN Business Process Modeling</h2>
            <div class="modal-meta">Team | Process/BPMN | BPMN 2.0, Bizagi, Draw.io</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A process engineering project involving the mapping, analysis, and optimization of complex enterprise business workflows using the BPMN 2.0 standard.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Inefficient internal corporate workflows leading to bottlenecks, redundancies, and delayed service delivery.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Utilized Bizagi and Draw.io to diagram 'As-Is' processes, identified bottlenecks, and modeled optimized 'To-Be' processes utilizing BPMN 2.0 notation.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Detailed modeling of pools, lanes, events, and gateways.</li>
                    <li>Identification of non-value-adding activities.</li>
                    <li>Simulation-ready process maps.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Interviewing stakeholders (simulated) to gather process requirements.</li>
                    <li>Drafting the BPMN diagrams ensuring strict adherence to notation standards.</li>
                    <li>Proposing actionable process improvements.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>BPMN 2.0</span><span>Bizagi</span><span>Draw.io</span><span>Process Mapping</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Ensuring complex logic was accurately represented using the correct gateways (XOR, AND, OR) without cluttering the diagram was an excellent exercise in logical structuring.</p>
            </div>
        `,
        'bpr-salon': `
            <h2>Business Process Redesign: Dyah's Salon</h2>
            <div class="modal-meta">Team | Process/BPR | Process Redesign, Case Study</div>
            <div class="modal-section">
                <img src="asset/images/NEEDS-CONFIRMATION-bpr-photo.jpg" alt="BPR Salon Team" style="width:100%; border-radius:8px; margin-bottom:1rem;">
                <h3>Overview</h3>
                <p>A real-world case study project applying Business Process Redesign (BPR) methodologies to modernize and streamline the operations of a local business, Dyah's Salon.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>The salon was struggling with manual booking conflicts, inefficient inventory tracking, and long customer wait times.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Conducted a thorough audit of their operations and proposed a comprehensive redesign integrating digital booking systems and streamlined inventory protocols.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Root cause analysis of operational inefficiencies.</li>
                    <li>'As-Is' vs 'To-Be' process mapping.</li>
                    <li>Cost-benefit analysis for proposed technological integrations.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Conducting on-site observations and interviews with the business owner.</li>
                    <li>Mapping the inventory and customer journey processes.</li>
                    <li>Presenting the final BPR proposal.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>BPR</span><span>Systems Analysis</span><span>Case Study</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Translating academic BPR frameworks into practical, affordable solutions for a small business taught me the necessity of aligning IT solutions with actual business capabilities.</p>
            </div>
        `,
        'flowchart-analysis': `
            <h2>Flowchart & Systems Analysis Practicum</h2>
            <div class="modal-meta">Team | Process | Flowcharts, Systems Analysis, DFD</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A foundational systems architecture project focusing on creating Data Flow Diagrams (DFD) and detailed system flowcharts to document software lifecycles.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Software development without clear architectural documentation leads to scope creep and disjointed data management.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Produced extensive documentation including Context Diagrams, Level 0 & Level 1 DFDs, and system flowcharts for a theoretical enterprise resource system.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Entity-Relationship mapping.</li>
                    <li>Multi-level Data Flow Diagrams.</li>
                    <li>Standardized logic flowcharts.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Designing the DFDs to ensure logical data consistency.</li>
                    <li>Drafting flowcharts for specific edge-case subroutines.</li>
                    <li>Ensuring documentation met industry standards.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>DFD</span><span>Flowcharts</span><span>Systems Architecture</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Maintaining consistency of data entities across different levels of DFDs required meticulous attention to detail. It was critical training for software systems design.</p>
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
                <img src="asset/images/sentimen_analisis_fotokelompokdandosen.jpg" alt="Sentiment Analysis Team" style="width:100%; border-radius:8px; margin-bottom:1rem;">
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
        'portfolio-website': `
            <h2>Interactive Portfolio Website</h2>
            <div class="modal-meta">Individual | Application | HTML, CSS, JavaScript, Canvas API</div>
            <div class="modal-section">
                <h3>Overview</h3>
                <p>A modern, highly interactive personal portfolio website built from scratch, featuring dynamic background animations, custom cursors, and responsive design.</p>
            </div>
            <div class="modal-section">
                <h3>Problem</h3>
                <p>Needed a unique digital presence that not only lists achievements but demonstrates front-end technical proficiency and design aesthetics.</p>
            </div>
            <div class="modal-section">
                <h3>Solution</h3>
                <p>Engineered a vanilla JavaScript web application prioritizing performance and visual flair, avoiding heavy frameworks to showcase core web development skills.</p>
            </div>
            <div class="modal-section">
                <h3>Key Features</h3>
                <ul>
                    <li>Aurora Canvas background utilizing HTML5 Canvas API and particle physics.</li>
                    <li>IntersectionObserver-driven scroll reveals and animations.</li>
                    <li>Custom DOM-manipulated modal systems and carousels.</li>
                    <li>Dark/Light mode toggling with local storage persistence.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>My Responsibilities</h3>
                <ul>
                    <li>Complete UI/UX design and architecture.</li>
                    <li>Writing all semantic HTML, responsive CSS, and interactive JS.</li>
                    <li>Optimizing asset loading and animation frame rates.</li>
                </ul>
            </div>
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="modal-tech-tags">
                    <span>JavaScript</span><span>HTML5 Canvas</span><span>CSS3</span><span>UI/UX</span>
                </div>
            </div>
            <div class="modal-section">
                <h3>Challenges & Lessons Learned</h3>
                <p>Optimizing the canvas animation to run at 60fps without draining device battery required careful mathematical tuning. It served as a masterclass in vanilla JS performance.</p>
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

});

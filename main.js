import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/postprocessing/UnrealBloomPass.js';

// Three.js Scene Setup - Cosmic Environment
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x020617, 1);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;

// Post-processing for glow effects
const composer = new THREE.EffectComposer(renderer);
const renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, 0.4, 0.85
);
bloomPass.threshold = 0;
bloomPass.strength = 1.5;
bloomPass.radius = 0.5;
composer.addPass(bloomPass);

// Galaxy Generator
function createGalaxy() {
    const galaxyGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    const colorInner = new THREE.Color(0x3b82f6);
    const colorOuter = new THREE.Color(0xef4444);
    
    for (let i = 0; i < starCount; i++) {
        // Position stars in a spiral pattern
        const radius = Math.random() * 50;
        const spinAngle = radius * 0.2;
        const branchAngle = (i % 5) * (Math.PI * 2) / 5;
        
        const randomX = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? -1 : 1) * 5;
        const randomY = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? -1 : 1) * 5;
        const randomZ = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? -1 : 1) * 5;
        
        positions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i * 3 + 1] = randomY;
        positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
        
        // Color mixing
        const mixedColor = colorInner.clone();
        mixedColor.lerp(colorOuter, radius / 50);
        
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
        
        sizes[i] = Math.random() * 2;
    }
    
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    galaxyGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const galaxyMaterial = new THREE.PointsMaterial({
        size: 0.1,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
    scene.add(galaxy);
    
    return galaxy;
}

const galaxy = createGalaxy();

// Nebula Clouds
function createNebula() {
    const nebulaGeometry = new THREE.SphereGeometry(30, 32, 32);
    const nebulaMaterial = new THREE.MeshPhongMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.05,
        emissive: 0x3b82f6,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide
    });
    
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);
    
    return nebula;
}

const nebula = createNebula();

// Floating Asteroids
const asteroids = [];
function createAsteroids() {
    const asteroidGeometry = new THREE.IcosahedronGeometry(0.5, 0);
    const asteroidMaterial = new THREE.MeshPhongMaterial({
        color: 0x3b82f6,
        emissive: 0x3b82f6,
        emissiveIntensity: 0.2,
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });
    
    for (let i = 0; i < 15; i++) {
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial.clone());
        
        // Position in a spherical pattern
        const radius = 20 + Math.random() * 30;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        asteroid.position.x = radius * Math.sin(phi) * Math.cos(theta);
        asteroid.position.y = radius * Math.sin(phi) * Math.sin(theta);
        asteroid.position.z = radius * Math.cos(phi);
        
        asteroid.userData = {
            speed: Math.random() * 0.002 + 0.001,
            rotationSpeed: Math.random() * 0.01 + 0.005,
            direction: new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize()
        };
        
        scene.add(asteroid);
        asteroids.push(asteroid);
    }
}

createAsteroids();

// Lighting
const ambientLight = new THREE.AmbientLight(0x3b82f6, 0.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0x3b82f6, 1, 50);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xef4444, 1, 50);
pointLight2.position.set(-5, -5, -5);
scene.add(pointLight2);

// Camera Position
camera.position.z = 30;

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    
    // Animate galaxy rotation
    galaxy.rotation.y += 0.0001;
    
    // Animate nebula pulsation
    nebula.scale.x = 1 + Math.sin(Date.now() * 0.001) * 0.05;
    nebula.scale.y = 1 + Math.cos(Date.now() * 0.0013) * 0.05;
    nebula.scale.z = 1 + Math.sin(Date.now() * 0.0007) * 0.05;
    
    // Animate asteroids
    asteroids.forEach(asteroid => {
        asteroid.position.x += asteroid.userData.direction.x * asteroid.userData.speed;
        asteroid.position.y += asteroid.userData.direction.y * asteroid.userData.speed;
        asteroid.position.z += asteroid.userData.direction.z * asteroid.userData.speed;
        
        asteroid.rotation.x += asteroid.userData.rotationSpeed;
        asteroid.rotation.y += asteroid.userData.rotationSpeed;
        
        // Wrap around if out of bounds
        const maxDistance = 50;
        if (Math.abs(asteroid.position.x) > maxDistance) asteroid.position.x = -asteroid.position.x;
        if (Math.abs(asteroid.position.y) > maxDistance) asteroid.position.y = -asteroid.position.y;
        if (Math.abs(asteroid.position.z) > maxDistance) asteroid.position.z = -asteroid.position.z;
    });

    composer.render();
}
animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// Navigation Buttons and Sections
const coverLetterBtn = document.getElementById('coverLetterBtn');
const cvBtn = document.getElementById('cvBtn');
const referencesBtn = document.getElementById('referencesBtn');
const coverLetter = document.getElementById('coverLetter');
const cvPage = document.getElementById('cvPage');
const referencesPage = document.getElementById('referencesPage');
const sections = [coverLetter, cvPage, referencesPage];

// Function to handle smooth scrolling and active button highlighting
function showSection(section, button) {
    // Smooth scroll to the section
    gsap.to(window, {
        scrollTo: { y: section, offsetY: 100 },
        duration: 1,
        ease: "power2.inOut"
    });

    // Update active button
    [coverLetterBtn, cvBtn, referencesBtn].forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Update navigation trail
    updateNavTrail();
}

// Event Listeners for Navigation Buttons
coverLetterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(coverLetter, coverLetterBtn);
});
cvBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(cvPage, cvBtn);
});
referencesBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(referencesPage, referencesBtn);
});

// Function to update the navigation trail animation
function updateNavTrail() {
    const activeBtn = document.querySelector('.nav-btn.active');
    if (activeBtn) {
        const trail = document.querySelector('.nav-trail');
        const btnRect = activeBtn.getBoundingClientRect();
        const navRect = document.querySelector('.nav-orbit').getBoundingClientRect();

        gsap.to(trail, {
            x: btnRect.left - navRect.left,
            width: btnRect.width,
            duration: 0.6,
            ease: "back.out(1.7)"
        });
    }
}

// Initialize sections and navigation trail on page load
function initializeSections() {
    // Ensure all sections are visible for scrolling
    sections.forEach(section => {
        section.style.display = 'block';
    });

    // Set the initial active button
    coverLetterBtn.classList.add('active');
    updateNavTrail();

    // Scroll to the top on initial load
    window.scrollTo(0, 0);
}

// Sticky navigation bar behavior
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.orbital-nav');
    nav.style.position = 'fixed';
    nav.style.top = '0';
});

// Call initialization functions on page load
window.addEventListener('DOMContentLoaded', initializeSections);
window.addEventListener('resize', updateNavTrail);

// Interactive profile image
const profileImg = document.getElementById('profileImage');
if (profileImg) {
    profileImg.addEventListener('mouseenter', () => {
        gsap.to(profileImg, {
            scale: 1.05,
            rotate: 5,
            duration: 0.3,
            ease: "back.out(1.7)"
        });
    });
    profileImg.addEventListener('mouseleave', () => {
        gsap.to(profileImg, {
            scale: 1,
            rotate: 0,
            duration: 0.3,
            ease: "back.out(1.7)"
        });
    });
}

// Function to open links
function openLink(url) {
    window.open(url, '_blank');
}

// Parallax effect on mouse move
document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    
    gsap.to(camera.position, {
        x: x * 5,
        y: -y * 5,
        duration: 5,
        ease: "power2.out"
    });
    
    gsap.to(coverLetter, {
        x: x * 20,
        y: -y * 20,
        duration: 1.5,
        ease: "power2.out"
    });
    
    gsap.to(cvPage, {
        x: x * 20,
        y: -y * 20,
        duration: 1.5,
        ease: "power2.out"
    });
});

// Scroll-triggered animations
gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll('.letter-paragraph').forEach((para, i) => {
    gsap.from(para, {
        scrollTrigger: {
            trigger: para,
            start: "top 80%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: i * 0.1,
        ease: "power2.out"
    });
});

document.querySelectorAll('.experience-pod').forEach((pod, i) => {
    gsap.from(pod, {
        scrollTrigger: {
            trigger: pod,
            start: "top 80%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: i * 0.1,
        ease: "power2.out"
    });
    
    gsap.from(pod.querySelector('.pod-glow'), {
        scrollTrigger: {
            trigger: pod,
            start: "top 80%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1 + 0.3,
        ease: "power2.out"
    });
});

// Floating QR code halos
document.querySelectorAll('.qr-port').forEach(port => {
    port.addEventListener('mouseenter', () => {
        gsap.to(port.querySelector('.qr-halo'), {
            opacity: 0.3,
            duration: 0.3,
            ease: "power2.out"
        });
    });
    
    port.addEventListener('mouseleave', () => {
        gsap.to(port.querySelector('.qr-halo'), {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
        });
    });
});

// Initialize skill orbs
document.querySelectorAll('.skill-orb').forEach(orb => {
    const percent = orb.getAttribute('data-percent');
    const fill = orb.querySelector('.skill-fill');
    fill.style.background = `conic-gradient(var(--primary) 0%, var(--primary) ${percent}%, transparent ${percent}%)`;

    orb.addEventListener('mouseenter', () => {
        gsap.to(orb.querySelector('.skill-glow'), {
            opacity: 0.6,
            duration: 0.3,
            ease: "power2.out"
        });
    });
    
    orb.addEventListener('mouseleave', () => {
        gsap.to(orb.querySelector('.skill-glow'), {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
        });
    });
});

// Enhanced Navigation System
const initNavigation = () => {
    const nav = document.querySelector('.orbital-nav');
    const navOrbit = document.querySelector('.nav-orbit');
    const navBtns = [coverLetterBtn, cvBtn, referencesBtn];
    const sections = [coverLetter, cvPage, referencesPage];
    const navTrail = document.querySelector('.nav-trail');
    
    // Intersection Observer for section detection
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeIndex = sections.findIndex(section => section === entry.target);
                if (activeIndex !== -1) {
                    updateActiveNav(activeIndex);
                }
            }
        });
    }, observerOptions);

    // Observe all sections
    sections.forEach(section => observer.observe(section));

    // Update active navigation state
    const updateActiveNav = (index) => {
        navBtns.forEach(btn => btn.classList.remove('active'));
        navBtns[index].classList.add('active');
        updateNavTrail();
    };

    // Enhanced nav trail animation
    const updateNavTrail = () => {
        const activeBtn = document.querySelector('.nav-btn.active');
        if (!activeBtn) return;

        const btnRect = activeBtn.getBoundingClientRect();
        const navRect = navOrbit.getBoundingClientRect();
        const trailWidth = btnRect.width;
        const trailLeft = btnRect.left - navRect.left;

        gsap.to(navTrail, {
            x: trailLeft,
            width: trailWidth,
            duration: 0.6,
            ease: "back.out(1.7)",
            overwrite: true
        });
    };

    // Enhanced smooth scrolling
    const scrollToSection = (section, index) => {
        gsap.to(window, {
            scrollTo: {
                y: section,
                offsetY: nav.offsetHeight + 20,
                autoKill: false
            },
            duration: 1.2,
            ease: "power3.inOut",
            onStart: () => updateActiveNav(index)
        });
    };

    // Event listeners with improved performance
    navBtns.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToSection(sections[index], index);
        });
    });

    // Initialize on load
    const initializeNavigation = () => {
        updateNavTrail();
        window.scrollTo(0, 0);
    };

    // Handle resize events with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateNavTrail();
        }, 100);
    });

    // Initialize everything
    initializeNavigation();
};

// Call the initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initNavigation);
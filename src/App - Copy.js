import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, doc, getDoc } from 'firebase/firestore';

// Importing icons from lucide-react (simulated for Canvas environment)
const Home = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const User = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucude-user">
    <circle cx="12" cy="7" r="4"/><path d="M12 16v6"/><path d="M8 20l-1-1"/><path d="M16 20l1-1"/><path d="M6 14L4 12"/><path d="M18 14l2-2"/><path d="M3 3l-.5-.5"/><path d="M21 3l.5-.5"/>
  </svg>
);
const Lightbulb = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lightbulb">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 3c0 1.3.5 2.6 1.5 3.5.8.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/><path d="M11 17L12 18"/><path d="M12 14L13 15"/><path d="M12 9V5"/><path d="M14 19.5L16 20"/><path d="M8 19.5L6 20"/>
  </svg>
);
const Briefcase = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const Mail = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const Github = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.082-.746.084-.729.084-.729 1.192.086 1.815 1.291 1.815 1.291 1.053 1.814 2.91.086 3.61-.007.104-.67.412-1.291.79-1.729-2.766-.318-5.645-1.379-5.645-6.159 0-1.309.465-2.387 1.235-3.221-.103-.318-.421-1.507.098-3.149 0 0 1.004-.322 3.286 1.267.959-.266 1.983-.399 3.004-.404 1.02.005 2.044.138 3.003.404 2.283-1.587 3.286-1.267 3.286-1.267.522 1.643.205 2.831.098 3.149.77.835 1.234 1.911 1.234 3.221 0 4.795-2.883 5.836-5.65.659.429.369.812 1.103.812 2.221v3.293c0 .319.192.694.801.576C20.562 22.181 24 17.6 24 12 24 5.373 18.627 0 12 0Z"/>
  </svg>
);
const Linkedin = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

// Custom Discord Icon
const Discord = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.25 0H3.75C1.678 0 0 1.678 0 3.75V20.25C0 22.322 1.678 24 3.75 24H20.25C22.322 24 24 22.322 24 20.25V3.75C24 1.678 22.322 0 20.25 0ZM18.75 8.25C18.75 7.146 17.854 6.25 16.75 6.25C15.646 6.25 14.75 7.146 14.75 8.25C14.75 9.354 15.646 10.25 16.75 10.25C17.854 10.25 18.75 9.354 18.75 8.25ZM5.25 8.25C5.25 7.146 6.146 6.25 7.25 6.25C8.354 6.25 9.25 7.146 9.25 8.25C9.25 9.354 8.354 10.25 7.25 10.25C6.146 10.25 5.25 9.354 5.25 8.25ZM18.75 15C18.75 16.104 17.854 17 16.75 17C15.646 17 14.75 16.104 14.75 15C14.75 13.896 15.646 13 16.75 13C17.854 13 18.75 13.896 18.75 15ZM5.25 15C5.25 16.104 6.146 17 7.25 17C8.354 17 9.25 16.104 9.25 15C9.25 13.896 8.354 13 7.25 13C6.146 13 5.25 13.896 5.25 15Z"/>
  </svg>
);

// Custom WebNovel Icon (stylized 'W' for Webnovel)
const WebNovel = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 16L7 8L12 16L17 8L21 16"/>
    <path d="M12 16V22"/>
    <path d="M12 2L12 8"/>
  </svg>
);

// Custom Science/Flask Icon (for materials engineer theme)
const Flask = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flask">
    <path d="M14.4 14.4 17 21l-7-3-2.6-6.6a2 2 0 0 0-1.8-1.3l-6.4-.7a2 2 0 0 0-1.6 3.4l6.4 6.4"/>
    <path d="M17 21h-2l-2-2m2-2h2m-2 0 2-2m-2 0v-2m-2-2v-2"/>
    <path d="M11 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2z"/>
  </svg>
);

// Custom Group/Users Icon for Lab Group
const Users = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

// Custom Superprof Icon (a simple 'S' in a square)
const Superprof = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="4" ry="4" fill="none" stroke="currentColor" strokeWidth="2"/>
    <path d="M10 7h4c1.1 0 2 .9 2 2s-.9 2-2 2h-2v2h4v2h-4c-1.1 0-2-.9-2-2s.9-2 2-2h2V9H8V7z"/>
  </svg>
);

// New Icons for About section titles
const GraduationCap = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-graduation-cap">
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.01 2.983a1 1 0 0 0-.99 0L2.6 9.084a1 1 0 0 0-.019 1.838l8.89 4.444a1 1 0 0 0 1.01 0l8.89-4.444Z"/><path d="M12 19.5v-7.5"/><path d="M6 16.5l-3.5 2"/><path d="M18 16.5l3.5 2"/>
  </svg>
);

const Award = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-award">
    <circle cx="12" cy="8" r="7"/><path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.11"/>
  </svg>
);

const BookOpen = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const Calendar = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

// New icon for Publications section
const FileText = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
  </svg>
);


// Navbar Component
const Navbar = ({ setCurrentPage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavLinkClick = (pageId) => {
    setCurrentPage(pageId);
    setIsOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <nav className="fixed w-full z-50 bg-gray-900 bg-opacity-95 shadow-lg py-4 px-6 md:px-12 rounded-b-xl">
      <div className="container mx-auto flex justify-between items-center">
        {/* "GG" name on the left (no absolute positioning) */}
        <button className="focus:outline-none text-white text-2xl font-bold font-inter" onClick={() => handleNavLinkClick('home')}>
          GG
        </button>

        {/* Centered navigation links */}
        <div className="hidden md:flex flex-grow justify-center space-x-8"> {/* flex-grow to take available space */}
          <NavLink icon={<Home className="w-5 h-5 mr-1" />} text="Home" pageId="home" onClick={handleNavLinkClick} />
          <NavLink icon={<User className="w-5 h-5 mr-1" />} text="About" pageId="about" onClick={handleNavLinkClick} />
          <NavLink icon={<Flask className="w-5 h-5 mr-1" />} text="Expertise" pageId="skills" onClick={handleNavLinkClick} />
          {/* Removed Research Tab */}
          <NavLink icon={<FileText className="w-5 h-5 mr-1" />} text="Publications" pageId="publications" onClick={handleNavLinkClick} />
          <NavLink icon={<Mail className="w-5 h-5 mr-1" />} text="Contact" pageId="contact" onClick={handleNavLinkClick} />
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-200 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden mt-4 space-y-2 bg-gray-800">
          <NavLink icon={<Home className="w-5 h-5 mr-1" />} text="Home" pageId="home" isMobile={true} onClick={handleNavLinkClick} />
          <NavLink icon={<User className="w-5 h-5 mr-1" />} text="About" pageId="about" isMobile={true} onClick={handleNavLinkClick} />
          <NavLink icon={<Flask className="w-5 h-5 mr-1" />} text="Expertise" pageId="skills" isMobile={true} onClick={handleNavLinkClick} />
          {/* Removed Research Tab for mobile */}
          <NavLink icon={<FileText className="w-5 h-5 mr-1" />} text="Publications" pageId="publications" isMobile={true} onClick={handleNavLinkClick} />
          <NavLink icon={<Mail className="w-5 h-5 mr-1" />} text="Contact" pageId="contact" isMobile={true} onClick={handleNavLinkClick} />
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ icon, text, pageId, isMobile, onClick }) => (
  <button
    className={`flex items-center text-gray-200 hover:text-blue-400 transition duration-300 font-semibold focus:outline-none ${isMobile ? 'block w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700' : ''}`}
    onClick={() => onClick(pageId)}
  >
    {icon}
    {text}
  </button>
);

// Animated Content Wrapper for entrance animations
const AnimatedContent = ({ children, delay = 0, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`${className} transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      {children}
    </div>
  );
};

// Material Sciences 3D Simulation Background Component (Existing background)
const MaterialSimulationBackground = () => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 5, 5).normalize();
    scene.add(directionalLight);

    const atomGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const bondGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1, 16);

    const atomMaterial1 = new THREE.MeshPhongMaterial({ color: 0x64b5f6, flatShading: true });
    const atomMaterial2 = new THREE.MeshPhongMaterial({ color: 0x81c784, flatShading: true });
    const bondMaterial = new THREE.MeshPhongMaterial({ color: 0x90a4ae, flatShading: true });

    const latticeGroup = new THREE.Group();
    const gridSize = 2;
    const spacing = 2;

    for (let x = -gridSize; x <= gridSize; x++) {
      for (let y = -gridSize; y <= gridSize; y++) {
        for (let z = -gridSize; z <= gridSize; z++) {
          const xPos = x * spacing;
          const yPos = y * spacing;
          const zPos = z * spacing;

          const atom1 = new THREE.Mesh(atomGeometry, atomMaterial1);
          atom1.position.set(xPos, yPos, zPos);
          latticeGroup.add(atom1);

          const atom2 = new THREE.Mesh(atomGeometry, atomMaterial2);
          atom2.position.set(xPos + spacing / 2, yPos + spacing / 2, zPos + spacing / 2);
          latticeGroup.add(atom2);

          const bond1 = new THREE.Mesh(bondGeometry, bondMaterial);
          bond1.position.set(xPos + spacing / 4, yPos + spacing / 4, zPos + spacing / 4);
          bond1.lookAt(atom2.position);
          bond1.rotation.x += Math.PI / 2;
          bond1.scale.y = atom1.position.distanceTo(atom2.position);
          latticeGroup.add(bond1);

          const neighbors = [
            [spacing, 0, 0], [0, spacing, 0], [0, 0, spacing],
            [-spacing, 0, 0], [0, -spacing, 0], [0, 0, -spacing]
          ];
          neighbors.forEach(offset => {
            const neighborPos = new THREE.Vector3(xPos + offset[0], yPos + offset[1], zPos + offset[2]);
            const bond = new THREE.Mesh(bondGeometry, bondMaterial);
            bond.position.copy(atom1.position).add(neighborPos).divideScalar(2);
            bond.lookAt(neighborPos);
            bond.rotation.x += Math.PI / 2;
            bond.scale.y = atom1.position.distanceTo(neighborPos);
            if (bond.scale.y > 0.1) {
                latticeGroup.add(bond);
            }
          });
        }
      }
    }
    scene.add(latticeGroup);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    window.onload = function() {
      animate();
    };

    const handleResize = () => {
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.onload = null;
      if (rendererRef.current) {
        rendererRef.current.dispose();
        currentMount.removeChild(rendererRef.current.domElement);
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      scene.clear();
    };
  }, []);

  return (
    <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 overflow-hidden">
      {/* Canvas will be appended here by Three.js */}
    </div>
  );
};

// Image Carousel Component for the Hero Section
const ImageCarousel = ({ images, currentIndex }) => {
  const [imageLoadError, setImageLoadError] = useState(false);

  if (images.length === 0) {
    return (
      <div className="relative w-full h-full bg-gray-900 flex items-center justify-center text-gray-400 font-bold text-2xl">
        {/* No background images provided. */}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Slides Container */}
      <div
        className="flex h-full transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => {
          return (
            <img
              key={index}
              src={image}
              alt={`Materials Engineer Image ${index + 1}`}
              className="flex-shrink-0 w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loops if fallback also fails
                e.target.src = `https://placehold.co/1920x1080/FF0000/FFFFFF?text=Error`; // Generic error placeholder
                setImageLoadError(true); // Set error state to true
                console.warn(`Error loading image ${image}. This often happens if the image is temporarily unavailable or there's a network issue. Error type: ${e.type || 'unknown'}`);
              }}
            />
          );
        })}
      </div>

      {/* Error Message Overlay */}
      {imageLoadError && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white text-center p-4 z-20">
          <p className="text-xl font-bold mb-2">Some Background Images Failed to Load</p>
          <p className="text-md">
            This might be due to temporary network issues or the image host being unavailable.
            The carousel will continue to try loading the next available images.
          </p>
        </div>
      )}
    </div>
  );
};


// Hero Section (Homepage content only)
const Hero = ({ setCurrentPage }) => {
    const heroRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // State for current image index
    const autoCycleTimerRef = useRef(null); // Ref to hold the auto-cycle interval ID

    const heroImages = [
      "https://d14k1d0ecj3g0p.cloudfront.net/wp-content/uploads/2021/06/IISc3-1.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/IISc_Materials_Engineering_dept.JPG/1200px-IISc_Materials_Engineering_dept.JPG?20090909040957",
    ];

    const startAutoCycle = useCallback(() => {
        // Clear any existing interval to prevent multiple timers
        if (autoCycleTimerRef.current) {
            clearInterval(autoCycleTimerRef.current);
        }

        autoCycleTimerRef.current = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 4000); // Auto-cycle every 4 seconds
    }, [heroImages.length]); // Recreate if number of images changes

    useEffect(() => {
        // Start auto-cycling when component mounts
        startAutoCycle();

        // Handle window resize for parallax effect
        const currentRef = heroRef.current;
        const handleScroll = () => {
          if (currentRef) {
            setScrollPosition(currentRef.scrollTop);
          }
        };

        if (currentRef) {
          currentRef.addEventListener('scroll', handleScroll);
        }

        // Cleanup on component unmount
        return () => {
            if (autoCycleTimerRef.current) {
                clearInterval(autoCycleTimerRef.current);
            }
            if (currentRef) {
              currentRef.removeEventListener('scroll', handleScroll);
            }
        };
    }, [startAutoCycle]); // Depend on startAutoCycle to re-run effect if it changes

    const handleManualImageChange = (newIndex) => {
        // Clear the auto-cycle timer immediately on manual change
        if (autoCycleTimerRef.current) {
            clearInterval(autoCycleTimerRef.current);
        }
        setCurrentImageIndex(newIndex);
        // Restart the auto-cycle after a short delay
        setTimeout(() => {
            startAutoCycle();
        }, 500); // Give a small delay before auto-cycling resumes
    };

    const goToNextImage = () => {
      handleManualImageChange((currentImageIndex + 1) % heroImages.length);
    };

    const goToPreviousImage = () => {
      handleManualImageChange((currentImageIndex - 1 + heroImages.length) % heroImages.length);
    };


    const getSectionStyles = (sectionIndex) => {
      if (!heroRef.current) return {};

      const viewportHeight = window.innerHeight;
      const currentScroll = scrollPosition;

      const normalizedProgress = (currentScroll - (sectionIndex * viewportHeight)) / viewportHeight;

      let opacity;
      let blur; // px
      let scale;
      let translateY; // px

      if (normalizedProgress >= -1 && normalizedProgress <= 1) {
        const absProgress = Math.abs(normalizedProgress);
        const easedProgress = Math.pow(absProgress, 2);

        opacity = 1 - easedProgress;
        blur = easedProgress * 15;
        scale = 1 - (easedProgress * 0.1);
        translateY = normalizedProgress * 100;
      } else {
        opacity = 0;
        blur = 15;
        scale = 0.9;
        translateY = normalizedProgress > 0 ? 100 : -100;
      }

      return {
        opacity,
        filter: `blur(${blur}px)`,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        pointerEvents: opacity > 0.1 ? 'auto' : 'none',
        transition: 'none',
        willChange: 'opacity, filter, transform',
      };
    };


    return (
        <section id="hero" ref={heroRef} className="relative w-full h-screen overflow-y-scroll snap-y-mandatory scroll-smooth">
            {/* 3D Simulation Background (full screen, spans entire hero scroll height) */}
            <MaterialSimulationBackground />

            {/* Image Carousel (full screen, behind content, spans entire hero scroll height) */}
            <div className="absolute inset-0 z-0">
                <ImageCarousel
                    images={heroImages}
                    currentIndex={currentImageIndex}
                />
            </div>

            {/* Navigation Buttons for Image Carousel */}
            <div className="absolute inset-y-0 left-0 flex items-center z-20 px-4">
                <button
                    onClick={goToPreviousImage}
                    className="bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition duration-300 focus:outline-none"
                    aria-label="Previous image"
                >
                    &larr;
                </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center z-20 px-4">
                <button
                    onClick={goToNextImage}
                    className="bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition duration-300 focus:outline-none"
                    aria-label="Next image"
                >
                    &rarr;
                </button>
            </div>


            {/* SECTION 1: Main Hero Content */}
            <div className="relative z-10 h-screen flex items-center justify-center p-4 snap-start" style={getSectionStyles(0)}>
                <AnimatedContent delay={0} className="w-full"> {/* Added AnimatedContent for the main hero block */}
                    <div className="bg-gray-800 bg-opacity-80 p-8 md:p-12 rounded-xl max-w-5xl mx-auto shadow-2xl backdrop-blur-sm text-white text-center border border-gray-700">
                        <AnimatedContent delay={100}>
                            <p className="text-lg text-blue-300 font-semibold mb-2 font-inter">Materials Sciences Engineer</p>
                        </AnimatedContent>
                        <AnimatedContent delay={200}>
                            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 font-inter text-white">
                                Innovating at the <span className="text-blue-200">Atomic Scale</span>
                            </h1>
                        </AnimatedContent>
                        <AnimatedContent delay={300}>
                            <p className="text-xl md:text-2xl mb-8 font-inter text-gray-200">
                                I am <span className="font-semibold text-white">Your Name</span>, passionate about developing and characterizing advanced materials for a sustainable future.
                            </p>
                        </AnimatedContent>
                        <AnimatedContent delay={400}>
                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                                {/* Changed button to Publications */}
                                <button
                                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
                                    onClick={() => setCurrentPage('publications')}
                                >
                                    Explore My Publications
                                </button>
                                <button
                                    className="px-8 py-3 bg-gray-200 text-gray-800 font-bold rounded-full shadow-lg hover:bg-gray-300 transition duration-300 transform hover:scale-105"
                                    onClick={() => setCurrentPage('contact')}
                                >
                                    Connect With Me
                                </button>
                            </div>
                        </AnimatedContent>
                    </div>
                </AnimatedContent>
            </div>

            {/* SECTION 2: Brief Expertise & Research Highlights (on homepage) */}
            <div className="relative z-10 h-screen flex items-center justify-center p-4 snap-start" style={getSectionStyles(1)}>
                <AnimatedContent delay={0} className="w-full">
                    <div className="p-6 max-w-6xl mx-auto rounded-xl shadow-2xl bg-gray-800 bg-opacity-95 backdrop-blur-md border border-gray-700">
                        <AnimatedContent delay={100}>
                            <h2 className="text-4xl font-bold text-gray-100 mb-8 font-inter">
                                My Core Focus
                            </h2>
                        </AnimatedContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                            {/* Publications Highlight (repurposed from Research Highlight) */}
                            <AnimatedContent delay={200}>
                                <div className="bg-gray-900 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => setCurrentPage('publications')}>
                                    <h3 className="text-2xl font-bold text-blue-400 mb-3 font-inter flex items-center">
                                        <FileText className="w-6 h-6 mr-2" /> Latest Publications
                                    </h3>
                                    <p className="text-gray-200 mb-4 font-inter">
                                        Discover my contributions to the field through my published research papers and articles.
                                    </p>
                                    <button
                                        className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200 font-semibold"
                                    >
                                        View All Publications &rarr;
                                    </button>
                                </div>
                            </AnimatedContent>

                            {/* Expertise Highlight */}
                            <AnimatedContent delay={300}>
                                <div className="bg-gray-900 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => setCurrentPage('skills')}>
                                    <h3 className="text-2xl font-bold text-green-400 mb-3 font-inter flex items-center">
                                        <Flask className="w-6 h-6 mr-2" /> Key Expertise
                                    </h3>
                                    <p className="text-gray-200 mb-4 font-inter">
                                        Proficient in <span className="font-semibold">characterization techniques</span> (SEM, XRD, TEM) and computational modeling (DFT, MD) to predict and analyze material behavior.
                                    </p>
                                    <button
                                        className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors duration-200 font-semibold"
                                    >
                                        See Full Expertise &rarr;
                                    </button>
                                </div>
                            </AnimatedContent>
                        </div>
                    </div>
                </AnimatedContent>
            </div>

            {/* SECTION 3: Brief About Me (on homepage) */}
            <div className="relative z-10 h-screen flex items-center justify-center p-4 snap-start" style={getSectionStyles(2)}>
                <AnimatedContent delay={0} className="w-full">
                    <div className="p-6 max-w-6xl mx-auto rounded-xl shadow-2xl bg-gray-800 bg-opacity-95 backdrop-blur-md border border-gray-700">
                        <AnimatedContent delay={100}>
                            <h2 className="text-4xl font-bold text-gray-100 mb-8 font-inter">
                                A Little About Me
                            </h2>
                        </AnimatedContent>
                        <div className="flex flex-col md:flex-row items-center md:space-x-8">
                            <AnimatedContent delay={200} className="md:w-1/2 mb-6 md:mb-0">
                                <img
                                    src="https://placehold.co/400x300/334155/E2E8F0?text=Your+Photo" // Placeholder for your actual photo
                                    alt="Your Photo"
                                    className="rounded-lg shadow-md w-full h-auto object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/334155/E2E8F0?text=Your+Photo"; }}
                                />
                            </AnimatedContent>
                            <AnimatedContent delay={300} className="md:w-1/2 text-lg text-gray-200 font-inter space-y-3">
                                <p>
                                    As a Materials Sciences Engineer, I'm driven by curiosity and a commitment to innovation. My journey involves hands-on experimentation and computational analysis to unravel the mysteries of materials.
                                </p>
                                <p>
                                    I'm passionate about developing practical, sustainable solutions that address real-world challenges, from energy efficiency to advanced manufacturing. Let's connect and explore how our work can intersect!
                                </p>
                                <button
                                    className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-200 font-semibold mt-4"
                                    onClick={() => setCurrentPage('about')}
                                >
                                    Read My Full Bio &rarr;
                                </button>
                            </AnimatedContent>
                        </div>
                    </div>
                </AnimatedContent>
            </div>
        </section>
    );
};


// About Section
const About = ({ db, appId }) => {
  const [aboutContent, setAboutContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db || !appId) return;

    const aboutDocRef = doc(db, `artifacts/${appId}/public/data/aboutContent/aboutData`);

    const unsubscribe = onSnapshot(aboutDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setAboutContent(docSnap.data());
      } else {
        console.warn("No 'aboutData' document found in Firestore. Please add data via Firebase console.");
        // Provide default empty arrays if document doesn't exist, so sections don't break
        setAboutContent({ qualifications: [], awards: [], publications: [], conferences: [] });
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching about content:", err);
      setError("Failed to load about content. Please ensure Firestore Security Rules are correctly set up. Error: " + err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, appId]);

  if (loading) {
    return (
      <section id="about" className="py-20 px-6 bg-gray-900 min-h-screen pt-20 flex items-center justify-center">
        <div className="text-gray-400 text-xl">Loading About Me content...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="about" className="py-20 px-6 bg-gray-900 min-h-screen pt-20 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </section>
    );
  }

  return (
    <section id="about" className="py-20 px-6 bg-gray-900 min-h-screen pt-20">
      <div className="container mx-auto max-w-4xl">
        <AnimatedContent delay={100}>
          <h2 className="text-4xl font-bold text-center text-gray-100 mb-12 font-inter">
            About Me
          </h2>
        </AnimatedContent>
        <div className="flex flex-col md:flex-row items-center md:space-x-12">
          <AnimatedContent delay={200} className="md:w-1/2 mb-8 md:mb-0">
            <img
              src="https://placehold.co/400x300/334155/E2E8F0?text=Materials+Engineer"
              alt="About Me"
              className="rounded-xl shadow-lg w-full h-auto transform hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/334155/E2E8F0?text=Materials+Engineer"; }}
            />
          </AnimatedContent>
          <AnimatedContent delay={300} className="md:w-1/2 text-lg text-gray-200 space-y-4 font-inter">
            <p>
              Hello! I'm Your Name, a dedicated Materials Sciences Engineer with X years of experience
              at the intersection of physics, chemistry, and engineering. My work focuses on understanding
              the fundamental properties of materials and designing novel ones for advanced applications.
            </p>
            <p>
              My expertise lies in areas such as <span className="font-semibold text-indigo-300">nanomaterials, advanced composites, and sustainable materials development</span>.
              I thrive on experimental design, data analysis, and using computational tools to predict material behavior.
            </p>
            <p>
              Beyond the lab, I enjoy exploring new hiking trails,
              reading sci-fi novels, and contributing to open-source science projects.
            </p>
            <div className="pt-4 flex space-x-4">
              <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Github className="w-8 h-8" />
              </a>
              <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin className="w-8 h-8" />
              </a>
              <a href="https://discord.gg/yourinvite" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Discord className="w-8 h-8" />
              </a>
              <a href="https://yourwebnovel.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <WebNovel className="w-8 h-8" />
              </a>
              <a href="https://www.superprof.co.in/yourusername" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Superprof className="w-8 h-8" />
              </a>
            </div>
          </AnimatedContent>
        </div>

        {/* Lab Affiliation Section */}
        <div className="mt-16 pt-8 border-t border-gray-700">
          <AnimatedContent delay={350}>
            <h3 className="text-3xl font-bold text-gray-100 mb-6 font-inter text-center flex items-center justify-center">
              <Users className="w-7 h-7 mr-2 text-blue-400" /> Lab Affiliation
            </h3>
            <p className="text-lg text-gray-200 text-center font-inter">
              I am currently a PhD researcher at the <span className="font-semibold text-blue-300">Advanced Materials Lab</span> at University Name.
              You can learn more about our research and projects here:
            </p>
            <div className="flex justify-center mt-4">
              <a
                href="https://your-lab-group-website.com" // Replace with your actual lab group website URL
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
              >
                Visit Our Lab Website <span className="ml-2">↗</span>
              </a>
            </div>
          </AnimatedContent>
        </div>


        {/* Qualifications Section */}
        {(aboutContent?.qualifications && aboutContent.qualifications.length > 0) ? (
          <div className="mt-16 pt-8 border-t border-gray-700">
            <AnimatedContent delay={400}>
              <h3 className="text-3xl font-bold text-gray-100 mb-6 font-inter text-center flex items-center justify-center">
                <GraduationCap className="w-8 h-8 mr-2 text-blue-300" /> Qualifications
              </h3>
              <ul className="list-disc list-inside text-lg text-gray-200 space-y-2 font-inter pl-4">
                {aboutContent.qualifications.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </AnimatedContent>
          </div>
        ) : (
          <div className="mt-16 pt-8 border-t border-gray-700 text-center text-gray-400">
            <AnimatedContent delay={400}>
              <h3 className="text-3xl font-bold text-gray-100 mb-6 font-inter text-center flex items-center justify-center">
                <GraduationCap className="w-8 h-8 mr-2 text-blue-300" /> Qualifications
              </h3>
              No qualifications added yet. Add them in Firestore under `aboutContent/aboutData` with a `qualifications` array.
            </AnimatedContent>
          </div>
        )}

        {/* Awards and Recognition Section */}
        {(aboutContent?.awards && aboutContent.awards.length > 0) ? (
          <div className="mt-8 pt-8 border-t border-gray-700">
            <AnimatedContent delay={500}>
              <h3 className="text-3xl font-bold text-gray-100 mb-6 font-inter text-center flex items-center justify-center">
                <Award className="w-8 h-8 mr-2 text-yellow-300" /> Awards & Recognition
              </h3>
              <ul className="list-disc list-inside text-lg text-gray-200 space-y-2 font-inter pl-4">
                {aboutContent.awards.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </AnimatedContent>
          </div>
        ) : (
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <AnimatedContent delay={500}>
              <h3 className="text-3xl font-bold text-gray-100 mb-6 font-inter text-center flex items-center justify-center">
                <Award className="w-8 h-8 mr-2 text-yellow-300" /> Awards & Recognition
              </h3>
              No awards added yet. Add them in Firestore under `aboutContent/aboutData` with an `awards` array.
            </AnimatedContent>
          </div>
        )}

        {/* Selected Publications Section (now pulling from aboutContent for consistency, but will be moved to dedicated page) */}
        {(aboutContent?.publications && aboutContent.publications.length > 0) ? (
          <div className="mt-8 pt-8 border-t border-gray-700">
            <AnimatedContent delay={600}>
              <h3 className="text-3xl font-bold text-gray-100 mb-6 font-inter text-center flex items-center justify-center">
                <BookOpen className="w-8 h-8 mr-2 text-purple-300" /> Selected Publications
              </h3>
              <ul className="list-disc list-inside text-lg text-gray-200 space-y-3 font-inter pl-4">
                {aboutContent.publications.map((pub, index) => (
                  <li key={index}>
                    <span className="font-semibold">"{pub.title},"</span> {pub.journal}, Vol. {pub.volume}, No. {pub.number}, pp. {pub.pages}, {pub.year}.
                  </li>
                ))}
              </ul>
            </AnimatedContent>
          </div>
        ) : (
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <AnimatedContent delay={600}>
              <h3 className="text-3xl font-bold text-gray-100 mb-6 font-inter text-center flex items-center justify-center">
                <BookOpen className="w-8 h-8 mr-2 text-purple-300" /> Selected Publications
              </h3>
              No publications added yet. Add them in Firestore under `aboutContent/aboutData` with a `publications` array (objects with `title`, `journal`, `volume`, `number`, `pages`, `year`).
            </AnimatedContent>
          </div>
        )}

        {/* Conferences and Workshops Section */}
        {(aboutContent?.conferences && aboutContent.conferences.length > 0) ? (
          <div className="mt-8 pt-8 border-t border-gray-700">
            <AnimatedContent delay={700}>
              <h3 className="text-3xl font-bold text-gray-100 mb-6 font-inter text-center flex items-center justify-center">
                <Calendar className="w-8 h-8 mr-2 text-green-300" /> Conferences & Workshops
              </h3>
              <ul className="list-disc list-inside text-lg text-gray-200 space-y-2 font-inter pl-4">
                {aboutContent.conferences.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </AnimatedContent>
          </div>
        ) : (
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <AnimatedContent delay={700}>
              <h3 className="text-3xl font-bold text-gray-100 mb-6 font-inter text-center flex items-center justify-center">
                <Calendar className="w-8 h-8 mr-2 text-green-300" /> Conferences & Workshops
              </h3>
              No conferences or workshops added yet. Add them in Firestore under `aboutContent/aboutData` with a `conferences` array.
            </AnimatedContent>
          </div>
        )}
      </div>
    </section>
  );
};

// Skills Section (Renamed to Expertise)
const Skills = () => {
  const categories = [
    {
      name: "Material Synthesis",
      skills: ["Thin Film Deposition (PVD, CVD)", "Nanomaterial Synthesis (Hydrothermal, Sol-gel)", "Polymerization", "Composite Fabrication"],
      icon: "🧪"
    },
    {
      name: "Characterization",
      skills: ["SEM/TEM", "XRD", "FTIR", "Raman Spectroscopy", "Mechanical Testing (Tensile, Hardness)", "Thermal Analysis (DSC, TGA)"],
      icon: "🔬"
    },
    {
      name: "Computational Materials",
      skills: ["Density Functional Theory (DFT)", "Molecular Dynamics (MD)", "Phase-Field Modeling", "Finite Element Analysis (FEA)", "Python (NumPy, SciPy)"],
      icon: "💻"
    },
    {
      name: "Software & Tools",
      skills: ["MATLAB", "OriginLab", "SolidWorks", "Abaqus", "Git/GitHub", "LaTeX"],
      icon: "🛠️"
    }
  ];

  return (
    <section id="skills" className="py-20 px-6 bg-gray-800 min-h-screen pt-20">
      <div className="container mx-auto, max-w-5xl">
        <AnimatedContent delay={100}>
          <h2 className="text-4xl font-bold text-center text-gray-100 mb-12 font-inter">
            My Expertise
          </h2>
        </AnimatedContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <AnimatedContent key={index} delay={200 + index * 100}>
              <div className="bg-gray-900 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 border border-gray-700">
                <div className="text-5xl text-center mb-6">{category.icon}</div>
                <h3 className="text-2xl font-semibold text-gray-100 mb-6 text-center font-inter">{category.name}</h3>
                <ul className="space-y-3 text-lg text-gray-200 font-inter">
                  {category.skills.map((skill, skillIndex) => (
                    <li key={skillIndex} className="flex items-center">
                      <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
};

// Projects Section (Renamed to Research) - REMOVED
// const Projects = ({ db, appId }) => {
//   // Hardcoded sample projects
//   const sampleProjects = [
//     {
//       title: "Development of High-Strength Composites",
//       description: "Engineered novel polymer-matrix composites for aerospace applications, optimizing their mechanical properties through microstructural control.",
//       technologies: ["Polymer Composites", "Fiber Reinforcement", "Mechanical Testing", "FEA Modeling"],
//       image: "https://placehold.co/400x250/C0E6FF/000000?text=Composites",
//       liveLink: "#", // Placeholder
//       githubLink: "#" // Placeholder
//     },
//     {
//       title: "Nanomaterial Synthesis for Energy Storage",
//       description: "Synthesized and characterized novel 2D nanomaterials for enhanced lithium-ion battery electrodes, demonstrating improved capacity and cycle life.",
//       technologies: ["Nanomaterials", "Electrochemistry", "TEM", "XRD", "Material Synthesis"],
//       image: "https://placehold.co/400x250/B5CCFF/000000?text=Nanomaterials",
//       liveLink: "#",
//       githubLink: "#"
//     },
//     {
//       title: "Corrosion Resistance in Advanced Alloys",
//       description: "Investigated the corrosion mechanisms of high-entropy alloys in harsh environments and developed surface modification techniques to enhance durability.",
//       technologies: ["Metallurgy", "Corrosion Science", "SEM/EDS", "Electrochemistry"],
//       image: "https://placehold.co/400x250/C6F6D5/000000?text=Alloys",
//       liveLink: "#",
//       githubLink: "#"
//     },
//     {
//       title: "Biocompatible Coatings for Implants",
//       description: "Developed and characterized novel ceramic coatings for biomedical implants to improve biocompatibility and reduce wear, leveraging PVD techniques.",
//       technologies: ["Biomaterials", "Thin Films", "PVD", "Cell Culture", "Mechanical Testing"],
//       image: "https://placehold.co/400x250/FFDDC1/000000?text=Biocoatings",
//       liveLink: "#",
//       githubLink: "#"
//     }
//   ];

//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!db || !appId) {
//       // If Firebase not initialized, use sample projects immediately
//       setProjects(sampleProjects);
//       setLoading(false);
//       return;
//     }

//     const projectsColRef = collection(db, `artifacts/${appId}/public/data/projects`);
//     const q = query(projectsColRef);

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const fetchedProjects = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       // If no projects are fetched from Firestore, use sample projects
//       if (fetchedProjects.length === 0) {
//         setProjects(sampleProjects);
//       } else {
//         setProjects(fetchedProjects);
//       }
//       setLoading(false);
//     }, (err) => {
//       console.error("Error fetching projects from Firestore:", err);
//       setError("Failed to load projects from Firestore. Displaying sample projects. Error: " + err.message);
//       setProjects(sampleProjects); // Fallback to sample projects on error
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, [db, appId]); // Depend on db and appId to re-run effect if they change

//   if (loading) {
//     return (
//       <section id="projects" className="py-20 px-6 bg-gray-900 min-h-screen pt-20 flex items-center justify-center">
//         <div className="text-gray-400 text-xl">Loading Research Projects...</div>
//       </section>
//     );
//   }

//   if (error) {
//     return (
//       <section id="projects" className="py-20 px-6 bg-gray-900 min-h-screen pt-20 flex items-center justify-center">
//         <div className="text-yellow-400 text-xl">
//           {error}
//           <br/>
//           <span className="text-sm text-gray-500">
//             (If you want to use your own projects, please add them to Firestore at `artifacts/{your_app_id}/public/data/projects`.)
//           </span>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section id="projects" className="py-20 px-6 bg-gray-900 min-h-screen pt-20">
//       <div className="container mx-auto max-w-6xl">
//         <AnimatedContent delay={100}>
//           <h2 className="text-4xl font-bold text-center text-gray-100 mb-12 font-inter">
//             My Research & Projects
//           </h2>
//         </AnimatedContent>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
//           {projects.map((project, index) => (
//             <AnimatedContent key={index} delay={200 + index * 100}>
//               <ProjectCard project={project} />
//             </AnimatedContent>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// const ProjectCard = ({ project }) => {
//   return (
//     <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 transform hover:scale-105 hover:shadow-xl transition-all duration-300">
//       <img
//         src={project.image || "https://placehold.co/400x250/CCCCCC/000000?text=Placeholder"}
//         alt={project.title}
//         className="w-full h-52 object-cover object-center border-b border-gray-700"
//         onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x250/CCCCCC/000000?text=Placeholder"; }}
//       />
//       <div className="p-6">
//         <h3 className="text-2xl font-semibold text-gray-100 mb-3 font-inter">{project.title}</h3>
//         <p className="text-gray-200 mb-4 font-inter">{project.description}</p>
//         <div className="flex flex-wrap gap-2 mb-5">
//           {project.technologies && project.technologies.map((tech, index) => (
//             <span key={index} className="bg-blue-900 text-blue-400 text-sm font-medium px-3 py-1 rounded-full font-inter">
//               {tech}
//             </span>
//           ))}
//         </div>
//         <div className="flex justify-start space-x-4">
//           <a
//             href={project.liveLink || "#"}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 text-sm font-semibold"
//           >
//             <span className="mr-1">🔗</span> View Details
//           </a>
//           {/* Using a generic 'Code' link for research projects, could be data repo/simulation code */}
//           <a
//             href={project.githubLink || "#"}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="flex items-center px-4 py-2 bg-gray-600 text-gray-100 rounded-lg shadow-md hover:bg-gray-500 transition duration-300 text-sm font-semibold"
//           >
//             <Github className="w-4 h-4 mr-1" /> Code/Data
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// };

// Publications Section Component
const Publications = ({ db, appId }) => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db || !appId) return;

    // Fetch from a new 'publications' collection
    const publicationsColRef = collection(db, `artifacts/${appId}/public/data/publications`);
    const q = query(publicationsColRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const publicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by year in descending order, then by title
      publicationsData.sort((a, b) => {
        if (b.year !== a.year) {
          return b.year - a.year;
        }
        return a.title.localeCompare(b.title);
      });
      setPublications(publicationsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching publications:", err);
      setError("Failed to load publications. Please ensure Firestore Security Rules are correctly set up. Error: " + err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, appId]);

  if (loading) {
    return (
      <section id="publications" className="py-20 px-6 bg-gray-900 min-h-screen pt-20 flex items-center justify-center">
        <div className="text-gray-400 text-xl">Loading Publications...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="publications" className="py-20 px-6 bg-gray-900 min-h-screen pt-20 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </section>
    );
  }

  if (publications.length === 0) {
    return (
      <section id="publications" className="py-20 px-6 bg-gray-900 min-h-screen pt-20 flex items-center justify-center">
        <div className="text-gray-400 text-xl text-center">No publications found. Please add them via Firebase console under `artifacts/{appId}/public/data/publications`.</div>
      </section>
    );
  }

  return (
    <section id="publications" className="py-20 px-6 bg-gray-900 min-h-screen pt-20">
      <div className="container mx-auto max-w-4xl">
        <AnimatedContent delay={100}>
          <h2 className="text-4xl font-bold text-center text-gray-100 mb-12 font-inter flex items-center justify-center">
            <FileText className="w-9 h-9 mr-3 text-cyan-300" /> My Publications
          </h2>
        </AnimatedContent>
        <div className="space-y-8">
          {publications.map((pub, index) => (
            <AnimatedContent key={index} delay={200 + index * 100}>
              <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-100 mb-2 font-inter">
                  <a href={pub.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    {pub.title}
                  </a>
                </h3>
                <p className="text-gray-300 text-md mb-2 font-inter">
                  <span className="font-medium">{pub.authors}</span>. {pub.journal}, {pub.volume && `Vol. ${pub.volume}, `}{pub.number && `No. ${pub.number}, `}pp. {pub.pages}, ({pub.year}).
                </p>
                {pub.abstract && (
                  <p className="text-gray-400 text-sm mt-3 font-inter">
                    <span className="font-semibold">Abstract:</span> {pub.abstract}
                  </p>
                )}
                {pub.doi && (
                  <p className="text-gray-400 text-sm mt-2 font-inter">
                    DOI: <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{pub.doi}</a>
                  </p>
                )}
                {pub.keywords && pub.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {pub.keywords.map((keyword, kIndex) => (
                      <span key={kIndex} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full font-inter">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
};


// Contact Section
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('Sending message...');

    console.log('Form Data Submitted:', formData);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStatusMessage('Message sent successfully! Thank you for reaching out.');
      setFormData({ name: '', email: '', message: '' }); // Clear form
      setTimeout(() => setStatusMessage(''), 3000); // Clear status message after 3 seconds

    } catch (error) {
      console.error('Error sending message:', error);
      setStatusMessage('Failed to send message. Please try again later.');
      setTimeout(() => setStatusMessage(''), 3000); // Clear status message after 3 seconds
    }
  };


  return (
    <section id="contact" className="py-20 px-6 bg-gray-800 min-h-screen pt-20">
      <div className="container mx-auto max-w-3xl">
        <AnimatedContent delay={100}>
          <h2 className="text-4xl font-bold text-center text-gray-100 mb-12 font-inter">
            Get In Touch
          </h2>
        </AnimatedContent>
        <AnimatedContent delay={200} className="w-full">
            <div className="bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-700">
                <p className="text-lg text-gray-200 text-center mb-8 font-inter">
                    Have a question, a collaboration idea, or want to discuss materials science? I'd love to hear from you!
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-gray-100 font-semibold mb-2 font-inter">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 font-inter"
                            placeholder="Your Name"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-gray-100 font-semibold mb-2 font-inter">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 font-inter"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-gray-100 font-semibold mb-2 font-inter">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows="6"
                            required
                            className="w-full px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 font-inter"
                            placeholder="Your message..."
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
                    >
                        Send Message
                    </button>
                    {statusMessage && (
                        <p className="text-center mt-4 text-md font-semibold text-gray-200 font-inter">
                            {statusMessage}
                        </p>
                    )}
                </form>
            </div>
        </AnimatedContent>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 px-6 text-center rounded-t-xl">
      <div className="container mx-auto">
        <p className="text-lg mb-4 font-inter">
          &copy; {new Date().getFullYear()} Your Name. All rights reserved.
        </p>
        <div className="flex justify-center space-x-6">
          <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <Github className="w-7 h-7" />
          </a>
          <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <Linkedin className="w-7 h-7" />
          </a>
          <a href="https://discord.gg/yourinvite" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <Discord className="w-7 h-7" />
          </a>
          <a href="https://yourwebnovel.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <WebNovel className="w-7 h-7" />
          </a>
          <a href="https://www.superprof.co.in/yourusername" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
            <Superprof className="w-7 h-7" />
          </a>
        </div>
      </div>
    </footer>
  );
};


// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7WzyZ9GjVB7ckX4lv-r3GjAsfc9O3QQA",
  authDomain: "website-8f5e2.firebaseapp.com",
  projectId: "website-8f5e2",
  storageBucket: "website-8f5e2.firebasestorage.app",
  messagingSenderId: "902295170091",
  appId: "1:902295170091:web:2c379c9f13ffc161728e6e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
        }

        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestoreDb);
        setAuth(firebaseAuth);

        // Use __initial_auth_token if available, otherwise sign in anonymously
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(firebaseAuth, __initial_auth_token);
        } else {
          await signInAnonymously(firebaseAuth);
        }

        onAuthStateChanged(firebaseAuth, (user) => {
          setUserId(user?.uid || crypto.randomUUID());
          setFirebaseInitialized(true);
        });

      } catch (error) {
        console.error("Failed to initialize Firebase:", error);
      }
    };

    initializeFirebase();
  }, []); // Run only once on component mount

  return (
    <div className="font-sans antialiased text-gray-100 bg-gray-950">
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
        body { margin: 0; }
        `}
      </style>
      <Navbar setCurrentPage={setCurrentPage} />

      <main className="min-h-screen pt-24">
        {firebaseInitialized ? (
          (() => {
            switch (currentPage) {
              case 'home':
                return <Hero setCurrentPage={setCurrentPage} />;
              case 'about':
                return <About db={db} appId={__app_id} />;
              case 'skills':
                return <Skills />;
              // case 'projects': // Removed this case
              //   return <Projects db={db} appId={__app_id} />;
              case 'publications':
                return <Publications db={db} appId={__app_id} />;
              case 'contact':
                return <Contact />;
              default:
                return <Hero setCurrentPage={setCurrentPage} />;
            }
          })()
        ) : (
          <div className="min-h-screen flex items-center justify-center text-gray-400">Initializing Firebase...</div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;

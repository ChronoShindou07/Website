import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
// Removed THREE and OrbitControls imports as simulation is no longer used
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
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
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flask">
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

// Original icons for Expertise section
const Laptop = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-laptop">
    <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.91 1.45H3.63a1 1 0 0 1-.91-1.45L4 16m16 0a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16Z"/>
  </svg>
);

const Wrench = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wrench">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-2.53 2.53a1 1 0 0 0-1.4 0L6.3 14.7a1 1 0 0 0 0-1.4l1.6-1.6a6 6 0 0 1 7.94-7.94l-2.53-2.53z"/>
    <path d="M12.6 12.6 9 16.2"/>
    <path d="M18.2 18.2 14.6 14.6"/>
  </svg>
);

// Custom Microscope Icon (simple design)
const Microscope = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-microscope">
    <path d="M6 18h4"/><path d="M10 21v-3"/><path d="M10 3v5"/><path d="M14 3v5"/><path d="M18 18h-4"/><path d="M14 21v-3"/><path d="M18 9h-4"/><path d="M14 12h-4"/><path d="M10 15v-3"/><path d="M6 9h4"/><path d="M12 2v20"/>
    <path d="M12 18a6 6 0 0 0 6-6V9a6 6 0 0 0-6-6Z"/>
  </svg>
);


// Lazy load components (COMMENTED OUT FOR COMPILATION FIX)
// const About = lazy(() => import('./About'));
// const Skills = lazy(() => import('./Skills'));
// const Publications = lazy(() => import('./Publications'));
// const Contact = lazy(() => import('./Contact'));


// Animated Content Wrapper for entrance animations
const AnimatedContent = ({ children, delay = 0, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after a short delay, regardless of intersection
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`${className} transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20' // Increased translate-y for more noticeable effect
      }`}
    >
      {children}
    </div>
  );
};


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

        // Cleanup on component unmount
        return () => {
            if (autoCycleTimerRef.current) {
                clearInterval(autoCycleTimerRef.current);
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


    return (
        <section id="hero" className="relative w-full min-h-screen bg-gray-950">
            {/* SECTION 1: Main Hero Content - This is where the background should be */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                {/* Removed MaterialSimulationBackground */}
                {/* <MaterialSimulationBackground /> */}

                {/* Image Carousel (full screen, behind content, spans this div) */}
                <div className="absolute inset-0 z-0">
                    <ImageCarousel
                        images={heroImages}
                        currentIndex={currentImageIndex}
                    />
                </div>

                {/* Navigation Buttons for Image Carousel (also relative to this div) */}
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

                {/* Main Hero Content Overlay */}
                <AnimatedContent delay={0} className="w-full relative z-10"> {/* Added relative z-10 to keep content on top */}
                    <div className="bg-gray-800 bg-opacity-80 p-8 md:p-12 rounded-xl max-w-5xl mx-auto shadow-2xl backdrop-blur-sm text-white text-center border border-gray-700">
                        <AnimatedContent delay={100}>
                            <p className="text-lg text-blue-300 font-semibold mb-2 font-inter">Materials Sciences PhD student</p>
                        </AnimatedContent>
                        <AnimatedContent delay={200}>
                            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 font-inter text-white">
                                Innovating at the <span className="text-blue-200">Atomic Scale</span>
                            </h1>
                        </AnimatedContent>
                        <AnimatedContent delay={300}>
                            <p className="text-xl md:text-2xl mb-8 font-inter text-gray-200">
                                I am <span className="font-semibold text-white">Golu Gehlot</span>, passionate about developing and characterizing advanced materials for a sustainable future.
                            </p>
                        </AnimatedContent>
                        <AnimatedContent delay={400}>
                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
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
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4 bg-gray-950">
                <AnimatedContent delay={0} className="w-full">
                    <div className="p-6 max-w-6xl mx-auto rounded-xl shadow-2xl bg-gray-800 bg-opacity-95 backdrop-blur-md border border-gray-700">
                        <AnimatedContent delay={100}>
                            <h2 className="text-4xl font-bold text-gray-100 mb-8 font-inter">
                                My Core Focus
                            </h2>
                        </AnimatedContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
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

                            <AnimatedContent delay={300}>
                                <div className="bg-gray-900 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => setCurrentPage('skills')}>
                                    <h3 className="text-2xl font-bold text-green-400 mb-3 font-inter flex items-center">
                                        <Flask className="w-6 h-6 mr-2" /> Key Expertise
                                    </h3>
                                    <p className="text-gray-200 mb-4 font-inter">
                                        Proficient in <span className="font-semibold">characterization techniques</span> (SEM, TEM, FTIR, Raman Spectroscopy, XRD, EBSD, EDS, Mechanical testing (Tensile, Creep, and Fatigue), Optical microscopy, DSC) and <span className="font-semibold">computational modeling</span> (Python) to predict and analyze material behavior.
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
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4 bg-gray-950">
                <AnimatedContent delay={0} className="w-full">
                    <div className="p-6 max-w-6xl mx-auto rounded-xl shadow-2xl bg-gray-800 bg-opacity-95 backdrop-blur-md border border-gray-700">
                        <AnimatedContent delay={100}>
                            <h2 className="text-4xl font-bold text-gray-100 mb-8 font-inter">
                                A Little About Me
                            </h2>
                        </AnimatedContent>
                        <div className="flex flex-col md:flex-row items-center md:space-x-8">
                            <AnimatedContent delay={200} className="md:w-1/2 mb-8 md:mb-0">
                                <img
                                    src="https://placehold.co/400x300/334155/E2E8F0?text=Your+Photo" // Placeholder for your actual photo
                                    alt="Your Photo"
                                    className="rounded-lg shadow-md w-full h-auto object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/334155/E2E8F0?text=Materials+Engineer"; }}
                                />
                            </AnimatedContent>
                            <AnimatedContent delay={300} className="md:w-1/2 text-lg text-gray-200 font-inter space-y-3">
                                <p>
                                    Hello! I'm Golu Gehlot, a dedicated Materials Sciences PhD student, at IISc Bangalore.
                                    I have done my B.tech from MANIT bhopal,2024. My work focuses on understanding
                                    the fundamental properties of materials and designing novel ones for advanced applications.
                                </p>
                                <p>
                                    My expertise lies in areas such as <span className="font-semibold text-indigo-300">Deformation mechanism,
                                    Damage mechanism, Microstructural studies, Mechanical testing (Tensile, creep, and fatigue), and High
                                     temperature testing </span>.

                                </p>
                                <p>
                                    Beyond the lab, I enjoy exploring new hiking trails,
                                    reading sci-fi and fantasy novels, computer gaing, football and contributing to open-source science projects.
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
const About = ({ db, currentAppId, userId }) => { // Added userId prop
  const [aboutContent, setAboutContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Ensure db, currentAppId, and userId are available before attempting to fetch
    if (!db || !currentAppId || !userId) {
      console.log("About: Waiting for Firebase init or userId. db:", !!db, "appId:", !!currentAppId, "userId:", !!userId);
      setLoading(false); // Set loading to false if dependencies are not ready
      return;
    }

    console.log("About: Attempting to fetch data for appId:", currentAppId, "userId:", userId);
    const aboutDocRef = doc(db, `artifacts/${currentAppId}/public/data/aboutContent/aboutData`);

    const unsubscribe = onSnapshot(aboutDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setAboutContent(docSnap.data());
      } else {
        console.warn("No 'aboutData' document found in Firestore. Please add data via Firebase console.");
        setAboutContent({ qualifications: [], awards: [], publications: [], conferences: [] });
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching about content:", err);
      if (err.code === 'permission-denied') {
        setError(
          "Failed to load about content due to insufficient permissions. " +
          "Please ensure your Firestore Security Rules are correctly set up to allow read access " +
          `to 'artifacts/{appId}/public/data/aboutContent/aboutData' (replace {appId} with your actual app ID). ` +
          "Refer to the Firebase console under 'Firestore Database' -> 'Rules' tab. " +
          "Your current App ID is: " + currentAppId + ". Current User ID: " + userId
        );
      } else {
        setError("Failed to load about content. Error: " + err.message);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, currentAppId, userId]); // Depend on db, currentAppId, and userId

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
        <div className="text-red-400 text-xl text-center">{error}</div>
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
             Hello! I'm Golu Gehlot, a dedicated Materials Sciences PhD student, at IISc Bangalore.
             I have done my B.tech from MANIT bhopal,2024. My work focuses on understanding
             the fundamental properties of materials and designing novel ones for advanced applications.
            </p>
            <p>
             My expertise lies in areas such as <span className="font-semibold text-indigo-300">Deformation mechanism,
              Damage mechanism, Microstructural studies, Mechanical testing (Tensile, creep, and fatigue), and High
              temperature testing </span>.
            </p>
            <p>
             Beyond the lab, I enjoy exploring new hiking trails,
             reading sci-fi and fantasy novels, computer gaing, football and contributing to open-source science projects.
            </p>
            <div className="pt-4 flex space-x-4">
              <a href="https://github.com/ChronoShindou07" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Github className="w-8 h-8" />
              </a>
              <a href="https://www.linkedin.com/in/golu-gehlot-a16b70216/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin className="w-8 h-8" />
              </a>
              {/* Discord Link - Verify this URL is active and does not expire */}
              <a href="https://discord.gg/zADYUgB5" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Discord className="w-8 h-8" />
              </a>
              {/* Webnovel Link - Verify this URL is correct */}
              <a href="https://www.webnovel.com/profile/4320276697" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <WebNovel className="w-8 h-8" />
              </a>
              {/* Superprof Link - Verify this URL is correct */}
              <a href="https://www.superprof.co.in/dashboard.html/my-listings/listing/10380797" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
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
              {/* Lab Website Link - Verify this URL is correct */}
              <a
                href="https://sites.google.com/view/ankurskchauhan"
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
                    <span className="font-semibold">"{pub.title},"</span> {pub.journal}, {pub.volume && `Vol. ${pub.volume}, `}{pub.number && `No. ${pub.number}, `}pp. {pub.pages}, ({pub.year}).
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
      skills: ["Powder Metallurgy", "Casting", "Heat Treatment"],
      icon: <Flask className="w-20 h-20 text-blue-400" />, // Reverted to Flask icon
      alt: "Material Synthesis Icon"
    },
    {
      name: "Characterization",
      skills: ["SEM", "TEM", "FTIR", "Raman Spectroscopy", "XRD", "EBSD", "EDS", "Mechanical testing (Tensile, Creep, and Fatigue)", "Optical microscopy, DSC"],
      icon: <Microscope className="w-20 h-20 text-green-400" />, // Reverted to Microscope icon
      alt: "Characterization Icon"
    },
    {
      name: "Computational Materials",
      skills: ["Python"],
      icon: <Laptop className="w-20 h-20 text-purple-400" />, // Reverted to Laptop icon
      alt: "Computational Materials Icon"
    },
    {
      name: "Software & Tools",
      skills: ["MATLAB", "OriginLab", "LaTeX", "ImageJ", "OIM analysis", "Git/GitHub", "Profex"],
      icon: <Wrench className="w-20 h-20 text-yellow-400" />, // Reverted to Wrench icon
      alt: "Software & Tools Icon"
    }
  ];

  return (
    <section id="skills" className="py-20 px-6 bg-gray-800 min-h-screen pt-20">
      <div className="container mx-auto max-w-5xl">
        <AnimatedContent delay={100}>
          <h2 className="text-4xl font-bold text-center text-gray-100 mb-12 font-inter">
            My Expertise
          </h2>
        </AnimatedContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <AnimatedContent key={index} delay={200 + index * 100}>
              <div className="bg-gray-900 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 border border-gray-700">
                <div className="flex flex-col items-center mb-6"> {/* New flex container for icon and title */}
                  {/* Circular background for the icon */}
                  <div className="bg-gray-700 p-4 rounded-full mb-4 flex items-center justify-center">
                    {category.icon} {/* Render the SVG icon directly */}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-100 mt-4 font-inter">{category.name}</h3> {/* Removed mb-6, added mt-4 */}
                </div>
                <ul className="space-y-3 text-lg text-gray-200 font-inter">
                  {category.skills.map((skill, skillIndex) => (
                    <li key={skillIndex} className="flex items-start break-words">
                      <span className="mr-2 text-blue-400 flex-shrink-0">•</span>
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

// Publications Section Component
const Publications = ({ db, currentAppId, userId }) => { // Added userId prop
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Ensure db, currentAppId, and userId are available before attempting to fetch
    if (!db || !currentAppId || !userId) {
      console.log("Publications: Waiting for Firebase init or userId. db:", !!db, "appId:", !!currentAppId, "userId:", !!userId);
      setLoading(false); // Set loading to false if dependencies are not ready
      return;
    }

    console.log("Publications: Attempting to fetch data for appId:", currentAppId, "userId:", userId);
    const publicationsColRef = collection(db, `artifacts/${currentAppId}/public/data/publications`);
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
      if (err.code === 'permission-denied') {
        setError(
          "Failed to load publications due to insufficient permissions. " +
          "Please ensure your Firestore Security Rules are correctly set up to allow read access " +
          `to 'artifacts/{appId}/public/data/publications' (replace {appId} with your actual app ID). ` +
          "Refer to the Firebase console under 'Firestore Database' -> 'Rules' tab. " +
          "Your current App ID is: " + currentAppId + ". Current User ID: " + userId
        );
      } else {
        setError("Failed to load publications. Error: " + err.message);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, currentAppId, userId]); // Depend on db, currentAppId, and userId

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
        <div className="text-red-400 text-xl text-center">{error}</div>
      </section>
    );
  }

  if (publications.length === 0) {
    return (
      <section id="publications" className="py-20 px-6 bg-gray-900 min-h-screen pt-20 flex items-center justify-center">
        <div className="text-gray-400 text-xl text-center">No publications found. Please add them via Firebase console under `artifacts/{currentAppId}/public/data/publications`.</div>
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
          <a href="https://github.com/ChronoShindou07" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <Github className="w-7 h-7" />
          </a>
          <a href="https://www.linkedin.com/in/golu-gehlot-a16b70216/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <Linkedin className="w-7 h-7" />
          </a>
          {/* Discord Link - Verify this URL is active and does not expire */}
          <a href="https://discord.gg/zADYUgB5" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <Discord className="w-7 h-7" />
          </a>
          {/* Webnovel Link - Verify this URL is correct */}
          <a href="https://www.webnovel.com/profile/4320276697" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <WebNovel className="w-7 h-7" />
          </a>
          {/* Superprof Link - Verify this URL is correct */}
          <a href="https://www.superprof.co.in/dashboard.html/my-listings/listing/10380797" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
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
  const [appIdFromConfig, setAppIdFromConfig] = useState(null); // New state for appId from config

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        let firebaseConfig;

        // Check if __firebase_config global variable is available (provided by Canvas environment)
        if (typeof __firebase_config !== 'undefined' && __firebase_config) {
          try {
            firebaseConfig = JSON.parse(__firebase_config);
            console.log("Using Firebase config from __firebase_config global variable.");
          } catch (e) {
            console.error("Error parsing __firebase_config:", e);
            // Fallback to placeholder if parsing fails
         const firebaseConfig = {
  apiKey: "AIzaSyC7WzyZ9GjVB7ckX4lv-r3GjAsfc9O3QQA",
  authDomain: "website-8f5e2.firebaseapp.com",
  projectId: "website-8f5e2",
  storageBucket: "website-8f5e2.firebasestorage.app",
  messagingSenderId: "902295170091",
  appId: "1:902295170091:web:2c379c9f13ffc161728e6e"
};
            console.warn("Falling back to placeholder Firebase config. Please ensure __firebase_config is valid JSON.");
          }
        } else {
          // If __firebase_config is not available, use the hardcoded placeholders.
          // IMPORTANT: IF YOU ARE DEPLOYING THIS APP OUTSIDE OF THE CANVAS ENVIRONMENT,
          // YOU MUST MANUALLY REPLACE THESE PLACEHOLDER VALUES WITH YOUR ACTUAL FIREBASE PROJECT CONFIGURATION.
          // Go to your Firebase project settings -> "Your apps" -> Web app -> Config to find these values.
     const firebaseConfig = {
  apiKey: "AIzaSyC7WzyZ9GjVB7ckX4lv-r3GjAsfc9O3QQA",
  authDomain: "website-8f5e2.firebaseapp.com",
  projectId: "website-8f5e2",
  storageBucket: "website-8f5e2.firebasestorage.app",
  messagingSenderId: "902295170091",
  appId: "1:902295170091:web:2c379c9f13ffc161728e6e"
};
          console.warn("The __firebase_config global variable was not found. Using hardcoded placeholder Firebase config. Please replace these values if deploying outside Canvas.");
        }

        // Log the config to console for debugging purposes
        console.log("Firebase Config being used:", firebaseConfig);


        if (!firebaseConfig || Object.keys(firebaseConfig).length === 0 || !firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
          console.error(
            "CRITICAL ERROR: Firebase config is missing or incomplete, or still contains placeholder values. " +
            "If you are running this outside the Canvas environment, you MUST manually update 'apiKey', 'authDomain', " +
            "'projectId', 'storageBucket', 'messagingSenderId', and 'appId' in the 'firebaseConfig' object within the App.js file. " +
            "Refer to your Firebase project settings -> 'Your apps' -> Web app -> Config for the correct values."
          );
          // Set initialized to true to allow the UI to render even if Firebase is not configured.
          // This prevents the "Initializing Firebase..." message from sticking indefinitely.
          setFirebaseInitialized(true);
          return;
        }

        setAppIdFromConfig(firebaseConfig.appId);

        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestoreDb);
        setAuth(firebaseAuth);

        // This promise will resolve once onAuthStateChanged fires for the first first time
        const authReadyPromise = new Promise(resolve => {
          const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            setUserId(user?.uid || crypto.randomUUID());
            console.log("Firebase Auth State Changed. Current User ID:", user?.uid || "Anonymous");
            // Only resolve if we have a user (authenticated or anonymous)
            if (user) {
              unsubscribe(); // Unsubscribe after the first state change
              resolve();
            }
          });
        });

        // Attempt sign-in first
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          try {
            await signInWithCustomToken(firebaseAuth, __initial_auth_token);
            console.log("Signed in with custom token.");
          } catch (tokenError) {
            console.error("Error signing in with custom token, attempting anonymous sign-in:", tokenError);
            await signInAnonymously(firebaseAuth);
            console.log("Signed in anonymously after custom token failure.");
          }
        } else {
          await signInAnonymously(firebaseAuth);
          console.log("Signed in anonymously.");
        }

        // Wait for the auth state to be confirmed before setting firebaseInitialized
        await authReadyPromise;
        setFirebaseInitialized(true);
        console.log("Firebase initialization complete and authentication state confirmed.");

      } catch (error) {
        console.error("Failed to initialize Firebase or authenticate:", error);
        setFirebaseInitialized(true);
      }
    };

    initializeFirebase();
  }, []); // Run only once on component mount

  return (
    <div className="font-sans antialiased text-gray-100 bg-gray-950 min-h-screen"> {/* Added min-h-screen here */}
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
        html, body, #root { /* Ensure html, body, and the root div take full height and width */
            height: 100%;
            width: 100%; /* Added this line */
            margin: 0;
            padding: 0;
            overflow-x: hidden; /* Prevent horizontal scrolling */
        }
        `}
      </style>
      <Navbar setCurrentPage={setCurrentPage} />

      <main className="min-h-screen pt-24">
        {firebaseInitialized ? (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading content...</div>}>
            {(() => {
              switch (currentPage) {
                case 'home':
                  return <Hero setCurrentPage={setCurrentPage} />;
                case 'about':
                  // Pass appIdFromConfig and userId to About component
                  return <About db={db} currentAppId={appIdFromConfig} userId={userId} />;
                case 'skills':
                  return <Skills />;
                case 'publications':
                  // Pass appIdFromConfig and userId to Publications component
                  return <Publications db={db} currentAppId={appIdFromConfig} userId={userId} />;
                case 'contact':
                  return <Contact />;
                default:
                  return <Hero setCurrentPage={setCurrentPage} />;
              }
            })()}
          </Suspense>
        ) : (
          <div className="min-h-screen flex items-center justify-center text-gray-400">Initializing Firebase...</div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;

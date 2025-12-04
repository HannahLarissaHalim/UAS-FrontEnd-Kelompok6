'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import '../custom.css';

export default function AboutPage() {
  const [visibleParagraphs, setVisibleParagraphs] = useState([]);
  const paragraphRefs = useRef([]);
  
  // Email untuk keluhan/saran - bisa diganti nanti
  const supportEmail = 'fteatuntar@gmail.com';
  const emailSubject = 'Keluhan/Saran untuk FTEAT';
  const emailBody = 'Halo Tim FTEAT,\n\nSaya ingin menyampaikan:\n\n';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = paragraphRefs.current.indexOf(entry.target);
            if (index !== -1 && !visibleParagraphs.includes(index)) {
              setVisibleParagraphs((prev) => [...prev, index]);
            }
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '0px'
      }
    );

    paragraphRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      paragraphRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [visibleParagraphs]);

  return (
    <div className="about-page">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <div className="about-container">
        {/* Left Side - Logo Background */}
        <div className="about-logo-bg">
          <Image 
            src="/images/LOGO.png" 
            alt="FTEAT Logo" 
            width={800} 
            height={800}
            className="about-logo-large"
          />
        </div>

        {/* Title */}
        <h1 className="about-title">
          <span className="about-title-kisah">Kisah</span>{' '}
          <span className="about-title-fteat">FTEAT</span>
        </h1>

        {/* Scrollable Text Container */}
        <div className="about-scroll-container">
          <div className="about-scroll-indicator"></div>
          <div className="about-text-content">
            <p 
              ref={(el) => (paragraphRefs.current[0] = el)}
              className={`about-paragraph ${visibleParagraphs.includes(0) ? 'fade-in' : ''}`}
            >
              Berawal dari sebuah proyek ujian, FTEAT lahir sebagai solusi nyata bagi kebutuhan mahasiswa, dari mahasiswa, untuk mahasiswa.
            </p>
            <p 
              ref={(el) => (paragraphRefs.current[1] = el)}
              className={`about-paragraph ${visibleParagraphs.includes(1) ? 'fade-in' : ''}`}
            >
              Dengan tujuan mempermudah kehidupan kuliah yang padat, FTEAT hadir agar mahasiswa bisa memesan makanan dengan mudah, sambil menunggu hidangan diproses hingga siap dinikmati.
            </p>
            <p 
              ref={(el) => (paragraphRefs.current[2] = el)}
              className={`about-paragraph ${visibleParagraphs.includes(2) ? 'fade-in' : ''}`}
            >
              Kami dari Fakultas Teknologi Informasi mengembangkan FTEAT dengan sukarela, penuh semangat, dan niat tulus agar dapat menjadi wadah yang membantu serta menghubungkan mahasiswa dengan kantin tercinta.
            </p>
          </div>
        </div>

        {/* Right Side - Photo */}
        <div className="about-photo">
          <Image 
            src="/images/about_us.jpg" 
            alt="FTEAT Team" 
            width={490} 
            height={368}
            className="about-photo-img"
          />
        </div>

        {/* Contact Section */}
        <div className="about-contact">
          <p className="about-contact-text">Ada kendala atau Saran? Hubungi kami</p>
          <a 
            href={`mailto:${supportEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
            className="about-email-link"
          >
            <div className="about-email">
              <div className="about-email-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#0A4988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6L12 13L2 6" stroke="#0A4988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="about-email-text">{supportEmail}</span>
              <div className="about-email-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#0A4988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </a>
        </div>

        {/* Footer */}
        <div className="about-footer">
          <span className="about-footer-text">Developed by</span>
          <span className="about-footer-team">HELD</span>
        </div>
      </div>
    </div>
  );
}

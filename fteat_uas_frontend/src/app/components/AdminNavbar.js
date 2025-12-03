"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import "../custom.css";

export default function AdminNavbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('admin');
        localStorage.removeItem('token');
        router.push('/admin/login');
    };

    return (
        <nav className="navbar-container">
            <div className="navbar-inner">
                {/* left: logo and brand name */}
                <div
                    className="navbar-logo"
                    onClick={() => router.push("/admin/stand")}
                    style={{ cursor: "pointer" }}
                >
                    <Image
                        src="/images/logo.png"
                        alt="fteat logo"
                        width={45}
                        height={45}
                        unoptimized
                    />
                    <span className="navbar-brand-text">FTEAT Admin</span>
                </div>

                {/* Burger menu button */}
                <button 
                    className="burger-menu"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* navigation links */}
                <div className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <Link 
                        href="/" 
                        className={pathname === "/" ? "active" : ""}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link 
                        href="/admin/stand" 
                        className={pathname === "/admin/stand" ? "active" : ""}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Verifikasi Vendor
                    </Link>
                    <Link 
                        href="/aboutus" 
                        className={pathname === "/aboutus" ? "active" : ""}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        About Us
                    </Link>
                </div>

                {/* right: logout button */}
                <div className="navbar-icons">
                    <button
                        onClick={handleLogout}
                        className="navbar-icon-btn"
                        style={{
                            background: '#CB142C',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

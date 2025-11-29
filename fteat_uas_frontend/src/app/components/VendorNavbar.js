"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import "../custom.css";

export default function VendorNavbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Helper to mark active link
    const isActive = (path) => {
        return pathname === path ? 'active' : '';
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="navbar-container">
            <div className="navbar-inner">
                {/* Left: Logo and brand name */}
                <div
                    className="navbar-logo"
                    onClick={() => router.push("/vendor-welcome")}
                    style={{ cursor: "pointer" }}
                >
                    <Image
                        src="/images/logo.png"
                        alt="fteat logo"
                        width={45}
                        height={45}
                        unoptimized
                    />
                    <span className="navbar-brand-text">FTEAT</span>
                </div>

                {/* Burger Menu Button - Mobile Only */}
                <button 
                    className={`burger-menu ${isMenuOpen ? 'open' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Navigation links - Vendor specific */}
                <div className={`navbar-links ${isMenuOpen ? 'mobile-open' : ''}`}>
                    <Link
                        href="/vendor/welcome"
                        className={isActive("/vendor/welcome")}
                        onClick={closeMenu}
                    >
                        Home
                    </Link>

                    <Link
                        href="/vendor/pesanan"
                        className={isActive("/vendor/pesanan")}
                        onClick={closeMenu}
                    >
                        Pesanan
                    </Link>

                    <Link
                        href="/vendor/menu"
                        className={isActive("/vendor/menu")}
                        onClick={closeMenu}
                    >
                        Menu
                    </Link>
                </div>

                {/* Right: Small logo icon */}
                <div className="navbar-icons">
                    <div className="navbar-vendor-logo">
                        <Image
                            src="/images/icon_small.png"
                            alt="Vendor Logo"
                            width={50}
                            height={50}
                            unoptimized
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
}

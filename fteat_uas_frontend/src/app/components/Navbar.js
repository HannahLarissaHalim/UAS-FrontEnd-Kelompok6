"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import "../custom.css"; 

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    // login state
    // used to check if user has token in local storage (already signed in)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [profilePic, setProfilePic] = useState("/images/navbar_icons/profile.png");

    useEffect(() => {
        // check token asynchronously to avoid sync state update warning
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            if (token) {
                // wrap setstate in a microtask to avoid cascading render
                setTimeout(() => {
                    setIsLoggedIn(true);
                    setProfilePic("/images/navbar_icons/profile.png");
                }, 0);
            }
        };
        
    checkAuth();
}, []);

    // handle button clicks
    const handleProfileClick = () => {
        // if not logged in, show alert
        // else redirect to welcome page
        if (!isLoggedIn) {
            alert("please sign in to view your profile.");
        } else {
            router.push("/home");
        }
    };

    const handleCartClick = () => {
        // if not logged in, show alert
        // else redirect to payment page
        if (!isLoggedIn) {
            alert("please sign in to access your cart.");
        } else {
            router.push("/payment");
        }
    };

    // helper to mark active link
    // gives visual cue for current page in navbar
    const isActive = (path) => {
        return pathname === path
            ? "text-blue-700 font-semibold underline underline-offset-4"
            : "hover:text-blue-600 transition-all duration-200";
    };

    // hide icons on specific pages
    // icons (cart, profile) will not show on these pages
    const hideIcons = [
        "/",
        "/home",
        "/register",
        "/login",
        "/check-email",
        "/verify",
        "/aboutus",
    ];

    const showIcons = !hideIcons.includes(pathname);

    // main navbar ui
    return (
        <nav className="navbar-container">
            <div className="navbar-inner">
                {/* left: logo and brand name */}
                <div
                    className="navbar-logo"
                    onClick={() => router.push("/home")}
                    style={{ cursor: "pointer" }}
                >
                    {/* site logo image */}
                    <Image
                        src="/images/logo.png"
                        alt="fteat logo"
                        width={45}
                        height={45}
                        unoptimized
                    />
                    <span className="navbar-brand-text">FTEAT</span>
                </div>

                {/* navigation links */}
                <div className="navbar-links">
                    <Link
                        href="/aboutus"
                        className={pathname === "/aboutus" ? "active" : ""}
                    >
                        About Us
                    </Link>
                    <Link
                        href="/home"
                        className={pathname === "/home" ? "active" : ""}
                    >
                        Home
                    </Link>
                    <Link
                        href="/stand"
                        className={pathname === "/stand" ? "active" : ""}
                    >
                        Stand
                    </Link>
                    <Link
                        href="/menu"
                        className={pathname === "/menu" ? "active" : ""}
                    >
                        Menu
                    </Link>
                </div>

                {/* right: cart and profile icons */}
                {showIcons && (
                    <div className="navbar-icons">
                        {/* cart icon */}
                        <button
                            onClick={handleCartClick}
                            className="navbar-icon-btn"
                            aria-label="cart"
                        >
                            <Image
                                src="/images/navbar_icons/trolley.png"
                                alt="cart"
                                width={26}
                                height={26}
                                unoptimized
                            />
                        </button>

                        {/* profile icon */}
                        <button
                            onClick={handleProfileClick}
                            className="navbar-icon-btn"
                            aria-label="profile"
                        >
                            <Image
                                src={profilePic}
                                alt="profile"
                                width={35}
                                height={35}
                                className="navbar-profile-img"
                                unoptimized
                            />
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

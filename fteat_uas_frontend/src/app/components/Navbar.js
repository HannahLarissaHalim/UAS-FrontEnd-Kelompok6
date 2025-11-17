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
    const [cartCount, setCartCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // check token asynchronously to avoid sync state update warning
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            if (token) {
                // wrap setstate in a microtask to avoid cascading render
                setTimeout(() => {
                    setIsLoggedIn(true);
                    
                    // Load profile image from user data
                    const userData = localStorage.getItem('user');
                    if (userData) {
                        try {
                            const user = JSON.parse(userData);
                            if (user.profileImage) {
                                setProfilePic(user.profileImage);
                            }
                        } catch (error) {
                            console.error('Error parsing user data:', error);
                        }
                    }
                }, 0);
            }
        };
        
        // Load cart count
        const updateCartCount = () => {
            const cart = localStorage.getItem('cart');
            if (cart) {
                const cartItems = JSON.parse(cart);
                setCartCount(cartItems.length);
            }
        };
        
        checkAuth();
        updateCartCount();
        
        // Listen for storage changes to update cart count
        const handleStorageChange = (e) => {
            if (e.key === 'cart') {
                updateCartCount();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for custom cart update event
        const handleCartUpdate = () => {
            updateCartCount();
        };
        window.addEventListener('cartUpdated', handleCartUpdate);
        
        // Listen for user/profile updates
        const handleUserUpdate = () => {
            const userData = localStorage.getItem('user');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    if (user.profileImage) {
                        setProfilePic(user.profileImage);
                    } else {
                        setProfilePic("/images/navbar_icons/profile.png");
                    }
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }
        };
        window.addEventListener('userUpdated', handleUserUpdate);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('cartUpdated', handleCartUpdate);
            window.removeEventListener('userUpdated', handleUserUpdate);
        };
    }, []);

    const handleProfileClick = () => {
        if (!isLoggedIn) {
            router.push("/login"); // langsung redirect ke login page
            return;
        }
        router.push("/profile");
    };

    const handleCartClick = () => {
        if (!isLoggedIn) {
            router.push("/login"); // langsung redirect ke login page
            return;
        }
        router.push("/payment");
    };

    // // handle button clicks
    // const handleProfileClick = () => {
    //     // if not logged in, show alert
    //     // else redirect to welcome page
    //     if (!isLoggedIn) {
    //         alert("please sign in to view your profile.");
    //     } else {
    //         router.push("/profile");
    //     }
    // };

    // const handleCartClick = () => {
    //     // if not logged in, show alert
    //     // else redirect to payment page
    //     if (!isLoggedIn) {
    //         alert("please sign in to access your cart.");
    //     } else {
    //         router.push("/payment");
    //     }
    // };

    // helper to mark active link
    // gives visual cue for current page in navbar
    const isActive = (path) => {
        // buat /home aktif juga kalau lagi di /login atau /register
        const homeRelatedPages = ['/login', '/register', '/choose-login'];
        
        if (homeRelatedPages.includes(pathname) && path === '/home') {
            return 'active-link';
        }

        return pathname === path ? 'active-link' : '';
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
        "/choose-login",
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
                        href="/aboutus"
                        className={pathname === "/aboutus" ? "active" : ""}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        About Us
                    </Link>

                    <Link 
                        href="/home" 
                        className={isActive("/home")}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Home
                    </Link>

                    <Link
                        href="/stand"
                        className={pathname === "/stand" ? "active" : ""}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Stand
                    </Link>
                    <Link
                        href="/menu"
                        className={pathname === "/menu" ? "active" : ""}
                        onClick={() => setIsMobileMenuOpen(false)}
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
                            className={`navbar-icon-btn navbar-cart-btn ${pathname === "/payment" ? "active-icon" : ""}`}
                            aria-label="cart"
                        >
                            <Image
                                src="/images/navbar_icons/trolley.png"
                                alt="cart"
                                width={26}
                                height={26}
                                unoptimized
                            />
                            {cartCount > 0 && (
                                <span className="cart-badge">{cartCount}</span>
                            )}
                        </button>

                        {/* profile icon */}
                        <button
                            onClick={handleProfileClick}
                            className="navbar-icon-btn"
                            aria-label="profile"
                        >
                            {/* Gunakan img biasa untuk support base64 */}
                            <img
                                src={profilePic}
                                alt="profile"
                                className="navbar-profile-img"
                                style={{
                                    width: '35px',
                                    height: '35px',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}
                            />
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
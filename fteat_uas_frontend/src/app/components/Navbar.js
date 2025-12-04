"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import ConfirmModal from "./ConfirmModal";
import "../custom.css";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [profilePic, setProfilePic] = useState("/images/navbar_icons/profile.png");
    const [cartCount, setCartCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const role = localStorage.getItem("role");

            if (token) {
                setTimeout(() => {
                    setIsLoggedIn(true);
                    setUserRole(role);

                    const userData = localStorage.getItem("user");
                    if (userData) {
                        try {
                            const user = JSON.parse(userData);
                            if (user.profileImage) {
                                setProfilePic(user.profileImage);
                            }
                        } catch (error) {
                            console.error("Error parsing user data:", error);
                        }
                    }
                }, 0);
            }
        };

        const updateCartCount = () => {
            const cart = localStorage.getItem("cart");
            if (cart) {
                const cartItems = JSON.parse(cart);
                setCartCount(cartItems.length);
            }
        };

        checkAuth();
        updateCartCount();

        const handleStorageChange = (e) => {
            if (e.key === "cart") {
                updateCartCount();
            }
        };

        window.addEventListener("storage", handleStorageChange);

        const handleCartUpdate = () => {
            updateCartCount();
        };
        window.addEventListener("cartUpdated", handleCartUpdate);

        const handleUserUpdate = () => {
            const userData = localStorage.getItem("user");
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    if (user.profileImage) {
                        setProfilePic(user.profileImage);
                    } else {
                        setProfilePic("/images/navbar_icons/profile.png");
                    }
                } catch (error) {
                    console.error("Error parsing user data:", error);
                }
            }
        };
        window.addEventListener("userUpdated", handleUserUpdate);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("cartUpdated", handleCartUpdate);
            window.removeEventListener("userUpdated", handleUserUpdate);
        };
    }, []);

    const handleProfileClick = () => {
        if (!isLoggedIn) {
            router.push("/login");
            return;
        }
        // Redirect vendor to vendor account, customer to regular profile
        if (userRole === "vendor") {
            router.push("/vendor/account");
        } else {
            router.push("/profile");
        }
    };

    const handleCartClick = () => {
        if (!isLoggedIn) {
            router.push("/login");
            return;
        }
        router.push("/payment");
    };

    const isActive = (path) => {
        const homeRelatedPages = ["/login", "/register", "/choose-login"];

        if (homeRelatedPages.includes(pathname) && path === "/home") {
            return "active-link";
        }

        return pathname === path ? "active-link" : "";
    };

    const hideIcons = ["/", "/home", "/register", "/login", "/check-email", "/verify"];

    const showIcons = !hideIcons.includes(pathname);

    return (
        <nav className="navbar-container">
            <div className="navbar-inner">
                <div
                    className="navbar-logo"
                    onClick={() => router.push("/home")}
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

                <button
                    className="burger-menu"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className={`navbar-links ${isMobileMenuOpen ? "mobile-open" : ""}`}>
                    <Link
                        href="/home"
                        className={isActive("/home")}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Home
                    </Link>

                    <Link
                        href="/aboutus"
                        className={pathname === "/aboutus" ? "active" : ""}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        About Us
                    </Link>

                    {userRole === "admin" && (
                        <Link
                            href="/admin/stand"
                            className={pathname === "/admin/stand" ? "active" : ""}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Verifikasi Vendor
                        </Link>
                    )}

                    {userRole === "vendor" && (
                        <>
                            <Link
                                href="/vendor/menu"
                                className={pathname === "/vendor/menu" ? "active" : ""}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Menu
                            </Link>
                            <Link
                                href="/vendor/pesanan"
                                className={pathname === "/vendor/pesanan" ? "active" : ""}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Pesanan
                            </Link>
                            <Link
                                href="/vendor/account"
                                className={pathname === "/vendor/account" ? "active" : ""}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Account Settings
                            </Link>
                        </>
                    )}

                    {/* Mahasiswa or not logged in - show Menu link to /menu */}
                    {userRole !== "admin" && userRole !== "vendor" && (
                        <Link
                            href="/menu"
                            className={pathname === "/menu" ? "active" : ""}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Menu
                        </Link>
                    )}
                </div>

                {showIcons && (
                    <div className="navbar-icons">
                        {userRole === "admin" && (
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="navbar-icon-btn"
                                style={{
                                    background: "#CB142C",
                                    color: "white",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                }}
                            >
                                Logout
                            </button>
                        )}

                        {userRole === "vendor" && (
                            <button
                                onClick={() => router.push("/vendor/profile")}
                                className="navbar-icon-btn"
                                aria-label="profile"
                            >
                                <img
                                    src={profilePic}
                                    alt="profile"
                                    className="navbar-profile-img"
                                    style={{
                                        width: "35px",
                                        height: "35px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                            </button>
                        )}

                        {/* Mahasiswa or guest - show cart and profile */}
                        {userRole !== "admin" && userRole !== "vendor" && (
                            <>
                                <button
                                    onClick={handleCartClick}
                                    className={`navbar-icon-btn navbar-cart-btn ${
                                        pathname === "/payment" ? "active-icon" : ""
                                    }`}
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

                                <button
                                    onClick={handleProfileClick}
                                    className="navbar-icon-btn"
                                    aria-label="profile"
                                >
                                    <img
                                        src={profilePic}
                                        alt="profile"
                                        className="navbar-profile-img"
                                        style={{
                                            width: "35px",
                                            height: "35px",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                        }}
                                    />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Logout Confirmation Modal */}
            <ConfirmModal
                show={showLogoutModal}
                onHide={() => setShowLogoutModal(false)}
                onConfirm={() => {
                    setShowLogoutModal(false);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    localStorage.removeItem("role");
                    localStorage.removeItem("cart");
                    localStorage.removeItem("currentOrder");
                    if (userRole === "admin") {
                        router.push("/admin/login");
                    } else if (userRole === "vendor") {
                        router.push("/vendor/login");
                    } else {
                        router.push("/login");
                    }
                }}
                title="Konfirmasi Logout"
                message="Apakah kamu yakin ingin keluar dari akun ini?"
                confirmText="Ya, Logout"
                cancelText="Batal"
                variant="warning"
            />
        </nav>
    );
}

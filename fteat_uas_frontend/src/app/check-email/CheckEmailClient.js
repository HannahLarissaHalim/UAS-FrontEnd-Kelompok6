"use client";
import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import AlertModal from "../components/AlertModal";

export default function CheckEmailClient() {
  const searchParams = useSearchParams();
  const emailFromURL = searchParams.get("email") || localStorage.getItem("email");

  const [loading, setLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', variant: 'info' });

  const handleResend = async () => {
    setLoading(true);
    try {
      if (!emailFromURL) throw new Error("Email tidak ditemukan di URL.");

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/auth/resend-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailFromURL }),
      });

      const data = await res.json();
      if (data.success) {
        setAlertModal({ show: true, title: 'Berhasil', message: 'Email verifikasi berhasil dikirim ulang!', variant: 'success' });
      } else {
        setAlertModal({ show: true, title: 'Gagal', message: data.message || 'Gagal mengirim ulang email.', variant: 'error' });
      }
    } catch (error) {
      console.error("Resend error:", error);
      setAlertModal({ show: true, title: 'Error', message: 'Terjadi kesalahan saat mengirim ulang email.', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Image
          src="/images/mail.png"
          alt="Mail Icon"
          width={120}
          height={120}
          style={{ marginBottom: "20px" }}
        />
        <h2 style={styles.title}>Periksa Email</h2>
        <p style={styles.text}>
          Kami telah mengirimkan link verifikasi ke email kamu. Silakan buka
          email tersebut untuk masuk ke aplikasi.
          <br />
          <span style={{ fontSize: "13px", color: "#555", fontStyle: "italic" }}>
            Tautan hanya berlaku selama 5 menit.
          </span>
        </p>

        <button
          onClick={handleResend}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Mengirim..." : "Kirim Ulang Email"}
        </button>

        {/* Alert Modal */}
        <AlertModal
          show={alertModal.show}
          onHide={() => setAlertModal({ ...alertModal, show: false })}
          title={alertModal.title}
          message={alertModal.message}
          variant={alertModal.variant}
        />
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#F5F5F5",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "rgba(187, 221, 255, 0.25)",
    padding: "50px 40px",
    borderRadius: "20px",
    textAlign: "center",
    maxWidth: "400px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  title: {
    color: "#0A4988",
    fontSize: "26px",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  text: {
    color: "#000000",
    fontSize: "15px",
    marginBottom: "25px",
  },
  button: {
    backgroundColor: "#4493E2",
    border: "none",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "16px",
    transition: "0.3s",
  },
};

"use client";
import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import { Card, Button, Alert, Spinner } from "react-bootstrap";
import Navbar from "../../components/Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../custom.css';

export default function AdminDashboard() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    // Ambil token admin dari localStorage
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      setError("Admin belum login.");
      setLoading(false);
      return;
    }
    setToken(savedToken);

    // Fetch daftar vendor
    fetchVendors(savedToken);
  }, []);

  const fetchVendors = async (authToken) => {
    setLoading(true);
    try {
      const response = await api.getVendorsForAdmin(authToken);
      if (response.success) {
        setVendors(response.data || []);
      } else {
        setError(response.message || "Gagal fetch vendor.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat fetch vendor.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId) => {
    try {
      const response = await api.approveVendor(vendorId, token);
      if (response.success) {
        // Update UI langsung
        setVendors((prev) =>
          prev.map((v) =>
            v._id === vendorId ? { ...v, isApproved: true } : v
          )
        );
      } else {
        alert(response.message || "Gagal approve vendor.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat approve vendor.");
    }
  };

  if (loading) return <Spinner animation="border" className="m-5" />;

  return (
    <div>
      <Navbar />
      <div className="container my-5">
        <h2>Admin Dashboard - Verifikasi Vendor</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="vendor-list d-flex flex-wrap">
          {vendors.length === 0 && <p>Tidak ada vendor untuk diverifikasi.</p>}
          {vendors.map((vendor) => (
            <Card key={vendor._id} style={{ width: "18rem", margin: "10px" }}>
              <Card.Body>
                <Card.Title>{vendor.name}</Card.Title>
                <Card.Text>
                  Email: {vendor.email} <br />
                  Status: {vendor.isApproved ? "Approved ✅" : "Pending ⏳"}
                </Card.Text>
                {!vendor.isApproved && (
                  <Button
                    variant="success"
                    onClick={() => handleApprove(vendor._id)}
                  >
                    Approve
                  </Button>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

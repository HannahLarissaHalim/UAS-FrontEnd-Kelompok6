'use client';
import { useState } from 'react';
import { Form, Alert, Row, Col } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Image from 'next/image';
import { api } from '../../../utils/api';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../custom.css';

export default function RegisterVendor() {

  const bankList = [
    "ACEH SYARIAH","ALADIN SYARIAH","ALLO BANK","ALTOREM/PAY","AMAR INDONESIA",
    "ANZ INDONESIA","ARTHA GRAHA","ATMBPLUS","ATMI","BALI",
    "BANK BPD DIY UUS","BANK CIMB NIAGA UUS","BANK DANAMON UUS","BANK DBS","BANK DKI UUS",
    "BANK JAGO","BANK JAGO UUS","BANK JATENG UUS","BANK JATIM UUS","BANK MAYBANK UUS",
    "BANK MEGA SYARIAH","BANK MIZUHO","BANK NAGARI UUS","BANK NEO COMMERCE","BANK OCBC NISP UUS",
    "BANK PERMATA UUS","BANK RAYA","BANK RESONA","BANK SAQU","BANK SINARMAS UUS",
    "BANK SMBC","BANK SULSELBAR UUS","BANK SYARIAH NASIONAL","BANTEN","BCA SYARIAH",
    "BENGKULU","BI","BJB","BJB SYARIAH","BLU BY BCA DIGITAL",
    "BMRI-BPR","BNI","BNP PARIBAS","BOA","BOC INDONESIA",
    "BOI INDONESIA","BPD DIY","BPD KALBAR UUS","BPD KALSEL UUS","BPD KALTIMTARA UUS",
    "BPD SUMSEL BABEL UUS","BPD SUMUT UUS","BPR DANUS","BPR EKA","BPR KS",
    "BPR PRIMA MASTER","BPR SUPRA","BRI","BRK SYARIAH","BSG",
    "BSI","BTN","BTN UUS","BTPN SYARIAH","BUMI ARTA",
    "CAPITAL INDONESIA","CCB INDONESIA","CIMB NIAGA","CITIBANK","CTBC INDONESIA",
    "DANA","DANAMON","DEUTSCHE BANK","DOKU","GANESHA",
    "HIBANK DH MAYORA","HSBC","IBK BANK","ICBC","INA PERDANA",
    "INDEX","JAKARTA","JAMBI","JATENG","JATIM",
    "JPMORGAN BANK","JTRUST BANK","KALBAR","KALSEL","KALTENG",
    "KALTIMKALTARA","KB BANK","KB BUKOPIN SYARIAH","KEB HANA","KROM",
    "KSEI","LAMPUNG","MALUKUMALUT","MANDIRI","MANDIRI TASPEN",
    "MAS","MASPION","MAYAPADA","MAYBANK (D/H BII)","MEGA",
    "MESTIKA","MNC BANK","MUAMALAT","MUFG BANK, LTD","NAGARI",
    "NANO BANK","NOBU","NTB SYARIAH","NTT","OCBC",
    "OKE","PANIN","PANIN SYARIAH","PAPUA","PAYPRO",
    "PERMATA","PT. BPD JAMBI UUS","QNB INDONESIA","SAHABAT SAMPOERN","SBI INDONESIA",
    "SEABANK","SHINHAN","SHOPEEPAY","SINARMAS","SLEMAN",
    "STANDARD CHARTERED","SULSELBAR","SULTENG","SULTRA","SUMSELBABEL",
    "SUMUT","SUPERBANK","TCASH","TELKOM","UOB",
    "VICTORIA","WOORI SAUDARA","YOOPAY"
  ];

  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    stallName: '',       
    accountHolder: '',   
    bankName: '',        
    accountNumber: '',    
    whatsapp: '',         
    email: '',
    VendorId: '',
    password: '',
    confirmPassword: ''
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setError('');

    if (step === 1) {
      // Validate step 1 fields
      if (!formData.accountHolder) return setError('Nama A/N harus diisi'); // EDIT
      if (!formData.bankName) return setError('Bank harus dipilih'); // EDIT
      if (!formData.accountNumber) return setError('Nomor Rekening harus diisi'); // EDIT
      if (!formData.whatsapp) return setError('Nomor WA harus diisi'); // EDIT

      setStep(2);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Password tidak cocok');
    }
    if (formData.password.length < 6) {
      return setError('Password minimal 6 karakter');
    }

    const requiredFields = ['vendorFirstName', 'stallName', 'VendorId', 'accountHolder', 'bankName', 'accountNumber', 'whatsapp', 'email', 'password'];
    for (let field of requiredFields) {
        if (!formData[field]) {
            setError(`${field} harus diisi`); // EDIT: tampilkan field yg kosong
            return;
        }
    }

    setLoading(true);

    try {

        // Use the provided VendorId (trimmed) — backend will validate uniqueness
        const payload = {
          ...formData,
          VendorId: (formData.VendorId || '').toString().trim()
        };

        const data = await api.vendorRegister(payload); 
        
        if (!data.success) throw new Error(data.message || 'Registration gagal');

        // Simpan email untuk verifikasi dan arahkan ke halaman menunggu verifikasi admin
        localStorage.setItem('vendor_registration_email', formData.email);
        router.push(`/vendor/pending`);
    } catch (err) {
      setError(err.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Navbar />

      <div className="register-container">

        {/* Logo kiri */}
        <div className="register-left">
          <Image 
            src="/images/logo.png" 
            alt="FTEAT Logo" 
            width={250} 
            height={250} 
            className="register-logo"
          />
        </div>

        {/* Form kanan */}
        <div className="register-right">
          <h2 className="register-title">Register Vendor</h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit} className="register-form">

            {/* Step 1: Vendor Info */}
            {step === 1 && (
              <>

                <Row>
                {/* First Name (wajib) */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="vendorFirstName"
                        value={formData.vendorFirstName || ''}
                        onChange={handleChange}
                        placeholder="First Name"
                        required
                    />
                    </Form.Group>
                </Col>

                {/* Last Name (optional) */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                    <Form.Label>Last Name (Optional)</Form.Label>
                    <Form.Control
                        type="text"
                        name="vendorLastName"
                        value={formData.vendorLastName || ''}
                        onChange={handleChange}
                        placeholder="Last Name"
                    />
                    </Form.Group>
                </Col>
            </Row>
            
                <Form.Group className="mb-3">
                  <Form.Label>Nomor WA</Form.Label>  
                  <Form.Control
                    type="text"
                    name="whatsapp" 
                    value={formData.whatsapp} 
                    onChange={handleChange}
                    placeholder="0812xxxxxxx"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bank</Form.Label> {/* EDIT */}
                  <Form.Select
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pilih Bank</option>
                    {bankList.map((bank, idx) => (
                      <option key={idx} value={bank}>{bank}</option> 
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nomor Rekening</Form.Label> 
                  <Form.Control
                    type="text"
                    name="accountNumber"  
                    value={formData.accountNumber} 
                    onChange={handleChange}
                    placeholder="Nomor Rekening"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nama A/N</Form.Label>  {/* EDIT */}
                  <Form.Control
                    type="text"
                    name="accountHolder" // EDIT
                    value={formData.accountHolder} // EDIT
                    onChange={handleChange}
                    placeholder="A/N Rekening"
                    required
                  />
                </Form.Group>

                

                <div className="d-flex justify-content-end">
                  <button type="button" onClick={handleNext} className="btn-next-arrow">
                    <span>→</span>
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Email & Password */}
            {step === 2 && (
              <>

                <Form.Group className="mb-3">
                  <Form.Label>Nama Stand</Form.Label>
                  <Form.Control
                    type="text"
                    name="stallName"
                    value={formData.stallName}
                    onChange={handleChange}
                    placeholder="Nama Stand"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Vendor ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="VendorId"
                    value={formData.VendorId}
                    onChange={handleChange}
                    placeholder="Masukkan Vendor ID (unik) atau gunakan format VEND-123"
                    required
                  />
                  <Form.Text className="text-muted">Vendor ID akan menjadi penghubung antara akun vendor dan field <code>vendor</code> pada menu makanan. Harus unik.</Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <div className="password-wrapper">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Konfirmasi Password</Form.Label>
                      <div className="password-wrapper">
                        <Form.Control
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                        <span className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-between">
                  <button type="button" onClick={handleBack} className="btn btn-outline-secondary">
                    ← Kembali
                  </button>
                  <button type="submit" className="btn-next-arrow" disabled={loading}>
                    {loading ? '...' : <span>→</span>}
                  </button>
                </div>
              </>
            )}

          </Form>
        </div>
      </div>
    </div>
  );
}
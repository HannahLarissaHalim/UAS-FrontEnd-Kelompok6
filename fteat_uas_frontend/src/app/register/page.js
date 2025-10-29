'use client';
import { useState, useEffect } from 'react';
import { Form, Alert, Row, Col } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import HomeNavbar from '../components/HomeNavbar';
import { mockFaculties, mockMajors } from '../../utils/mockData';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    facultyCode: '',
    majorCode: '',
    yearEntry: '',
    npmLast3Digits: '',
    fullNPM: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [availableMajors, setAvailableMajors] = useState([]);

  // Update available majors when faculty changes
  useEffect(() => {
    if (formData.facultyCode) {
      const majors = mockMajors[formData.facultyCode] || [];
      setAvailableMajors(majors);
    } else {
      setAvailableMajors([]);
    }
  }, [formData.facultyCode]);

  // Auto-generate NPM and Email when dependencies change
  useEffect(() => {
    const { facultyCode, majorCode, yearEntry, npmLast3Digits, firstName } = formData;

    if (facultyCode && majorCode && yearEntry) {
      // Get last 2 digits of year
      const yearShort = yearEntry.toString().slice(-2);

      // NPM Format: majorCode(3) + year(2) + 0 + last3digits(3) = 9 digits
      // Example: 535 + 24 + 0 + 023 = 535240023
      const npmPrefix = `${majorCode}${yearShort}0`;

      // Update full NPM if last 3 digits are entered
      if (npmLast3Digits && npmLast3Digits.length === 3) {
        const fullNPM = npmPrefix + npmLast3Digits;

        // Generate email: firstname.NPM@stu.untar.ac.id
        const email = firstName ? `${firstName.toLowerCase()}.${fullNPM}@stu.untar.ac.id` : '';

        // Only update if values have changed to prevent infinite loop
        if (formData.fullNPM !== fullNPM || formData.email !== email) {
          setFormData(prev => ({
            ...prev,
            fullNPM,
            email
          }));
        }
      } else {
        const newNPM = npmPrefix + (npmLast3Digits || 'XXX');
        // Only update if value has changed
        if (formData.fullNPM !== newNPM) {
          setFormData(prev => ({
            ...prev,
            fullNPM: newNPM,
            email: ''
          }));
        }
      }
    }
  }, [formData.facultyCode, formData.majorCode, formData.yearEntry, formData.npmLast3Digits, formData.firstName]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for npmLast3Digits - only allow 3 digits
    if (name === 'npmLast3Digits') {
      const sanitized = value.replace(/\D/g, '').slice(0, 3);
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      return;
    }

    // Reset major when faculty changes
    if (name === 'facultyCode') {
      setFormData(prev => ({
        ...prev,
        facultyCode: value,
        majorCode: ''
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setError('');

    if (step === 1) {
      // Validate step 1
      if (!formData.firstName) {
        setError('Nama Depan harus diisi');
        return;
      }

      if (!formData.facultyCode) {
        setError('Fakultas harus dipilih');
        return;
      }

      if (!formData.majorCode) {
        setError('Program Studi harus dipilih');
        return;
      }

      if (!formData.yearEntry) {
        setError('Tahun Masuk harus dipilih');
        return;
      }

      if (!formData.npmLast3Digits || formData.npmLast3Digits.length !== 3) {
        setError('Nomor Identitas Mahasiswa harus 3 digit');
        return;
      }

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
      setError('Password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      router.push('/login');
    } catch (err) {
      setError(err.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="register-page">
      <HomeNavbar />

      <div className="register-container">
        <div className="register-left">
          <Image
            src="/images/logo.png"
            alt="FTEAT Logo"
            className="register-logo"
            width={150}
            height={150}
            priority
          />
        </div>

        <div className="register-right">
          <div className="register-card">
            <h2 className="register-title">Registrasi</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit} className="register-form">
              {/* Step 1: Personal Info & NPM Generation */}
              {step === 1 && (
                <>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nama Depan</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          placeholder="Masukkan nama depan"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nama Belakang <span className="text-muted">(Opsional)</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          placeholder="Opsional"
                          value={formData.lastName}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Fakultas</Form.Label>
                    <Form.Select
                      name="facultyCode"
                      value={formData.facultyCode}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Pilih Fakultas</option>
                      {mockFaculties.map((faculty, index) => (
                        <option key={`faculty-${faculty.code}-${index}`} value={faculty.code}>
                          {faculty.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Program Studi</Form.Label>
                    <Form.Select
                      name="majorCode"
                      value={formData.majorCode}
                      onChange={handleChange}
                      disabled={!formData.facultyCode}
                      required
                    >
                      <option value="">Pilih Program Studi</option>
                      {availableMajors.map((major, index) => (
                        <option key={`major-${major.code}-${index}`} value={major.code}>
                          {major.name}
                        </option>
                      ))}
                    </Form.Select>
                    {!formData.facultyCode && (
                      <Form.Text className="text-muted">
                        Pilih fakultas terlebih dahulu
                      </Form.Text>
                    )}
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Tahun Masuk</Form.Label>
                        <Form.Select
                          name="yearEntry"
                          value={formData.yearEntry}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Pilih Tahun</option>
                          {[2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map((year) => (
                            <option key={`year-${year}`} value={year}>
                              {year}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Nomor Identitas Mahasiswa</Form.Label>
                        <Form.Control
                          type="text"
                          name="npmLast3Digits"
                          placeholder="001"
                          maxLength="3"
                          value={formData.npmLast3Digits}
                          onChange={handleChange}
                          required
                          className="text-center fw-bold"
                        />
                        <Form.Text className="text-muted">
                          Input 3 digit terakhir NPM Anda
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* NPM Preview */}
                  {formData.facultyCode && formData.majorCode && formData.yearEntry && (
                    <div className="npm-preview mb-4 p-3 bg-light rounded">
                      <Row>
                        <Col md={6}>
                          <strong>Preview NPM:</strong>
                          <div className="fs-4 fw-bold text-primary">
                            {formData.fullNPM || 'Belum lengkap'}
                          </div>
                          <small className="text-muted">
                            Format: {formData.majorCode} + {formData.yearEntry.toString().slice(-2)} + 0 + {formData.npmLast3Digits || 'XXX'}
                          </small>
                        </Col>
                        {formData.fullNPM && formData.fullNPM.length === 8 && (
                          <Col md={6}>
                            <strong>Email Universitas:</strong>
                            <div className="fs-6 text-primary">
                              {formData.email || 'Masukkan nama depan'}
                            </div>
                          </Col>
                        )}
                      </Row>
                    </div>
                  )}

                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-next-arrow"
                    >
                      <span>→</span>
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: Email & Password */}
              {step === 2 && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Untar (Auto-generated)</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      disabled
                      className="email-display"
                    />
                    <Form.Text className="text-muted">
                      Email verifikasi akan dikirim ke alamat ini
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>NPM (Auto-generated)</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.fullNPM}
                      disabled
                      className="fw-bold text-center"
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Kata Sandi</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        <Form.Text className="text-muted">
                          Minimal 6 karakter
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Konfirmasi Kata Sandi</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="btn btn-outline-secondary"
                    >
                      ← Kembali
                    </button>
                    <button
                      type="submit"
                      className="btn-next-arrow"
                      disabled={loading}
                    >
                      {loading ? '...' : <span>→</span>}
                    </button>
                  </div>
                </>
              )}

            </Form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="homepage-footer">
        <p>Developed by <strong>HELD</strong></p>
      </div>
    </div>
  );
}

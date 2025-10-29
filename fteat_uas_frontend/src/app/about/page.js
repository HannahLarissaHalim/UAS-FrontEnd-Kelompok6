'use client';
import { Container, Row, Col, Card } from 'react-bootstrap';
import HomeNavbar from '../components/HomeNavbar';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AboutPage() {
  return (
    <>
      <HomeNavbar />
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="text-center mb-5">
              <h1 className="fw-bold mb-3">About FTEAT</h1>
              <p className="lead text-muted">
                Teknik Rekayasa Rasa - Platform Pemesanan Makanan Kampus
              </p>
            </div>

            <Row className="g-4 mb-5">
              <Col md={6}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <div className="text-center mb-3" style={{ fontSize: '3rem' }}>
                      🎯
                    </div>
                    <h4 className="text-center mb-3">Misi Kami</h4>
                    <p className="text-muted">
                      Menyediakan platform yang memudahkan mahasiswa untuk memesan 
                      makanan di kampus dengan cepat, mudah, dan efisien. Kami 
                      berkomitmen mendukung UMKM lokal di lingkungan kampus.
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <div className="text-center mb-3" style={{ fontSize: '3rem' }}>
                      👁️
                    </div>
                    <h4 className="text-center mb-3">Visi Kami</h4>
                    <p className="text-muted">
                      Menjadi platform terdepan untuk ekosistem kuliner kampus, 
                      menghubungkan mahasiswa dengan berbagai pilihan makanan 
                      berkualitas sambil mendukung pertumbuhan pedagang lokal.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="shadow-sm mb-4">
              <Card.Body className="p-5">
                <h3 className="mb-4">Tentang Platform</h3>
                <p className="mb-3">
                  FTEAT (Food Technology Engineering And Taste) adalah platform pemesanan 
                  makanan yang dirancang khusus untuk mahasiswa Universitas Tarumanagara. 
                  Kami menyediakan solusi praktis bagi mahasiswa yang ingin memesan makanan 
                  tanpa harus antri lama.
                </p>
                <p className="mb-3">
                  Platform ini menghubungkan mahasiswa dengan berbagai stand makanan di 
                  kampus, mulai dari mie instan, gorengan, bento, hingga minuman segar. 
                  Semua bisa dipesan dengan mudah melalui smartphone.
                </p>
                <h5 className="mt-4 mb-3">Fitur Utama:</h5>
                <ul>
                  <li className="mb-2">📱 Pemesanan online yang mudah dan cepat</li>
                  <li className="mb-2">🍜 Berbagai pilihan menu dari multiple vendor</li>
                  <li className="mb-2">💰 Harga transparan dan terjangkau</li>
                  <li className="mb-2">⏱️ Estimasi waktu pembuatan yang akurat</li>
                  <li className="mb-2">📍 Informasi lokasi pengambilan yang jelas</li>
                  <li className="mb-2">📊 Dashboard untuk tracking pesanan</li>
                </ul>
              </Card.Body>
            </Card>

            <Card className="shadow-sm bg-primary text-white">
              <Card.Body className="p-5 text-center">
                <h3 className="mb-3">Ingin Bergabung?</h3>
                <p className="mb-4">
                  Baik Anda mahasiswa yang ingin memesan makanan atau pedagang yang 
                  ingin membuka tenant di platform kami, FTEAT siap membantu!
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <div>
                    <h6>Untuk Mahasiswa</h6>
                    <p className="mb-0">Daftar dan mulai pesan sekarang!</p>
                  </div>
                  <div>
                    <h6>Untuk Vendor</h6>
                    <p className="mb-0">Hubungi: +62 812-3456-7890</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

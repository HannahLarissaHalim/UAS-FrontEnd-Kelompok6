'use client';
import { Navbar, Nav, Container } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';

function HomeNavbar() {
  return (
    <Navbar expand="lg" className="navbar-custom">
      <Container fluid>
        {/* Left Empty Space */}
        <div className="navbar-left-space"></div>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
          <Nav className="navbar-nav-centered">
            <Nav.Link as={Link} href="/stand">Stand</Nav.Link>
            <Nav.Link as={Link} href="/register">Register</Nav.Link>
            <Nav.Link as={Link} href="/menu">Menu</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        
        <div className="d-none d-lg-flex align-items-center gap-2 navbar-right">
          <Image 
            src="/images/logo.png" 
            alt="FTEAT Logo" 
            width={50}
            height={50}
            className="navbar-icon"
            unoptimized
          />
        </div>
      </Container>
    </Navbar>
  );
}

export default HomeNavbar;

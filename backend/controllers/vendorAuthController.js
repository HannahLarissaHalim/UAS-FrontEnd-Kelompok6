const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

exports.vendorLogin = async (req, res) => {
  let body = "";

  req.on("data", chunk => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      const { email, password } = JSON.parse(body);

      const allowedVendors = [
        { email: process.env.VENDOR1_EMAIL, password: process.env.VENDOR1_PASS },
        { email: process.env.VENDOR2_EMAIL, password: process.env.VENDOR2_PASS },
      ];

      console.log("Login attempt:", email);

      const matchedVendor = allowedVendors.find(
        (v) => v.email === email && v.password === password
      );

      if (!matchedVendor) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({
          success: false,
          message: "Email atau password salah",
        }));
      }

      // Cari data vendor di database
      const vendorData = await Vendor.findOne({ email_address: email });

      if (!vendorData) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({
          success: false,
          message: "Data vendor tidak ditemukan di database",
        }));
      }

      const token = jwt.sign(
        { id: vendorData._id, role: "vendor" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        success: true,
        message: "Login vendor berhasil",
        data: {
          token,
          role: "vendor",
          VendorID: vendorData._id,
          vendorName: vendorData.stallName,
          email: email,
        },
      }));

    } catch (error) {
      console.error("Vendor login error:", error);

      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        success: false,
        message: "Terjadi kesalahan server",
      }));
    }
  });
};

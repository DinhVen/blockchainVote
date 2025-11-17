import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// --- Cấu hình đường dẫn tuyệt đối ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Khởi tạo app ---
const app = express();
app.use(express.json());
app.use(cors());

// --- Cho phép phục vụ file tĩnh (index.html, main.js, style.css) ---
app.use(express.static(__dirname));

// --- Biến lưu OTP ---
let otpStore = {};

// --- Gửi OTP ---
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email.endsWith("@st.qnu.edu.vn")) {
    return res.status(400).json({ success: false, message: "Chỉ chấp nhận email sinh viên @st.qnu.edu.vn" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "van4551050252@st.qnu.edu.vn",
        pass: "vbsd hgcj xebe masw",
      },
    });

    await transporter.sendMail({
      from: '"Ủy ban Bầu cử Gia Lai" <van4551050252@st.qnu.edu.vn>',
      to: email,
      subject: "Mã xác thực cử tri (OTP)",
      text: `Mã OTP của bạn là ${otp}. Mã chỉ có hiệu lực trong 5 phút.`,
    });

    console.log(`[OTP_SENT] ${email} => ${otp}`);
    res.json({ success: true, message: "Đã gửi mã OTP đến email sinh viên." });
  } catch (err) {
    console.error("Lỗi gửi mail:", err);
    res.status(500).json({ success: false, message: "Không gửi được OTP." });
  }
});

// --- Xác minh OTP ---
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record) return res.status(400).json({ success: false, message: "Chưa gửi OTP." });
  if (Date.now() > record.expires)
    return res.status(400).json({ success: false, message: "OTP đã hết hạn." });
  if (record.otp !== otp)
    return res.status(400).json({ success: false, message: "Sai mã OTP." });

  delete otpStore[email];
  res.json({ success: true, message: "Xác thực thành công!" });
});

// --- Mặc định chuyển về index.html nếu truy cập gốc ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// --- Chạy server ---
app.listen(3000, () => console.log("✅ Server OTP đang chạy tại http://localhost:3000"));

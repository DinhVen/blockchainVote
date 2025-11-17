// === CẤU HÌNH HỢP ĐỒNG ===
const CONTRACT_ADDRESS = "0xb3cf434ec5530cee42c22755858a3b44767ce5f1"; // dán địa chỉ contract sau khi deploy
const CONTRACT_ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "cuTri",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "maUngVien",
				"type": "uint256"
			}
		],
		"name": "DaBoPhieu",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_maUngVien",
				"type": "uint256"
			}
		],
		"name": "boPhieu",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "daBau",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "dsUngVien",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "maSo",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "hoTen",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "tongPhieu",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "tongUngVien",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "xemKetQua",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

let provider, signer, contract;
let currentAccount = null;

// === OTP ===
async function sendOTP() {
  const email = document.getElementById("email").value;
  const res = await fetch("http://localhost:3000/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  document.getElementById("otpStatus").textContent = data.message;
}

async function verifyOTP() {
  const email = document.getElementById("email").value;
  const otp = document.getElementById("otp").value;
  const res = await fetch("http://localhost:3000/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp })
  });
  const data = await res.json();
  document.getElementById("otpStatus").textContent = data.message;

  if (data.success) {
    document.getElementById("connectButton").disabled = false;
  }
}

// === KẾT NỐI VÍ ===
async function connectWallet() {
  const statusEl = document.getElementById("status");
  try {
    if (!window.ethereum) {
      statusEl.textContent = "MetaMask chưa được cài đặt.";
      return;
    }

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    currentAccount = accounts[0];

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    document.getElementById("connectButton").textContent = "Đã kết nối";
    statusEl.textContent = `Địa chỉ ví: ${currentAccount}`;
    await renderCandidates();
  } catch (err) {
    statusEl.textContent = "Lỗi kết nối ví: " + err.message;
  }
}

// === DANH SÁCH ỨNG VIÊN ===
async function renderCandidates() {
  const container = document.getElementById("candidateList");
  container.innerHTML = "";

  const total = await contract.tongUngVien();
  for (let i = 1; i <= total; i++) {
    const uv = await contract.dsUngVien(i);
    const card = document.createElement("div");
    card.className = "candidate-card";
    card.innerHTML = `
      <h3>${uv.hoTen}</h3>
      <p>Mã ứng viên: ${uv.maSo}</p>
      <button onclick="handleVote(${uv.maSo})">BẦU CHỌN</button>
    `;
    container.appendChild(card);
  }
}

// === BỎ PHIẾU ===
async function handleVote(id) {
  const statusEl = document.getElementById("status");
  try {
    statusEl.textContent = "Đang gửi phiếu...";
    const tx = await contract.boPhieu(id);
    await tx.wait();
    statusEl.textContent = "Bỏ phiếu thành công!";
    showFlagEffect();
    await renderResults();
  } catch (err) {
    statusEl.textContent = "Lỗi khi bỏ phiếu: " + err.message;
  }
}

// === KẾT QUẢ ===
async function renderResults() {
  const resultBox = document.getElementById("resultBox");
  const [names, votes] = await contract.xemKetQua();

  let html = "<h4>Kết quả hiện tại:</h4>";
  for (let i = 0; i < names.length; i++) {
    html += `${names[i]}: <b>${votes[i]}</b> phiếu<br>`;
  }
  resultBox.innerHTML = html;
}

// === HIỆU ỨNG CỜ SAU KHI BẦU ===
function showFlagEffect() {
  const flag = document.createElement("div");
  flag.innerHTML = "🇻🇳";
  flag.style.position = "fixed";
  flag.style.left = "50%";
  flag.style.top = "50%";
  flag.style.transform = "translate(-50%, -50%) scale(2)";
  flag.style.fontSize = "80px";
  flag.style.opacity = "1";
  flag.style.transition = "all 2s ease-out";
  document.body.appendChild(flag);

  setTimeout(() => {
    flag.style.transform = "translate(-50%, -300%) scale(3)";
    flag.style.opacity = "0";
  }, 100);
  setTimeout(() => flag.remove(), 2000);
}

// === GẮN SỰ KIỆN ===
document.getElementById("connectButton").addEventListener("click", connectWallet);
document.getElementById("refreshResult").addEventListener("click", renderResults);

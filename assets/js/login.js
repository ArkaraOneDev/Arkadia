// assets/js/login.js

(function () {
  const form = document.getElementById("loginForm");
  if (!form) return;

  // --- KEAMANAN RENDAH: Daftar Akun Disimpan di Sisi Klien ---
  // PENTING: Daftar ini rentan dan bisa dilihat oleh siapa saja.
  const VALID_USERS = [
    { username: "busdev1", password: "arkara111!" },
    { username: "busdev2", password: "arkara222@" },
    { username: "busdev", password: "arkara888*" }
  ];

  // --- Elemen UI dan State ---

  let msgEl = document.querySelector(".login-error");
  if (!msgEl) {
    msgEl = document.createElement("div");
    msgEl.className = "login-error";
    msgEl.style.color = "#b00020";
    msgEl.style.marginTop = "8px";
    msgEl.style.fontSize = "14px";
    msgEl.style.textAlign = "left";
    msgEl.style.display = "none";
    
    const btn = form.querySelector("button[type='submit']");
    if (btn) {
      btn.parentNode.insertBefore(msgEl, btn);
    }
  }

  // Proteksi percobaan login
  const MAX_ATTEMPTS = 3;
  const LOCK_SECONDS = 8;
  let attempts = 0;
  let lockedUntil = 0;

  function setError(text) {
    msgEl.textContent = text;
    msgEl.style.display = text ? "block" : "none";
  }

  function lockLogin(seconds) {
    lockedUntil = Date.now() + seconds * 1000;
    const btn = form.querySelector("button[type='submit']");
    btn.disabled = true;
    let remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
    setError(`Terlalu banyak percobaan salah. Coba lagi dalam ${remaining} detik.`);

    const timer = setInterval(() => {
      remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining > 0) {
        setError(`Terlalu banyak percobaan salah. Coba lagi dalam ${remaining} detik.`);
      } else {
        clearInterval(timer);
        btn.disabled = false;
        attempts = 0;
        setError("");
      }
    }, 1000);
  }

  // Fungsi untuk validasi user lokal
  function isValidUser(username, password) {
    return VALID_USERS.some(
      user => user.username === username && user.password === password
    );
  }

  // --- Cek Sesi Awal ---
  // Jika user sudah login, langsung alihkan
  if (localStorage.getItem('currentUser')) {
      window.location.href = "landing.html";
      return;
  }
  
  // --- Event Listener ---

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // 1. Cek Locked
    if (Date.now() < lockedUntil) {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      setError(`Terlalu banyak percobaan salah. Coba lagi dalam ${remaining} detik.`);
      return;
    }

    const username = (document.getElementById("username")?.value || "").trim();
    const password = document.getElementById("password")?.value || "";
    
    // 2. Validasi Kredensial (Client-Side)
    if (isValidUser(username, password)) {
      // ✅ Login Sukses
      setError("");
      attempts = 0; // Reset percobaan

      // 3. Simpan username ke localStorage untuk sesi
      try {
        localStorage.setItem("currentUser", username);
        // localStorage.setItem("isLoggedIn", "true"); // 'currentUser' sudah cukup
      } catch (err) { 
        console.warn("Gagal mengakses localStorage. Sesi tidak tersimpan.", err);
      }

      // 4. Redirect ke landing page
      window.location.href = "landing.html";
      
    } else {
      // ❌ Login Gagal
      attempts += 1;
      const remainingAttempts = MAX_ATTEMPTS - attempts;
      
      if (remainingAttempts > 0) {
        setError(`Username atau password salah. Sisa percobaan: ${remainingAttempts}.`);
      } else {
        lockLogin(LOCK_SECONDS);
      }
    }
  });
})();
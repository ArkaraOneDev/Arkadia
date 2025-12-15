// backend/server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Port untuk menjalankan server Node.js

// --- Path File Data ---
const JSON_FILE_PATH = path.join(__dirname, 'projects_data.json');
const SECTOR_JSON_FILE_PATH = path.join(__dirname, 'sector_data.json');
const NEWS_JSON_FILE_PATH = path.join(__dirname, 'news_data.json'); 
const USER_JSON_FILE_PATH = path.join(__dirname, 'user_data.json'); // Path file user data
const LOGS_JSON_FILE_PATH = path.join(__dirname, 'logs_data.json'); 
const WEBGIS_JSON_FILE_PATH = path.join(__dirname, 'webgis_data.json'); 
const TEAMS_JSON_FILE_PATH = path.join(__dirname, 'teams_data.json'); 
// ** BARU: Path file Company data **
const COMPANY_JSON_FILE_PATH = path.join(__dirname, 'company_data.json'); 

// --- Middleware Setup ---
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit untuk foto base64
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); 


// =======================================================
//                  UTILITY FUNCTIONS (PROJECTS)
// =======================================================

/**
 * Membaca konten dari projects_data.json
 * @returns {Array} Array of project objects
 */
function readProjects() {
    try {
        const data = fs.readFileSync(JSON_FILE_PATH, 'utf8');
        if (!data.trim()) {
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log("projects_data.json not found. Initializing file.");
            writeProjects([]);
            return [];
        }
        console.error("Error reading JSON file:", error);
        return []; 
    }
}

/**
 * Menulis array proyek ke projects_data.json
 * @param {Array} projects Array of project objects
 * @returns {boolean} True if successful
 */
function writeProjects(projects) {
    try {
        fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(projects, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error("Error writing JSON file:", error);
        return false;
    }
}


// =======================================================
//                  UTILITY FUNCTIONS (SECTOR/COMMODITY)
// =======================================================

/**
 * Membaca konten dari sector_data.json
 * @returns {object} { customSectors: [], customCommodityMap: {} }
 */
function readSectorData() {
    try {
        const data = fs.readFileSync(SECTOR_JSON_FILE_PATH, 'utf8');
        // Inisialisasi default jika file kosong
        if (!data.trim()) {
            return { customSectors: [], customCommodityMap: {} };
        }
        return JSON.parse(data);
    } catch (error) {
        // Jika file tidak ada, buat file baru dengan data kosong
        if (error.code === 'ENOENT') {
            console.log("sector_data.json not found. Initializing file.");
            const defaultData = { customSectors: [], customCommodityMap: {} };
            writeSectorData(defaultData);
            return defaultData;
        }
        console.error("Error reading SECTOR JSON file:", error);
        return { customSectors: [], customCommodityMap: {} }; 
    }
}

/**
 * Menulis data sektor ke sector_data.json
 * @param {object} data { customSectors: Array, customCommodityMap: Object }
 * @returns {boolean} True if successful
 */
function writeSectorData(data) {
    try {
        fs.writeFileSync(SECTOR_JSON_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error("Error writing SECTOR JSON file:", error);
        return false;
    }
}

// =======================================================
//          UTILITY FUNCTIONS (NEWS LINKS)
// =======================================================

/**
 * Membaca konten dari news_data.json
 * @returns {object} Peta sektor ke array URL
 */
function readNewsData() {
    try {
        const data = fs.readFileSync(NEWS_JSON_FILE_PATH, 'utf8');
        if (!data.trim()) {
            return {};
        }
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log("news_data.json not found. Initializing file.");
            writeNewsData({});
            return {};
        }
        console.error("Error reading NEWS DATA JSON file:", error);
        return {}; 
    }
}

/**
 * Menulis data URL berita ke news_data.json
 * @param {object} data Peta sektor ke array URL
 * @returns {boolean} True if successful
 */
function writeNewsData(data) {
    try {
        fs.writeFileSync(NEWS_JSON_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error("Error writing NEWS DATA JSON file:", error);
        return false;
    }
}


// =======================================================
//          UTILITY FUNCTIONS (USER DATA)
// =======================================================

/**
 * Membaca konten dari user_data.json
 * @returns {object} Object dengan username sebagai key
 */
function readUserData() {
    try {
        const data = fs.readFileSync(USER_JSON_FILE_PATH, 'utf8');
        if (!data.trim()) {
            return {};
        }
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log("user_data.json not found. Initializing file.");
            writeUserData({});
            return {};
        }
        console.error("Error reading USER DATA JSON file:", error);
        return {}; 
    }
}

/**
 * Menulis data user ke user_data.json
 * @param {object} data Object dengan username sebagai key
 * @returns {boolean} True if successful
 */
function writeUserData(data) {
    try {
        fs.writeFileSync(USER_JSON_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error("Error writing USER DATA JSON file:", error);
        return false;
    }
}

// =======================================================
//          UTILITY FUNCTIONS (LOG DATA)
// =======================================================

/**
 * Membaca konten dari logs_data.json
 * @returns {Array} Array of log objects
 */
function readLogs() {
    try {
        const data = fs.readFileSync(LOGS_JSON_FILE_PATH, 'utf8');
        if (!data.trim()) {
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log("logs_data.json not found. Initializing file.");
            writeLogs([]);
            return [];
        }
        console.error("Error reading LOGS JSON file:", error);
        return []; 
    }
}

/**
 * FUNGSI BARU: Menghapus log yang lebih lama dari 14 hari yang lalu.
 * Log yang disimpan adalah Hari Ini dan 14 hari sebelumnya.
 * @param {Array} logs - Array log saat ini.
 * @returns {Array} - Array log yang sudah dibersihkan.
 */
function pruneOldLogs(logs) {
    const today = new Date();
    // Atur tanggal 15 hari yang lalu (tepat tengah malam)
    // Log hari ke-15 dan seterusnya akan dihapus.
    const cutoffDate = new Date(today);
    cutoffDate.setDate(today.getDate() - 14);
    cutoffDate.setHours(0, 0, 0, 0); 

    const keptLogs = logs.filter(log => {
        // Kita berasumsi log.id adalah timestamp yang dibuat di POST /api/logs
        const logDate = new Date(log.id || log.timestamp); 
        return logDate >= cutoffDate;
    });
    
    // Konsol log untuk debugging/informasi
    console.log(`[LOG PRUNING] Total log sebelum prune: ${logs.length}`);
    console.log(`[LOG PRUNING] Log dipertahankan (Hari Ini + 14 hari): ${keptLogs.length}`);
    
    return keptLogs;
}


/**
 * Menulis array log ke logs_data.json
 * @param {Array} logs Array of log objects
 * @returns {boolean} True if successful
 */
function writeLogs(logs) {
    // REVISI: Bersihkan log sebelum menulis ke file
    const prunedLogs = pruneOldLogs(logs); 
    
    try {
        fs.writeFileSync(LOGS_JSON_FILE_PATH, JSON.stringify(prunedLogs, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error("Error writing LOGS JSON file:", error);
        return false;
    }
}


// =======================================================
//          UTILITY FUNCTIONS (WEB GIS DATA)
// =======================================================

/**
 * Membaca konten dari webgis_data.json
 * @returns {Array} Array of web GIS objects { name: string, url: string }
 */
function readWebGisData() {
    try {
        const data = fs.readFileSync(WEBGIS_JSON_FILE_PATH, 'utf8');
        if (!data.trim()) {
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log("webgis_data.json not found. Initializing file.");
            writeWebGisData([]);
            return [];
        }
        console.error("Error reading Web GIS JSON file:", error);
        return []; 
    }
}

/**
 * Menulis array data Web GIS ke webgis_data.json
 * @param {Array} data Array of web GIS objects
 * @returns {boolean} True if successful
 */
function writeWebGisData(data) {
    try {
        fs.writeFileSync(WEBGIS_JSON_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error("Error writing Web GIS JSON file:", error);
        return false;
    }
}


// =======================================================
//          UTILITY FUNCTIONS (TEAMS DATA)
// =======================================================

/**
 * Membaca konten dari teams_data.json
 * @returns {object} Objek data tim (yang kemungkinan berisi kartu dan konektor)
 */
function readTeams() {
    try {
        const data = fs.readFileSync(TEAMS_JSON_FILE_PATH, 'utf8');
        if (!data.trim()) {
            // Data tim default adalah objek kosong
            return {};
        }
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log("teams_data.json not found. Initializing file.");
            writeTeams({});
            return {};
        }
        console.error("Error reading TEAMS JSON file:", error);
        return {}; 
    }
}

/**
 * Menulis objek data tim ke teams_data.json
 * @param {object} data Objek data tim
 * @returns {boolean} True if successful
 */
function writeTeams(data) {
    try {
        fs.writeFileSync(TEAMS_JSON_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error("Error writing TEAMS JSON file:", error);
        return false;
    }
}


// =======================================================
//          ** BARU: UTILITY FUNCTIONS (COMPANY DATA) **
// =======================================================

/**
 * Membaca konten dari company_data.json (Data Slide Perusahaan)
 * @returns {Array} Array of slide objects [{ url: string, transitionIndex: number }, ...]
 */
function readCompanyData() {
    try {
        const data = fs.readFileSync(COMPANY_JSON_FILE_PATH, 'utf8');
        if (!data.trim()) {
            // Data slide default adalah array kosong
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log("company_data.json not found. Initializing file.");
            writeCompanyData([]);
            return [];
        }
        console.error("Error reading COMPANY JSON file:", error);
        return []; 
    }
}

/**
 * Menulis array data slide ke company_data.json
 * @param {Array} data Array of slide objects
 * @returns {boolean} True if successful
 */
function writeCompanyData(data) {
    try {
        fs.writeFileSync(COMPANY_JSON_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error("Error writing COMPANY JSON file:", error);
        return false;
    }
}


// =======================================================
//                    API ENDPOINTS (PROJECTS)
// =======================================================

/**
 * Endpoint 1: GET /api/projects
 * Mengambil semua data proyek
 */
app.get('/api/projects', (req, res) => {
    const projects = readProjects();
    res.status(200).json({ success: true, projects });
});

/**
 * Endpoint 2: GET /api/project/:no
 * Mengambil detail satu proyek
 */
app.get('/api/project/:no', (req, res) => {
    const projectNo = parseInt(req.params.no);
    const projects = readProjects();
    const project = projects.find(p => p.no === projectNo);

    if (project) {
        res.status(200).json({ success: true, project });
    } else {
        res.status(404).json({ success: false, error: "Proyek tidak ditemukan." });
    }
});


/**
 * Endpoint 3: POST /api/projects
 * Membuat proyek baru (CREATE)
 */
app.post('/api/projects', (req, res) => {
    const newData = req.body;
    let projects = readProjects();

    if (!newData || !newData.prospek) {
        return res.status(400).json({ success: false, error: "Data proyek tidak valid." });
    }

    const maxNo = projects.length > 0 ? Math.max(...projects.map(p => p.no || 0)) : 0;
    newData.no = maxNo + 1;
    
    // Pastikan properti penting terinisialisasi
    if (!newData.documentHistory) { 
        newData.documentHistory = []; 
    }
    if (!newData.contact) {
        newData.contact = { name: "", title: "", email: "", phone: "" };
    }
    
    projects.push(newData);

    if (writeProjects(projects)) {
        res.status(201).json({ success: true, message: "Proyek baru berhasil dibuat.", project: newData, no: newData.no });
    } else {
        res.status(500).json({ success: false, error: "Gagal menyimpan data ke file." });
    }
});


/**
 * Endpoint 4: PUT /api/project/:no
 * Memperbarui data proyek yang sudah ada (UPDATE)
 */
app.put('/api/project/:no', (req, res) => {
    const projectNo = parseInt(req.params.no);
    const updatedData = req.body;
    let projects = readProjects();
    
    const index = projects.findIndex(p => p.no === projectNo);

    if (index === -1) {
        return res.status(404).json({ success: false, error: "Proyek tidak ditemukan untuk diperbarui." });
    }

    // Gabungkan data lama dengan data baru, pastikan 'no' tidak berubah
    projects[index] = { ...projects[index], ...updatedData, no: projectNo }; 
    
    if (writeProjects(projects)) {
        res.status(200).json({ success: true, message: "Data proyek berhasil diperbarui.", no: projectNo, project: projects[index] });
    } else {
        res.status(500).json({ success: false, error: "Gagal menyimpan data ke file." });
    }
});


/**
 * Endpoint 5: DELETE /api/project/:no
 * Menghapus proyek berdasarkan 'no' (DELETE)
 */
app.delete('/api/project/:no', (req, res) => {
    const projectNo = parseInt(req.params.no);
    let projects = readProjects();
    const initialLength = projects.length;

    projects = projects.filter(p => p.no !== projectNo);

    if (projects.length < initialLength) {
        if (writeProjects(projects)) {
            res.status(200).json({ success: true, message: "Proyek berhasil dihapus." });
        } else {
            res.status(500).json({ success: false, error: "Gagal menghapus proyek dari file." });
        }
    } else {
        res.status(404).json({ success: false, error: "Proyek tidak ditemukan untuk dihapus." });
    }
});


/**
 * Endpoint 6: POST /api/sync-projects
 * Menerima seluruh array proyek untuk sinkronisasi (Import Data)
 */
app.post('/api/sync-projects', (req, res) => {
    const projects = req.body.projects; 

    if (!projects || !Array.isArray(projects)) {
        return res.status(400).json({ success: false, error: "Payload projects tidak valid atau bukan array." });
    }

    if (writeProjects(projects)) {
        res.status(200).json({ success: true, message: `${projects.length} proyek berhasil disinkronkan.` });
    } else {
        res.status(500).json({ success: false, error: "Gagal menyimpan data sinkronisasi ke file." });
    }
});


// =======================================================
//                 API ENDPOINTS (SECTOR DATA)
// =======================================================

/**
 * Endpoint 7: GET /api/sector-data
 * Mengambil semua data Sektor dan Komoditas Kustom (dari sector_data.json)
 */
app.get('/api/sector-data', (req, res) => {
    const data = readSectorData();
    res.status(200).json({ success: true, data });
});

/**
 * Endpoint 8: POST /api/sector-data
 * Menyimpan data Sektor dan Komoditas Kustom yang diperbarui.
 */
app.post('/api/sector-data', (req, res) => {
    const updatedData = req.body;
    
    // Validasi dasar
    if (!updatedData || !Array.isArray(updatedData.customSectors) || typeof updatedData.customCommodityMap !== 'object') {
        return res.status(400).json({ success: false, error: "Payload data sektor tidak valid." });
    }

    if (writeSectorData(updatedData)) {
        res.status(200).json({ success: true, message: "Data sektor berhasil diperbarui." });
    } else {
        res.status(500).json({ success: false, error: "Gagal menyimpan data sektor ke file." });
    }
});


// =======================================================
//                 API ENDPOINTS (NEWS LINKS/WEBSITE)
// =======================================================

/**
 * Endpoint 9: GET /api/news-links
 * Mengambil semua data URL Website per Sektor (dari news_data.json)
 */
app.get('/api/news-links', (req, res) => {
    const linksData = readNewsData();
    res.status(200).json({ success: true, newsLinks: linksData });
});

/**
 * Endpoint 10: POST /api/news-links
 * Menyimpan/Memperbarui seluruh objek URL Website per Sektor.
 * Payload harus berupa { [sectorName]: [url1, url2, ...], ... }
 */
app.post('/api/news-links', (req, res) => {
    const updatedLinks = req.body;
    
    // Validasi dasar
    if (!updatedLinks || typeof updatedLinks !== 'object' || Array.isArray(updatedLinks)) {
        return res.status(400).json({ success: false, error: "Payload data links berita tidak valid. Harus berupa objek." });
    }

    if (writeNewsData(updatedLinks)) {
        res.status(200).json({ success: true, message: "Data URL Website berita sektor berhasil diperbarui." });
    } else {
        res.status(500).json({ success: false, error: "Gagal menyimpan data URL Website berita sektor ke file." });
    }
});


// =======================================================
//          API ENDPOINTS (USER DATA)
// =======================================================

/**
 * Endpoint 11: GET /api/users
 * Mengambil semua data user (tanpa password untuk keamanan)
 */
app.get('/api/users', (req, res) => {
    const users = readUserData();
    // Hapus password dari response untuk keamanan
    const safeUsers = {};
    for (let username in users) {
        const { password, ...safeData } = users[username];
        safeUsers[username] = safeData;
    }
    res.status(200).json({ success: true, users: safeUsers });
});

/**
 * Endpoint 12: GET /api/user/:username
 * Mengambil data profil satu user (tanpa password)
 */
app.get('/api/user/:username', (req, res) => {
    const username = req.params.username;
    const users = readUserData();
    
    if (users[username]) {
        const { password, ...safeData } = users[username];
        res.status(200).json({ success: true, user: safeData });
    } else {
        res.status(404).json({ success: false, error: "User tidak ditemukan." });
    }
});

/**
 * Endpoint 13: POST /api/user/:username/profile
 * Menyimpan/Update profile info user (nama, jabatan, email, phone, photo)
 */
app.post('/api/user/:username/profile', (req, res) => {
    const username = req.params.username;
    const profileData = req.body;
    let users = readUserData();
    
    // Inisialisasi user jika belum ada
    if (!users[username]) {
        users[username] = {};
    }
    
    // Update profile data (jangan overwrite password)
    users[username] = {
        ...users[username],
        fullName: profileData.fullName,
        jobTitle: profileData.jobTitle,
        email: profileData.email,
        phone: profileData.phone,
        photo: profileData.photo
    };
    
    if (writeUserData(users)) {
        res.status(200).json({ success: true, message: "Profile user berhasil diperbarui." });
    } else {
        res.status(500).json({ success: false, error: "Gagal menyimpan profile user ke file." });
    }
});

/**
 * Endpoint 14: POST /api/user/:username/password
 * Update password user (untuk fitur change password di masa depan)
 */
app.post('/api/user/:username/password', (req, res) => {
    const username = req.params.username;
    const { oldPassword, newPassword } = req.body;
    let users = readUserData();
    
    if (!users[username]) {
        return res.status(404).json({ success: false, error: "User tidak ditemukan." });
    }
    
    // Verifikasi password lama (jika ada)
    if (users[username].password && users[username].password !== oldPassword) {
        return res.status(401).json({ success: false, error: "Password lama tidak sesuai." });
    }
    
    // Update password
    users[username].password = newPassword;
    
    if (writeUserData(users)) {
        res.status(200).json({ success: true, message: "Password berhasil diperbarui." });
    } else {
        res.status(500).json({ success: false, error: "Gagal menyimpan password ke file." });
    }
});

/**
 * Endpoint 15: POST /api/login
 * Validasi login user
 */
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = readUserData();
    
    // Cek apakah user ada dan password cocok
    if (users[username] && users[username].password === password) {
        const { password: pwd, ...safeData } = users[username];
        res.status(200).json({ 
            success: true, 
            message: "Login berhasil.",
            user: { username, ...safeData }
        });
    } else {
        res.status(401).json({ success: false, error: "Username atau password salah." });
    }
});

// =======================================================
//          API ENDPOINTS (LOGS DATA)
// =======================================================

/**
 * Endpoint 16: GET /api/logs
 * Mengambil semua data log aktivitas
 */
app.get('/api/logs', (req, res) => {
    // Log di-prune saat ditulis, jadi readLogs() mengembalikan log yang sudah bersih (atau yang tersimpan saat ini)
    const logs = readLogs(); 
    res.status(200).json({ success: true, logs });
});

/**
 * Endpoint 17: POST /api/logs
 * Menyimpan log aktivitas baru (Append)
 */
app.post('/api/logs', (req, res) => {
    const newLog = req.body;
    let logs = readLogs();
    
    if (!newLog || !newLog.activity) {
        return res.status(400).json({ success: false, error: "Data log tidak valid." });
    }
    
    // Tambahkan ID unik (timestamp) dan masukkan ke array
    newLog.id = Date.now();
    
    // Tambahkan timestamp eksplisit jika tidak ada (untuk fallback pruning)
    if (!newLog.timestamp) {
        newLog.timestamp = new Date().toISOString();
    }
    
    logs.push(newLog);

    // writeLogs akan otomatis membersihkan log yang lebih lama dari 14 hari sebelum menulis
    if (writeLogs(logs)) {
        res.status(201).json({ success: true, message: "Log berhasil disimpan dan data lama dibersihkan.", log: newLog });
    } else {
        res.status(500).json({ success: false, error: "Gagal menyimpan log ke file." });
    }
});

// =======================================================
//          API ENDPOINTS (WEB GIS DATA)
// =======================================================

/**
 * Endpoint 18: GET /api/webgis-data
 * Mengambil semua data Web GIS (dari webgis_data.json)
 */
app.get('/api/webgis-data', (req, res) => {
    const data = readWebGisData();
    res.status(200).json({ success: true, data });
});

/**
 * Endpoint 19: POST /api/webgis-data
 * Menyimpan seluruh array data Web GIS.
 * Payload harus berupa array: [{ name: "...", url: "..." }, ...]
 */
app.post('/api/webgis-data', (req, res) => {
    const updatedData = req.body;
    
    // Validasi dasar: harus berupa array
    if (!updatedData || !Array.isArray(updatedData)) {
        return res.status(400).json({ success: false, error: "Payload data Web GIS tidak valid. Harus berupa array." });
    }
    
    // Validasi isi array
    const isValid = updatedData.every(item => 
        item.name && typeof item.name === 'string' &&
        item.url && typeof item.url === 'string'
    );
    
    if (!isValid && updatedData.length > 0) {
        return res.status(400).json({ success: false, error: "Setiap item Web GIS harus memiliki 'name' dan 'url'." });
    }

    if (writeWebGisData(updatedData)) {
        res.status(200).json({ success: true, message: `${updatedData.length} data Web GIS berhasil disimpan.` });
    } else {
        res.status(500).json({ success: false, error: "Gagal menyimpan data Web GIS ke file." });
    }
});

// =======================================================
//          API ENDPOINTS (TEAMS DATA)
// =======================================================

/**
 * Endpoint 20: GET /api/teams-data
 * Mengambil seluruh objek data Tim (dari teams_data.json)
 */
app.get('/api/teams-data', (req, res) => {
    const data = readTeams();
    res.status(200).json({ success: true, data });
});

/**
 * Endpoint 21: POST /api/teams-data
 * Menyimpan seluruh objek data Tim (misalnya, kartu dan konektor) ke teams_data.json
 */
app.post('/api/teams-data', (req, res) => {
    const updatedData = req.body;
    
    // Validasi dasar: harus berupa objek (sesuai struktur org-chart)
    if (!updatedData || typeof updatedData !== 'object' || Array.isArray(updatedData)) {
        return res.status(400).json({ success: false, error: "Payload data Tim tidak valid. Harus berupa objek." });
    }

    if (writeTeams(updatedData)) {
        res.status(200).json({ success: true, message: "Data Tim (Org Chart) berhasil disimpan." });
    } else {
        res.status(500).json({ success: false, error: "Gagal menyimpan data Tim ke file." });
    }
});


// =======================================================
//          ** BARU: API ENDPOINTS (COMPANY DATA) **
// =======================================================

/**
 * Endpoint 22: GET /api/company-data
 * Mengambil seluruh array data Slide Perusahaan (dari company_data.json)
 */
app.get('/api/company-data', (req, res) => {
    const data = readCompanyData();
    res.status(200).json({ success: true, data });
});

/**
 * Endpoint 23: POST /api/company-data
 * Menyimpan seluruh array data Slide Perusahaan.
 * Payload harus berupa array: [{ url: "...", transitionIndex: number }, ...]
 */
app.post('/api/company-data', (req, res) => {
    const updatedData = req.body;
    
    // Validasi dasar: harus berupa array
    if (!updatedData || !Array.isArray(updatedData)) {
        return res.status(400).json({ success: false, error: "Payload data Company Slide tidak valid. Harus berupa array." });
    }
    
    // Validasi isi array
    const isValid = updatedData.every(item => 
        item.url && typeof item.url === 'string' &&
        item.transitionIndex !== undefined && typeof item.transitionIndex === 'number'
    );
    
    if (!isValid && updatedData.length > 0) {
        return res.status(400).json({ success: false, error: "Setiap item Company Slide harus memiliki 'url' (string) dan 'transitionIndex' (number)." });
    }

    if (writeCompanyData(updatedData)) {
        res.status(200).json({ success: true, message: `${updatedData.length} data Company Slide berhasil disimpan.` });
    } else {
        res.status(500).json({ success: false, error: "Gagal menyimpan data Company Slide ke file." });
    }
});


// --- Server Listener ---
app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Server Node.js berjalan di http://localhost:${PORT}`);
    console.log(`Data Proyek disimpan di: ${JSON_FILE_PATH}`);
    console.log(`Data Sektor disimpan di: ${SECTOR_JSON_FILE_PATH}`);
    console.log(`Data Berita disimpan di: ${NEWS_JSON_FILE_PATH}`); 
    console.log(`Data User disimpan di: ${USER_JSON_FILE_PATH}`); 
    console.log(`Data Log disimpan di: ${LOGS_JSON_FILE_PATH}`); 
    console.log(`Data Web GIS disimpan di: ${WEBGIS_JSON_FILE_PATH}`);
    console.log(`Data Teams disimpan di: ${TEAMS_JSON_FILE_PATH}`); 
    console.log(`Data Company disimpan di: ${COMPANY_JSON_FILE_PATH}`); // Ditambahkan
    console.log(`======================================================\n`);
});
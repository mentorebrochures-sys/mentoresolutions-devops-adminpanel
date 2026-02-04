/* ===============================   
    GLOBAL CONFIGURATION
================================ */
const BASE_URL = `https://mentoresolutions-devops-backend.vercel.app`;
const SUPABASE_PROJECT_ID = "jjxosflqkdccgtdyhguz"; 
const BUCKET_NAME = "certificates";
const STORAGE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${BUCKET_NAME}/`;

let editingRow = null;

/* ===============================
    1. LOGIN & SESSION MANAGEMENT
================================ */
function login() {
    const userEl = document.getElementById("loginUsername");
    const passEl = document.getElementById("loginPassword");
    const errorEl = document.getElementById("loginError");
    const loginScr = document.getElementById("loginScreen");
    const admPan = document.getElementById("adminPanel");

    if (!userEl || !passEl) return;

    const user = userEl.value.trim();
    const pass = passEl.value.trim();

    if (user === "admin123" && pass === "admin@123") {
        if (loginScr) loginScr.style.display = "none";
        if (admPan) admPan.style.display = "block";
        localStorage.setItem("isLoggedIn", "true");
        // लॉगिन झाल्यानंतर डेटा लोड करा
        initAllData();
    } else {
        if (errorEl) errorEl.innerText = "Invalid Username or Password";
    }
}

/* PAGE LOAD CHECK */
window.onload = () => {
    const loginScr = document.getElementById("loginScreen");
    const admPan = document.getElementById("adminPanel");
    
    if (localStorage.getItem("isLoggedIn") === "true") {
        if (loginScr) loginScr.style.display = "none";
        if (admPan) admPan.style.display = "block";
        initAllData();
    } else {
        if (loginScr) loginScr.style.display = "flex";
        if (admPan) admPan.style.display = "none";
    }

    // शेवटचा उघडलेला पॅनल रिस्टोअर करा
    const lastPanel = localStorage.getItem("activePanel") || "dashboard";
    showPanel(lastPanel, null);
};

function logout() {
    if (!confirm("Are you sure you want to logout?")) return;
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload(); // पेज रिफ्रेश करून लॉगिन स्क्रीनवर जा
}

/* ===============================
    2. NAVIGATION & SIDEBAR
================================ */
function showPanel(id, el) {
    localStorage.setItem("activePanel", id);
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("show"));
    const activePanel = document.getElementById(id);
    if (activePanel) activePanel.classList.add("show");
    
    document.querySelectorAll(".sidebar li").forEach(li => li.classList.remove("active"));
    if (el) el.classList.add("active");
    
    const sidebar = document.getElementById("sidebar");
    if (sidebar && window.innerWidth <= 768) sidebar.classList.remove("open");
}

function toggleSidebar() {
    const sb = document.getElementById("sidebar");
    if (sb) sb.classList.toggle("open");
}

/* ===============================
    3. CERTIFICATE SECTION
================================ */
const API_CERT = `${BASE_URL}/api/certificates`;
let editingCertId = null;

async function loadCertificates() {
    const table = document.getElementById("certificateTable");
    if (!table) return;
    try {
        const res = await fetch(API_CERT);
        const data = await res.json();
        table.innerHTML = "";
        data.forEach(cert => {
            const row = document.createElement("tr");
            let imageUrl = cert.image.startsWith('http') ? cert.image : `${STORAGE_URL}${cert.image}`;
            row.innerHTML = `
                <td style="padding: 15px; text-align: center; border-bottom: 1px solid #eee;">
                    <img src="${imageUrl}" onerror="this.src='https://via.placeholder.com/150?text=Error'" style="max-width:120px; border-radius:5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                </td>
                <td style="text-align:center; border-bottom: 1px solid #eee;">
                    <button onclick="editCert('${cert.id}')" style="background:#ffc107; padding:5px 10px; border:none; cursor:pointer; margin-right:5px; border-radius:4px;">Edit</button>
                    <button onclick="deleteCert('${cert.id}')" style="background:#dc3545; color:#fff; padding:5px 10px; border:none; cursor:pointer; border-radius:4px;">Delete</button>
                </td>`;
            table.appendChild(row);
        });
    } catch (err) { console.error("Cert Load Error:", err); }
}

async function saveCertificate() {
    const imageInput = document.getElementById("certImage");
    const addBtn = document.getElementById("addCertBtn");
    const file = imageInput.files[0];
    
    if (!editingCertId && !file) { alert("Please select an image file"); return; }
    
    const formData = new FormData();
    if (file) formData.append("image", file);
    
    addBtn.disabled = true;
    addBtn.innerText = "Processing...";

    const method = editingCertId ? "PUT" : "POST";
    const url = editingCertId ? `${API_CERT}/${editingCertId}` : API_CERT;
    
    try {
        const res = await fetch(url, { method, body: formData });
        if (res.ok) {
            editingCertId = null;
            imageInput.value = "";
            addBtn.innerText = "Save Certificate";
            loadCertificates();
        }
    } catch (err) { console.error("Cert Save Error:", err); }
    finally { addBtn.disabled = false; }
}

function editCert(id) {
    editingCertId = id;
    const addBtn = document.getElementById("addCertBtn");
    if(addBtn) addBtn.innerText = "Update Certificate";
    document.getElementById("certImage").focus();
}

async function deleteCert(id) {
    if (confirm("Delete this certificate?")) { 
        await fetch(`${API_CERT}/${id}`, { method: "DELETE" }); 
        loadCertificates(); 
    }
}

/* ===============================
    4. PLACEMENT SECTION
================================ */
const PLACE_API = `${BASE_URL}/api/placements`;
let editingPlaceId = null;

async function loadPlacements() {
    const container = document.getElementById("placementsContainer");
    if (!container) return;
    try {
        const res = await fetch(PLACE_API);
        const data = await res.json();
        container.innerHTML = "";
        data.forEach(p => {
            const card = document.createElement("div");
            card.className = "placement-card";
            card.innerHTML = `
                <div class="cell"><img src="${p.image}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;"></div>
                <div class="cell">${p.name}</div>
                <div class="cell">${p.company}</div>
                <div class="cell">
                    <button onclick="editPlace('${p.id}','${p.name}','${p.company}','${p.role}','${p.package}')" style="background:#ffc107; border:none; padding:4px 8px; cursor:pointer; border-radius:4px;">Edit</button>
                    <button onclick="deletePlace('${p.id}')" style="background:#dc3545; color:#fff; border:none; padding:4px 8px; cursor:pointer; border-radius:4px;">Delete</button>
                </div>`;
            container.appendChild(card);
        });
    } catch (err) { console.error("Placement Load Error:", err); }
}

function editPlace(id, name, comp, role, pack) {
    editingPlaceId = id;
    document.getElementById("studentName").value = name;
    document.getElementById("studentCompany").value = comp;
    document.getElementById("studentRole").value = role;
    document.getElementById("studentPackage").value = pack;
    document.getElementById("addBtn").innerText = "Update Placement";
}

async function savePlacement() {
    const addBtn = document.getElementById("addBtn");
    const formData = new FormData();
    formData.append("name", document.getElementById("studentName").value);
    formData.append("company", document.getElementById("studentCompany").value);
    formData.append("role", document.getElementById("studentRole").value);
    formData.append("package", document.getElementById("studentPackage").value);
    
    const file = document.getElementById("studentImage").files[0];
    if (file) formData.append("image", file);

    addBtn.disabled = true;
    const method = editingPlaceId ? "PUT" : "POST";
    const url = editingPlaceId ? `${PLACE_API}/${editingPlaceId}` : PLACE_API;
    
    try {
        await fetch(url, { method, body: formData });
        editingPlaceId = null;
        document.getElementById("studentName").value = "";
        document.getElementById("studentCompany").value = "";
        document.getElementById("studentRole").value = "";
        document.getElementById("studentPackage").value = "";
        document.getElementById("studentImage").value = "";
        addBtn.innerText = "Add Placement";
        loadPlacements();
    } catch (err) { console.error(err); }
    finally { addBtn.disabled = false; }
}

async function deletePlace(id) {
    if (confirm("Delete this placement record?")) { 
        await fetch(`${PLACE_API}/${id}`, { method: "DELETE" }); 
        loadPlacements(); 
    }
}

/* ===============================
    5. COURSES SECTION
================================ */
const COURSE_API = `${BASE_URL}/api/courses`;
let editingCourseId = null;

async function loadCourses() {
    const table = document.getElementById("coursesTable");
    if (!table) return;
    try {
        const res = await fetch(COURSE_API);
        const courses = await res.json();
        table.innerHTML = "";
        courses.forEach(c => {
            const row = document.createElement("tr");
            row.dataset.id = c.id;
            row.innerHTML = `<td>${c.duration}</td><td>${c.start_date}</td>
                <td><button onclick="editCourse('${c.id}','${c.duration}','${c.start_date}')" style="background:#ffc107; border:none; padding:4px 8px; cursor:pointer; border-radius:4px;">Edit</button>
                <button onclick="deleteCourse('${c.id}')" style="background:#dc3545; color:#fff; border:none; padding:4px 8px; cursor:pointer; border-radius:4px;">Delete</button></td>`;
            table.appendChild(row);
        });
    } catch (err) { console.error(err); }
}

async function saveCourse() {
    const duration = document.getElementById("courseDuration").value;
    const start_date = document.getElementById("courseStartDate").value;
    if(!duration || !start_date) { alert("Fill all fields"); return; }

    const payload = { duration, start_date };
    const method = editingCourseId ? "PUT" : "POST";
    const url = editingCourseId ? `${COURSE_API}/${editingCourseId}` : COURSE_API;
    
    await fetch(url, { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
    });
    
    editingCourseId = null;
    document.getElementById("courseDuration").value = "";
    document.getElementById("courseStartDate").value = "";
    loadCourses();
}

function editCourse(id, dur, date) {
    editingCourseId = id;
    document.getElementById("courseDuration").value = dur;
    document.getElementById("courseStartDate").value = date;
}

async function deleteCourse(id) {
    if (confirm("Delete this course?")) { 
        await fetch(`${COURSE_API}/${id}`, { method: "DELETE" }); 
        loadCourses(); 
    }
}

/* ===============================
    6. TRAINING SECTION
================================ */
const TRAINING_API = `${BASE_URL}/api/trainings`;
let editingTrainingId = null;

async function loadTrainings() {
    const container = document.getElementById("trainingTable");
    if (!container) return;
    try {
        const res = await fetch(TRAINING_API);
        const data = await res.json();
        container.innerHTML = "";
        data.forEach(t => {
            const div = document.createElement("div");
            div.className = "training-card";
            div.style = "display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #ddd;";
            div.innerHTML = `<div><i class="${t.icon}"></i> <strong>${t.name}</strong></div>
                <div>
                    <button onclick="editTraining('${t.id}','${t.icon}','${t.name}')" style="background:#ffc107; border:none; padding:4px 8px; cursor:pointer; border-radius:4px;">Edit</button>
                    <button onclick="deleteTraining('${t.id}')" style="background:#dc3545; color:#fff; border:none; padding:4px 8px; cursor:pointer; border-radius:4px;">Delete</button>
                </div>`;
            container.appendChild(div);
        });
    } catch (err) { console.error(err); }
}

async function saveTraining() {
    const icon = document.getElementById("t1").value;
    const name = document.getElementById("t2").value;
    if(!icon || !name) return;

    const method = editingTrainingId ? "PUT" : "POST";
    const url = editingTrainingId ? `${TRAINING_API}/${editingTrainingId}` : TRAINING_API;
    
    await fetch(url, { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ icon, name }) 
    });
    
    editingTrainingId = null;
    document.getElementById("t1").value = "";
    document.getElementById("t2").value = "";
    loadTrainings();
}

function editTraining(id, icon, name) {
    editingTrainingId = id;
    document.getElementById("t1").value = icon;
    document.getElementById("t2").value = name;
}

async function deleteTraining(id) {
    if (confirm("Delete this training record?")) { 
        await fetch(`${TRAINING_API}/${id}`, { method: "DELETE" }); 
        loadTrainings(); 
    }
}

/* ===============================
    7. CONTACT SECTION
================================ */
const CONTACT_API = `${BASE_URL}/api/contacts`;

async function loadContact() {
    try {
        const res = await fetch(CONTACT_API);
        const data = await res.json();
        if (data && data.length > 0) {
            const c = data[0];
            document.getElementById("m2").value = c.email || "";
            document.getElementById("m4").value = c.mobile || "";
            document.getElementById("m5").value = c.instagram || "";
            document.getElementById("m6").value = c.linkedin || "";
        }
    } catch (err) { console.error(err); }
}

async function saveContact() {
    const payload = {
        email: document.getElementById("m2").value,
        mobile: document.getElementById("m4").value,
        instagram: document.getElementById("m5").value,
        linkedin: document.getElementById("m6").value
    };
    try {
        await fetch(CONTACT_API, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(payload) 
        });
        alert("Contact Information Updated Successfully!");
    } catch (err) { alert("Error saving contact"); }
}

/* ===============================
    INITIALIZE ALL DATA
================================ */
function initAllData() {
    loadCertificates();
    loadPlacements();
    loadCourses();
    loadTrainings();
    loadContact();
}

// इव्हेंट लिसनर्स सेट करणे
document.addEventListener("DOMContentLoaded", () => {
    // लॉगिन बटण इव्हेंट
    const loginBtn = document.querySelector("#loginScreen button");
    if(loginBtn) loginBtn.onclick = login;

    // फॉर्म सबमिट बटणे बाइंड करणे
    const addCertBtn = document.getElementById("addCertBtn");
    if(addCertBtn) addCertBtn.onclick = saveCertificate;
    
    const addPlaceBtn = document.getElementById("addBtn");
    if(addPlaceBtn) addPlaceBtn.onclick = savePlacement;

    const addCourseBtn = document.querySelector("#courses .form button");
    if(addCourseBtn) addCourseBtn.onclick = saveCourse;

    const addTrainBtn = document.getElementById("addBtnTraining");
    if(addTrainBtn) addTrainBtn.onclick = saveTraining;

    const addContactBtn = document.getElementById("addBtnContact");
    if(addContactBtn) addContactBtn.onclick = saveContact;
});
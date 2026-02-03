/* ===============================   
   GLOBAL VARIABLES
================================ */
let editingRow = null;
const BASE_URL = "https://mentoresolutions-devops-backend.vercel.app"; // production backend
const IMGBB_API_KEY = "705d46e7428ea312b66b1bff8d2aeaf1"; // replace if needed

/* ===============================
   IMG UPLOAD → IMGBB
================================ */
async function uploadToImgBB(file) {
  if (!file) throw new Error("Select image");
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  if (!data.success) throw new Error("ImgBB upload failed");
  return data.data.url;
}

/* ===============================
   SIDEBAR TOGGLE
================================ */
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

/* ===============================
   PANEL SWITCHING
================================ */
function showPanel(id, el) {
  localStorage.setItem("activePanel", id);
  document.querySelectorAll(".panel").forEach(panel => panel.classList.remove("show"));
  const panel = document.getElementById(id);
  if (panel) panel.classList.add("show");
  document.querySelectorAll(".sidebar li").forEach(li => li.classList.remove("active"));
  if (el) el.classList.add("active");
  if (window.innerWidth <= 768) document.getElementById("sidebar").classList.remove("open");
}

/* ===============================
   CERTIFICATE SECTION
================================ */
(() => {
  const API_URL = `${BASE_URL}/api/certificates`;
  let editingCertId = null;
  document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("certificateTable");
    const imageInput = document.getElementById("certImage");
    const addBtn = document.getElementById("addCertBtn");
    if (!table || !imageInput || !addBtn) return;

    async function loadCertificates() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        table.innerHTML = "";
        if (!data.length) table.innerHTML = `<tr><td colspan="2">No certificates found</td></tr>`;
        data.forEach(cert => {
          const row = document.createElement("tr");
          row.dataset.id = cert.id;
          row.innerHTML = `
            <td><img src="${cert.image}" style="max-width:120px;border-radius:6px;"></td>
            <td>
              <button class="action-btn edit">Edit</button>
              <button class="action-btn delete">Delete</button>
            </td>
          `;
          row.querySelector(".edit").onclick = () => { editingCertId = cert.id; imageInput.click(); };
          row.querySelector(".delete").onclick = async () => {
            if (!confirm("Delete this certificate?")) return;
            await fetch(`${API_URL}/${cert.id}`, { method: "DELETE" });
            loadCertificates();
          };
          table.appendChild(row);
        });
      } catch (err) { console.error("Certificate load error:", err); }
    }

    addBtn.onclick = async (e) => {
      e.preventDefault();
      const file = imageInput.files[0];
      if (!file) return alert("Please select certificate image");
      try {
        const imageURL = await uploadToImgBB(file);
        const url = editingCertId ? `${API_URL}/${editingCertId}` : API_URL;
        const method = editingCertId ? "PUT" : "POST";
        await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageURL })
        });
        editingCertId = null;
        imageInput.value = "";
        loadCertificates();
      } catch (err) { alert(err.message); }
    };

    loadCertificates();
  });
})();

/* ===============================
   PLACEMENT SECTION
================================ */
(() => {
  const API_URL = `${BASE_URL}/api/placements`;
  let editingPlaceId = null;
  document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("placementsContainer");
    const addBtn = document.getElementById("addBtn");
    const nameInput = document.getElementById("studentName");
    const roleInput = document.getElementById("studentRole");
    const companyInput = document.getElementById("studentCompany");
    const packageInput = document.getElementById("studentPackage");
    const imageInput = document.getElementById("studentImage");
    if (!container || !addBtn) return;

    async function loadPlacements() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        container.innerHTML = "";
        data.forEach(p => {
          const card = document.createElement("div");
          card.className = "placement-card";
          card.dataset.id = p.id;
          card.innerHTML = `
            <img src="${p.image}" style="max-width:100px">
            <div class="placement-name">${p.name}</div>
            <div class="placement-role">${p.role}</div>
            <div class="placement-company">${p.company}</div>
            <div class="placement-package">${p.package}</div>
            <button class="edit">Edit</button>
            <button class="delete">Delete</button>
          `;
          card.querySelector(".edit").onclick = () => {
            editingPlaceId = p.id;
            nameInput.value = p.name;
            roleInput.value = p.role;
            companyInput.value = p.company;
            packageInput.value = p.package;
          };
          card.querySelector(".delete").onclick = async () => {
            if (!confirm("Delete this placement?")) return;
            await fetch(`${API_URL}/${p.id}`, { method: "DELETE" });
            loadPlacements();
          };
          container.appendChild(card);
        });
      } catch (err) { console.error("Placement load error:", err); }
    }

    addBtn.onclick = async (e) => {
      e.preventDefault();
      if (!nameInput.value || !roleInput.value || !companyInput.value || !packageInput.value)
        return alert("Fill all fields");
      try {
        const file = imageInput.files[0];
        let imageURL = "";
        if (file) imageURL = await uploadToImgBB(file);
        const payload = {
          name: nameInput.value,
          role: roleInput.value,
          company: companyInput.value,
          package: packageInput.value,
          image: imageURL
        };
        const url = editingPlaceId ? `${API_URL}/${editingPlaceId}` : API_URL;
        const method = editingPlaceId ? "PUT" : "POST";
        await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        editingPlaceId = null;
        nameInput.value = roleInput.value = companyInput.value = packageInput.value = "";
        imageInput.value = "";
        loadPlacements();
      } catch (err) { alert(err.message); }
    };

    loadPlacements();
  });
})();

/* ===============================
   COURSES SECTION
================================ */
const COURSE_API = `${BASE_URL}/api/courses`;
let editingCourseId = null;

async function loadCourses() {
  const res = await fetch(COURSE_API);
  const courses = await res.json();
  const table = document.getElementById("coursesTable");
  table.innerHTML = "";
  courses.forEach(course => {
    const row = document.createElement("tr");
    row.dataset.id = course.id;
    row.innerHTML = `
      <td class="course-duration">${course.duration}</td>
      <td class="course-startdate">${course.start_date}</td>
      <td>
        <button class="action-btn edit" onclick="editCourse(this)">Edit</button>
        <button class="action-btn delete" onclick="deleteCourse(this)">Delete</button>
      </td>
    `;
    table.appendChild(row);
  });
}

async function addCourse() {
  const duration = document.getElementById("courseDuration").value.trim();
  const startDate = document.getElementById("courseStartDate").value;
  if (!duration || !startDate) { alert("Please fill all fields"); return; }
  const payload = { duration, startDate };
  if (editingCourseId) {
    await fetch(`${COURSE_API}/${editingCourseId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    editingCourseId = null;
  } else {
    await fetch(COURSE_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  }
  document.getElementById("courseDuration").value = "";
  document.getElementById("courseStartDate").value = "";
  loadCourses();
}

function editCourse(btn) {
  const row = btn.closest("tr");
  editingCourseId = row.dataset.id;
  document.getElementById("courseDuration").value = row.querySelector(".course-duration").innerText;
  document.getElementById("courseStartDate").value = row.querySelector(".course-startdate").innerText;
}

async function deleteCourse(btn) {
  if (!confirm("Delete this course?")) return;
  const id = btn.closest("tr").dataset.id;
  await fetch(`${COURSE_API}/${id}`, { method: "DELETE" });
  loadCourses();
}

document.addEventListener("DOMContentLoaded", loadCourses);

/* ===============================
   TRAININGS SECTION
================================ */
let editingTrainingCard = null;
const TRAIN_API = `${BASE_URL}/api/trainings`;

window.addEventListener("DOMContentLoaded", loadTrainings);

function loadTrainings() {
  fetch(TRAIN_API)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("trainingTable");
      container.innerHTML = "";
      data.forEach(t => {
        const card = document.createElement("div");
        card.className = "training-card";
        card.dataset.id = t.id;
        card.innerHTML = `
          <div class="cell training-icon"><i class="${t.icon}"></i></div>
          <div class="cell training-title">${t.name}</div>
          <div class="cell actions">
            <button class="edit" onclick="editTraining(this)">Edit</button>
            <button class="delete" onclick="deleteTraining(this)">Delete</button>
          </div>
        `;
        container.appendChild(card);
      });
    });
}

document.getElementById("addBtnTraining").addEventListener("click", () => {
  const icon = document.getElementById("t1").value.trim();
  const title = document.getElementById("t2").value.trim();
  if (!icon || !title) { alert("Please fill all fields"); return; }
  const payload = { icon, name: title };
  if (editingTrainingCard) {
    const id = editingTrainingCard.dataset.id;
    fetch(`${TRAIN_API}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(loadTrainings);
    editingTrainingCard = null;
  } else {
    fetch(TRAIN_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(loadTrainings);
  }
  document.getElementById("t1").value = "";
  document.getElementById("t2").value = "";
});

function editTraining(btn) {
  editingTrainingCard = btn.closest(".training-card");
  document.getElementById("t1").value = editingTrainingCard.querySelector(".training-icon i").className;
  document.getElementById("t2").value = editingTrainingCard.querySelector(".training-title").innerText;
}

function deleteTraining(btn) {
  if (!confirm("Delete this record?")) return;
  const card = btn.closest(".training-card");
  const id = card.dataset.id;
  fetch(`${TRAIN_API}/${id}`, { method: "DELETE" }).then(() => card.remove());
}

/* ===============================
   CONTACT SECTION
================================ */
(() => {
  const CONTACT_API = `${BASE_URL}/api/contacts`;
  document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("addBtnContact");
    if (!saveBtn) return;
    async function loadContact() {
      try {
        const res = await fetch(CONTACT_API);
        const data = await res.json();
        if (!data || !data.length) return;
        const c = data[0];
        document.getElementById("m2").value = c.email || "";
        document.getElementById("m4").value = c.mobile || "";
        document.getElementById("m5").value = c.instagram || "";
        document.getElementById("m6").value = c.linkedin || "";
      } catch (err) { console.error("Error loading contact:", err); }
    }
    saveBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const payload = {
        email: document.getElementById("m2").value.trim(),
        mobile: document.getElementById("m4").value.trim(),
        instagram: document.getElementById("m5").value.trim(),
        linkedin: document.getElementById("m6").value.trim()
      };
      if (!payload.email) return alert("Email is required");
      try {
        await fetch(CONTACT_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        alert("Contact updated successfully ✅");
      } catch (err) { console.error("Error saving contact:", err); }
    });
    loadContact();
  });
})();

/* ===============================
   RESTORE LAST ACTIVE PANEL
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const lastPanel = localStorage.getItem("activePanel") || "dashboard";
  document.querySelectorAll(".panel").forEach(panel => panel.classList.remove("show"));
  const panel = document.getElementById(lastPanel);
  if (panel) panel.classList.add("show");
});

/* ===============================
   LOGOUT
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.querySelector(".logout");
  if (!logoutBtn) return;
  logoutBtn.addEventListener("click", () => {
    if (!confirm("Are you sure you want to logout?")) return;
    localStorage.clear();
    sessionStorage.clear();
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = () => window.history.go(1);
    window.location.replace("index.html");
  });
});

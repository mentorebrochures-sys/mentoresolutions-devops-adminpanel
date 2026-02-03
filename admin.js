function login() {
  const user = document.getElementById("loginUsername").value.trim();
  const pass = document.getElementById("loginPassword").value.trim();
  const error = document.getElementById("loginError");

  if (user === "admin123" && pass === "admin@123") {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
  } else {
    error.innerText = "Invalid Username or Password";
  }
}

/* PAGE LOAD → ALWAYS SHOW LOGIN */
window.onload = () => {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("adminPanel").style.display = "none";
};

/* ===============================   
   GLOBAL VARIABLES
================================ */
let editingRow = null;
const BASE_URL = "http://localhost:5000";
/* ===============================
   SIDEBAR TOGGLE (MOBILE)
================================ */
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}
/* ===============================
   PANEL SWITCHING
================================ */
/* ===============================
   PANEL SWITCHING (FIXED)
================================ */
function showPanel(id, el) {
  // 🔒 active section save (IMPORTANT)
  localStorage.setItem("activePanel", id);
  // hide all panels
  document.querySelectorAll(".panel").forEach(panel => {
    panel.classList.remove("show");
  });
  // show selected panel
  const activePanel = document.getElementById(id);
  if (activePanel) activePanel.classList.add("show");
  // sidebar active state
  document.querySelectorAll(".sidebar li").forEach(li =>
    li.classList.remove("active")
  );
  if (el) el.classList.add("active");
  // mobile sidebar close
  if (window.innerWidth <= 768) {
    document.getElementById("sidebar").classList.remove("open");
  }
}

/* ===============================
   ADD / UPDATE ROW
================================ */
function addRow(tableId, inputIds) {
  const values = inputIds.map(id => document.getElementById(id).value.trim());
  if (values.some(v => v === "")) {
    alert("Please fill all fields");
    return;
  }
  const table = document.getElementById(tableId);
  if (editingRow) {
    values.forEach((val, i) => editingRow.cells[i].innerText = val);
    editingRow = null;
  } else {
    const row = table.insertRow();
    row.innerHTML = `
      ${values.map(v => `<td>${v}</td>`).join("")}
      <td>
        <button class="action-btn edit" onclick="editRow(this)">Edit</button>
        <button class="action-btn delete" onclick="deleteRow(this)">Delete</button>
      </td>
    `;
  }
  inputIds.forEach(id => document.getElementById(id).value = "");
}
/* ===============================
   EDIT ROW
================================ */
function editRow(btn) {
  editingRow = btn.parentElement.parentElement;
  const inputs = document.querySelectorAll(".panel.show input");
  [...editingRow.cells]
    .slice(0, inputs.length)
    .forEach((cell, i) => inputs[i].value = cell.innerText);
}

// ------------------------------
// Certificate Section Admin JS
// ------------------------------
(() => {
  const BASE_URL = "https://mentoresolutions-devops-backend.vercel.app"; // Vercel backend
  const API_URL = `${BASE_URL}/api/certificates`; // certificate database
  const UPLOAD_URL = `${BASE_URL}/api/upload`;     // Supabase storage upload
  let editingCertId = null;

  document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("certificateTable");
    const imageInput = document.getElementById("certImage");
    const addBtn = document.getElementById("addCertBtn");
    if (!table || !imageInput || !addBtn) return;

    // ================= LOAD CERTIFICATES =================
    async function loadCertificates() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        table.innerHTML = "";

        if (!data.length) {
          table.innerHTML = `<tr><td colspan="2">No certificates found</td></tr>`;
          return;
        }

        data.forEach(cert => {
          const row = document.createElement("tr");
          row.dataset.id = cert.id;
          row.innerHTML = `
            <td>
              <img src="${cert.image}" style="max-width:120px;border-radius:6px;">
            </td>
            <td>
              <button class="action-btn edit">Edit</button>
              <button class="action-btn delete">Delete</button>
            </td>
          `;

          row.querySelector(".edit").onclick = () => {
            editingCertId = cert.id;
            imageInput.click();
          };

          row.querySelector(".delete").onclick = async () => {
            if (!confirm("Delete this certificate?")) return;
            try {
              await fetch(`${API_URL}/${cert.id}`, { method: "DELETE" });
              loadCertificates();
            } catch (err) {
              console.error("Delete failed:", err);
            }
          };

          table.appendChild(row);
        });
      } catch (err) {
        console.error("Certificate load error:", err);
      }
    }

    // ================= ADD / UPDATE CERTIFICATE =================
    addBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const file = imageInput.files[0];
      if (!file) return alert("Select certificate image");

      const formData = new FormData();
      formData.append("image", file);

      let uploadedUrl = "";
      try {
        const uploadRes = await fetch(UPLOAD_URL, { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        uploadedUrl = uploadData.url;
      } catch (err) {
        console.error("Upload failed:", err);
        return alert("Image upload failed");
      }

      try {
        if (editingCertId) {
          await fetch(`${API_URL}/${editingCertId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: uploadedUrl })
          });
          editingCertId = null;
        } else {
          await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: uploadedUrl })
          });
        }
        imageInput.value = "";
        loadCertificates();
      } catch (err) {
        console.error("Database save error:", err);
      }
    });

    loadCertificates();
  });
})();

// ------------------------------
// Placement Section Admin JS
// ------------------------------
// ===============================
// PLACEMENT SECTION ADMIN JS
// ===============================
(() => {
  const PLACE_API = "http://localhost:5000/api/placements";
  let editingPlaceId = null;
  document.addEventListener("DOMContentLoaded", () => {
    const placementsContainer = document.getElementById("placementsContainer");
    const addBtn = document.getElementById("addBtn");
    if (!placementsContainer || !addBtn) return; // 🔒 safety
    // ------------------------------
    // Load placements
    // ------------------------------
    async function loadPlacements() {
      try {
        const res = await fetch(PLACE_API);
        const data = await res.json();
        placementsContainer.innerHTML = "";
        if (!data || !data.length) return;
        data.forEach(p => createPlacementCard(p));
      } catch (err) {
        console.error("Error loading placements:", err);
      }
    }
    // ------------------------------
    // Create placement card
    // ------------------------------
    function createPlacementCard(p) {
      const card = document.createElement("div");
      card.className = "placement-card";
      card.dataset.id = p.id;
      const imgSrc = p.image.startsWith("/")
        ? `${BASE_URL}${p.image}`
        : `${BASE_URL}/uploads/placements/${p.image}`;
      card.innerHTML = `
        <div class="cell image">
          <img class="placement-img" src="${imgSrc}">
        </div>
        <div class="cell placement-name">${p.name}</div>
        <div class="cell placement-role">${p.role}</div>
        <div class="cell placement-company">${p.company}</div>
        <div class="cell placement-package">${p.package}</div>
        <div class="cell actions">
          <button type="button" class="edit">Edit</button>
          <button type="button" class="delete">Delete</button>
        </div>
      `;
      card.querySelector(".edit").onclick = () => editPlacement(card);
      card.querySelector(".delete").onclick = () => deletePlacement(card);
      placementsContainer.appendChild(card);
    }
    // ------------------------------
    // Add / Update placement
    // ------------------------------
    addBtn.addEventListener("click", async (e) => {
      e.preventDefault(); // 🔥 panel jump stop
      const name = document.getElementById("studentName").value.trim();
      const company = document.getElementById("studentCompany").value.trim();
      const role = document.getElementById("studentRole").value.trim();
      const pack = document.getElementById("studentPackage").value.trim();
      const imgInput = document.getElementById("studentImage");
      const file = imgInput.files[0];
      if (!name || !company || !role || !pack) {
        alert("Please fill all fields");
        return;
      }
      const formData = new FormData();
      formData.append("name", name);
      formData.append("company", company);
      formData.append("role", role);
      formData.append("package", pack);
      if (file) formData.append("image", file);
      try {
        if (editingPlaceId) {
          await fetch(`${PLACE_API}/${editingPlaceId}`, {
            method: "PUT",
            body: formData
          });
          editingPlaceId = null;
        } else {
          await fetch(PLACE_API, {
            method: "POST",
            body: formData
          });
        }
        loadPlacements();
        // clear form
        document.getElementById("studentName").value = "";
        document.getElementById("studentCompany").value = "";
        document.getElementById("studentRole").value = "";
        document.getElementById("studentPackage").value = "";
        imgInput.value = "";
      } catch (err) {
        console.error("Placement save error:", err);
      }
    });
    // ------------------------------
    // Edit placement
    // ------------------------------
    function editPlacement(card) {
      editingPlaceId = card.dataset.id;
      document.getElementById("studentName").value =
        card.querySelector(".placement-name").innerText;
      document.getElementById("studentCompany").value =
        card.querySelector(".placement-company").innerText;
      document.getElementById("studentRole").value =
        card.querySelector(".placement-role").innerText;
      document.getElementById("studentPackage").value =
        card.querySelector(".placement-package").innerText;
    }
    // ------------------------------
    // Delete placement
    // ------------------------------
    async function deletePlacement(card) {
      if (!confirm("Delete this placement?")) return;
      const id = card.dataset.id;
      await fetch(`${PLACE_API}/${id}`, { method: "DELETE" });
      loadPlacements();
    }
    // ------------------------------
    // INIT
    // ------------------------------
    loadPlacements();
  });
})();


//courses
const COURSE_API = "http://localhost:5000/api/courses";
let editingCourseId = null;
// ===============================
// LOAD COURSES (Admin Table)
// ===============================
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
// ===============================
// ADD / UPDATE COURSE
// ===============================
async function addCourse() {
  const duration = document.getElementById("courseDuration").value.trim();
  const startDate = document.getElementById("courseStartDate").value;
  if (!duration || !startDate) {
    alert("Please fill all fields");
    return;
  }
  const payload = { duration, startDate };
  if (editingCourseId) {
    await fetch(`${COURSE_API}/${editingCourseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    editingCourseId = null;
  } else {
    await fetch(COURSE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }
  document.getElementById("courseDuration").value = "";
  document.getElementById("courseStartDate").value = "";
  loadCourses();
}
// ===============================
// EDIT COURSE
// ===============================
function editCourse(btn) {
  const row = btn.closest("tr");
  editingCourseId = row.dataset.id;
  document.getElementById("courseDuration").value =
    row.querySelector(".course-duration").innerText;
  document.getElementById("courseStartDate").value =
    row.querySelector(".course-startdate").innerText;
}
// ===============================
// DELETE COURSE
// ===============================
async function deleteCourse(btn) {
  if (!confirm("Delete this course?")) return;
  const id = btn.closest("tr").dataset.id;
  await fetch(`${COURSE_API}/${id}`, { method: "DELETE" });
  loadCourses();
}

// init
document.addEventListener("DOMContentLoaded", loadCourses);

// ===============================
// TRAINING SECTION ADMIN JS
// ===============================
let editingTrainingCard = null;
const API_URL = "http://localhost:5000/api/trainings";

// ================= LOAD ON PAGE LOAD =================
window.addEventListener("DOMContentLoaded", loadTrainings);

function loadTrainings() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("trainingTable");
      container.innerHTML = "";

      data.forEach(t => {
        const card = document.createElement("div");
        card.className = "training-card";
        card.dataset.id = t.id; // backend id

        card.innerHTML = `
          <div class="cell training-icon">
            <i class="${t.icon}"></i>
          </div>
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

// ================= ADD / UPDATE TRAINING =================
document.getElementById("addBtnTraining").addEventListener("click", addTraining);

function addTraining() {
  const icon = document.getElementById("t1").value.trim();
  const title = document.getElementById("t2").value.trim();

  if (!icon || !title) {
    alert("Please fill all fields");
    return;
  }

  // ========== UPDATE ==========
  if (editingTrainingCard) {
    const id = editingTrainingCard.dataset.id;
    fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icon, name: title })
    }).then(() => loadTrainings());

    editingTrainingCard = null;
  } 
  // ========== ADD ==========
  else {
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icon, name: title })
    }).then(() => loadTrainings());
  }

  document.getElementById("t1").value = "";
  document.getElementById("t2").value = "";
}

// ================= EDIT =================
function editTraining(btn) {
  editingTrainingCard = btn.closest(".training-card");

  document.getElementById("t1").value =
    editingTrainingCard.querySelector(".training-icon i").className;
  document.getElementById("t2").value =
    editingTrainingCard.querySelector(".training-title").innerText;
}

// ================= DELETE =================
function deleteTraining(btn) {
  if (confirm("Are you sure you want to delete this record?")) {
    const card = btn.closest(".training-card");
    const id = card.dataset.id;

    fetch(`${API_URL}/${id}`, { method: "DELETE" })
      .then(() => card.remove());
  }
}


// ===============================
// SINGLE CONTACT ADMIN JS
// ===============================
(() => {
  const CONTACT_API = "http://localhost:5000/api/contacts";
  document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("addBtnContact");
    if (!saveBtn) return;
    // ------------------------------
    // LOAD SINGLE CONTACT
    // ------------------------------
    async function loadContact() {
      try {
        const res = await fetch(CONTACT_API);
        const data = await res.json();
        // backend returns array → first record use
        if (!data || !data.length) return;
        const c = data[0];
        document.getElementById("m2").value = c.email || "";
        document.getElementById("m4").value = c.mobile || "";
        document.getElementById("m5").value = c.instagram || "";
        document.getElementById("m6").value = c.linkedin || "";
      } catch (err) {
        console.error("Error loading contact:", err);
      }
    }
    // ------------------------------
    // SAVE / UPDATE CONTACT
    // ------------------------------
    saveBtn.addEventListener("click", async (e) => {
      e.preventDefault(); // 🔥 dashboard jump stop
      const email = document.getElementById("m2").value.trim();
      const mobile = document.getElementById("m4").value.trim();
      const instagram = document.getElementById("m5").value.trim();
      const linkedin = document.getElementById("m6").value.trim();
      if (!email) {
        alert("Email is required");
        return;
      }
      const payload = { email, mobile, instagram, linkedin };
      try {
        // backend logic: if record exists → update, else → insert
        await fetch(CONTACT_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        alert("Contact updated successfully ✅");
      } catch (err) {
        console.error("Error saving contact:", err);
      }
    });
    // ------------------------------
    // INIT
    // ------------------------------
    loadContact();
  });
})();

/* ===============================
   RESTORE LAST ACTIVE PANEL
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const lastPanel = localStorage.getItem("activePanel") || "dashboard";
  document.querySelectorAll(".panel").forEach(panel =>
    panel.classList.remove("show")
  );
  const panel = document.getElementById(lastPanel);
  if (panel) panel.classList.add("show");
});

// ===============================
// LOGOUT FUNCTION (FINAL)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.querySelector(".logout");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    if (!confirm("Are you sure you want to logout?")) return;

    // Clear all login/session data
    localStorage.clear();
    sessionStorage.clear();

    // Prevent back navigation
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };

    // Redirect out of admin panel
    window.location.replace("index.html"); // change if needed
  });
});


/* ===============================   
   LOGIN
================================ */
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

window.onload = () => {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("adminPanel").style.display = "none";
};

/* ===============================   
   GLOBAL VARIABLES
================================ */
let editingRow = null;
const BASE_URL = "https://mentoresolutions-devops-backend.vercel.app";

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
   ADD / EDIT / DELETE GENERIC ROW
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

function editRow(btn) {
  editingRow = btn.parentElement.parentElement;
  const inputs = document.querySelectorAll(".panel.show input");
  [...editingRow.cells].slice(0, inputs.length).forEach((cell, i) => inputs[i].value = cell.innerText);
}

/* ===============================   
   CERTIFICATE SECTION
================================ */
(() => {
  const API_URL = `${BASE_URL}/api/certificates`;
  let editingCertId = null;

  async function uploadToSupabase(file) {
    if (!file) throw new Error("Select an image");
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (!data.url) throw new Error("Image upload failed");
    return data.url; // Supabase public URL
  }

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
        if (!data.length) {
          table.innerHTML = `<tr><td colspan="2">No certificates found</td></tr>`;
          return;
        }
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
      } catch (err) { console.error(err); }
    }

    addBtn.onclick = async (e) => {
      e.preventDefault();
      const file = imageInput.files[0];
      if (!file) return alert("Select an image");

      try {
        const imageURL = await uploadToSupabase(file);
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
   OTHER SECTIONS (Placements / Courses / Trainings / Contacts)
   → Same logic, BASE_URL set to Vercel
   → Image upload for placements same as certificates
================================ */

/* For brevity, you just need to:
   1️⃣ Change BASE_URL to your Vercel backend.
   2️⃣ For any section needing image, use `uploadToSupabase(file)` like certificates.
   3️⃣ All fetch POST/PUT/DELETE requests stay same.
*/

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

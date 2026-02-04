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
const BASE_URL = `https://mentoresolutions-devops-backend.vercel.app`;

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

// ===============================
// certificate Section Admin JS
// ===============================

(() => {
  const API_URL = `${BASE_URL}/api/certificates`;

  // सुपबेस कॉन्फिगरेशन (तुमच्या लिंकनुसार अपडेटेड)
  const SUPABASE_PROJECT_ID = "jjxosflqkdccgtdyhguz"; 
  const BUCKET_NAME = "certificates";
  
  // ही तुमची फायनल स्टोरेज लिंक आहे
  const STORAGE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${BUCKET_NAME}/`;

  let editingCertId = null;

  document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("certificateTable");
    const imageInput = document.getElementById("certImage");
    const addBtn = document.getElementById("addCertBtn");

    if (!table || !imageInput || !addBtn) return;

    // --- सर्टिफिकेट लोड करण्याचे फंक्शन ---
    async function loadCertificates() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Backend not responding");
        
        const data = await res.json();
        table.innerHTML = "";

        if (!data || data.length === 0) {
          table.innerHTML = `<tr><td colspan="2" style="text-align:center; padding:10px;">No certificates found</td></tr>`;
          return;
        }

        data.forEach(cert => {
          const row = document.createElement("tr");
          row.dataset.id = cert.id;
          
          // इमेज पाथ तयार करण्याचे लॉजिक
          let imageUrl = cert.image;
          // जर डेटाबेसमध्ये फक्त नाव असेल (उदा. photo.jpg), तर त्याला STORAGE_URL जोडणे
          if (cert.image && !cert.image.startsWith('http')) {
            imageUrl = `${STORAGE_URL}${cert.image}`;
          }

          row.innerHTML = `
            <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: center;">
              <img src="${imageUrl}" 
                   onerror="this.src='https://via.placeholder.com/150?text=Image+Not+Found'"
                   style="max-width:150px; border-radius:8px; display:block; margin:auto; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border: 1px solid #ddd;">
            </td>
            <td style="text-align:center; vertical-align:middle; border-bottom: 1px solid #eee;">
              <button type="button" class="edit-btn" style="background:#ffc107; border:none; padding:8px 12px; cursor:pointer; border-radius:4px; margin-right:5px; font-weight:bold;">Edit</button>
              <button type="button" class="delete-btn" style="background:#dc3545; color:#fff; border:none; padding:8px 12px; cursor:pointer; border-radius:4px; font-weight:bold;">Delete</button>
            </td>
          `;

          // Edit बटन इव्हेंट
          row.querySelector(".edit-btn").onclick = () => {
            editingCertId = cert.id;
            addBtn.innerText = "Update Certificate";
            addBtn.style.background = "#28a745";
            imageInput.scrollIntoView({ behavior: 'smooth' });
          };

          // Delete बटन इव्हेंट
          row.querySelector(".delete-btn").onclick = async () => {
            if (!confirm("Delete this certificate?")) return;
            try {
              const delRes = await fetch(`${API_URL}/${cert.id}`, { method: "DELETE" });
              if (delRes.ok) loadCertificates();
              else alert("Delete failed!");
            } catch (err) {
              console.error("Delete error:", err);
            }
          };

          table.appendChild(row);
        });
      } catch (err) {
        console.error("Load error:", err);
        table.innerHTML = `<tr><td colspan="2" style="color:red; text-align:center; padding: 20px;">Server error.</td></tr>`;
      }
    }

    // --- नवीन सर्टिफिकेट सेव्ह किंवा अपडेट करण्याचे लॉजिक ---
    addBtn.addEventListener("click", async (e) => {
      e.preventDefault(); 
      const file = imageInput.files[0];
      
      if (!editingCertId && !file) {
        alert("Please select an image file first.");
        return;
      }

      const formData = new FormData();
      if (file) formData.append("image", file);

      try {
        addBtn.disabled = true;
        addBtn.innerText = editingCertId ? "Updating..." : "Uploading...";

        const method = editingCertId ? "PUT" : "POST";
        const url = editingCertId ? `${API_URL}/${editingCertId}` : API_URL;

        const response = await fetch(url, { method: method, body: formData });

        if (response.ok) {
          imageInput.value = ""; 
          editingCertId = null;
          addBtn.innerText = "Save Certificate";
          addBtn.style.background = ""; 
          loadCertificates();
        } else {
          const errData = await response.json();
          alert("Error: " + (errData.error || "Upload failed"));
        }
      } catch (err) {
        console.error("Save error:", err);
      } finally {
        addBtn.disabled = false;
        if (!editingCertId) addBtn.innerText = "Save Certificate";
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
  // खात्री करा की BASE_URL तुमच्या Vercel बॅकएंडची आहे
  const BASE_URL = "https://mentoresolutions-devops-backend.vercel.app";
  const PLACE_API = `${BASE_URL}/api/placements`;
  let editingPlaceId = null;

  document.addEventListener("DOMContentLoaded", () => {
    const placementsContainer = document.getElementById("placementsContainer");
    const addBtn = document.getElementById("addBtn");

    if (!placementsContainer || !addBtn) return;

    // ------------------------------
    // Load placements
    // ------------------------------
    async function loadPlacements() {
      try {
        const res = await fetch(PLACE_API);
        const data = await res.json();
        placementsContainer.innerHTML = "";

        if (!data || !data.length) {
          placementsContainer.innerHTML = "<p style='text-align:center; padding:20px;'>No placements found.</p>";
          return;
        }

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

      // Supabase कडून पूर्ण URL येते, त्यामुळे चेक करण्याची गरज नाही
      // तरीही सुरक्षेसाठी हा चेक ठेवला आहे
      const imgSrc = p.image.startsWith("http") 
        ? p.image 
        : `${BASE_URL}${p.image}`;

      card.innerHTML = `
        <div class="cell image">
          <img class="placement-img" src="${imgSrc}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;">
        </div>
        <div class="cell placement-name">${p.name}</div>
        <div class="cell placement-role">${p.role}</div>
        <div class="cell placement-company">${p.company}</div>
        <div class="cell placement-package">${p.package}</div>
        <div class="cell actions">
          <button type="button" class="edit" style="background:#ffc107; border-radius:4px; padding:4px 8px; cursor:pointer;">Edit</button>
          <button type="button" class="delete" style="background:#dc3545; color:#fff; border-radius:4px; padding:4px 8px; cursor:pointer;">Delete</button>
        </div>
      `;

      card.querySelector(".edit").onclick = () => editPlacement(card, p);
      card.querySelector(".delete").onclick = () => deletePlacement(card);
      placementsContainer.appendChild(card);
    }

    // ------------------------------
    // Add / Update placement
    // ------------------------------
    addBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      
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

      // जर नवीन एंट्री असेल तर इमेज अनिवार्य आहे
      if (!editingPlaceId && !file) {
        alert("Please select student image");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("company", company);
      formData.append("role", role);
      formData.append("package", pack);
      if (file) formData.append("image", file);

      try {
        addBtn.disabled = true;
        addBtn.innerText = "Processing...";

        let res;
        if (editingPlaceId) {
          res = await fetch(`${PLACE_API}/${editingPlaceId}`, {
            method: "PUT",
            body: formData
          });
          editingPlaceId = null;
          addBtn.innerText = "Add Placement";
        } else {
          res = await fetch(PLACE_API, {
            method: "POST",
            body: formData
          });
        }

        if (res.ok) {
          loadPlacements();
          // clear form
          document.getElementById("studentName").value = "";
          document.getElementById("studentCompany").value = "";
          document.getElementById("studentRole").value = "";
          document.getElementById("studentPackage").value = "";
          imgInput.value = "";
        } else {
          alert("Failed to save data");
        }
      } catch (err) {
        console.error("Placement save error:", err);
      } finally {
        addBtn.disabled = false;
        if (!editingPlaceId) addBtn.innerText = "Add Placement";
      }
    });

    // ------------------------------
    // Edit placement
    // ------------------------------
    function editPlacement(card, p) {
      editingPlaceId = p.id;
      document.getElementById("studentName").value = p.name;
      document.getElementById("studentCompany").value = p.company;
      document.getElementById("studentRole").value = p.role;
      document.getElementById("studentPackage").value = p.package;
      
      addBtn.innerText = "Update Placement";
      document.getElementById("studentName").focus();
    }

    // ------------------------------
    // Delete placement
    // ------------------------------
    async function deletePlacement(card) {
      if (!confirm("Delete this placement?")) return;
      const id = card.dataset.id;
      try {
        const res = await fetch(`${PLACE_API}/${id}`, { method: "DELETE" });
        if (res.ok) loadPlacements();
      } catch (err) {
        console.error("Delete error:", err);
      }
    }

    loadPlacements();
  });
})();


// 1. खात्री करा की BASE_URL वरती एकदाच डिफाइन केली आहे
const COURSE_API = `${BASE_URL}/api/courses`;
let editingCourseId = null;

// ===============================
// LOAD COURSES (Admin Table)
// ===============================
async function loadCourses() {
  try {
    const res = await fetch(COURSE_API);
    const courses = await res.json();
    const table = document.getElementById("coursesTable");
    
    if (!table) return;
    table.innerHTML = "";

    if (!courses || courses.length === 0) {
      table.innerHTML = `<tr><td colspan="3" style="text-align:center;">No courses found</td></tr>`;
      return;
    }

    courses.forEach(course => {
      const row = document.createElement("tr");
      row.dataset.id = course.id;
      row.innerHTML = `
        <td class="course-duration">${course.duration}</td>
        <td class="course-startdate">${course.start_date}</td>
        <td>
          <button class="action-btn edit" onclick="editCourse(this)" style="background:#ffc107; border:none; padding:5px 10px; cursor:pointer; border-radius:4px; margin-right:5px;">Edit</button>
          <button class="action-btn delete" onclick="deleteCourse(this)" style="background:#dc3545; color:#fff; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">Delete</button>
        </td>
      `;
      table.appendChild(row);
    });
  } catch (err) {
    console.error("Course load error:", err);
  }
}

// ===============================
// ADD / UPDATE COURSE
// ===============================
async function addCourse() {
  const durationInput = document.getElementById("courseDuration");
  const startDateInput = document.getElementById("courseStartDate");
  const addBtn = document.querySelector("#courses .form button");

  const duration = durationInput.value.trim();
  const start_date = startDateInput.value; // बॅकएंडला 'start_date' नाव हवे आहे

  if (!duration || !start_date) {
    alert("Please fill all fields");
    return;
  }

  // बॅकएंडच्या स्कीम्यानुसार पेलोड (Payload)
  const payload = { 
    duration: duration, 
    start_date: start_date 
  };

  try {
    addBtn.disabled = true;
    addBtn.innerText = "Saving...";

    let response;
    if (editingCourseId) {
      // UPDATE (PUT)
      response = await fetch(`${COURSE_API}/${editingCourseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      editingCourseId = null;
    } else {
      // ADD (POST)
      response = await fetch(COURSE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    if (response.ok) {
      durationInput.value = "";
      startDateInput.value = "";
      addBtn.innerText = "Add Course";
      loadCourses();
    } else {
      const errData = await response.json();
      alert("Error: " + (errData.error || "Failed to save course"));
    }
  } catch (err) {
    console.error("Save error:", err);
    alert("Check if backend is online!");
  } finally {
    addBtn.disabled = false;
  }
}

// ===============================
// EDIT COURSE (Fill form)
// ===============================
function editCourse(btn) {
  const row = btn.closest("tr");
  editingCourseId = row.dataset.id;
  
  document.getElementById("courseDuration").value = row.querySelector(".course-duration").innerText;
  document.getElementById("courseStartDate").value = row.querySelector(".course-startdate").innerText;
  
  const addBtn = document.querySelector("#courses .form button");
  addBtn.innerText = "Update Course";
  document.getElementById("courseDuration").focus();
}

// ===============================
// DELETE COURSE
// ===============================
async function deleteCourse(btn) {
  if (!confirm("Delete this course?")) return;
  
  const id = btn.closest("tr").dataset.id;
  try {
    const res = await fetch(`${COURSE_API}/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadCourses();
    } else {
      alert("Delete failed");
    }
  } catch (err) {
    console.error("Delete error:", err);
  }
}

// Initial Load
document.addEventListener("DOMContentLoaded", loadCourses);

// ===============================
// TRAINING SECTION ADMIN JS
// ===============================
const training_URL = `${BASE_URL}/api/trainings`;
let editingTrainingId = null; // Card ऐवजी थेट ID स्टोअर करणे सोपे पडते

// ================= LOAD ON PAGE LOAD =================
document.addEventListener("DOMContentLoaded", loadTrainings);

async function loadTrainings() {
  try {
    const res = await fetch(training_URL);
    const data = await res.json();
    const container = document.getElementById("trainingTable");
    
    if (!container) return;
    container.innerHTML = "";

    if (!data || data.length === 0) {
      container.innerHTML = "<p style='text-align:center; width:100%; padding:20px;'>No trainings found.</p>";
      return;
    }

    data.forEach(t => {
      const card = document.createElement("div");
      card.className = "training-card";
      card.dataset.id = t.id;

      card.innerHTML = `
        <div class="cell training-icon" style="font-size: 24px; color: #007bff; text-align: center;">
          <i class="${t.icon}"></i>
        </div>
        <div class="cell training-title" style="font-weight: bold;">${t.name}</div>
        <div class="cell actions">
          <button class="edit" onclick="editTraining(this)" style="background:#ffc107; border:none; padding:5px 10px; cursor:pointer; border-radius:4px; margin-right:5px;">Edit</button>
          <button class="delete" onclick="deleteTraining(this)" style="background:#dc3545; color:#fff; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">Delete</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading trainings:", err);
  }
}

// ================= ADD / UPDATE TRAINING =================
document.getElementById("addBtnTraining").addEventListener("click", async (e) => {
  e.preventDefault();
  
  const iconInput = document.getElementById("t1");
  const titleInput = document.getElementById("t2");
  const addBtn = document.getElementById("addBtnTraining");

  const icon = iconInput.value.trim();
  const name = titleInput.value.trim();

  if (!icon || !name) {
    alert("Please fill all fields (Icon class and Training Name)");
    return;
  }

  const payload = { icon, name };

  try {
    addBtn.disabled = true;
    addBtn.innerText = "Saving...";

    let response;
    if (editingTrainingId) {
      // UPDATE
      response = await fetch(`${training_URL}/${editingTrainingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      editingTrainingId = null;
    } else {
      // ADD
      response = await fetch(training_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    if (response.ok) {
      iconInput.value = "";
      titleInput.value = "";
      addBtn.innerText = "Add";
      loadTrainings();
    } else {
      alert("Failed to save training.");
    }
  } catch (err) {
    console.error("Training save error:", err);
    alert("Server error!");
  } finally {
    addBtn.disabled = false;
    if (!editingTrainingId) addBtn.innerText = "Add";
  }
});

// ================= EDIT =================
// Note: 'btn' pass केला जातोय, त्यावरून आपण डेटा काढतो
function editTraining(btn) {
  const card = btn.closest(".training-card");
  editingTrainingId = card.dataset.id;

  document.getElementById("t1").value = card.querySelector(".training-icon i").className;
  document.getElementById("t2").value = card.querySelector(".training-title").innerText;
  
  const addBtn = document.getElementById("addBtnTraining");
  addBtn.innerText = "Update";
  document.getElementById("t1").focus();
}

// ================= DELETE =================
async function deleteTraining(btn) {
  if (!confirm("Are you sure you want to delete this record?")) return;

  const card = btn.closest(".training-card");
  const id = card.dataset.id;

  try {
    const res = await fetch(`${training_URL}/${id}`, { method: "DELETE" });
    if (res.ok) {
      card.remove();
      // जर लिस्ट पूर्ण रिकामी झाली तर रिफ्रेश करा
      const container = document.getElementById("trainingTable");
      if (container.children.length === 0) loadTrainings();
    }
  } catch (err) {
    console.error("Delete error:", err);
  }
}

// ===============================
// SINGLE CONTACT ADMIN JS
// ===============================
// ===============================
// SINGLE CONTACT ADMIN JS
// ===============================
(() => {
  const CONTACT_API = `${BASE_URL}/api/contacts`;

  document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("addBtnContact");
    if (!saveBtn) return;

    // ------------------------------
    // 1. LOAD SINGLE CONTACT
    // ------------------------------
    async function loadContact() {
      try {
        const res = await fetch(CONTACT_API);
        const data = await res.json();

        // बॅकएंड ॲरे (Array) देतो, आपण पहिला रेकॉर्ड (Index 0) वापरू
        if (data && data.length > 0) {
          const c = data[0];
          document.getElementById("m2").value = c.email || "";
          document.getElementById("m4").value = c.mobile || "";
          document.getElementById("m5").value = c.instagram || "";
          document.getElementById("m6").value = c.linkedin || "";
          
          // जर डेटा असेल तर बटनचा टेक्स्ट बदलूया
          saveBtn.innerText = "Update Contact";
        }
      } catch (err) {
        console.error("Error loading contact:", err);
      }
    }

    // ------------------------------
    // 2. SAVE / UPDATE CONTACT
    // ------------------------------
    saveBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const email = document.getElementById("m2").value.trim();
      const mobile = document.getElementById("m4").value.trim();
      const instagram = document.getElementById("m5").value.trim();
      const linkedin = document.getElementById("m6").value.trim();

      if (!email || !mobile) {
        alert("Email and Mobile are required!");
        return;
      }

      const payload = { email, mobile, instagram, linkedin };

      try {
        saveBtn.disabled = true;
        saveBtn.innerText = "Saving...";

        // बॅकएंडमध्ये POST मेथड 'Upsert' (Update or Insert) करते
        const res = await fetch(CONTACT_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          alert("Contact information updated successfully ✅");
          loadContact(); // डेटा पुन्हा रिफ्रेश करा
        } else {
          const errData = await res.json();
          alert("Error: " + (errData.error || "Failed to save"));
        }
      } catch (err) {
        console.error("Error saving contact:", err);
        alert("Server is not responding.");
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = "Update Contact";
      }
    });

    // INIT
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


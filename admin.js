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
    // BASE_URL define kela asava (e.g., const BASE_URL = "http://localhost:5000")
    const API_URL = `${BASE_URL}/api/certificates`;

    document.addEventListener("DOMContentLoaded", () => {
        const addBtn = document.getElementById("addCertBtn");
        const imageInput = document.getElementById("certImage");
        const certificateTable = document.getElementById("certificateTable");

        if (!addBtn) return;

        // --- 1. DISPLAY LOGIC ---
        async function loadCertificates() {
            try {
                const res = await fetch(API_URL);
                const data = await res.json();

                if (!Array.isArray(data)) return;

                certificateTable.innerHTML = ""; 

                data.forEach(cert => {
                    const row = document.createElement("tr");
                    
                    // HTML structure madhe badal na karta fakt data insert karne
                    row.innerHTML = `
                        <td>
                            <img src="${cert.image}" alt="Certificate" style="width: 100px; height: auto; border-radius: 4px;">
                        </td>
                        <td>
                            <button type="button" onclick="deleteCert(${cert.id})">Delete</button>
                        </td>
                    `;
                    certificateTable.appendChild(row);
                });
            } catch (err) {
                console.error("Data load karnyaat adthala:", err);
            }
        }

        // --- 2. DELETE LOGIC ---
        // Global function banavli aahe jya mule HTML madhun 'onclick' kaam karel
        window.deleteCert = async (id) => {
            if (!confirm("Khatri aahe? Certificate kaamche nighun jail!")) return;

            try {
                const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
                if (res.ok) {
                    loadCertificates(); 
                } else {
                    const errorData = await res.json();
                    alert("Delete karta aale nahi: " + errorData.error);
                }
            } catch (err) {
                console.error("Delete error:", err);
                alert("Server error mule delete jhale nahi.");
            }
        };

        // --- 3. CREATE LOGIC ---
        addBtn.onclick = async (e) => {
            e.preventDefault();
            const file = imageInput.files[0];

            if (!file) {
                alert("Krupaya ek image select kara!");
                return;
            }

            const formData = new FormData();
            formData.append("image", file); 

            try {
                addBtn.disabled = true;
                addBtn.innerText = "Saving...";

                const response = await fetch(API_URL, {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Certificate successfully save jhale!");
                    imageInput.value = ""; 
                    loadCertificates(); 
                } else {
                    alert("Error: " + (result.error || "Upload fail jhale"));
                }
            } catch (err) {
                console.error("Fetch error:", err);
                alert("Backend connect hot nahiye!");
            } finally {
                addBtn.disabled = false;
                addBtn.innerText = "Save Certificate";
            }
        };

        loadCertificates();
    });
})();


// ------------------------------
// Placement Section Admin JS
// ------------------------------

const API_URL = "http://localhost:5000/api/placements"; 

document.addEventListener("DOMContentLoaded", () => {
    fetchPlacements();

    const addBtn = document.getElementById("addBtn");
    addBtn.addEventListener("click", addPlacement);
});

// 1. डेटाबेस मधून सर्व Placements आणून दाखवणे
async function fetchPlacements() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        const container = document.getElementById("placementsContainer");
        container.innerHTML = ""; // जुना डेटा क्लिअर करा

        data.forEach(item => {
            // तुझ्या "placements-headings" च्या स्ट्रक्चरनुसार कार्ड तयार करणे
            const card = document.createElement("div");
            card.className = "placement-card-row"; // हे तुझ्या CSS नुसार बदलू शकतोस
            
            card.innerHTML = `
                <span class="cell"><img src="${item.image}" alt="student" style="width:50px; height:50px; object-fit:cover; border-radius:4px;"></span>
                <span class="cell">${item.name}</span>
                <span class="cell">${item.role}</span>
                <span class="cell">${item.company}</span>
                <span class="cell">${item.pkg}</span>
                <span class="cell">
                    <button onclick="deletePlacement('${item.id}')" class="delete-btn" style="background:#ff4d4d; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">Delete</button>
                </span>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching placements:", error);
    }
}

// 2. नवीन Placement ॲड करणे
async function addPlacement() {
    const name = document.getElementById("studentName").value;
    const company = document.getElementById("studentCompany").value;
    const role = document.getElementById("studentRole").value;
    const pkg = document.getElementById("studentPackage").value;
    const imageInput = document.getElementById("studentImage");
    const imageFile = imageInput.files[0];

    // व्हॅलिडेशन
    if (!name || !company || !role || !pkg || !imageFile) {
        alert("कृपया सर्व रकाने भरा!");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("company", company);
    formData.append("role", role);
    formData.append("pkg", pkg);
    formData.append("image", imageFile);

    try {
        const addBtn = document.getElementById("addBtn");
        addBtn.innerText = "Adding...";
        addBtn.disabled = true;

        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            alert("Placement यशस्वीरित्या सेव्ह झाली!");
            // फॉर्म रिसेट करा
            document.getElementById("studentName").value = "";
            document.getElementById("studentCompany").value = "";
            document.getElementById("studentRole").value = "";
            document.getElementById("studentPackage").value = "";
            imageInput.value = "";
            
            fetchPlacements(); // लिस्ट अपडेट करा
        } else {
            alert("काहीतरी चूक झाली!");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        const addBtn = document.getElementById("addBtn");
        addBtn.innerText = "Add Placement";
        addBtn.disabled = false;
    }
}

// 3. डिलीट फंक्शन
async function deletePlacement(id) {
    if (!confirm("तुम्हाला खात्री आहे की हे रेकॉर्ड डिलीट करायचे आहे?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            fetchPlacements();
        }
    } catch (error) {
        console.error("Delete error:", error);
    }
}

// ============================
// COURSE JS (Vercel Ready)
// ============================

const COURSE_API = `${BASE_URL}/api/courses`;
let editingCourseId = null;

// ===============================
// 1. DATA LOAD KARNE
// ===============================
async function loadCourses() {
    try {
        const res = await fetch(COURSE_API);
        const courses = await res.json();
        const table = document.getElementById("coursesTable");
        
        if (!table) return;
        table.innerHTML = "";

        if (!courses || courses.length === 0 || courses.error) {
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
                    <button class="action-btn edit" onclick="editCourse(this)" style="background:#ffc107; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">Edit</button>
                    <button class="action-btn delete" onclick="deleteCourse('${course.id}')" style="background:#dc3545; color:#fff; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">Delete</button>
                </td>
            `;
            table.appendChild(row);
        });
    } catch (err) {
        console.error("Course load error:", err);
    }
}

// ===============================
// 2. DATA ADD KIWA UPDATE KARNE
// ===============================
async function addCourse() {
    const durationInput = document.getElementById("courseDuration");
    const startDateInput = document.getElementById("courseStartDate");
    
    // HTML class badalnyachi garaj nahi, querySelector vaprun button sho dhuya
    const submitBtn = document.querySelector("#courses .form button");

    const duration = durationInput.value.trim();
    const start_date = startDateInput.value;

    if (!duration || !start_date) {
        alert("Krupaya sarva mahiti bhara!");
        return;
    }

    const payload = { duration, start_date };

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Saving...";
        }

        let response;
        if (editingCourseId) {
            // UPDATE
            response = await fetch(`${COURSE_API}/${editingCourseId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } else {
            // ADD NEW
            response = await fetch(COURSE_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }

        if (response.ok) {
            alert(editingCourseId ? "Course Updated!" : "Course Added to Supabase!");
            
            // Reset Form
            durationInput.value = "";
            startDateInput.value = "";
            editingCourseId = null;
            if (submitBtn) submitBtn.innerText = "Add Course";
            
            loadCourses(); 
        } else {
            const errorMsg = await response.json();
            alert("Error: " + (errorMsg.error || "Failed to save"));
        }
    } catch (err) {
        console.error("Save error:", err);
        alert("Server connection failed!");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

// ===============================
// 3. EDIT SATHI FORM BHARNE
// ===============================
function editCourse(btn) {
    const row = btn.closest("tr");
    editingCourseId = row.dataset.id;
    
    document.getElementById("courseDuration").value = row.querySelector(".course-duration").innerText;
    document.getElementById("courseStartDate").value = row.querySelector(".course-startdate").innerText;
    
    const submitBtn = document.querySelector("#courses .form button");
    if (submitBtn) submitBtn.innerText = "Update Course";
}

// ===============================
// 4. DATA DELETE KARNE
// ===============================
async function deleteCourse(id) {
    if (!confirm("Haa course delete karaycha ka?")) return;
    
    try {
        const res = await fetch(`${COURSE_API}/${id}`, { method: "DELETE" });
        if (res.ok) {
            loadCourses();
        } else {
            alert("Delete failed.");
        }
    } catch (err) {
        console.error("Delete error:", err);
    }
}

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
}const TRAINING_API = `${BASE_URL}/api/trainings`;

// 1. DATA LOAD KARNE
async function loadTrainings() {
    try {
        const res = await fetch(TRAINING_API);
        const data = await res.json();
        const container = document.getElementById("trainingTable");
        
        if (!container) return;
        container.innerHTML = "";

        if (!data || data.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding: 20px;">No trainings found.</p>`;
            return;
        }

        data.forEach(t => {
            const card = document.createElement("div");
            card.className = "training-card"; // Tumcha CSS class
            card.style = "display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #eee;";
            
            card.innerHTML = `
                <div style="flex: 1;"><i class="${t.icon}" style="font-size: 20px;"></i></div>
                <div style="flex: 2;">${t.name}</div>
                <div style="flex: 1;">
                    <button onclick="deleteTraining('${t.id}')" style="background:#dc3545; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">Delete</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error("Load error:", err);
    }
}

// 2. DATA ADD KARNE
async function addTraining() {
    const iconInput = document.getElementById("t1");
    const nameInput = document.getElementById("t2");
    const submitBtn = document.getElementById("addBtnTraining");

    const payload = {
        icon: iconInput.value.trim(),
        name: nameInput.value.trim()
    };

    if (!payload.icon || !payload.name) {
        alert("Krupaya Icon class ani Name dohi bhara!");
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.innerText = "Saving...";

        const res = await fetch(TRAINING_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            iconInput.value = "";
            nameInput.value = "";
            loadTrainings(); // Refresh list
        } else {
            alert("Database madhe save karta ale nahi.");
        }
    } catch (err) {
        console.error("Add error:", err);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Add";
    }
}

// 3. DELETE KARNE
async function deleteTraining(id) {
    if (!confirm("Hee training delete karaychi ka?")) return;
    try {
        const res = await fetch(`${TRAINING_API}/${id}`, { method: "DELETE" });
        if (res.ok) loadTrainings();
    } catch (err) {
        console.error("Delete error:", err);
    }
}

// INIT
document.addEventListener("DOMContentLoaded", loadTrainings);

// ===============================
// SINGLE CONTACT ADMIN JS
// ===============================
// ===============================
// SINGLE CONTACT ADMIN JS
// ===============================
(() => {
  // BASE_URL chi khaatri kara (Local sathi http://localhost:5000)
  const CONTACT_API = `${BASE_URL}/api/contacts`;
  let currentContactId = null; // Update sathi ID lagel

  document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("addBtnContact");
    if (!saveBtn) return;

    // ------------------------------
    // 1. LOAD & DISPLAY CONTACTS
    // ------------------------------
    async function loadContact() {
      try {
        const res = await fetch(CONTACT_API);
        const data = await res.json();
        const container = document.getElementById("contactTable");

        if (!container) return;
        container.innerHTML = ""; // Container clear kara

        if (data && data.length > 0) {
          // Apan pahila record inputs madhe bharu (Editing sathi)
          const c = data[0];
          currentContactId = c.id; 
          
          document.getElementById("m2").value = c.email || "";
          document.getElementById("m4").value = c.mobile || "";
          document.getElementById("m5").value = c.instagram || "";
          document.getElementById("m6").value = c.linkedin || "";
          
          saveBtn.innerText = "Update Contact";

          // Card Swarupat Frontend la dakhavne
          data.forEach(item => {
              const card = document.createElement("div");
              card.className = "contact-card-item"; // Tumcha CSS class
              card.style = "border: 1px solid #ccc; padding: 10px; margin: 10px 0; border-radius: 8px; background: #f9f9f9;";
              card.innerHTML = `
                <p><strong>Email:</strong> ${item.email}</p>
                <p><strong>Mobile:</strong> ${item.mobile}</p>
                <p><strong>Insta:</strong> ${item.instagram || 'N/A'}</p>
                <p><strong>LinkedIn:</strong> ${item.linkedin || 'N/A'}</p>
              `;
              container.appendChild(card);
          });
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

        let res;
        if (currentContactId) {
          // Jar ID asel tar UPDATE (PUT) kara
          res = await fetch(`${CONTACT_API}/${currentContactId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } else {
          // Jar ID nasel tar NEW (POST) kara
          res = await fetch(CONTACT_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }

        if (res.ok) {
          alert("Contact information updated successfully ✅");
          loadContact(); // List refresh kara
        } else {
          const errData = await res.json();
          alert("Error: " + (errData.error || "Failed to save"));
        }
      } catch (err) {
        console.error("Error saving contact:", err);
        alert("Server is not responding.");
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = currentContactId ? "Update Contact" : "Add";
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


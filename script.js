// script.js

// Theme switching functionality
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  const themeText = document.querySelector('.theme-text');
  
  // Check for saved theme preference or use default light theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
    themeText.textContent = 'Тёмная тема';
  } else {
    themeText.textContent = 'Светлая тема';
  }
  
  // Add event listener to theme toggle button
  themeToggle.addEventListener('click', () => {
    // Check current theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
      // Switch to light theme
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
      themeText.textContent = 'Светлая тема';
    } else {
      // Switch to dark theme
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
      themeText.textContent = 'Тёмная тема';
    }
  });
}

const feelingsList = [
    "тревога",
    "страх",
    "вина",
    "грусть",
    "злость",
    "обида",
    "радость",
    "беспомощность",
    "одиночество",
    "усталость",
    "надежда",
    "разочарование",
    "стыд",
    "раздражение",
    "безысходность",
    "вдохновение",
    "шок",
    "благодарность",
    "вина за других",
    "облегчение",
  ];
  
  const feelingsContainer = document.getElementById("feelings");
  const selectedFeelings = new Set();
  
  function toggleFeeling(tag, feeling) {
    if (selectedFeelings.has(feeling)) {
      // Deselect feeling
      selectedFeelings.delete(feeling);
      tag.style.backgroundColor = "var(--tag-bg)";
      tag.style.color = "var(--input-text)";
      tag.style.borderColor = "var(--input-border)";
      tag.style.fontWeight = "normal";
    } else {
      // Select feeling
      selectedFeelings.add(feeling);
      tag.style.backgroundColor = "var(--tag-bg-selected)";
      tag.style.color = "var(--tag-selected-text)";
      tag.style.borderColor = "var(--tag-border-selected)";
      tag.style.fontWeight = "bold";
    }
  }
  
  function goToStep(step) {
    if (step === 4 && selectedFeelings.size < 3) {
      showIndicator(document.getElementById("feelingsError"));
      return;
    }
    for (let i = 0; i <= 6; i++) {
      const el = document.getElementById(`screen-${i}`);
      if (el) el.classList.add("hidden");
    }
    const target = document.getElementById(`screen-${step}`);
    if (target) target.classList.remove("hidden");
  }
  
  function validateAndGo(current, fieldId, next) {
    const value = document.getElementById(fieldId).value.trim();
    if (!value) {
      showIndicator(document.getElementById("validationError"));
      return;
    }
    goToStep(next);
  }
  
  function validateAndSave() {
    const outcome = document.getElementById("outcome").value.trim();
    if (!outcome) {
      showIndicator(document.getElementById("validationError"));
      return;
    }
    saveEntry();
  }
  
  function saveEntry() {
    const selectedFromUI = Array.from(selectedFeelings);
    const entry = {
      situation: document.getElementById("situation")?.value || "",
      thoughts: document.getElementById("thoughts")?.value || "",
      feelings: selectedFromUI,
      outcome: document.getElementById("outcome")?.value || "",
    };
  
    let entries = JSON.parse(localStorage.getItem("diaryEntries") || "[]");
    entries.push(entry);
  
    if (entries.length > 7) {
      entries = entries.slice(entries.length - 7);
    }
  
    localStorage.setItem("diaryEntries", JSON.stringify(entries));
  
    document.getElementById("situation").value = "";
    document.getElementById("thoughts").value = "";
    document.getElementById("outcome").value = "";
    selectedFeelings.clear();
    Array.from(feelingsContainer.children).forEach((el) => {
      el.style.backgroundColor = "var(--tag-bg)";
      el.style.color = "var(--input-text)";
      el.style.borderColor = "var(--input-border)";
      el.style.fontWeight = "normal";
    });
  
    showIndicator(document.getElementById("saveSuccess"));
    goToStep(5);
    renderEntries();
  }
  
  function showIndicator(element) {
    element.classList.remove("hidden");
    element.classList.add("fade-in");
    setTimeout(() => {
      element.classList.add("hidden");
      element.classList.remove("fade-in");
    }, 2000);
  }
  
  function renderEntries() {
    const entries = JSON.parse(localStorage.getItem("diaryEntries") || "[]");
    const entriesList = document.getElementById("entriesList");
    if (!entriesList) return;
    entriesList.innerHTML = "";
  
    entries.forEach((entry, index) => {
      const li = document.createElement("li");
      li.className = "p-2 rounded shadow-sm flex flex-col gap-2";
      li.style.backgroundColor = "var(--card-bg)";
      li.style.color = "var(--card-text)";
      li.style.border = "1px solid var(--card-border)";
      
      li.innerHTML = `
        <div class="flex justify-between items-center">
          <span>${entry.situation.substring(0, 30)}...</span>
          <div class="flex gap-2">
            <button class="text-sm hover:underline copy-btn" onclick='copyEntry(${index})'>Скопировать</button>
            <button class="text-sm hover:underline open-btn" onclick='openEntry(${index})'>Открыть</button>
          </div>
        </div>`;
      entriesList.appendChild(li);
      
      // Style buttons after they are added to the DOM
      const copyBtn = li.querySelector('.copy-btn');
      copyBtn.style.color = "var(--button-primary)";
      
      const openBtn = li.querySelector('.open-btn');
      openBtn.style.color = "var(--button-success)";
    });
  
    const controlLi = document.createElement("li");
    controlLi.className = "flex flex-col gap-2 mt-4 items-center";
  
    const addBtn = document.createElement("button");
    addBtn.className = "px-6 py-2 rounded-xl text-white";
    addBtn.style.backgroundColor = "var(--button-primary)";
    addBtn.style.transition = "background-color 0.3s ease";
    addBtn.addEventListener("mouseenter", () => {
      addBtn.style.backgroundColor = "var(--button-primary-hover)";
    });
    addBtn.addEventListener("mouseleave", () => {
      addBtn.style.backgroundColor = "var(--button-primary)";
    });
    addBtn.textContent = "➕ Добавить новое событие";
    addBtn.onclick = () => goToStep(1);
    controlLi.appendChild(addBtn);
  
    const clearBtn = document.createElement("button");
    clearBtn.className = "px-6 py-2 rounded-xl text-white";
    clearBtn.style.backgroundColor = "var(--button-danger)";
    clearBtn.style.transition = "background-color 0.3s ease";
    clearBtn.addEventListener("mouseenter", () => {
      clearBtn.style.backgroundColor = "var(--button-danger-hover)";
    });
    clearBtn.addEventListener("mouseleave", () => {
      clearBtn.style.backgroundColor = "var(--button-danger)";
    });
    clearBtn.textContent = "🗑 Очистить дневник";
    clearBtn.onclick = () => {
      if (confirm("Вы точно хотите удалить все записи?")) {
        localStorage.removeItem("diaryEntries");
        renderEntries();
      }
    };
    controlLi.appendChild(clearBtn);
  
    entriesList.appendChild(controlLi);
  }
  
  function copyEntry(index) {
    const entries = JSON.parse(localStorage.getItem("diaryEntries") || "[]");
    const entry = entries[index];
    const text = `Ситуация:\n${entry.situation}\n\nМысли:\n${entry.thoughts}\n\nЧувства:\n${entry.feelings.join(", ")}\n\nИтог:\n${entry.outcome}`;
    navigator.clipboard
      .writeText(text)
      .then(() => showIndicator(document.getElementById("copySuccess")));
  }
  
  function openEntry(index) {
    const entries = JSON.parse(localStorage.getItem("diaryEntries") || "[]");
    const entry = entries[index];
    const container = document.getElementById("entryView");
    container.textContent = `Ситуация:\n${entry.situation}\n\nМысли:\n${entry.thoughts}\n\nЧувства:\n${entry.feelings.join(", ")}\n\nИтог:\n${entry.outcome}`;
    goToStep(6);
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    // Initialize theme functionality
    initTheme();
    
    if (feelingsContainer) {
      feelingsList.forEach((feeling) => {
        const tag = document.createElement("div");
        tag.className = "cursor-pointer border px-3 py-1 rounded-full select-none";
        tag.style.borderColor = "var(--input-border)";
        tag.style.color = "var(--input-text)";
        tag.style.backgroundColor = "var(--tag-bg)";
        
        // Add hover effect
        tag.addEventListener("mouseenter", () => {
          tag.style.backgroundColor = "var(--tag-hover)";
        });
        
        tag.addEventListener("mouseleave", () => {
          if (!selectedFeelings.has(feeling)) {
            tag.style.backgroundColor = "var(--tag-bg)";
            tag.style.color = "var(--input-text)";
            tag.style.borderColor = "var(--input-border)";
          } else {
            tag.style.backgroundColor = "var(--tag-bg-selected)";
            tag.style.color = "var(--tag-selected-text)";
            tag.style.borderColor = "var(--tag-border-selected)";
          }
        });
        
        tag.innerText = feeling;
        tag.addEventListener("pointerdown", () => {
          toggleFeeling(tag, feeling);
        });
        feelingsContainer.appendChild(tag);
      });
    }
    renderEntries();
  });
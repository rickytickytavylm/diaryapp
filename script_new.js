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
    timestamp: new Date().toISOString()
  };

  let entries = JSON.parse(localStorage.getItem("diaryEntries") || "[]");
  
  // Check if we're at the limit
  if (entries.length >= 7) {
    // Show limit reached warning
    showLimitWarning();
    return;
  }
  
  entries.push(entry);
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
      <div class="flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <span>${entry.situation.substring(0, 30)}...</span>
          <div class="flex gap-2">
            <button class="px-3 py-1 rounded-md copy-btn" onclick='copyEntry(${index})'>Скопировать</button>
            <button class="px-3 py-1 rounded-md open-btn" onclick='openEntry(${index})'>Открыть</button>
          </div>
        </div>
        <div class="flex justify-end">
          <button class="px-2 py-1 rounded-md delete-btn text-sm" onclick='deleteEntry(${index})'>Удалить</button>
        </div>
      </div>`;
    entriesList.appendChild(li);
    
    // Style buttons after they are added to the DOM
    const copyBtn = li.querySelector('.copy-btn');
    copyBtn.style.backgroundColor = "var(--button-primary)";
    copyBtn.style.color = "white";
    copyBtn.style.fontWeight = "500";
    copyBtn.style.border = "none";
    copyBtn.style.transition = "background-color 0.3s ease";
    
    copyBtn.addEventListener("mouseenter", () => {
      copyBtn.style.backgroundColor = "var(--button-primary-hover)";
    });
    
    copyBtn.addEventListener("mouseleave", () => {
      copyBtn.style.backgroundColor = "var(--button-primary)";
    });
    
    const openBtn = li.querySelector('.open-btn');
    openBtn.style.backgroundColor = "var(--button-success)";
    openBtn.style.color = "white";
    openBtn.style.fontWeight = "500";
    openBtn.style.border = "none";
    openBtn.style.transition = "background-color 0.3s ease";
    
    openBtn.addEventListener("mouseenter", () => {
      openBtn.style.backgroundColor = "var(--button-success-hover)";
    });
    
    openBtn.addEventListener("mouseleave", () => {
      openBtn.style.backgroundColor = "var(--button-success)";
    });
    
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.style.backgroundColor = "var(--button-danger)";
    deleteBtn.style.color = "white";
    deleteBtn.style.fontWeight = "500";
    deleteBtn.style.border = "none";
    deleteBtn.style.transition = "background-color 0.3s ease";
    
    deleteBtn.addEventListener("mouseenter", () => {
      deleteBtn.style.backgroundColor = "var(--button-danger-hover)";
    });
    
    deleteBtn.addEventListener("mouseleave", () => {
      deleteBtn.style.backgroundColor = "var(--button-danger)";
    });
  });

  const controlLi = document.createElement("li");
  controlLi.className = "flex flex-col gap-3 mt-6 mb-12 items-center";

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
  addBtn.onclick = () => {
    // Check if we're at the limit
    const entries = JSON.parse(localStorage.getItem("diaryEntries") || "[]");
    if (entries.length >= 7) {
      showLimitWarning();
      return;
    }
    goToStep(1);
  };
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
  
  // Add bottom spacer for better mobile experience
  const spacerLi = document.createElement("li");
  spacerLi.className = "h-20"; // Height of 5rem (80px)
  spacerLi.style.minHeight = "80px";

  entriesList.appendChild(controlLi);
  entriesList.appendChild(spacerLi);
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
  
  // Форматируем дату, если она есть
  let dateString = "";
  if (entry.timestamp) {
    const date = new Date(entry.timestamp);
    dateString = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  
  // Создаем HTML для компактного отображения записи
  container.innerHTML = `
    <div class="text-sm opacity-70 mb-2">${dateString}</div>
    <div class="grid gap-2">
      <div class="mb-2">
        <h3 class="font-bold mb-0.5 text-sm">Ситуация:</h3>
        <p class="whitespace-pre-wrap text-sm">${entry.situation}</p>
      </div>
      <div class="mb-2">
        <h3 class="font-bold mb-0.5 text-sm">Мысли:</h3>
        <p class="whitespace-pre-wrap text-sm">${entry.thoughts}</p>
      </div>
      <div class="mb-2">
        <h3 class="font-bold mb-0.5 text-sm">Чувства:</h3>
        <div class="flex flex-wrap gap-1">
          ${entry.feelings.map(feeling => 
            `<span class="px-2 py-0.5 text-xs rounded-xl" style="background-color: var(--tag-bg-selected); color: var(--tag-selected-text);">${feeling}</span>`
          ).join('')}
        </div>
      </div>
      <div class="mb-1">
        <h3 class="font-bold mb-0.5 text-sm">Итог:</h3>
        <p class="whitespace-pre-wrap text-sm">${entry.outcome}</p>
      </div>
    </div>
  `;
  
  goToStep(6);
}

function deleteEntry(index) {
  if (confirm('Вы уверены, что хотите удалить эту запись?')) {
    let entries = JSON.parse(localStorage.getItem("diaryEntries") || "[]");
    entries.splice(index, 1);
    localStorage.setItem("diaryEntries", JSON.stringify(entries));
    renderEntries();
    showIndicator(document.getElementById("deleteSuccess"));
  }
}

function showLimitWarning() {
  // Create modal backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
  document.body.appendChild(backdrop);
  
  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-auto';
  modal.style.backgroundColor = 'var(--card-bg)';
  modal.style.color = 'var(--card-text)';
  modal.style.border = '1px solid var(--card-border)';
  modal.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  
  modal.innerHTML = `
    <h3 class="text-lg font-bold mb-4">Достигнут лимит записей</h3>
    <p class="mb-4">Вы достигли максимального количества записей (7). Чтобы создать новую запись, вам необходимо удалить одну из существующих.</p>
    <div class="flex justify-end gap-3">
      <button id="cancelBtn" class="px-4 py-2 rounded-md">Отмена</button>
      <button id="viewEntriesBtn" class="px-4 py-2 rounded-md">Перейти к записям</button>
    </div>
  `;
  
  backdrop.appendChild(modal);
  
  // Style buttons
  const cancelBtn = document.getElementById('cancelBtn');
  cancelBtn.style.backgroundColor = 'var(--button-danger)';
  cancelBtn.style.color = 'white';
  
  const viewEntriesBtn = document.getElementById('viewEntriesBtn');
  viewEntriesBtn.style.backgroundColor = 'var(--button-primary)';
  viewEntriesBtn.style.color = 'white';
  
  // Add event listeners
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(backdrop);
  });
  
  viewEntriesBtn.addEventListener('click', () => {
    document.body.removeChild(backdrop);
    goToStep(5);
  });
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

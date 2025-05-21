// script.js

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
    tag.style.transform = "scale(1)";
  } else {
    // Select feeling
    selectedFeelings.add(feeling);
    tag.style.backgroundColor = "var(--tag-bg-selected)";
    tag.style.color = "var(--tag-selected-text)";
    tag.style.borderColor = "var(--tag-border-selected)";
    tag.style.fontWeight = "bold";
    tag.style.transform = "scale(1.05)";
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

  if (entries.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "text-center p-6 rounded-xl card";
    emptyMessage.style.backgroundColor = "var(--card-bg)";
    emptyMessage.innerHTML = `
      <div class="text-xl font-medium mb-2">Нет записей</div>
      <p class="text-sm mb-4">Нажмите кнопку ниже, чтобы создать первую запись</p>
      <button id="createFirstEntry" class="px-6 py-3 rounded-xl btn text-white w-full">
        ➕ Создать запись
      </button>
    `;
    entriesList.appendChild(emptyMessage);
    
    const createBtn = document.getElementById("createFirstEntry");
    createBtn.style.backgroundColor = "var(--button-primary)";
    createBtn.style.fontWeight = "700";
    createBtn.style.boxShadow = "0 6px 12px rgba(58, 42, 109, 0.25)";
    createBtn.style.transition = "all 0.3s ease";
    
    return;
  }
  
  entries.forEach((entry, index) => {
    const li = document.createElement("li");
    li.className = "p-4 mb-4 rounded-2xl shadow-md";
    li.style.backgroundColor = "var(--card-bg)";
    li.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
    
    // Форматируем дату, если она есть
    let dateString = "";
    if (entry.timestamp) {
      const date = new Date(entry.timestamp);
      dateString = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    
    // Создаем превью ситуации
    const situationPreview = entry.situation.length > 100 ? 
      entry.situation.substring(0, 100) + "..." : 
      entry.situation;
    
    // Создаем структуру карточки
    const cardDiv = document.createElement("div");
    cardDiv.className = "flex flex-col gap-3";
    
    // Добавляем дату
    const dateDiv = document.createElement("div");
    dateDiv.className = "flex justify-between items-center mb-1";
    const dateTxt = document.createElement("div");
    dateTxt.className = "text-sm opacity-70";
    dateTxt.textContent = dateString;
    dateDiv.appendChild(dateTxt);
    cardDiv.appendChild(dateDiv);
    
    // Добавляем превью ситуации
    const situationDiv = document.createElement("div");
    situationDiv.className = "font-medium mb-2";
    situationDiv.textContent = situationPreview;
    cardDiv.appendChild(situationDiv);
    
    // Добавляем чувства
    const feelingsDiv = document.createElement("div");
    feelingsDiv.className = "flex flex-wrap gap-1 mb-2";
    
    // Добавляем первые 3 чувства
    entry.feelings.slice(0, 3).forEach(feeling => {
      const feelingSpan = document.createElement("span");
      feelingSpan.className = "text-xs px-2 py-1 rounded-xl";
      feelingSpan.style.backgroundColor = "var(--tag-bg)";
      feelingSpan.style.color = "var(--text-color)";
      feelingSpan.textContent = feeling;
      feelingsDiv.appendChild(feelingSpan);
    });
    
    // Если чувств больше 3, добавляем счетчик
    if (entry.feelings.length > 3) {
      const moreSpan = document.createElement("span");
      moreSpan.className = "text-xs px-2 py-1 rounded-xl";
      moreSpan.style.backgroundColor = "var(--tag-bg)";
      moreSpan.style.color = "var(--text-color)";
      moreSpan.textContent = `+${entry.feelings.length - 3}`;
      feelingsDiv.appendChild(moreSpan);
    }
    
    cardDiv.appendChild(feelingsDiv);
    
    // Добавляем кнопки
    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "flex justify-between gap-2";
    
    // Кнопка Открыть
    const viewBtn = document.createElement("button");
    viewBtn.className = "flex-1 py-1.5 px-2 rounded-xl text-center btn-view text-sm";
    viewBtn.textContent = "Открыть";
    viewBtn.style.backgroundColor = "var(--button-success)";
    viewBtn.style.color = "var(--text-color)";
    viewBtn.style.fontWeight = "600";
    viewBtn.style.border = "none";
    viewBtn.style.boxShadow = "0 2px 4px rgba(58, 42, 109, 0.2)";
    viewBtn.style.transition = "all 0.3s ease";
    
    viewBtn.addEventListener('click', function() {
      window.openEntry(index);
    });
    
    viewBtn.addEventListener('mouseover', function() {
      this.style.backgroundColor = "var(--button-success-hover)";
      this.style.transform = "translateY(-1px)";
      this.style.boxShadow = "0 3px 6px rgba(58, 42, 109, 0.25)";
    });
    
    viewBtn.addEventListener('mouseout', function() {
      this.style.backgroundColor = "var(--button-success)";
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 2px 4px rgba(58, 42, 109, 0.2)";
    });
    
    // Кнопка Скопировать
    const copyBtn = document.createElement("button");
    copyBtn.className = "flex-1 py-1.5 px-2 rounded-xl text-center btn-copy text-sm";
    copyBtn.textContent = "Скопировать";
    copyBtn.style.backgroundColor = "var(--button-primary)";
    copyBtn.style.color = "var(--text-color)";
    copyBtn.style.fontWeight = "600";
    copyBtn.style.border = "none";
    copyBtn.style.boxShadow = "0 2px 4px rgba(58, 42, 109, 0.2)";
    copyBtn.style.transition = "all 0.3s ease";
    
    copyBtn.addEventListener('click', function() {
      window.copyEntry(index);
    });
    
    copyBtn.addEventListener('mouseover', function() {
      this.style.backgroundColor = "var(--button-primary-hover)";
      this.style.transform = "translateY(-1px)";
      this.style.boxShadow = "0 3px 6px rgba(58, 42, 109, 0.25)";
    });
    
    copyBtn.addEventListener('mouseout', function() {
      this.style.backgroundColor = "var(--button-primary)";
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 2px 4px rgba(58, 42, 109, 0.2)";
    });
    
    // Кнопка Удалить
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "w-8 h-8 rounded-xl flex items-center justify-center btn-delete text-sm";
    deleteBtn.innerHTML = "🗑";
    deleteBtn.style.backgroundColor = "var(--button-danger)";
    deleteBtn.style.color = "white";
    deleteBtn.style.fontWeight = "600";
    deleteBtn.style.border = "none";
    deleteBtn.style.boxShadow = "0 2px 4px rgba(58, 42, 109, 0.2)";
    deleteBtn.style.transition = "all 0.3s ease";
    
    deleteBtn.addEventListener('click', function() {
      window.deleteEntry(index);
    });
    
    deleteBtn.addEventListener('mouseover', function() {
      this.style.backgroundColor = "var(--button-danger-hover)";
      this.style.transform = "translateY(-1px)";
      this.style.boxShadow = "0 3px 6px rgba(58, 42, 109, 0.25)";
    });
    
    deleteBtn.addEventListener('mouseout', function() {
      this.style.backgroundColor = "var(--button-danger)";
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 2px 4px rgba(58, 42, 109, 0.2)";
    });
    
    // Добавляем все кнопки в контейнер
    buttonsDiv.appendChild(viewBtn);
    buttonsDiv.appendChild(copyBtn);
    buttonsDiv.appendChild(deleteBtn);
    
    cardDiv.appendChild(buttonsDiv);
    li.appendChild(cardDiv);
    entriesList.appendChild(li);
  });

  const spacerLi = document.createElement("li");
  spacerLi.className = "h-20";
  entriesList.appendChild(spacerLi);

  const controlLi = document.createElement("li");
  controlLi.className = "flex flex-col gap-3 mt-6 mb-12 items-center";

  const addBtn = document.createElement("button");
  addBtn.className = "px-6 py-2 rounded-xl text-white";
  addBtn.style.backgroundColor = "var(--button-primary)";
  addBtn.style.transition = "background-color 0.3s ease";
  addBtn.addEventListener("mouseover", () => {
    addBtn.style.backgroundColor = "var(--button-primary-hover)";
    addBtn.style.transform = "translateY(-2px)";
  });
  addBtn.addEventListener("mouseout", () => {
    addBtn.style.backgroundColor = "var(--button-primary)";
    addBtn.style.transform = "translateY(0)";
  });
  addBtn.textContent = "➡ Добавить новое событие";
  addBtn.onclick = () => {
    // Check if we're at the limit
    const entries = JSON.parse(localStorage.getItem("diaryEntries") || "[]");
    if (entries.length >= 7) {
      showLimitWarning();
      return;
    }
    resetForm();
    goToStep(1);
  };
  
  controlLi.appendChild(addBtn);
  // Добавляем кнопку очистки дневника
  const clearBtn = document.createElement("button");
  clearBtn.className = "px-6 py-2 mt-4 rounded-xl text-white";
  clearBtn.style.backgroundColor = "var(--button-danger)";
  clearBtn.style.transition = "background-color 0.3s ease";
  clearBtn.textContent = "🗑 Очистить дневник";
  
  clearBtn.addEventListener("mouseover", () => {
    clearBtn.style.backgroundColor = "var(--button-danger-hover)";
    clearBtn.style.transform = "translateY(-2px)";
  });
  
  clearBtn.addEventListener("mouseout", () => {
    clearBtn.style.backgroundColor = "var(--button-danger)";
    clearBtn.style.transform = "translateY(0)";
  });
  
  clearBtn.addEventListener("click", () => {
    if (confirm("Вы точно хотите удалить все записи?")) {
      localStorage.removeItem("diaryEntries");
      renderEntries();
    }
  });
  
  controlLi.appendChild(clearBtn);
  entriesList.appendChild(controlLi);
  
  // Добавляем нижний отступ для лучшего опыта на мобильных устройствах
  const bottomSpacer = document.createElement("li");
  bottomSpacer.className = "h-20"; // Высота 5rem (80px)
  entriesList.appendChild(bottomSpacer);
  // Конец функции renderEntries
}

// Глобальные функции для работы с записями
window.copyEntry = function(index) {
  const entries = JSON.parse(localStorage.getItem("diaryEntries") || "[]");
  const entry = entries[index];
  const text = `Ситуация:\n${entry.situation}\n\nМысли:\n${entry.thoughts}\n\nЧувства:\n${entry.feelings.join(", ")}\n\nИтог:\n${entry.outcome}`;
  
  navigator.clipboard.writeText(text)
    .then(() => showIndicator(document.getElementById("copySuccess")));
};

window.openEntry = function(index) {
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
    <div class="text-sm opacity-70 mb-3">${dateString}</div>
    
    <div class="grid gap-3">
      <div>
        <h3 class="font-bold mb-1">Ситуация:</h3>
        <p class="whitespace-pre-wrap">${entry.situation}</p>
      </div>
      
      <div>
        <h3 class="font-bold mb-1">Мысли:</h3>
        <p class="whitespace-pre-wrap">${entry.thoughts}</p>
      </div>
      
      <div>
        <h3 class="font-bold mb-1">Чувства:</h3>
        <div class="flex flex-wrap gap-1">
          ${entry.feelings.map(feeling => 
            `<span class="px-2 py-1 text-sm rounded-xl" style="background-color: var(--tag-bg-selected); color: var(--tag-selected-text);">${feeling}</span>`
          ).join('')}
        </div>
      </div>
      
      <div>
        <h3 class="font-bold mb-1">Итог:</h3>
        <p class="whitespace-pre-wrap">${entry.outcome}</p>
      </div>
    </div>
  `;
  
  // Добавляем кнопки
  const buttonsContainer = document.createElement("div");
  buttonsContainer.className = "flex gap-3 mt-4";
  
  // Кнопка копирования
  const copyButton = document.createElement("button");
  copyButton.className = "flex-1 py-2 px-3 rounded-xl text-white btn text-sm";
  copyButton.style.backgroundColor = "var(--button-primary)";
  copyButton.style.transition = "all 0.3s ease";
  copyButton.style.fontWeight = "600";
  copyButton.style.boxShadow = "0 2px 4px rgba(58, 42, 109, 0.2)";
  copyButton.style.maxWidth = "180px";
  copyButton.innerHTML = `
    <div class="flex items-center justify-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      </svg>
      <span>Скопировать</span>
    </div>
  `;
  
  copyButton.addEventListener("mouseover", function() {
    this.style.backgroundColor = "var(--button-primary-hover)";
    this.style.transform = "translateY(-1px)";
    this.style.boxShadow = "0 3px 6px rgba(58, 42, 109, 0.25)";
  });
  
  copyButton.addEventListener("mouseout", function() {
    this.style.backgroundColor = "var(--button-primary)";
    this.style.transform = "translateY(0)";
    this.style.boxShadow = "0 2px 4px rgba(58, 42, 109, 0.2)";
  });
  
  copyButton.addEventListener("click", function() {
    window.copyEntry(index);
  });
  
  // Кнопка назад
  const backButton = document.createElement("button");
  backButton.className = "flex-1 py-2 px-3 rounded-xl btn text-sm";
  backButton.style.backgroundColor = "var(--button-secondary)";
  backButton.style.color = "var(--text-color)";
  backButton.style.transition = "all 0.3s ease";
  backButton.style.fontWeight = "600";
  backButton.style.boxShadow = "0 2px 4px rgba(58, 42, 109, 0.2)";
  backButton.style.maxWidth = "180px";
  backButton.innerHTML = `
    <div class="flex items-center justify-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      <span>Назад к списку</span>
    </div>
  `;
  
  backButton.addEventListener("mouseover", function() {
    this.style.backgroundColor = "var(--button-secondary-hover)";
    this.style.transform = "translateY(-1px)";
    this.style.boxShadow = "0 3px 6px rgba(58, 42, 109, 0.25)";
  });
  
  backButton.addEventListener("mouseout", function() {
    this.style.backgroundColor = "var(--button-secondary)";
    this.style.transform = "translateY(0)";
    this.style.boxShadow = "0 2px 4px rgba(58, 42, 109, 0.2)";
  });
  
  backButton.addEventListener("click", function() {
    goToStep(5);
  });
  
  buttonsContainer.appendChild(copyButton);
  buttonsContainer.appendChild(backButton);
  container.appendChild(buttonsContainer);
  
  goToStep(6);
};

window.deleteEntry = function(index) {
  if (confirm('Вы уверены, что хотите удалить эту запись?')) {
    let entries = JSON.parse(localStorage.getItem("diaryEntries") || "[]");
    entries.splice(index, 1);
    localStorage.setItem("diaryEntries", JSON.stringify(entries));
    renderEntries();
    showIndicator(document.getElementById("deleteSuccess"));
  }
};

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
  // Create feeling tags
  feelingsList.forEach((feeling) => {
    const tag = document.createElement("span");
    tag.className = "inline-block px-3 py-1 mb-2 mr-2 rounded-xl border cursor-pointer transition-all duration-200 tag";
    tag.textContent = feeling;
    tag.style.backgroundColor = "var(--tag-bg)";
    tag.style.color = "var(--input-text)";
    tag.style.borderColor = "var(--input-border)";

    tag.addEventListener("click", () => toggleFeeling(tag, feeling));
    tag.addEventListener("mouseover", () => {
      if (!selectedFeelings.has(feeling)) {
        tag.style.backgroundColor = "var(--tag-hover)";
        tag.style.transform = "scale(1.05)";
      }
    });
    
    tag.addEventListener("mouseout", () => {
      if (!selectedFeelings.has(feeling)) {
        tag.style.backgroundColor = "var(--tag-bg)";
        tag.style.transform = "scale(1)";
      }
    });
    
    feelingsContainer.appendChild(tag);
  });
  
  // Render saved entries
  renderEntries();
  
  // Show intro screen
  goToStep(0);
});

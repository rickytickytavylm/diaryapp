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

// Делаем функцию доступной глобально
// Сначала сохраняем оригинальную функцию
function goToStepInternal(step) {
  console.log(`goToStep called with step: ${step}`);
  
  if (step === 4 && selectedFeelings.size < 3) {
    console.log('Not enough feelings selected');
    showIndicator(document.getElementById("feelingsError"));
    return;
  }
  
  console.log('Hiding all screens');
  for (let i = 0; i <= 6; i++) {
    const el = document.getElementById(`screen-${i}`);
    if (el) {
      el.classList.add("hidden");
      console.log(`Screen ${i} hidden`);
    } else {
      console.log(`Screen ${i} not found`);
    }
  }
  
  console.log(`Showing screen ${step}`);
  const target = document.getElementById(`screen-${step}`);
  if (target) {
    target.classList.remove("hidden");
    console.log(`Screen ${step} shown`);
  } else {
    console.error(`Target screen ${step} not found!`);
  }
}

// Делаем функцию доступной глобально
window.goToStep = goToStepInternal;

// Для обратной совместимости с существующим кодом
function goToStep(step) {
  goToStepInternal(step);
}

// Делаем функцию validateAndGo доступной глобально
window.validateAndGo = function(current, fieldId, next) {
  console.log(`validateAndGo called: current=${current}, fieldId=${fieldId}, next=${next}`);
  const field = document.getElementById(fieldId);
  if (!field) {
    console.error(`Field with id ${fieldId} not found!`);
    return;
  }
  
  const value = field.value.trim();
  console.log(`Field value: "${value}"`); 
  
  if (!value) {
    console.log('Empty value, showing validation error');
    showIndicator(document.getElementById("validationError"));
    return;
  }
  
  console.log(`Validation passed, going to step ${next}`);
  // Скрываем все экраны
  for (let i = 0; i <= 6; i++) {
    const el = document.getElementById(`screen-${i}`);
    if (el) el.classList.add("hidden");
  }
  
  // Показываем нужный экран
  const target = document.getElementById(`screen-${next}`);
  if (target) target.classList.remove("hidden");
};

// Для обратной совместимости
function validateAndGo(current, fieldId, next) {
  window.validateAndGo(current, fieldId, next);
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
      <button id="createFirstEntry" class="px-4 py-2 rounded-xl btn text-white w-full text-sm">
        <div class="flex items-center justify-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Создать запись</span>
        </div>
      </button>
    `;
    entriesList.appendChild(emptyMessage);
    
    // После добавления в DOM, находим кнопку и стилизуем её
    setTimeout(() => {
      const createBtn = document.getElementById("createFirstEntry");
      if (!createBtn) {
        console.error("Create button not found!");
        return;
      }
      
      console.log("Create button found, styling it");
      createBtn.style.backgroundColor = "var(--button-primary)";
      createBtn.style.fontWeight = "600";
      createBtn.style.boxShadow = "0 2px 4px rgba(58, 42, 109, 0.2)";
      createBtn.style.transition = "all 0.3s ease";
      
      // Добавляем эффекты при наведении
      createBtn.addEventListener("mouseover", function() {
        this.style.backgroundColor = "var(--button-primary-hover)";
        this.style.transform = "translateY(-1px)";
        this.style.boxShadow = "0 3px 6px rgba(58, 42, 109, 0.25)";
      });
      
      createBtn.addEventListener("mouseout", function() {
        this.style.backgroundColor = "var(--button-primary)";
        this.style.transform = "translateY(0)";
        this.style.boxShadow = "0 2px 4px rgba(58, 42, 109, 0.2)";
      });
      
      // Добавляем обработчик клика напрямую в HTML
      createBtn.onclick = function() {
        console.log("Create first entry button clicked");
        // Скрываем все экраны
        for (let i = 0; i <= 6; i++) {
          const el = document.getElementById(`screen-${i}`);
          if (el) el.classList.add("hidden");
        }
        // Показываем экран 1
        const target = document.getElementById('screen-1');
        if (target) target.classList.remove("hidden");
        
        // Очищаем выбранные чувства
        selectedFeelings.clear();
      };
      
      console.log("Create button setup complete");
    }, 100); // Небольшая задержка, чтобы убедиться, что DOM обновлен
    
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
  addBtn.className = "px-4 py-1.5 rounded-xl text-white text-sm";
  addBtn.style.backgroundColor = "var(--button-primary)";
  addBtn.style.transition = "all 0.3s ease";
  addBtn.style.boxShadow = "0 2px 4px rgba(58, 42, 109, 0.2)";
  addBtn.style.fontWeight = "600";
  
  addBtn.addEventListener("mouseover", () => {
    addBtn.style.backgroundColor = "var(--button-primary-hover)";
    addBtn.style.transform = "translateY(-1px)";
    addBtn.style.boxShadow = "0 3px 6px rgba(58, 42, 109, 0.25)";
  });
  
  addBtn.addEventListener("mouseout", () => {
    addBtn.style.backgroundColor = "var(--button-primary)";
    addBtn.style.transform = "translateY(0)";
    addBtn.style.boxShadow = "0 2px 4px rgba(58, 42, 109, 0.2)";
  });
  
  addBtn.innerHTML = `
    <div class="flex items-center justify-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      <span>Добавить запись</span>
    </div>
  `;
  
  addBtn.onclick = () => {
    // Check if we're at the limit
    const entries = JSON.parse(localStorage.getItem("diaryEntries") || "[]");
    if (entries.length >= 7) {
      showLimitWarning();
      return;
    }
    // Очищаем выбранные чувства перед переходом к новой записи
    selectedFeelings.clear();
    // Переходим к первому шагу
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
  
  // Создаем HTML для максимально компактного отображения записи без отступов
  container.innerHTML = `
    <div style="line-height: 1.1; margin-top: 0;">
      <div class="text-xs opacity-70" style="margin: 0 0 2px 0;"><span class="font-bold">Дата:</span> ${dateString}</div>
      <div>
        <h3 class="font-bold text-xs inline">Ситуация:</h3>
        <span class="text-xs">${entry.situation}</span>
      </div>
      <div>
        <h3 class="font-bold text-xs inline">Мысли:</h3>
        <span class="text-xs">${entry.thoughts}</span>
      </div>
      <div>
        <h3 class="font-bold text-xs inline">Чувства:</h3>
        <span class="flex flex-wrap gap-0.5 inline">
          ${entry.feelings.map(feeling => 
            `<span class="px-0.5 text-xs rounded" style="background-color: var(--tag-bg-selected); color: var(--tag-selected-text);">${feeling}</span>`
          ).join('')}
        </span>
      </div>
      <div>
        <h3 class="font-bold text-xs inline">Итог:</h3>
        <span class="text-xs">${entry.outcome}</span>
      </div>
    </div>
  `;
  
  // Добавляем кнопки
  const buttonsContainer = document.createElement("div");
  buttonsContainer.className = "flex gap-0.5 mt-0.5";
  
  // Кнопка назад (теперь первая)
  const backButton = document.createElement("button");
  backButton.className = "flex-1 py-0 px-1 rounded text-xs";
  backButton.style.backgroundColor = "var(--button-secondary)";
  backButton.style.color = "var(--text-color)";
  backButton.style.transition = "all 0.2s ease";
  backButton.style.fontWeight = "400";
  backButton.style.boxShadow = "none";
  backButton.style.maxWidth = "60px";
  backButton.innerHTML = `
    <div class="flex items-center justify-center gap-0.5">
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      <span>Назад</span>
    </div>
  `;
  
  backButton.addEventListener("mouseover", function() {
    this.style.backgroundColor = "var(--button-secondary-hover)";
    this.style.transform = "translateY(-1px)";
  });
  
  backButton.addEventListener("mouseout", function() {
    this.style.backgroundColor = "var(--button-secondary)";
    this.style.transform = "translateY(0)";
  });
  
  backButton.addEventListener("click", function() {
    goToStep(5);
  });
  
  // Кнопка копирования (теперь вторая)
  const copyButton = document.createElement("button");
  copyButton.className = "flex-1 py-0 px-1 rounded text-white text-xs";
  copyButton.style.backgroundColor = "var(--button-primary)";
  copyButton.style.transition = "all 0.2s ease";
  copyButton.style.fontWeight = "400";
  copyButton.style.boxShadow = "none";
  copyButton.style.maxWidth = "60px";
  copyButton.innerHTML = `
    <div class="flex items-center justify-center gap-0.5">
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      </svg>
      <span>Скопировать</span>
    </div>
  `;
  
  copyButton.addEventListener("mouseover", function() {
    this.style.backgroundColor = "var(--button-primary-hover)";
    this.style.transform = "translateY(-1px)";
  });
  
  copyButton.addEventListener("mouseout", function() {
    this.style.backgroundColor = "var(--button-primary)";
    this.style.transform = "translateY(0)";
  });
  
  copyButton.addEventListener("click", function() {
    window.copyEntry(index);
  });
  
  // Добавляем кнопки в обратном порядке
  buttonsContainer.appendChild(backButton);
  buttonsContainer.appendChild(copyButton);
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
  const backdrop = document.createElement("div");
  backdrop.className = "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center";
  document.body.appendChild(backdrop);
  
  // Create modal content
  const modal = document.createElement("div");
  modal.className = "bg-white p-5 rounded-xl max-w-sm mx-auto";
  modal.style.backgroundColor = "var(--card-bg)";
  modal.style.color = "var(--text-color)";
  modal.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
  
  // Создаем заголовок
  const header = document.createElement("h2");
  header.className = "text-lg font-bold mb-3 text-center";
  header.style.color = "var(--text-color)";
  header.textContent = "Достигнут лимит записей";
  modal.appendChild(header);
  
  // Создаем текст сообщения
  const message = document.createElement("p");
  message.className = "mb-4 text-sm";
  message.style.color = "var(--text-color)";
  message.style.lineHeight = "1.4";
  message.textContent = `Вы достигли максимального количества записей (7). Чтобы создать новую запись, вам необходимо удалить одну из существующих.`;
  modal.appendChild(message);
  
  // Создаем контейнер для кнопок
  const buttonsContainer = document.createElement("div");
  buttonsContainer.className = "flex justify-center gap-3";
  modal.appendChild(buttonsContainer);
  
  // Кнопка Отмена
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "px-3 py-1.5 rounded-lg text-sm font-medium";
  cancelBtn.style.backgroundColor = "#F2F2F2";
  cancelBtn.style.color = "var(--text-color)";
  cancelBtn.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
  cancelBtn.style.transition = "all 0.2s ease";
  cancelBtn.textContent = "Отмена";
  
  cancelBtn.addEventListener("mouseover", function() {
    this.style.backgroundColor = "#E5E5E5";
    this.style.transform = "translateY(-1px)";
  });
  
  cancelBtn.addEventListener("mouseout", function() {
    this.style.backgroundColor = "#F2F2F2";
    this.style.transform = "translateY(0)";
  });
  
  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(backdrop);
  });
  
  // Кнопка Перейти к записям
  const goToEntriesBtn = document.createElement("button");
  goToEntriesBtn.className = "px-3 py-1.5 rounded-lg text-sm font-medium text-white";
  goToEntriesBtn.style.backgroundColor = "var(--button-primary)";
  goToEntriesBtn.style.boxShadow = "0 1px 3px rgba(58, 42, 109, 0.2)";
  goToEntriesBtn.style.transition = "all 0.2s ease";
  goToEntriesBtn.textContent = "Перейти к записям";
  
  goToEntriesBtn.addEventListener("mouseover", function() {
    this.style.backgroundColor = "var(--button-primary-hover)";
    this.style.transform = "translateY(-1px)";
    this.style.boxShadow = "0 2px 4px rgba(58, 42, 109, 0.25)";
  });
  
  goToEntriesBtn.addEventListener("mouseout", function() {
    this.style.backgroundColor = "var(--button-primary)";
    this.style.transform = "translateY(0)";
    this.style.boxShadow = "0 1px 3px rgba(58, 42, 109, 0.2)";
  });
  
  goToEntriesBtn.addEventListener("click", () => {
    document.body.removeChild(backdrop);
    goToStep(5);
  });
  
  // Добавляем кнопки в контейнер
  buttonsContainer.appendChild(cancelBtn);
  buttonsContainer.appendChild(goToEntriesBtn);
  
  backdrop.appendChild(modal);
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


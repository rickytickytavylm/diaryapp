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
    selectedFeelings.delete(feeling);
    tag.classList.remove("bg-slate-500");
  } else {
    selectedFeelings.add(feeling);
    tag.classList.add("bg-slate-500");
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

  // лимит 7
  if (entries.length > 7) {
    entries = entries.slice(entries.length - 7);
  }

  localStorage.setItem("diaryEntries", JSON.stringify(entries));

  document.getElementById("situation").value = "";
  document.getElementById("thoughts").value = "";
  document.getElementById("outcome").value = "";
  selectedFeelings.clear();
  Array.from(feelingsContainer.children).forEach((el) =>
    el.classList.remove("bg-slate-500")
  );

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
    li.className =
      "p-2 bg-slate-700 text-white rounded shadow-sm flex flex-col gap-2";
    li.innerHTML = `
        <div class="flex justify-between items-center">
          <span>${entry.situation.substring(0, 30)}...</span>
          <div class="flex gap-2">
            <button class="text-sm text-blue-400 hover:underline" onclick='copyEntry(${index})'>Скопировать</button>
            <button class="text-sm text-green-400 hover:underline" onclick='openEntry(${index})'>Открыть</button>
          </div>
        </div>`;
    entriesList.appendChild(li);
  });

  // добавить кнопку очистки
  const clearBtn = document.createElement("button");
  clearBtn.className =
    "mt-4 w-full py-2 bg-red-600 text-white rounded-xl hover:bg-red-700";
  clearBtn.textContent = "🗑 Очистить дневник";
  clearBtn.onclick = () => {
    if (confirm("Вы точно хотите удалить все записи?")) {
      localStorage.removeItem("diaryEntries");
      renderEntries();
    }
  };
  entriesList.appendChild(clearBtn);
}

function copyEntry(index) {
  const entries = JSON.parse(localStorage.getItem("diaryEntries") || "[]");
  const entry = entries[index];
  const text = `Ситуация:\n${entry.situation}\n\nМысли:\n${
    entry.thoughts
  }\n\nЧувства:\n${entry.feelings.join(", ")}\n\nИтог:\n${entry.outcome}`;
  navigator.clipboard
    .writeText(text)
    .then(() => showIndicator(document.getElementById("copySuccess")));
}

function openEntry(index) {
  const entries = JSON.parse(localStorage.getItem("diaryEntries") || "[]");
  const entry = entries[index];
  const container = document.getElementById("entryView");
  container.textContent = `Ситуация:\n${entry.situation}\n\nМысли:\n${
    entry.thoughts
  }\n\nЧувства:\n${entry.feelings.join(", ")}\n\nИтог:\n${entry.outcome}`;
  goToStep(6);
}

document.addEventListener("DOMContentLoaded", () => {
  if (feelingsContainer) {
    feelingsList.forEach((feeling) => {
      const tag = document.createElement("div");
      tag.className =
        "cursor-pointer border border-slate-600 text-white px-3 py-1 rounded-full hover:bg-slate-700 select-none";
      tag.innerText = feeling;
      tag.addEventListener("click", () => toggleFeeling(tag, feeling));
      tag.addEventListener("touchstart", () => toggleFeeling(tag, feeling));
      feelingsContainer.appendChild(tag);
    });
  }
  renderEntries();
});

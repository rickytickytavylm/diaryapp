// buttons.js - Файл для обработки кнопок в приложении "Дневник чувств"

// Функция для перехода между экранами
function navigateToScreen(fromScreen, toScreen) {
  console.log(`Переход с экрана ${fromScreen} на экран ${toScreen}`);
  
  // Скрываем все экраны
  for (let i = 0; i <= 6; i++) {
    const screen = document.getElementById(`screen-${i}`);
    if (screen) {
      screen.classList.add('hidden');
      console.log(`Экран ${i} скрыт`);
    }
  }
  
  // Показываем нужный экран
  const targetScreen = document.getElementById(`screen-${toScreen}`);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
    console.log(`Экран ${toScreen} показан`);
  } else {
    console.error(`Экран ${toScreen} не найден!`);
  }
}

// Функция для валидации поля и перехода к следующему экрану
function validateAndNavigate(fieldId, fromScreen, toScreen) {
  console.log(`Проверка поля ${fieldId} и переход с экрана ${fromScreen} на экран ${toScreen}`);
  
  const field = document.getElementById(fieldId);
  if (!field) {
    console.error(`Поле ${fieldId} не найдено!`);
    return false;
  }
  
  const value = field.value.trim();
  if (!value) {
    alert('Пожалуйста, заполните поле');
    return false;
  }
  
  navigateToScreen(fromScreen, toScreen);
  return true;
}

// Инициализация обработчиков событий после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM загружен, инициализация обработчиков кнопок');
  
  // Кнопка "Перейти к дневнику" на начальном экране
  const startButton = document.getElementById('startButton');
  if (startButton) {
    startButton.addEventListener('click', function() {
      console.log('Кнопка "Перейти к дневнику" нажата');
      navigateToScreen(0, 1);
    });
  }
  
  // Кнопка "Далее" на первом экране (ситуация)
  const nextButton1 = document.getElementById('nextStep1Button');
  if (nextButton1) {
    nextButton1.addEventListener('click', function() {
      console.log('Кнопка "Далее" на экране 1 нажата');
      validateAndNavigate('situation', 1, 2);
    });
  } else {
    console.error('Кнопка "Далее" на экране 1 не найдена');
  }
  
  // Кнопки "Открыть дневник"
  const openDiaryButtons = [
    document.getElementById('openDiaryButton0'), // на стартовом экране
    document.getElementById('openDiaryButton')  // на экране ситуации
  ];
  
  openDiaryButtons.forEach(button => {
    if (button) {
      button.addEventListener('click', function() {
        const screenId = button.id === 'openDiaryButton0' ? 0 : 1;
        console.log(`Кнопка "Открыть дневник" нажата на экране ${screenId}`);
        
        // Переходим к экрану с записями дневника
        navigateToScreen(screenId, 5);
      });
    }
  });
  
  // Кнопка "Создать запись" на пустом списке
  document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'createFirstEntry') {
      console.log('Кнопка "Создать запись" нажата');
      // Очищаем выбранные чувства
      if (window.selectedFeelings) {
        window.selectedFeelings.clear();
      }
      navigateToScreen(5, 1);
    }
  });
});

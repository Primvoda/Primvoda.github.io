document.getElementById('feedback-form').addEventListener('submit', function (e) {
  e.preventDefault();

  // URL для отправки данных (замените на ваш)
  const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSe5J4uJ2D4HalCKLYeV-kzlTK017c6oFihELGnMAJg5u9ZvUw/formResponse';

  // ID полей формы (замените на ваши)
  const nameField = 'entry.525074289'; // ID поля имени 
  const phoneField = 'entry.1344391528'; // ID поля телефона
  const messageField = 'entry.63456643'; // ID поля сообщения

  // Собираем данные из формы
  const formData = new URLSearchParams();
  formData.append(nameField, document.getElementById('name').value);
  formData.append(phoneField, document.getElementById('phone').value);
  formData.append(messageField, document.getElementById('message').value);

  // Отправляем данные через Fetch API
  fetch(formUrl, {
    method: 'POST',
    body: formData,
    mode: 'no-cors' // Обязательно для Google Forms
  })
    .then(() => {
      // Скрываем форму
      document.getElementById('feedback-form').style.display = 'none';
      
      // Меняем заголовок
      document.getElementById('form-title').textContent = 'Спасибо! Ваша заявка отправлена.';
      
      // Показываем сообщение об успешной отправке
      document.getElementById('success-message').style.display = 'block';
      
      // Очищаем форму
      document.getElementById('feedback-form').reset();
    })
    .catch(() => {
      alert('Ошибка при отправке заявки. Пожалуйста, попробуйте ещё раз.');
    });
});
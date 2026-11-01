const slug = document.body.dataset.program;
const welcome = document.getElementById('welcome');
const token = localStorage.getItem('studentToken');

if (!token) {
  window.location.href = 'index.html#training';
} else {
  fetch(`/api/programs/${slug}/enter`, {
    method: 'POST',
    headers: { 'x-student-token': token }
  })
    .then(async (res) => {
      if (res.status === 401) {
        localStorage.removeItem('studentToken');
        window.location.href = 'index.html#training';
        return;
      }
      const data = await res.json();
      if (res.ok) {
        welcome.textContent = `أهلاً ${data.name}، تم تسجيل دخولك لهذا التخصص ✅`;
      } else {
        welcome.textContent = data.error;
      }
    })
    .catch(() => {
      welcome.textContent = 'تعذّر الاتصال بالسيرفر';
    });
}
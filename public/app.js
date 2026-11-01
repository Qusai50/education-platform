const nameInput = document.getElementById('name');
const msg = document.getElementById('msg');
const sendBtn = document.getElementById('send');

sendBtn.addEventListener('click', async () => {
  msg.textContent = '';
  sendBtn.disabled = true;
  try {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameInput.value })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('studentToken', data.token);
      msg.textContent = 'تم تسجيلك بنجاح ✅ جاري نقلك للبرامج...';
      setTimeout(() => { window.location.href = 'programs.html'; }, 1200);
    } else {
      msg.textContent = data.error;
      sendBtn.disabled = false;
    }
  } catch (err) {
    msg.textContent = 'تعذّر الاتصال بالسيرفر، حاول مرة ثانية';
    sendBtn.disabled = false;
  }
});
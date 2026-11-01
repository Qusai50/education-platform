const nameInput = document.getElementById('name');
const msg = document.getElementById('msg');
const list = document.getElementById('list');

async function loadStudents() {
  const res = await fetch('/api/students');
  const students = await res.json();
  list.innerHTML = '';
  students.forEach(s => {
    const li = document.createElement('li');
    li.textContent = s.name;
    list.appendChild(li);
  });
}

document.getElementById('send').addEventListener('click', async () => {
  msg.textContent = '';
  const res = await fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nameInput.value })
  });
  const data = await res.json();
  if (res.ok) {
    msg.textContent = 'تم تسجيلك بنجاح ✅';
    nameInput.value = '';
    loadStudents();
  } else {
    msg.textContent = data.error;
  }
});

loadStudents();
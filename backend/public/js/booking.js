document.getElementById('nextBtn').addEventListener('click', async () => {
  const bookingData = {
    name: document.getElementById('name').value,
    contactNum: document.getElementById('contact').value,
    address: document.getElementById('address').value,
    email: document.getElementById('email').value
  };

  const token = localStorage.getItem('token');

  const res = await fetch('/api/booking/booking-customer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // ✅ token sent
    },
    body: JSON.stringify(bookingData)
  });

  const result = await res.json();
  console.log(result);

  if (res.ok && result.redirect) {
    window.location.href = result.redirect;
  } else {
    alert(result.message || "Something went wrong.");
  }
});

const rangeMonths = parseInt(document.getElementById("eventDate").dataset.rangeMonths);

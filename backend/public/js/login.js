document.querySelector(".loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("token", data.token); // ✅ store token
    window.location.href = "/package.html";
  } else {
    alert(data.message);
  }
});
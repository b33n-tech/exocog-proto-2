document.addEventListener("DOMContentLoaded", () => {
  const jsonText = document.getElementById("jsonText");
  const convertBtn = document.getElementById("convertBtn");
  const sendBtn = document.getElementById("sendBtn");
  const status = document.getElementById("status");
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");

  // Sidebar toggle
  toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });

  // Convertir le texte en JSON et télécharger
  convertBtn.addEventListener("click", () => {
    try {
      const jsonData = JSON.parse(jsonText.value);
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.json";
      a.click();
      URL.revokeObjectURL(url);
      status.textContent = "✅ JSON converti et téléchargé avec succès !";
      status.style.color = "green";
    } catch (err) {
      console.error(err);
      status.textContent = "❌ Erreur : le contenu n'est pas un JSON valide.";
      status.style.color = "red";
    }
  });

  // Envoyer à Stack 2
  sendBtn.addEventListener("click", () => {
    const stack2Url = "../stack2/index.html";
    window.open(stack2Url, "_blank").focus();
  });
});

// --- Navigation entre Stack1 et Stack2 ---
const btnStack1 = document.getElementById("btnStack1");
const btnStack2 = document.getElementById("btnStack2");
const frame1 = document.getElementById("frameStack1");
const frame2 = document.getElementById("frameStack2");

function showStack(stack) {
  frame1.classList.remove("active");
  frame2.classList.remove("active");
  if(stack==="stack1") frame1.classList.add("active");
  if(stack==="stack2") frame2.classList.add("active");
}

btnStack1.addEventListener("click", ()=> showStack("stack1"));
btnStack2.addEventListener("click", ()=> showStack("stack2"));

// Afficher Stack1 par défaut
showStack("stack1");

// --- Fonction pour envoyer JSON de Stack1 vers Stack2 ---
window.sendJSONToStack2 = function(jsonData){
  if(frame2.contentWindow && frame2.contentWindow.updateFromStack1){
    frame2.contentWindow.updateFromStack1(jsonData);
    alert("✅ JSON envoyé à Stack2 !");
  } else {
    alert("❌ Stack2 n'est pas encore chargé ou updateFromStack1 non défini");
  }
};

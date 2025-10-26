// Navigation entre stacks
function showStack(stack) {
  document.getElementById('frameStack1').style.display = stack === 'stack1' ? 'block' : 'none';
  document.getElementById('frameStack2').style.display = stack === 'stack2' ? 'block' : 'none';
}
showStack('stack1'); // Affiche Stack1 au lancement

// Exemple d'injection texte Stack1 → Stack2
// Dans stack1/script.js, tu peux appeler : 
// parent.updateStack2("nouveau texte");

function updateStack2(text) {
  const stack2Frame = document.getElementById('frameStack2');
  stack2Frame.contentWindow.updateText(text);
}

// Dans stack2/script.js, ajoute :
// function updateText(text) { document.getElementById('cadre').textContent = text; }

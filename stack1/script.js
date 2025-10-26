// --- Elements ---
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const archiveBtn = document.getElementById("archiveBtn");
const tasksContainer = document.getElementById("tasksContainer");
const promptsContainer = document.getElementById("promptsContainer");
const copiedMsg = document.getElementById("copiedMsg");
const llmSelect = document.getElementById("llmSelect");
const jsonInput = document.getElementById("jsonInput");
const sendToStack2Btn = document.getElementById("sendToStack2Btn");

// --- Tâches stockées localement ---
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// --- Format date ---
function formatDate(iso){
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2,'0');
  const month = String(d.getMonth()+1).padStart(2,'0');
  const hours = String(d.getHours()).padStart(2,'0');
  const minutes = String(d.getMinutes()).padStart(2,'0');
  return `${day}/${month} ${hours}:${minutes}`;
}

// --- Render tasks ---
function renderTasks() {
  tasksContainer.innerHTML = "";
  tasks.slice().sort((a,b)=> new Date(a.date)-new Date(b.date))
    .forEach(task=>{
      const li = document.createElement("li");
      li.className = "task-item";

      const taskText = document.createElement("div");
      taskText.className = "task-text";
      taskText.textContent = task.text + " (ajoutée le "+task.date.split("T")[0]+")";
      taskText.style.cursor = "pointer";

      if(task.comments?.length){
        taskText.title = task.comments.map(c=>`• ${c.text} (${formatDate(c.date)})`).join("\n");
      }

      const commentBlock = document.createElement("div");
      commentBlock.className = "comment-section";
      commentBlock.style.display = "none";

      const commentList = document.createElement("ul");
      commentList.className = "comment-list";
      if(task.comments?.length){
        task.comments.forEach(c=>{
          const cLi = document.createElement("li");
          cLi.textContent = `[${formatDate(c.date)}] ${c.text}`;
          commentList.appendChild(cLi);
        });
      }
      commentBlock.appendChild(commentList);

      const commentInputDiv = document.createElement("div");
      commentInputDiv.className = "comment-input";
      const commentInput = document.createElement("input");
      commentInput.placeholder = "Ajouter un commentaire…";
      const commentBtn = document.createElement("button");
      commentBtn.textContent = "+";
      commentBtn.addEventListener("click", ()=>{
        const val = commentInput.value.trim();
        if(val!==""){
          if(!task.comments) task.comments=[];
          task.comments.push({text: val, date: new Date().toISOString()});
          localStorage.setItem("tasks", JSON.stringify(tasks));
          commentInput.value="";
          renderTasks();
        }
      });
      commentInputDiv.appendChild(commentInput);
      commentInputDiv.appendChild(commentBtn);
      commentBlock.appendChild(commentInputDiv);

      li.appendChild(taskText);
      li.appendChild(commentBlock);

      taskText.addEventListener("click", ()=>{
        commentBlock.style.display = commentBlock.style.display==="none"?"flex":"none";
      });

      tasksContainer.appendChild(li);
    });
}

// --- Ajouter tâche ---
addBtn.addEventListener("click", ()=>{
  const text = taskInput.value.trim();
  if(text!==""){
    tasks.push({text,date:new Date().toISOString(),comments:[]});
    localStorage.setItem("tasks", JSON.stringify(tasks));
    taskInput.value="";
    renderTasks();
  }
});

// --- Archiver JSON ---
archiveBtn.addEventListener("click", ()=>{
  if(tasks.length===0){ alert("Aucune tâche à archiver !"); return; }
  const blob = new Blob([JSON.stringify(tasks,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `taches_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// --- Prompts ---
const prompts = [
  {id:"planifier", label:"Plan", text:"Transforme ces tâches en plan structuré étape par étape :"},
  {id:"prioriser", label:"Priorité", text:"Classe ces tâches par ordre de priorité et urgence :"},
  {id:"categoriser", label:"Catégories", text:"Range ces tâches dans des catégories logiques :"}
];

prompts.forEach(p=>{
  const btn = document.createElement("button");
  btn.textContent = p.label;
  btn.addEventListener("click", ()=>{
    const combined = p.text + "\n\n" + tasks.map(t=>{
      let str = "- "+t.text;
      if(t.comments?.length){
        str += "\n  Commentaires :\n" + t.comments.map(c=>`    - [${formatDate(c.date)}] ${c.text}`).join("\n");
      }
      return str;
    }).join("\n");
    navigator.clipboard.writeText(combined).then(()=>{
      copiedMsg.style.display="block";
      setTimeout(()=>copiedMsg.style.display="none",2000);
      window.open(llmSelect.value, "_blank");
    });
  });
  promptsContainer.appendChild(btn);
});

// --- Envoyer JSON à Stack 2 ---
sendToStack2Btn.addEventListener("click", ()=>{
  let raw = jsonInput.value.trim();
  if(!raw) { alert("Colle le JSON dans le textarea !"); return; }
  try{
    const data = JSON.parse(raw);
    const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stack2_input_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("✅ JSON envoyé et téléchargé pour Stack 2 !");
  }catch(err){
    alert("❌ JSON invalide !");
    console.error(err);
  }
});

// --- Initial render ---
renderTasks();

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const archiveBtn = document.getElementById("archiveBtn");
const tasksContainer = document.getElementById("tasksContainer");
const promptsContainer = document.getElementById("promptsContainer");
const copiedMsg = document.getElementById("copiedMsg");
const uploadJson = document.getElementById("uploadJson");
const llmSelect = document.getElementById("llmSelect");
const pasteDownloadBtn = document.getElementById("pasteDownloadBtn");
const sendStack2Btn = document.getElementById("sendStack2Btn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function formatDate(iso){
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

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

addBtn.addEventListener("click", ()=>{
  const text = taskInput.value.trim();
  if(text!==""){
    tasks.push({text,date:new Date().toISOString(),comments:[]});
    localStorage.setItem("tasks", JSON.stringify(tasks));
    taskInput.value="";
    renderTasks();
  }
});

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

const prompts = [
  {id:"planifier", label:"Plan", text:"Transforme ces tâches en plan structuré étape par étape :"},
  {id:"prioriser", label:"Priorité", text:"Classe ces tâches par ordre de priorité et urgence :"},
  {id:"categoriser", label:"Catégories", text:"Range ces tâches dans des catégories logiques :"}
];

prompts.forEach(p=>{
  const btn = document.createElement("button");
  btn.textContent = p.label;
  btn.addEventListener("click", ()=>{
    const clipboardContent = `${p.text}\n\n${JSON.stringify(tasks,null,2)}`;
    navigator.clipboard.writeText(clipboardContent)
      .then(()=>{ copiedMsg.style.display="block"; setTimeout(()=>copiedMsg.style.display="none",1500); });
    const llmUrl = llmSelect.value;
    const newWin = window.open(llmUrl,"_blank");
    if(newWin) newWin.focus();
  });
  promptsContainer.appendChild(btn);
});

renderTasks();

// --- Upload JSON
uploadJson.addEventListener("change", (e)=>{
  const files = Array.from(e.target.files);
  files.forEach(file=>{
    const reader = new FileReader();
    reader.onload = ev=>{
      try{
        const json = JSON.parse(ev.target.result);
        tasks = tasks.concat(json);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
      }catch(err){ console.error(err); alert("JSON invalide !"); }
    };
    reader.readAsText(file);
  });
});

// --- Coller depuis presse-papier & télécharger
pasteDownloadBtn.addEventListener("click", async ()=>{
  try{
    const text = await navigator.clipboard.readText();
    const json = JSON.parse(text);
    const blob = new Blob([JSON.stringify(json,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clipboard_json_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("✅ JSON copié depuis presse-papier et téléchargé !");
  }catch(err){ console.error(err); alert("❌ JSON invalide dans presse-papier !"); }
});

// --- Envoyer JSON à Stack2
sendStack2Btn.addEventListener("click", ()=>{
  if(window.parent && window.parent.sendJSONToStack2){
    window.parent.sendJSONToStack2(tasks);
  } else alert("❌ Impossible d'envoyer à Stack2 !");
});

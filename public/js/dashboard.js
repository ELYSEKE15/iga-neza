const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "index.html";
}
const progressList = document.getElementById("progress-list");
const messageEl = document.getElementById("message");
const summaryEl = document.getElementById("summary");
const sesSubject = document.getElementById('ses-subject');

function show(text) {
    messageEl.textContent = text;
}
function clearInput(ids) {
    for (const id of ids) {
        document.getElementById(id).value = "";
    }
}

async function api(path, options = {}) {
    const res = await fetch(path, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
    });
    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "index.html";
        return null;
    }
    const body = await res.json().catch(()=>({}));
    return { ok: res.ok,body};
}
function formatMinutes(total){
    const h = Math.floor(total / 60);
    const m = total % 60;
    if(h==0) return m + " min";
    return m===0 ? h + " h" : h + " h " + m + " min";
}
function addStat(label,value){
    const box = document.createElement("div");
    box.className  = "stat";
    const big = document.createElement("strong");
    big.textContent = value;
    const small = document.createElement("span");
    small.textContent = label;
    box.appendChild(big);
    box.appendChild(small);
    summaryEl.appendChild(box);
}
function makeBlocks(goalHours, studiedMinutes) {
    const blocks = document.createElement("div");
    blocks.className = "blocks";
    for (let i = 0; i < goalHours; i++) {
        const block = document.createElement("div");
        block.className = "block";
        const fill = document.createElement("div");
        fill.className = "block-fill";
        const share = Math.min(1, Math.max(0, (studiedMinutes - i * 60) / 60));
        fill.style.width = share * 100 + "%";
        block.appendChild(fill);
        blocks.appendChild(block);
    }
    return blocks;
}

async function deleteSubject(id,name){
    if(!window.confirm('Delete "' + '"and all its sessions?thsi cannot be undone')){
        return;
    }
    try{
        const result = await api("/api/subject" + id ,{method:DELETE});
        if(!result) return;
        if(result.ok){
            show(result.body.error || "Could not delete");
            return;
        }
        show("Subject deleted");
        await loadprogress();
    }
    catch(error){
        show("Could not reach the server");
        console.error(error);
    }
}
async function loadprogress() {
    const result = await api("/api/progress");
    if (!result) return;
    if (!result.ok) {
        show(result.body.error || "Could not load progress");
        return;
    }
    const data = result.body;
    progressList.textContent = "";
    sesSubject.textContent = "";
    summaryEl.textContent = "";

    if (data.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No subjects yet. Add your first one on the right.";
        progressList.appendChild(empty);
        return;
    }

    let totalMinutes = 0;
    let lowest = data[0];
    for (const item of data) {
        totalMinutes += item.studiedMinutes;
        if (item.percent < lowest.percent) lowest = item;
    }
    addStat("Studied this week", formatMinutes(totalMinutes));
    addStat("Subjects", String(data.length));
    addStat("Needs attention", lowest.percent >= 100 ? "All goals reached" : lowest.name);

    for (const item of data) {
        const row = document.createElement("article");
        row.className = "row";
        if (data.length > 1 && item === lowest && item.percent < 100) {
            row.classList.add("low");
        }

        const pct = document.createElement("div");
        pct.className = "pct";
        pct.textContent = item.percent + "%";

        const info = document.createElement("div");
        info.className = "info";
        const title = document.createElement("h3");
        title.textContent = item.name;
        const label = document.createElement("p");
        label.textContent = formatMinutes(item.studiedMinutes) + " of " + formatMinutes(item.goalHours * 60);



        const del = document.createElement("button");
        del.type = "button";
        del.className = "delete-btn";
        del.textContent = "Delete";
        del.setAttribute("aria-label", "delete " + item.name);
        
        del.addEventListener("click",()=>deleteSubject(item-subjectId,item.name));
        info.appendChild(title);
        info.appendChild(makeBlocks(item.goalHours, item.studiedMinutes));
        info.appendChild(label);
        info.appendChild(del);
        row.appendChild(pct);
        row.appendChild(info);
        progressList.appendChild(row);

        const option = document.createElement("option");
        option.value = item.subjectId;
        option.textContent = item.name;
        sesSubject.appendChild(option);
    }
}
document.getElementById('sub-btn').addEventListener("click", async () => {
    const name = document.getElementById('sub-name').value;
    const hours = Number(document.getElementById('sub-hours').value);

    if (!name || !hours) {
        show("all field are required");
        return;
    }
    try {
        show("Creating ...");
        const result = await api("/api/subjects", {
            method: "POST",
            body: JSON.stringify(
                {
                    name: name, weeklyGoalHours: hours
                }
            ),
        });
        if (!result) return;
        if (!result.ok) {
            show(result.body.error || "failed to create");
            return;
        }
        clearInput(["sub-name","sub-hours"]);
        document.getElementById("side-log").checked = true;
        show("Subject added")
        await loadprogress();
    }
    catch (error) {
        show("Could not reach the server");
        console.error(error);
    }
});


document.getElementById("ses-btn").addEventListener("click", async () => {
    const subjectId = sesSubject.value;
    const minutes = Number(document.getElementById('ses-minutes').value);
    const note = document.getElementById('ses-notes').value.trim();
    if (!subjectId) {
        show("Add a subject first");
        return;
    }
    if(!Number.isInteger(minutes) || minutes <1 || minutes >600){
        show("MInutes must be a whole number from 1 to 600");
        return;
    }

    const data = {subjectId,minutes};
    if(note) data.note = note;
    try {
    show("saving...");
        const result = await api("/api/sessions", {
            method: "POST",
            body: JSON.stringify(data)
        });
        if (!result) return;
        if (!result.ok) {
            show(result.body.error || "failed to log session ");
            return;
        }
        clearInput(["ses-minutes","ses-notes"]);
        show("Session logged");
        await loadprogress();
    }
    catch (error) {
        show("Could not reach the server");
        console.error(error);
    }
});

document.getElementById("logout-btn").addEventListener("click",async()=>{
    localStorage.removeItem("token");
    window.location.href="index.html";
});

if(token) loadprogress();

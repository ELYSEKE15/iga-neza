const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "index.html";
}
const progressList = document.getElementById("progress-list");
const messageEl = document.getElementById("message");
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
    return { ok: res.ok, body: await res.json() };
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
    for (const item of data) {
        const card = document.createElement("div");
        card.className = "hill-card";
        const title = document.createElement("h3");
        title.textContent = item.name;
        const bar = document.createElement("div");
        bar.className = "bar";
        const fill = document.createElement("div");
        fill.className = "bar-fill";
        fill.style.width = item.percent + "%";
        const label = document.createElement("p");
        label.textContent = item.studiedMinutes + " min of " + item.goalHours * 60;
        bar.appendChild(fill);
        card.appendChild(title);
        card.appendChild(bar);
        card.appendChild(label);
        progressList.appendChild(card);
        const option = document.createElement("option");
        option.value = item.subjectId;
        option.textContent = item.name;
        sesSubject.appendChild(option);

    }
}

document.getElementById('sub-btn').addEventListener("click", async () => {
    const name = document.getElementById('sub-name').value;
    const hours = document.getElementById('sub-hours').value;
    const convertHours = Number(hours);

    if (!name || !convertHours) {
        show("all field are required");
        return;
    }
    try {
        show("Creating ...");
        const result = await api("/api/subjects", {
            method: "POST",
            body: JSON.stringify(
                {
                    name: name, weeklyGoalHours: convertHours
                }
            ),
        });
        if (!result) return;
        if (!result.ok) {
            show(result.body.error || "failed to create");
            return;
        }
        document.getElementById('sub-name').value = "";
        document.getElementById('sub-hours').value = "";
        show("Subject added")
        await loadprogress();


    }
    catch (error) {
        show("Could not reach the server");
        console.error(error);
    }
});

loadprogress();


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
    show("saving");
        const result = await api("/api/sessions", {
            method: "POST",
            body: JSON.stringify(data)
        });
        if (!result) return;
        if (!result.ok) {
            show(result.body.error || "failed to create ");
            return;
        }
        clearInput(["ses-minutes","ses-notes"]);
        show("session logged");
        await loadprogress();
    }
    catch (error) {
        show("Could not reach the server");
        console.error(error);
    }
})
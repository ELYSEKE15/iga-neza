const messageEl =document.getElementById('message');

function show(text){
    messageEl.textContent = text;
}
async function postJson(path,data){
    const res =  await fetch(path,{
        method : "POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data),
    });
    const body = await res.json();
    return {ok:res.ok,body};
}
function clearInputs(ids){
    for (const id of ids){
        document.getElementById(id).value = "";
    }
}

document.getElementById('reg-btn').addEventListener("click",async()=>{
    const reg_name =document.getElementById('reg-name').value;
    const reg_email =document.getElementById('reg-email').value;
    const reg_password =document.getElementById('reg-password').value;
        if(!reg_name || !reg_email || !reg_password){
        show("all field required ");
        return;
    }
    try{
        show("creating account ....");
        const {ok,body} = await postJson("/api/auth/register",{
            name: reg_name,email:reg_email,password:reg_password
        });
        if(ok){
            show("account created. now log in");
            clearInputs(["reg-name","reg-email","reg-password"]);
        }
            
        else{
            show(body.error || "registration failed");
        }

    }
    catch(error){
        show("something went wrong");
        console.error(error);
    }
});


document.getElementById('log-btn').addEventListener("click",async()=>{
    const log_email=document.getElementById('log-email').value;
    const log_pass = document.getElementById('log-password').value;
    if (!log_email || !log_pass){
        show("all field are required");
        return;
    }
    try{
        show("loging in....")
        const {ok,body} = await postJson("/api/auth/login",{
            email:log_email,password:log_pass
        });
        if(!ok){
            show(body.error || "login failed");
            return;
        }
        clearInputs(["log_password"]);
        
            localStorage.setItem("token",body.token);
            show("logged in as " + body.user.name);

    }
    catch(error){
        show("Could  not reach the server");
        console.error(error);
    }
});
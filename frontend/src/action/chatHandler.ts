

export const sendChat = async(messageBody:string,friendId:string, BACKEND_URL:string )=>{
    const user = localStorage.getItem("user");
    if(!user) return;
    const username = (JSON.parse(user)).username;
    console.log({username, friendId, messageBody})
    try {
        const res = await fetch(BACKEND_URL + "/api/sendChat",{
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json"},
            body : JSON.stringify({ username, friendId, messageBody })
        })
        const data = (await res.json()).data;
        console.log(data);
    } catch (error) {
        console.log("Error in sendChat",error);
        throw new Error("Something went wrong!")
    }
}
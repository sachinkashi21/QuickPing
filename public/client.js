

// Get references to components only once
const form = document.getElementById('send-msg-form');
const msgInput = document.getElementById('content-form');
const fileInput = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const imagePreviewContainer = document.getElementById('image-preview-container');
const box = document.querySelector('.box');
const loadingIndicator = document.getElementById('loading-indicator');
const inputs = [msgInput, fileInput, form.querySelector('button')];
let isSubmitting = false; // Flag to prevent multiple submissions

const socket = io();

const isGroup=document.getElementById("isGroup").getAttribute("modelId");
let roomId;
let toUserId;
if(isGroup==="true"){
    toUserId=document.getElementById("groupId").getAttribute("modelId"); 
    roomId=toUserId;
} else{
    toUserId=document.getElementById("toUserId").getAttribute("modelId");
    const fromUserId=document.getElementById("fromUserId").getAttribute("modelId");
    roomId=(toUserId>fromUserId)?fromUserId+toUserId:toUserId+fromUserId;
}


socket.emit("join-room", roomId);   

socket.on("client-total", (data) => {
    console.log(data);
});

// Image preview handler
fileInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };

        reader.readAsDataURL(file);
    } else {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
    }
});

// Form submission handler
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent multiple submissions
    isSubmitting = true; // Set flag to true

    // Prepare form data
    const formData = new FormData();
    if (fileInput.files[0]) {
        formData.append("image", fileInput.files[0]);
    }
    formData.append("Msg", msgInput.value);

    // Show loading indicator and disable inputs
    loadingIndicator.style.display = 'block';
    inputs.forEach(input => input.disabled = true);

    try {
        const res = await fetch(`/chats/${toUserId}`, {
            method: "POST",
            credentials: "same-origin",
            body: formData,
        });

        const jsonRes = await res.json();
        const Msg = jsonRes[0].content || null;
        const uploadedImageUrl = jsonRes[0].image?.url || null;

        // Add message to UI and emit message event
        addMsgToUI(true, Msg, uploadedImageUrl);
        socket.emit("message", {roomId, Msg, uploadedImageUrl });

        // Reset form inputs
        fileInput.value = "";
        msgInput.value = "";
        imagePreview.src = "";
        imagePreview.style.display = "none";
    } catch (error) {
        console.error("Error while sending message:", error);
    } finally {
        // Hide loading indicator, re-enable inputs, and reset flag
        loadingIndicator.style.display = 'none';
        inputs.forEach(input => input.disabled = false);
        isSubmitting = false; // Reset flag
    }
});

// Add message to UI
function addMsgToUI(isMe, Msg, imageUrl = null) {
    const newChat = document.createElement("div");
    newChat.classList.add("chat", isMe ? "chat-me" : "chat-you");

    const arr = Date().toString().split(" ");
    const date = `${arr[2]} ${arr[1]}, ${arr[3]} (${arr[0]})`;

    newChat.innerHTML = `
        <div class="content">
            ${imageUrl ? `<img src="${imageUrl}" alt="Uploaded Image" class="chat-image" style="max-width: 150px; border-radius: 10px;">` : ""}
            <p>${Msg}</p>
        </div>
        <p class="date">${date}</p>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <p class="date">${arr[4].slice(0, 5)}</p>
    `;
    box.append(newChat);
    scrlToBtm();
}

// Scroll to bottom of chat box
function scrlToBtm() {
    box.scrollTo(0, box.scrollHeight);
}

// Listen for incoming chat messages
socket.on("chat-message", (data) => {
    const { Msg, uploadedImageUrl } = data;
    addMsgToUI(false, Msg, uploadedImageUrl || null);
});

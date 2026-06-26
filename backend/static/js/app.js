const TARGET_WIDTH = 640;
const TARGET_HEIGHT = 480;

const form = document.getElementById("verify-form");
const pinflInput = document.getElementById("pinfl");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");
const placeholder = document.getElementById("camera-placeholder");
const fileInput = document.getElementById("file-input");
const btnStartCamera = document.getElementById("btn-start-camera");
const btnCapture = document.getElementById("btn-capture");
const btnRetake = document.getElementById("btn-retake");
const btnSubmit = document.getElementById("btn-submit");
const loading = document.getElementById("loading");
const resultEl = document.getElementById("result");

let stream = null;
let imageBase64 = null;

function getDeviceId() {
  const key = "kyc_device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function updateSubmitState() {
  const pinflValid = /^[0-9]{14}$/.test(pinflInput.value.trim());
  btnSubmit.disabled = !(pinflValid && imageBase64);
}

pinflInput.addEventListener("input", () => {
  pinflInput.value = pinflInput.value.replace(/\D/g, "").slice(0, 14);
  pinflInput.classList.toggle("invalid", pinflInput.value.length > 0 && pinflInput.value.length !== 14);
  updateSubmitState();
});

function showPreview(dataUrl) {
  preview.src = dataUrl;
  preview.hidden = false;
  video.hidden = true;
  placeholder.hidden = true;
  btnCapture.hidden = true;
  btnStartCamera.hidden = true;
  btnRetake.hidden = false;
}

function resetCamera() {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  imageBase64 = null;
  preview.hidden = true;
  video.hidden = true;
  placeholder.hidden = false;
  btnCapture.hidden = true;
  btnStartCamera.hidden = false;
  btnRetake.hidden = true;
  updateSubmitState();
}

function resizeToBase64(source) {
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(source, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return dataUrl.split(",")[1];
}

btnStartCamera.addEventListener("click", async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: TARGET_WIDTH }, height: { ideal: TARGET_HEIGHT } },
      audio: false,
    });
    video.srcObject = stream;
    video.hidden = false;
    placeholder.hidden = true;
    btnCapture.hidden = false;
    btnStartCamera.hidden = true;
    btnRetake.hidden = false;
  } catch {
    showError("Kameraga ruxsat berilmadi. Fayl orqali yuklang.");
  }
});

btnCapture.addEventListener("click", () => {
  imageBase64 = resizeToBase64(video);
  showPreview(canvas.toDataURL("image/jpeg", 0.85));
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  updateSubmitState();
});

btnRetake.addEventListener("click", resetCamera);

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    imageBase64 = resizeToBase64(img);
    canvas.toBlob((blob) => {
      showPreview(URL.createObjectURL(blob));
    }, "image/jpeg", 0.85);
    updateSubmitState();
  };
  img.src = URL.createObjectURL(file);
  fileInput.value = "";
});

function hideResult() {
  resultEl.hidden = true;
  resultEl.className = "result";
  resultEl.innerHTML = "";
}

function showSuccess(data, message) {
  resultEl.hidden = false;
  resultEl.className = "result success";
  resultEl.innerHTML = `
    <h3>✓ Shaxs tasdiqlandi</h3>
    <p>${escapeHtml(message)}</p>
    <dl class="person-data">
      <dt>Familiya</dt><dd>${escapeHtml(data.surName || "—")}</dd>
      <dt>Ism</dt><dd>${escapeHtml(data.name || "—")}</dd>
      <dt>Otasining ismi</dt><dd>${escapeHtml(data.patronymicName || "—")}</dd>
      <dt>JSHSHIR</dt><dd>${escapeHtml(String(data.pinfl || "—"))}</dd>
    </dl>
  `;
}

function showError(message, code) {
  resultEl.hidden = false;
  resultEl.className = "result error";

  let hint = "";
  if (code === 3) {
    hint = "<p>Yuz pasportdagi surat bilan mos kelmadi. Qayta urinib ko'ring.</p>";
  } else if (code === 10) {
    hint = "<p>Yuz jonligi tasdiqlanmadi. Yaxshi yoritilgan joyda qayta suratga oling.</p>";
  }

  resultEl.innerHTML = `
    <h3>✗ Tasdiqlanmadi</h3>
    <p>${escapeHtml(message)}</p>
    ${hint}
  `;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getErrorMessage(code) {
  const messages = {
    3: "Shaxs tasdiqlanmadi — yuz pasport surati bilan mos kelmadi",
    10: "Yuz jonligi tasdiqlanmadi — surat sifati past yoki texnik muammo",
  };
  return messages[code] || "Yuzni solishtirishda xatolik yuz berdi";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideResult();

  const pinfl = pinflInput.value.trim();
  if (!/^[0-9]{14}$/.test(pinfl)) {
    showError("JSHSHIR 14 ta raqamdan iborat bo'lishi kerak");
    return;
  }
  if (!imageBase64) {
    showError("Avval yuz suratini oling yoki yuklang");
    return;
  }

  form.hidden = true;
  loading.hidden = false;
  btnSubmit.disabled = true;

  try {
    const response = await fetch("/kyc/compare-face", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pinfl,
        image: imageBase64,
        deviceId: getDeviceId(),
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showSuccess(data.data, data.message || "Shaxsingiz tasdiqlandi");
    } else if (data.success === false) {
      showError(data.message || getErrorMessage(data.code), data.code);
    } else {
      const detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
      showError(detail || "Noma'lum xatolik");
    }
  } catch {
    showError("Server bilan bog'lanishda xatolik. Keyinroq qayta urinib ko'ring.");
  } finally {
    loading.hidden = true;
    form.hidden = false;
    updateSubmitState();
  }
});

updateSubmitState();

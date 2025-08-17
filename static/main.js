async function summarize() {
  const transcript = document.getElementById("transcript").value.trim();
  const instruction = document.getElementById("instruction").value.trim();

  if (!transcript) {
    alert("Please provide a transcript (either upload a file OR type it).");
    return;
  }

  document.getElementById("loader").classList.remove("hidden");
  document.getElementById("summaryCard").classList.add("hidden");

  try {
    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, instruction }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    document.getElementById("summaryOutput").textContent = data.summary_markdown;
    document.getElementById("summaryCard").classList.remove("hidden");
  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    document.getElementById("loader").classList.add("hidden");
  }
}

function copySummary() {
  const text = document.getElementById("summaryOutput").textContent;
  navigator.clipboard.writeText(text);
  alert("✅ Summary copied to clipboard!");
}

function downloadSummary() {
  const text = document.getElementById("summaryOutput").textContent;
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "meeting_summary.txt";
  link.click();
}

async function sendEmail() {
  const summary = document.getElementById("summaryOutput").textContent;
  if (!summary) {
    alert("Generate a summary before sending email.");
    return;
  }

  const recipients = prompt("Enter recipient emails (comma separated):");
  if (!recipients) return;

  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipients: recipients.split(",").map((e) => e.trim()),
        subject: "Meeting Summary",
        body_markdown: summary,
      }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    alert("📧 Email sent successfully!");
  } catch (err) {
    alert("Error sending email: " + err.message);
  }
}

// 📂 Handle file upload (exclusive mode)
async function uploadFile() {
  const fileInput = document.getElementById("fileUpload");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    document.getElementById("loader").classList.remove("hidden");

    const res = await fetch("/api/upload-file", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // ✅ Insert extracted text into transcript
    document.getElementById("transcript").value = data.text || "";

    // ✅ Disable manual typing if a file is uploaded
    document.getElementById("transcript").setAttribute("disabled", "true");

    alert("📂 File uploaded successfully. Transcript inserted!");
  } catch (err) {
    alert("Upload failed: " + err.message);
  } finally {
    document.getElementById("loader").classList.add("hidden");
  }
}

// If user types manually, clear file input & allow typing
document.getElementById("transcript").addEventListener("input", () => {
  const transcriptBox = document.getElementById("transcript");
  if (transcriptBox.value.trim().length > 0) {
    document.getElementById("fileUpload").value = "";
    transcriptBox.removeAttribute("disabled");
  }
});

// --- Event bindings ---
document.getElementById("summarizeBtn").addEventListener("click", summarize);
document.getElementById("copyBtn").addEventListener("click", copySummary);
document.getElementById("downloadBtn").addEventListener("click", downloadSummary);
document.getElementById("emailBtn").addEventListener("click", sendEmail);
document.getElementById("uploadBtn").addEventListener("click", uploadFile);

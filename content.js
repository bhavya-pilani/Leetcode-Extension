(async () => {
  let title = null;

  // 1. Try extracting title from meta tag
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    const match = (meta.getAttribute("content") || "").match(
      /question\?\s(.+?)\s-\s/
    );
    if (match && match[1]) title = match[1].trim();
  }

  // 2. Fallback: try <h1>
  if (!title) {
    const h1 = document.querySelector("h1");
    if (h1) title = h1.innerText.trim();
  }

  if (!title) {
    console.warn("❗ Unable to extract LeetCode problem title.");
    return;
  }

  console.log("✅ Detected problem:", title);

  try {
    const response = await fetch("http://localhost:3000/api/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    const data = await response.json();
    const hints = data.hints || [data.hint || "No hint available"];
    let currentHintIndex = 0;

    // 🔲 UI Elements
    const hintBox = document.createElement("div");
    hintBox.className = "leetcode-hint-box";
    hintBox.style.display = "none"; // initially hidden

    const hintText = document.createElement("div");
    hintText.className = "hint-text";
    hintText.innerHTML = hints[currentHintIndex]
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");

    const nextBtn = document.createElement("button");
    nextBtn.className = "next-hint-btn";
    nextBtn.innerText = "Next Hint";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "hint-toggle-btn";
    toggleBtn.innerText = "💡 Hint";

    // 🧱 Build
    hintBox.appendChild(hintText);
    hintBox.appendChild(nextBtn);
    document.body.appendChild(hintBox);
    document.body.appendChild(toggleBtn);

    // 🎯 Toggle show/hide
    toggleBtn.addEventListener("click", () => {
      hintBox.style.display =
        hintBox.style.display === "none" ? "block" : "none";
    });

    // ⏭️ Cycle hints
    nextBtn.addEventListener("click", () => {
      currentHintIndex = (currentHintIndex + 1) % hints.length;
      hintText.innerHTML = hints[currentHintIndex]
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
    });

    // 🖱️ Draggable logic
    let isDragging = false;
    let offsetX = 0,
      offsetY = 0;

    hintBox.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - hintBox.offsetLeft;
      offsetY = e.clientY - hintBox.offsetTop;
      hintBox.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        hintBox.style.left = `${e.clientX - offsetX}px`;
        hintBox.style.top = `${e.clientY - offsetY}px`;
        hintBox.style.right = "auto";
        hintBox.style.bottom = "auto";
        hintBox.style.position = "fixed";
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      hintBox.style.cursor = "grab";
    });
  } catch (err) {
    console.error("🚨 Error fetching hint:", err);
  }
})();

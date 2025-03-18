document.addEventListener("DOMContentLoaded", () => {
  const typingElement = document.getElementById("typing-text");
  const codeSection = document.querySelector(".code-section");
  const scriptContainer = document.querySelector(".script-section");

  if (!typingElement || !codeSection || !scriptContainer) return;

  const text = typingElement.getAttribute("data-text");
  let index = 0;

  function type() {
    if (index < text.length) {
      typingElement.innerHTML = text.substring(0, index + 1);
      index++;
      setTimeout(type, 100); // タイピング速度を調整
    } else {
      scriptContainer.classList.add("show"); // script タグを表示
      setTimeout(() => {
        codeSection.classList.add("show"); // code-section を表示
      }, 1000);
    }
  }

  typingElement.innerHTML = "";
  type(); // タイピング開始
});

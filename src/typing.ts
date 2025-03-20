document.addEventListener("DOMContentLoaded", () => {
  const typingElement = document.getElementById(
    "typing-text"
  ) as HTMLElement | null;
  const codeSection = document.querySelector(
    ".code-section"
  ) as HTMLElement | null;
  const scriptContainer = document.querySelector(
    ".script-section"
  ) as HTMLElement | null;

  if (!typingElement || !codeSection || !scriptContainer) return;

  const text: string | null = typingElement.getAttribute("data-text");
  if (!text) return; // `data-text` がない場合は処理を終了

  let index = 0;

  function type(): void {
    if (text && index < text.length) {
      if (typingElement) {
        typingElement.innerHTML = text.substring(0, index + 1);
      }
      index++;
      setTimeout(type, 50); // タイピング速度を調整
    } else {
      if (scriptContainer) {
        scriptContainer.classList.add("show"); // script タグを表示
      }
      setTimeout(() => {
        if (codeSection) {
          codeSection.classList.add("show"); // code-section を表示
        }
      }, 1000);
    }
  }

  typingElement.innerHTML = "";
  type(); // タイピング開始
});

const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector("#site-nav");
const form = document.querySelector("#brief");
const success = document.querySelector("#form-success");
const preview = document.querySelector("#form-preview");
const mailtoLink = document.querySelector("#mailto-link");
const resetButton = document.querySelector("#form-reset");
const emailLink = document.querySelector("#contact-email");

const contactEmail = emailLink ? emailLink.textContent.trim() : "hello@pryamaya.example";

function setMenu(open) {
  nav.classList.toggle("is-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("nav-open", open);
}

menuBtn.addEventListener("click", () => {
  setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
});

nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMenu(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
  }
});

const desktopNav = window.matchMedia("(min-width: 980px)");
desktopNav.addEventListener("change", (event) => {
  if (event.matches) {
    setMenu(false);
  }
});

const spyLinks = [...nav.querySelectorAll("a[href^='#']")];
const linkById = new Map(
  spyLinks.map((link) => [link.getAttribute("href").slice(1), link])
);

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      const current = linkById.get(entry.target.id);
      if (!current) {
        return;
      }
      spyLinks.forEach((link) => link.removeAttribute("aria-current"));
      current.setAttribute("aria-current", "true");
    });
  },
  { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
);

document.querySelectorAll("[data-spy]").forEach((section) => spy.observe(section));

const rules = [
  {
    name: "name",
    errorId: "name-error",
    check: (value) => value.trim().length >= 2,
    message: "Как к вам обращаться? Нужно хотя бы два символа.",
  },
  {
    name: "email",
    errorId: "email-error",
    check: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    message: "Похоже, в почте опечатка.",
  },
  {
    name: "task",
    errorId: "task-error",
    check: (value) => value.trim() !== "",
    message: "Выберите формат текста.",
  },
  {
    name: "message",
    errorId: "message-error",
    check: (value) => value.trim().length >= 20,
    message: "Опишите задачу чуть подробнее — хотя бы пару предложений.",
  },
];

function fieldOf(control) {
  return control.closest(".field");
}

function clearField(control) {
  const field = fieldOf(control);
  const error = field.querySelector(".error");
  field.classList.remove("is-invalid");
  error.textContent = "";
  control.removeAttribute("aria-invalid");
  control.removeAttribute("aria-describedby");
}

function setFieldError(control, errorId, message) {
  const field = fieldOf(control);
  const error = field.querySelector(".error");
  field.classList.add("is-invalid");
  error.textContent = message;
  control.setAttribute("aria-invalid", "true");
  control.setAttribute("aria-describedby", errorId);
}

form.addEventListener("input", (event) => {
  if (event.target instanceof HTMLElement && fieldOf(event.target)) {
    clearField(event.target);
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  let firstInvalid = null;

  rules.forEach((rule) => {
    const control = form.elements[rule.name];
    if (rule.check(control.value)) {
      clearField(control);
      return;
    }
    setFieldError(control, rule.errorId, rule.message);
    if (!firstInvalid) {
      firstInvalid = control;
    }
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const task = form.elements.task.value.trim();
  const budget = form.elements.budget.value.trim();
  const message = form.elements.message.value.trim();
  const lines = [
    `Имя: ${name}`,
    `Почта для ответа: ${email}`,
    `Формат: ${task}`,
  ];

  if (budget) {
    lines.push(`Бюджет: ${budget}`);
  }
  lines.push("", message);

  const body = lines.join("\n");
  const subject = `Задача с сайта — ${task}`;
  preview.textContent = body;
  mailtoLink.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  form.hidden = true;
  success.hidden = false;
  success.focus();
});

resetButton.addEventListener("click", () => {
  success.hidden = true;
  form.hidden = false;
  form.elements.name.focus();
});

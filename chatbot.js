document.addEventListener("DOMContentLoaded", () => {
  const chatToggle =
    document.getElementById("chatToggle") ||
    document.getElementById("chatbot-button");

  const chatWindow =
    document.getElementById("chatWindow") ||
    document.getElementById("chatbot-box");

  const chatMessages = document.getElementById("chatMessages");
  const chatInputWrapper = document.getElementById("chatInputWrapper");
  const chatInput = document.getElementById("chatInput");
  const chatSend = document.getElementById("chatSend");

  if (!chatToggle || !chatWindow || !chatMessages) return;

  let firstOpen = true;

  const appointment = {
    doctor: null,
    time: null,
    name: null,
    phone: null
  };

  let awaiting = null;

  const doctors = [
    "Ахметов Нурлан — Терапевт",
    "Садыкова Айгуль — Кардиолог",
    "Иманбаев Руслан — Невролог",
    "Жумагалиева Алия — Эндокринолог",
    "Касымов Ерлан — Хирург",
    "Абдрахманова Динара — Гинеколог",
    "Турсынбеков Азамат — Уролог",
    "Нурбекова Сауле — Педиатр",
    "Исламов Марат — Офтальмолог"
  ];

  const availableTimes = [
    "10:00","11:00","12:00",
    "14:00","15:00","16:00",
    "17:00","18:00"
  ];

  if (chatInputWrapper) chatInputWrapper.classList.add("hidden");

  function showInput() {
    chatInputWrapper.classList.remove("hidden");
    chatInput.focus();
  }

  function hideInput() {
    chatInputWrapper.classList.add("hidden");
  }

  chatToggle.onclick = () => {
    chatWindow.classList.toggle("hidden");

    if (firstOpen) {
      firstOpen = false;
      botTyping(() => {
        botMessage(
          "Здравствуйте 👋<br>Я администратор <b>AL-NUR INTERNATIONAL CLINIC</b>.<br>Чем могу помочь?"
        );
        showQuickButtons();
      });
    }
  };

  chatSend.onclick = sendText;
  chatInput.addEventListener("keypress", e => {
    if (e.key === "Enter") sendText();
  });

  function sendText() {
    const text = chatInput.value.trim();
    if (!text) return;

    userMessage(text);
    chatInput.value = "";

    botTyping(() => handleLogic(text));
  }

  function userMessage(text) {
    chatMessages.innerHTML += `
      <div class="text-right mt-2">
        <div class="inline-block bg-blue-600 text-white rounded-xl px-3 py-2 text-sm">
          ${text}
        </div>
      </div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function botMessage(text) {
    chatMessages.innerHTML += `
      <div class="mt-2">
        <div class="inline-block bg-gray-100 text-gray-800 rounded-xl px-3 py-2 text-sm">
          ${text}
        </div>
      </div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function botTyping(callback) {
    const t = document.createElement("div");
    t.className = "mt-2 text-sm text-gray-400 italic";
    t.textContent = "Администратор печатает…";
    chatMessages.appendChild(t);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      t.remove();
      callback();
    }, 900);
  }

  function showQuickButtons() {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap gap-2 mt-3";

    [
      { label: "🩺 Записаться к врачу", v: "запись" },
      { label: "💬 Консультация", v: "консультация" }
    ].forEach(b => {
      const btn = document.createElement("button");
      btn.className =
        "text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full";
      btn.textContent = b.label;
      btn.onclick = () => {
        userMessage(b.label);
        wrap.remove();
        botTyping(() => handleLogic(b.v));
      };
      wrap.appendChild(btn);
    });

    chatMessages.appendChild(wrap);
  }

  function showDoctorsButtons() {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-2 mt-3";

    doctors.forEach(name => {
      const btn = document.createElement("button");
      btn.className =
        "text-left text-sm bg-white border rounded-xl px-3 py-2";
      btn.textContent = "👨‍⚕️ " + name;

      btn.onclick = () => {
        appointment.doctor = name;
        awaiting = "time";
        userMessage(name);
        wrap.remove();

        botTyping(() => {
          botMessage("Выберите удобное время приёма:");
          showTimeButtons();
        });
      };
      wrap.appendChild(btn);
    });

    chatMessages.appendChild(wrap);
  }

  function showTimeButtons() {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap gap-2 mt-3";

    availableTimes.forEach(time => {
      const btn = document.createElement("button");
      btn.className =
        "text-sm bg-white border rounded-full px-4 py-1.5";
      btn.textContent = time;

      btn.onclick = () => {
        appointment.time = time;
        awaiting = "name";
        userMessage(time);
        wrap.remove();
        showInput();

        botTyping(() => {
          botMessage("Пожалуйста, напишите ваше <b>имя и фамилию</b>.");
        });
      };
      wrap.appendChild(btn);
    });

    chatMessages.appendChild(wrap);
  }

  function handleLogic(text) {
    const lower = text.toLowerCase();

    if (lower.includes("запис")) {
      botMessage("К какому специалисту вы хотите записаться?");
      showDoctorsButtons();
      return;
    }

    if (awaiting === "name") {
      appointment.name = text
        .split(" ")
        .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
      awaiting = "phone";
      showInput();

      botMessage(`Спасибо, <b>${appointment.name}</b> 😊<br>Введите телефон.`);
      return;
    }

    if (awaiting === "phone") {
      appointment.phone = text;
      awaiting = null;
      hideInput();

      fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: appointment.name,
          phone: appointment.phone,
          doctorId: appointment.doctor,
          time: appointment.time,
          source: "chatbot"
        })
      });

      botMessage(
        "✅ Заявка отправлена!<br>Администратор свяжется с вами."
      );
      return;
    }

    botMessage("Уточните, пожалуйста, запись или консультация 😊");
  }
});
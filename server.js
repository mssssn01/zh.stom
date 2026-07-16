const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("../frontend"));

app.post("/api/appointments", (req, res) => {
  const {
    name,
    phone,
    service,
    doctor,
    appointment_date,
    appointment_time,
    message
  } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Имя и телефон обязательны" });
  }

  const sql = `
    INSERT INTO appointments (
      name,
      phone,
      service,
      doctor,
      appointment_date,
      appointment_time,
      message,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      name,
      phone,
      service || "",
      doctor || "",
      appointment_date || "",
      appointment_time || "",
      message || "",
      "new"
    ],
    function (err) {
      if (err) {
        console.error("INSERT ERROR:", err.message);
        return res.status(500).json({ error: err.message });
      }

      res.json({ success: true, id: this.lastID });
    }
  );
});

app.get("/api/admin/appointments", (req, res) => {
  db.all("SELECT * FROM appointments ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Ошибка базы данных" });
    }

    res.json(rows);
  });
});

app.patch("/api/admin/appointments/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["new", "in_progress", "done"].includes(status)) {
    return res.status(400).json({ error: "Неверный статус" });
  }

  db.run(
    "UPDATE appointments SET status = ? WHERE id = ?",
    [status, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Ошибка базы данных" });
      }

      res.json({ success: true });
    }
  );
});

app.delete("/api/admin/appointments/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM appointments WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Ошибка базы данных" });
    }

    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
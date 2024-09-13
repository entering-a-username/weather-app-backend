const express = require("express");
const path = require("path");

require("dotenv").config();

const app = express();

app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));


app.post("/api", async (req, res) => {
    const data = req.body;
    let response;

    if (data.forecast) {
        response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${data.city}&appid=${process.env.API_KEY}&units=metric`);
    } else if (data.longitude) {
        response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${data.latitude}&lon=${data.longitude}&appid=${process.env.API_KEY}&units=metric`);
    } else if (data.city) {
        response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${data.city}&appid=${process.env.API_KEY}&units=metric`);
    }


    const result = await response.json();
    res.send(result);
});

app.listen(3030)
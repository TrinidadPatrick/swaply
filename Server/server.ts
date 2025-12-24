import app from "./index.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, (data) => {
    console.log(`🚀 Server running on port ${PORT}`);
})
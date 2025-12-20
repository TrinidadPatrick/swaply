import app from ".";

const PORT = process.env.PORT || 3000;

app.listen(PORT, (data) => {
    console.log(`🚀 Server running on port ${PORT}`);
})
const express = require('express');
const connectDb = require('./config/dbConnection');
const dotenv = require('dotenv').config();
const errorHandler = require('./middleware/errorHandler');
const userRoutes=require("./routes/userRoutes");
const companyRoutes=require("./routes/companyRoutes");
const projectRoutes=require("./routes/projectRoutes");
const emailRoutes=require("./routes/emailRoutes");
const notificationRoutes=require("./routes/notificationRoutes");
const loggerHandler = require('./middleware/loggerHandler');
const effortRoutes = require('./routes/effortRoutes');
const contractRoutes = require('./routes/contractRoutes');
const bodyParser = require('body-parser');
const socketHandler = require('./socket/socketHandler');
const projectFavoriteRoutes = require('./routes/projectFavoriteRoutes');
const http = require('http');
const app = express();

const path = require('path');
const cors = require("cors");

const httpServer = http.createServer(app);
socketHandler(httpServer);


const port = process.env.PORT || 5000;

connectDb();

app.use(
  cors({
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(loggerHandler);
app.use("/api/projects",projectRoutes);
app.use("/api/email",emailRoutes);
app.use("/api/users",userRoutes);
app.use("/api/company",companyRoutes);
app.use("/api/effort",effortRoutes);
app.use("/api/contracts",contractRoutes);
app.use("/api/notifications",notificationRoutes);
app.use("/api/favoriteProjects",projectFavoriteRoutes);
app.use("/feFiles",express.static(path.join(__dirname, 'feFiles')));
app.use("/files",express.static(path.join(__dirname, 'files')));
app.use(errorHandler);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Health check passed" });
});

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

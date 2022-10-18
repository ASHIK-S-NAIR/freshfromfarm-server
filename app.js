const dotenv = require("dotenv");
dotenv.config();

const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  transports: ["websocket", "polling"],
});
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const port = process.env.PORT || 8000;

// Middlewares
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(express.static("static"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//DB connection
mongoose.connect(process.env.DATABASE, {}).then(() => {
  console.log("DB connected");
});

// routes
const authRoute = require("./src/api/v1/routes/auth");
const userRoute = require("./src/api/v1/routes/user");
const employeeRoute = require("./src/api/v1/routes/employee");
const productRoute = require("./src/api/v1/routes/product");
const orderRoute = require("./src/api/v1/routes/order");
const { countOrders, getAllOrdersWebSocket } = require("./src/api/v1/controllers/order");
const { countProducts, getAllProductsWebSocket } = require("./src/api/v1/controllers/product");
const { countEmployers, getAllEmployeesWebSocket } = require("./src/api/v1/controllers/employee");
const { countCustomers, getCustomers } = require("./src/api/v1/controllers/user");

// My routes
app.use("/api/v1/", authRoute);
app.use("/api/v1/", userRoute);
app.use("/api/v1/", productRoute);
app.use("/api/v1/", orderRoute);
app.use("/api/v1/", employeeRoute);

// app.get("/", (req, res) => {
//   res.send("revenew dipp");
// });

io.on("connection", async (client) => {
  const setValues = async () => {
    var countValues = {};
    const orderCount = await countOrders();
    countValues["orderCount"] = orderCount;
    const productCount = await countProducts();
    countValues["productCount"] = productCount;
    const employerCount = await countEmployers();
    countValues["employerCount"] = employerCount;
    const customerCount = await countCustomers();
    countValues["customerCount"] = customerCount;
    return countValues;
  };

  const setCommentValues = async () => {
    var commentArray = {};
    const orderCommentArray = await getAllOrdersWebSocket('all');
    commentArray['orderCommentArray'] = orderCommentArray;
    const productCommentArray = await getAllProductsWebSocket('all');
    commentArray['productCommentArray'] = productCommentArray;
    const employeeCommentArray = await getAllEmployeesWebSocket('all');
    commentArray['employeeCommentArray'] = employeeCommentArray;
    const customerCommentArray = await getCustomers();
    commentArray['customerCommentArray'] = customerCommentArray;
    return commentArray;
  };

   setInterval(async () => {
    client.emit("statusValues", await setValues());
  }, 10000);
   setInterval(async () => {
    client.emit("commentArray", await setCommentValues());
  }, 10000);
});

app.get("*", async (req, res) => {
  res.sendFile(path.join(__dirname, "static/index.html"));
});

http.listen(port, () => {
  console.log(`Server is running on : ${port}`);
});

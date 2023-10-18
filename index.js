const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const expressSession = require("express-session");
const bcrypt = require("bcrypt");
const app = express();

const User = require("./models/User.js"); // Define a User model

app.use(expressSession({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// ...

// Passport configuration
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// ...

const Project = require("./projectSchema.js");

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Connect to MongoDB
const uri =
  "mongodb+srv://techprime:techprime@cluster0.jeqgekk.mongodb.net/your-database-name";
// Replace 'your-database-name' with the actual name of your database.
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to MongoDB!");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit(1);
  });

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Success Achieved! Backend is Up and Running 🚀 🎉💼🌟");
});


// Registration route
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username });
    await User.register(user, password, (err, user) => {
      if (err) {
        console.error(err);
        res.status(500).send({ error: 'Registration failed' });
      } else {
        res.status(201).send({ message: 'Registration successful' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Registration failed' });
  }
});

// Login route
app.post('/login', passport.authenticate('local'), (req, res) => {
  res.status(200).send({ message: 'Login successful' });
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      // Handle any potential error here, e.g., logging the error
      console.error(err);
    }
    res.status(200).send({ message: 'Logout successful' });
  });
});


app.post("/project", async (req, res) => {
  try {
    const newProject = await Project.create(req.body);
    console.log(newProject);
    res.status(201).send(newProject);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.get("/project", async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).send(projects);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/projects/deptwise", async (req, res) => {
  try {
    let chartData = await Project.aggregate([
      {
        $match: {
          status: { $in: ["registered", "Completed"] },
        },
      },
      {
        $group: {
          _id: { dept: "$dept", status: "$status" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.dept",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
    ]);

    res.status(200).send(chartData);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.patch("/project/:id", (req, res) => {
  //get id for the request paramiter
  const projectId = req.params.id;

  //update the project with the provided datain req.body
  const project = Project.findOneAndUpdate({ id: projectId }, req.body, {
    new: true,
  });
  console.log(project);
  res.status(204).send("Update Successfull!");
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

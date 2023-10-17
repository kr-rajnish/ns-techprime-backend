const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRoute = require('./routes/user');

const app = express();
const cors=require("cors");
app.use(cors());
const Project = require("./projectSchema.js");

const PORT = process.env.PORT || 3000;

app.use('/api/user', userRoute);

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
  res.send("Hello World");
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

// sign up
app.post("http://localhost:3000/api/user/login", async (req, res) => {
  console.log(req.body);
  try {
    await User.create({
      email: req.body.email,
      password: req.body.password,
    });
    res.json({ status: "ok" });
  } catch (err) {
    res.json({ status: "error", error: "Duplicate email" });
  }
});
app.post("/project", async (req, res) => {
  try {
    let project = await Project.create(req.body);
    console.log(project);
    res.status(201).send(project);
  } catch (err) {
    console.log(err);
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

// dashboard project count
app.get('/dashboard', async (req, res) => {
    try {
      const total = await Project.find({});
      const closed = await Project.find({ status: 'close' });
      const running = await Project.find({ status: 'running' });
      const closureDelay = await Project.find({ status: 'Closure Delay' });
      const canceled = await Project.find({ status: 'register' });
  
      const projectCounts = {
        total:total.length,
        close:closed.length,
        running:running.length,
        closureDelay:closureDelay.length,
        canceled:canceled.length,
      };
      console.log(projectCounts);
      res.json(projectCounts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching project counts' });
    }
  });

// create project
app.post("/createproject", async (req, res) => {
    try {
      let project=req.body;
      console.log(project);
     let newProject = new Project(project);
    await newProject.save();
    res.status(201).json({msg: "creation successfully"});
  
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

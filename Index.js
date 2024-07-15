const express = require('express');
const fs = require("fs");
const app = express();

app.use(express.json());

app.get('/', function (req, res) {
  res.send('Hello World');
});


app.get('/user-data', function (req, res) {
  try {
    const data = fs.readFileSync("./db.json", "utf8");
    res.send(data);
  } catch (err) {
    res.status(500).send("Error reading user data");
  }
});

app.post('/app-data', function (req, res) {
  try {
    const incomingData = req.body;  // Get the incoming data from the request body
    console.log("incoming", incomingData);

    const userData = fs.readFileSync("./db.json", "utf8");  // Read the existing data from db.json
    console.log("userData", userData);

    const parsedData = JSON.parse(userData);  // Parse the existing data into a JavaScript object
    console.log("parsedData", parsedData);

    if (!parsedData.todos) {
      parsedData.todos = [];  // Initialize the todos array if it doesn't exist
    }

    // Add a new ID to the incoming data
    incomingData.id = parsedData.todos.length > 0 ? parsedData.todos[parsedData.todos.length - 1].id + 1 : 1;

    parsedData.todos.push(incomingData);  // Add the incoming data to the todos array
    console.log("old+new data", parsedData);

    fs.writeFileSync("./db.json", JSON.stringify(parsedData, null, 2));  // Write the updated data back to db.json
    res.send(`Data received successfully ${JSON.stringify(parsedData)}`);
  } catch (err) {
    res.status(500).send("Error saving app data");
  }
});

// DELETE endpoint to delete a todo by ID
app.delete('/delete-data/:id', function (req, res) {
  try {
    const idToDelete = parseInt(req.params.id);

    const userData = fs.readFileSync("./db.json", "utf8");
    const parsedData = JSON.parse(userData);

    if (!parsedData.todos) {
      return res.status(404).send("Data not found");
    }

    const filteredData = parsedData.todos.filter(item => item.id !== idToDelete);

    // Update the db.json file
    parsedData.todos = filteredData;
    fs.writeFileSync("./db.json", JSON.stringify(parsedData));
    console.log("parsedData after delete", parsedData);

    res.send(`Deleted item with id ${idToDelete}. Updated data: ${JSON.stringify(parsedData)}`);
  } catch (err) {
    res.status(500).send("Error deleting data");
  }
});


app.put('/update-data/:id', (req, res) => {
  try {
    const idToUpdate = parseInt(req.params.id);
    const updatedData = req.body;

    const userData = JSON.parse(fs.readFileSync("./db.json", "utf8"));

    if (!userData.todos) {
      return res.status(404).send("Data not found");
    }

    const todo = userData.todos.find(item => item.id === idToUpdate);

    if (!todo) {
      return res.status(404).send("Todo not found");
    }

    Object.assign(todo, updatedData);

    fs.writeFileSync("./db.json", JSON.stringify(userData, null, 2));

    res.send(`Updated item with id ${idToUpdate}. Updated data: ${JSON.stringify(userData)}`);
  } catch (err) {
    res.status(500).send("Error updating data");
  }
});



app.listen(3001, function () {
  console.log('Server is running on http://localhost:3001');
});

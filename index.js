const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const users = require("./users.json");

app.use(cors());
app.use(express.json());
const port = 3000;

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/user/random", (req, res) => {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    res.send(randomUser);
});

app.get("/user/all", (req, res) => {
    const limit = req.query.limit || users.length; // Get the limit from the query string or use the default value
    const limitedUsers = users.slice(0, limit);
    res.send(limitedUsers);
});

app.post("/user/save", (req, res) => {
    const requiredFields = [
        "id",
        "gender",
        "name",
        "contact",
        "address",
        "photoUrl",
    ];

    // Check if all required fields are present in the request body
    const missingFields = requiredFields.filter(
        (field) => !(field in req.body)
    );
    if (missingFields.length > 0) {
        res.status(400).send(
            `Missing required fields: ${missingFields.join(", ")}`
        );
        return;
    }

    // Save the new user to the JSON file
    const newUser = req.body;
    users.push(newUser);
    fs.writeFile("./users.json", JSON.stringify(users), (err) => {
        if (err) {
            res.status(500).send("Error saving user");
            return;
        }
        res.send(newUser);
    });
});

app.patch("/user/update/:id", (req, res) => {
    const id = req.params.id;
    const updatedUser = req.body;

    const userIndex = users.findIndex((user) => user.Id == id);

    if (userIndex === -1) {
        res.status(404).send("Item not found");
        return;
    }

    users[userIndex] = { ...users[userIndex], ...updatedUser };

    fs.writeFile("./users.json", JSON.stringify(users), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error updating item");
        } else {
            res.send("Users updated successfully");
        }
    });
});

app.delete("/user/delete/:id", (req, res) => {
    const id = req.params.id;

    // Find the index of the user with the specified ID
    const index = users.findIndex((user) => user.Id == id);

    if (index === -1) {
        // If the user doesn't exist, send a 404 response
        res.status(404).send("User not found");
    } else {
        // Remove the user from the array
        users.splice(index, 1);

        // Save the updated array back to the file
        fs.writeFileSync("./users.json", JSON.stringify(users));

        // Send a success response
        res.send(`User with ID ${id} deleted successfully`);
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
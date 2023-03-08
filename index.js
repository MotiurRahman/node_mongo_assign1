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

// A random user API
app.get("/user/random", (req, res) => {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    res.send(randomUser);
});

//A list of random users API
app.get("/user/all", (req, res) => {
    const limit = req.query.limit || users.length; // Get the limit from the query string or use the default value
    const limitedUsers = users.slice(0, limit);
    res.send(limitedUsers);
});

//Save a random user API
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

// Update a random user API
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

// update multiple users
app.patch("/user/bulk-update", (req, res) => {
    const ids = req.body.ids;

    // Validate the request body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400).send("Invalid request body");
        return;
    }

    // Loop through the array of IDs and update the corresponding users
    ids.forEach((id) => {
        // Find the index of the user with the specified ID
        const index = users.findIndex((user) => user.Id === id);

        if (index !== -1) {
            // Update the user's information based on the request body
            if (req.body.gender) {
                users[index].gender = req.body.gender;
            }
            if (req.body.name) {
                users[index].name = req.body.name;
            }
            if (req.body.contact) {
                users[index].contact = req.body.contact;
            }
            if (req.body.address) {
                users[index].address = req.body.address;
            }
            if (req.body.photoUrl) {
                users[index].photoUrl = req.body.photoUrl;
            }
        }
    });

    // Save the updated array back to the file
    fs.writeFileSync("./users.json", JSON.stringify(users));

    // Send a success response
    res.send("Users updated successfully");
});

// delete A user API
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

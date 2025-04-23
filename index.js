const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 8000;

app.use(
    cors({
        origin: ["http://localhost:3000"],
        credentials: true,
    })
);

app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        console.log("Connected to MongoDB");

        const bannerCollection = client.db("ishwardi").collection("BannerCollection");
        const usersCollection = client.db("ishwardi").collection("users");
        const hotlineCollection = client.db("ishwardi").collection("hotline");
        const featuredLocationCollection = client.db("ishwardi").collection("location");
        const contactController = client.db("ishwardi").collection("contact");
        const bussnessCollection = client.db("ishwardi").collection("bussness");





        app.post("/contactInbox", async (req, res) => {
            const banner = req.body;
 
            try {
                const result = await contactController.insertOne({
                    name: banner.name,
                    email: banner.email,
                    message: banner.message,
                    timestamp: Date.now(),
                });
                res
                    .status(201)
                    .send({ message: "Banner uploaded successfully", result });
            } catch (error) {
                console.error("Error uploading banner:", error);
                res.status(500).send({ error: "Failed to upload banner" });
            }
        });



        app.get("/users", async (req, res) => {
            const users = await usersCollection.find().toArray();
            res.send(users);
        });

        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const result = await usersCollection.findOne({ email });
            res.send(result);
        });

        app.patch("/users/:email", async (req, res) => {
            const { email } = req.params;
            const { role, ids, userEmail, userName } = req.body;

            const filter = { email: email };
            const updateDoc = {
                $set: {
                    role,
                    userEmail,
                    userName,
                },
            };

            try {
                const result = await usersCollection.updateOne(filter, updateDoc);

                if (result.matchedCount === 0) {
                    return res.status(404).send({ error: "User not found" });
                }

                if (result.modifiedCount === 0) {
                    return res
                        .status(400)
                        .send({ message: "No changes made to the user" });
                }

                res.send({ message: "User updated successfully", result });
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: "Failed to update user" });
            }
        });

     

        app.get("/contactInbox", async (req, res) => {
            try {
                const messages = await contactInboxCollection.find().toArray();
                res.send(messages);
            } catch (error) {
                console.error("Error fetching messages:", error);
                res.status(500).send({ error: "Failed to fetch messages" });
            }
        });

        app.put("/user", async (req, res) => {
            const user = req.body;
            const query = { email: user?.email, name: user.displayName };
            const isExist = await usersCollection.findOne(query);
            if (isExist) {
                if (user.status === "Requested") {
                    const result = await usersCollection.updateOne(query, {
                        $set: { status: user?.status },
                    });
                    return res.send(result);
                } else {
                    return res.send(isExist);
                }
            }

            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    ...user,
                    timestamp: Date.now(),
                },
            };
            const result = await usersCollection.updateOne(query, updateDoc, options);
            res.send(result);
        });

        app.post("/featuredLocation", async (req, res) => {
            const { title, description, img } = req.body;

            if (!title || !description || !img) {
                return res.status(400).send({ error: "Invalid location data" });
            }

            try {
                const result = await featuredLocationCollection.insertOne({
                    title,
                    description,
                    img,
                    timestamp: Date.now(),
                });

                res.status(201).send({
                    message: "Featured Location added successfully",
                    result,
                });
            } catch (error) {
                console.error("Error uploading featured location:", error);
                res.status(500).send({ error: "Failed to upload featured location" });
            }
        });

        app.get("/banners", async (req, res) => {
            try {
                const banners = await bannerCollection.find().toArray();
                res.send(banners);
            } catch (error) {
                console.error("Error fetching banners:", error);
                res.status(500).send({ error: "Failed to fetch banners" });
            }
        });

        app.get("/hotline", async (req, res) => {
            try {
                const hotline = await hotlineCollection.find().toArray();
                res.send(hotline);
            } catch (error) {
                console.error("Error fetching hotline:", error);
                res.status(500).send({ error: "Failed to fetch hotline" });
            }
        });

        app.get("/featuredLocation", async (req, res) => {
            try {
                const featuredLocation = await featuredLocationCollection.find().toArray();
                res.send(featuredLocation);
            } catch (error) {
                console.error("Error fetching featuredLocation:", error);
                res.status(500).send({ error: "Failed to fetch featuredLocation" });
            }
        });
        app.get("/localbusiness", async (req, res) => {
            try {
                const featuredbussness = await bussnessCollection.find().toArray();
                res.send(featuredbussness);
            } catch (error) {
                console.error("Error fetching featuredbussness:", error);
                res.status(500).send({ error: "Failed to fetch featuredbussness" });
            }
        });

        app.post("/hotline", async (req, res) => {
            const hotline = req.body;

            if (
                !hotline ||
                !hotline._forId ||
                !hotline.title ||
                !hotline.image ||
                !hotline.description ||
                !Array.isArray(hotline.phoneNumbers)
            ) {
                return res.status(400).send({ error: "Invalid hotline data" });
            }

            try {
                const result = await hotlineCollection.insertOne({
                    _forId: hotline._forId,
                    title: hotline.title,
                    image: hotline.image,
                    description: hotline.description,
                    phoneNumbers: hotline.phoneNumbers,
                    timestamp: Date.now(),
                });

                res.status(201).send({
                    message: "Hotline uploaded successfully",
                    result,
                });
            } catch (error) {
                console.error("Error uploading hotline:", error);
                res.status(500).send({ error: "Failed to upload hotline" });
            }
        });

        app.post("/banners", async (req, res) => {
            const banner = req.body;

            if (!banner || !banner.url || !banner.heading || !banner.description) {
                return res.status(400).send({ error: "Invalid banner data" });
            }

            try {
                const result = await bannerCollection.insertOne({
                    url: banner.url,
                    heading: banner.heading,
                    description: banner.description,
                    timestamp: Date.now(),
                });
                res
                    .status(201)
                    .send({ message: "Banner uploaded successfully", result });
            } catch (error) {
                console.error("Error uploading banner:", error);
                res.status(500).send({ error: "Failed to upload banner" });
            }
        });

        app.patch("/banners/:id", async (req, res) => {
            const id = req.params.id;
            const { url, heading, description } = req.body;

            if (!url && !heading && !description) {
                return res.status(400).send({ error: "No fields provided for update" });
            }

            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    ...(url && { url }),
                    ...(heading && { heading }),
                    ...(description && { description }),
                },
            };

            try {
                const result = await bannerCollection.updateOne(filter, updateDoc);

                if (result.matchedCount === 0) {
                    return res.status(404).send({ error: "Banner not found" });
                }

                res.send({ message: "Banner updated successfully", result });
            } catch (error) {
                console.error("Error updating banner:", error);
                res.status(500).send({ error: "Failed to update banner" });
            }
        });

        app.put("/banners/:id", async (req, res) => {
            const id = req.params.id;
            const { url, heading, description } = req.body;

            if (!url && !heading && !description) {
                return res.status(400).send({ error: "No fields provided for update" });
            }

            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    ...(url && { url }),
                    ...(heading && { heading }),
                    ...(description && { description }),
                },
            };

            try {
                const result = await bannerCollection.updateOne(filter, updateDoc);

                if (result.matchedCount === 0) {
                    return res.status(404).send({ error: "Banner not found" });
                }

                res.send({ message: "Banner updated successfully", result });
            } catch (error) {
                console.error("Error updating banner:", error);
                res.status(500).send({ error: "Failed to update banner" });
            }
        });

        app.get("/logout", async (req, res) => {
            try {
                res
                    .clearCookie("token", {
                        maxAge: 0,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                    })
                    .send({ success: true });
            } catch (err) {
                res.status(500).send(err);
            }
        });

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } finally {
        process.on("SIGINT", async () => { });
    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("MyIshwardi is sitting");
});

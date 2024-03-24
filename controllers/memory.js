import memory from "../models/memory.js";
import cron from "node-cron";

export const createMemory = async (req, res) => {
  try {
    const { memoryPath, userId } = req.body;
    const newMemory = new memory({ memoryPath, userId });
    await newMemory.save();
    res.status(201).json(newMemory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllMemories = async (req, res) => {
  try {
    const memories = await memory.find({ isActive: true });
    res.status(200).json(memories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserMemories = async (req, res) => {
  try {
    const { userId } = req.params;
    const userMemories = await memory.find({ userId, isActive: true });
    res.status(200).json(userMemories);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const checkMemory = async (req, res) => {
  try {
    // Find memories with isActive = true
    const activeMemories = await memory.find({ isActive: true });

    // Check each active memory
    for (const Memory of activeMemories) {
      const currentTime = new Date();
      const memoryTime = Memory.createdAt;

      // Calculate the time difference in milliseconds
      const timeDifference = currentTime - memoryTime;

      // If the memory was created more than 1 minute ago, set isActive to false
      if (timeDifference >= 60000) {
        // 1 minute = 60,000 milliseconds
        Memory.isActive = false;
        await Memory.save();
        console.log(`Memory ${Memory._id} deactivated.`);
      }
    }

    res.status(200).json({ message: "Memories checked successfully." });
  } catch (err) {
    console.error("Error checking memories:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

cron.schedule(
  "* * * * *",
  async () => {
    try {
      console.log("cron job running");
      // Find memories with isActive = true
      const activeMemories = await memory.find({ isActive: true });

      // Check each active memory
      for (const Memory of activeMemories) {
        const currentTime = new Date();
        const memoryTime = Memory.createdAt;

        // Calculate the time difference in milliseconds
        const timeDifference = currentTime - memoryTime;

        const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
        // If the memory was created more than 1 minute ago, set isActive to false
        if (timeDifference >= twentyFourHoursInMs) {
          // 1 minute = 60,000 milliseconds
          Memory.isActive = false;
          await Memory.save();
          console.log(`Memory ${Memory._id} deactivated.`);
        }
      }

      console.log("Memories checked successfully.");
    } catch (err) {
      console.error("Error checking memories:", err);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);

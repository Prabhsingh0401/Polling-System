export const getPollStatus = (req, res) => {
    try {
        res.json({ 
            success: true,
            message: "Poll status fetched successfully!" 
        });
    } catch (error) {
        console.error("Error fetching poll status:", error);
        res.status(500).json({ 
            success: false,
            error: "Failed to fetch poll status" 
        });
    }
};

export const createPoll = (req, res) => {
    try {
        const { question } = req.body;
        
        if (!question) {
            return res.status(400).json({ 
                success: false,
                error: "Question is required" 
            });
        }
        
        res.json({ 
            success: true,
            message: "Poll created successfully!", 
            question 
        });
    } catch (error) {
        console.error("Error creating poll:", error);
        res.status(500).json({ 
            success: false,
            error: "Failed to create poll" 
        });
    }
};
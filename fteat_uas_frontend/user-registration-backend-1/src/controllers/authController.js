class AuthController {
    constructor(userModel, emailService) {
        this.userModel = userModel;
        this.emailService = emailService;
    }

    async registerUser(req, res) {
        const { firstName, lastName, faculty, major, yearOfEntry, email, password, confirmPassword } = req.body;

        // Validate input
        if (!firstName || !lastName || !faculty || !major || !yearOfEntry || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        try {
            // Check if user already exists
            const existingUser = await this.userModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists." });
            }

            // Create new user
            const newUser = await this.userModel.create({
                firstName,
                lastName,
                faculty,
                major,
                yearOfEntry,
                email,
                password, // Note: Password should be hashed before saving
            });

            // Send verification email
            await this.emailService.sendVerificationEmail(newUser);

            return res.status(201).json({ message: "User registered successfully. Please check your email for verification." });
        } catch (error) {
            return res.status(500).json({ message: "Server error.", error: error.message });
        }
    }

    async verifyEmail(req, res) {
        const { token } = req.params;

        // Logic to verify email using the token
        // This would typically involve checking the token against the database

        return res.status(200).json({ message: "Email verified successfully." });
    }
}

export default AuthController;
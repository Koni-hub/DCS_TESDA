import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import Accounts from "../model/accountModels.js";

export const getAllAccounts = async (req, res) => {
  try {
    const response = await Accounts.findAll();
    res.json(response);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAccountById = async (req, res) => {
  try {
      const response = await Accounts.findOne({
          where: {
            account_email: req.params.account_email
          }
      });

      if (!response) {
          return res.status(404).json({ msg: "Account Email not found" });
      }

      res.json(response);
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ msg: "Internal Server Error" });
  }
}

export const registerAccount = async (req, res) => {
  try {
    // Extract data from request body
    const {
      account_username,
      account_firstName,
      account_lastName,
      account_password,
      account_email,
      account_contactNo,
      isAccountVerified,
    } = req.body;

    // Check if the username already exists
    const existingUser = await Accounts.findOne({
      where: { account_username: account_username },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await Accounts.findOne({
      where: { account_email: account_email },
    });
    if (existingEmail) {
      return res.status(400).json({ message: "E-mail already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(account_password, saltRounds);

    // Create user in VersatilyDB "accounts table"
    const user = await Accounts.create({
      account_username: account_username,
      account_firstName: account_firstName,
      account_lastName: account_lastName,
      account_pass: hashedPassword,
      account_email: account_email,
      account_contactNo: account_contactNo,
      isAccountVerified: isAccountVerified,
      createdBy: "System",
    });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const loginAccount = async (req, res) => {
  const secretKey = "1234";

  try {
    const { emailOrUsername, account_password } = req.body;

    // Find the user by email or username
    const user = await Accounts.findOne({
      where: {
        [Op.or]: [
          { account_username: emailOrUsername },
          { account_email: emailOrUsername },
        ],
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "Invalid email or username" });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(
      account_password,
      user.account_pass
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid email/username and password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.account_email,
        username: user.account_username,
        fullname: user.account_firstName + " " + user.account_lastName,
        role: user.createdBy
      },
      secretKey,
      { expiresIn: "24h" }
    );

    // If everything is okay, send a success response with JWT token
    res
      .status(200)
      .json({ message: "Login successful", user: user, token: token, role: user.createdBy });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};


export const updateAccount = async (req, res) => {
  try {
    const { currentPassword, newPassword, ...updateFields } = req.body;

    // Find the account to update by email
    const account = await Accounts.findOne({
      where: { account_email: updateFields.account_email },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Check if current password matches
    if (currentPassword && !(await bcrypt.compare(currentPassword, account.account_pass))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Check if the username already exists and is not the current account's username
    if (updateFields.account_username && updateFields.account_username !== account.account_username) {
      const existingUser = await Accounts.findOne({
        where: {
          account_username: updateFields.account_username,
          account_email: { [Sequelize.Op.ne]: updateFields.account_email }
        }
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    // Hash the new password if provided
    if (newPassword) {
      const saltRounds = 10;
      updateFields.account_pass = await bcrypt.hash(newPassword, saltRounds);
    }

    // Update the account with provided fields
    await account.update(updateFields);

    res.status(200).json({ message: "User updated successfully", account });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const findGoogleAccount = async(req, res) => {
  try {
    const { email } = req.body;
    
    // Adjust the query to use the correct field name
    const account = await Accounts.findOne({
      where: { account_email: email } // Updated field name
    });

    if (account) {
      res.json(account.createdBy);
    } else {
      res.status(404).json({ message: 'No account found with the provided email.' });
    }
  } catch (error) {
    console.error('Error finding account:', error); // Log the full error object
    res.status(500).json({ message: 'Server error', error: error.message }); 
  }
}
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Handles new user registration.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const registerUser = async (req, res) => {
    const { userName, userNumber, userPassword, userEmail } = req.body;
    if (!userName || !userNumber || !userPassword) {
        return res.status(400).json({ message: 'Username, number, and password are required.' });
    }
    try {
        const existingUser = await prisma.accountUser.findUnique({
            where: { userNumber },
        });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this number already exists.' });
        }
        const hashedPassword = await bcrypt.hash(userPassword, 10);
        const newUser = await prisma.accountUser.create({
            data: {
                userName,
                userNumber,
                userPassword: hashedPassword,
                userEmail,
            },
        });
        const userForResponse = { ...newUser };
        delete userForResponse.userPassword;
        const token = jwt.sign({ userId: newUser.uniqueId }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.status(201).json({
            message: 'User registered successfully!',
            user: userForResponse,
            token,
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

/**
 * Handles user login.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const loginUser = async (req, res) => {
    const { userNumber, userPassword } = req.body;
    if (!userNumber || !userPassword) {
        return res.status(400).json({ message: 'User number and password are required.' });
    }
    try {
        const user = await prisma.accountUser.findUnique({
            where: { userNumber },
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const isPasswordCorrect = await bcrypt.compare(userPassword, user.userPassword);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign({ userId: user.uniqueId }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.status(200).json({
            message: 'Logged in successfully!',
            token,
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

/**
 * Adds a new contact for the authenticated user.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const addContact = async (req, res) => {
    const { userName, userNumber, userEmail } = req.body; 
    const loggedInUserId = req.userId;
    if (!userName || !userNumber) {
        return res.status(400).json({ message: 'Name and number are required for a contact.' });
    }
    try {
        const newContact = await prisma.userContact.create({
            data: {
                userName,
                userNumber,
                userEmail,
                accountUserId: loggedInUserId, 
            },
        });
        res.status(201).json({ message: 'Contact added successfully!', contact: newContact });
    } catch (error) {
        console.error('Add Contact Error:', error);
        res.status(500).json({ message: 'Server error while adding contact.' });
    }
};

/**
 * Marks a number as spam.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const markSpam = async (req, res) => {
    const { reportedNumber } = req.body;
    const loggedInUserId = req.userId;
    if (!reportedNumber) {
        return res.status(400).json({ message: 'The phone number to report is required.' });
    }
    try {
        const newSpamReport = await prisma.spamAlert.create({
            data: {
                reportedNumber,
                accountUserId: loggedInUserId, 
            },
        });
        res.status(201).json({ message: 'Number marked as spam successfully!', report: newSpamReport });
    } catch (error) {
        console.error('Mark Spam Error:', error);
        res.status(500).json({ message: 'Server error while marking spam.' });
    }
};

/**
 * Searches for registered users by name.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const searchByName = async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ message: 'A search query "q" is required.' });
    }
    try {
        const startsWithMatches = await prisma.accountUser.findMany({
            where: {
                userName: {
                    startsWith: query,
                    mode: 'insensitive', 
                },
            },
        });
        const containsMatches = await prisma.accountUser.findMany({
            where: {
                AND: [
                    {
                        userName: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        NOT: {
                            userName: {
                                startsWith: query,
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            },
        });
        const allMatches = [...startsWithMatches, ...containsMatches];

        // Each user , each spamcount
        const resultsWithSpamCount = await Promise.all(
            allMatches.map(async (user) => {
                const spamCount = await prisma.spamAlert.count({
                    where: {
                        reportedNumber: user.userNumber,
                    },
                });
                return {
                    userName: user.userName,
                    userNumber: user.userNumber,
                    spamCount,
                };
            })
        );
        res.status(200).json(resultsWithSpamCount);
    } catch (error) {
        console.error('Search by Name Error:', error);
        res.status(500).json({ message: 'Server error during name search.' });
    }
};

/**
 * Searches for a number, providing different details if the number
 * is registered or just found in other users' contacts.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const searchByNumber = async (req, res) => {
    const searchNumber = req.query.num;
    const loggedInUserId = req.userId;

    if (!searchNumber) {
        return res.status(400).json({ message: 'A search query "num" is required.' });
    }

    try {
        const spamCount = await prisma.spamAlert.count({
            where: { reportedNumber: searchNumber },
        });
        const registeredUser = await prisma.accountUser.findUnique({
            where: { userNumber: searchNumber },
        });

        if (registeredUser) {
            const isContact = await prisma.userContact.findFirst({
                where: {
                    userNumber: registeredUser.userNumber, 
                    accountUserId: loggedInUserId,     
                },
            });
            const response = {
                userName: registeredUser.userName,
                userNumber: registeredUser.userNumber,
                spamCount,
            };
            if (isContact && registeredUser.userEmail) {
                response.userEmail = registeredUser.userEmail;
            }
            return res.status(200).json([response]); 
        } else {
            const contacts = await prisma.userContact.findMany({
                where: { userNumber: searchNumber },
                select: { userName: true }, 
            });
            if (contacts.length > 0) {
                 return res.status(200).json(contacts.map(c => ({...c, userNumber: searchNumber, spamCount})));
            }
        }
        if (spamCount > 0) {
            return res.status(200).json([{
                userNumber: searchNumber,
                spamCount: spamCount,
                message: "This number is not registered but has been reported as spam."
            }]);
        }
        return res.status(404).json({ message: 'No records found for this number.' });
    } catch (error) {
        console.error('Search by Number Error:', error);
        res.status(500).json({ message: 'Server error during number search.' });
    }
};
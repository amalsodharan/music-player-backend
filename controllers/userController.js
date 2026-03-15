import initDb from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = 10;

const createUser = async (req, res) => {
    try{
        const { User } = await initDb();
        let { email, password, first_name, last_name, phone, role } = req.body;
        if(!email || !password || !first_name || !last_name || !phone){
            res.status(400).json({ status: 'Failed', message: 'All fields are required' });
        }
        if(!role) role = 'user';

        const fetchUser = await User.findOne({ where: { email: email } });
        if(fetchUser) res.status(400).json({ status: 'Failed', message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const input = {
            email: email,
            password: hashedPassword,
            first_name: first_name,
            last_name: last_name,
            phone: phone,
            role: role,
            is_deleted: false
        }
        console.log(input)

        const user = await User.create(input);
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        )
        res.status(201).json({ status: 'Success', message: 'User created successfully', token: token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ Status: 'Failed', message: `Some error occured due to ${error}` });
    }
};

const loginUser = async (req, res) => {
    try {
        const { User } = await initDb();
        let { email, password } = req.body;
        if(!email || !password){
            res.status(400).json({ status: 'Failed', message: 'All fields are required' });
        }
        const fetchUser = await User.findOne({ where: { email : email } });
        if(!fetchUser) res.status(400).json({ status: 'Failed', message: 'No User Found' });

        const isMatch = await bcrypt.compare(password, fetchUser.password);
        if (!isMatch) return res.status(400).json({ message: 'wrong password' });
        const token = jwt.sign(
            { id: fetchUser.id, role: fetchUser.role, email: fetchUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        res.status(201).json({ message: 'login successfull!', token: `JWT ${token}` });
    }catch (error) {
        console.error(error);
        res.status(500).json({ Status: 'Failed', message: `Some error occured due to ${error}` });
    }
}

export default { createUser, loginUser };
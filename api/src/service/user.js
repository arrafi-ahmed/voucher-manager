const jwt = require("jsonwebtoken");
const CustomError = require("../model/CustomError");
const {sql} = require("../db");
const {hash, compare} = require("bcrypt");
const {v4: uuidv4} = require("uuid");
const {
    generatePassResetContent,
    appInfo,
    VUE_BASE_URL,
} = require("../helpers/util");
const {sendMail, sendPasswordResetEmail} = require("./email");

const generateAuthData = (result) => {
    let token = "";
    let currentUser = {};
    if (result) {
        currentUser = {
            id: result.id,
            role: Number(result.role),
            name: result.name,
        };
        token = jwt.sign({currentUser}, process.env.TOKEN_SECRET);
    }
    return {token, currentUser};
};
// role 10 = admin, 20 = customer
exports.save = async ({payload}) => {
    const hashedPassword = await hash(payload.password, 10);
    const user = {
        ...payload,
        password: hashedPassword,
        role: payload.role || 20,
        createdAt: new Date(),
    };
    let savedUser = null;
    try {
        [savedUser] = await sql`
            insert into users ${sql(user)} on conflict(id) do
            update set ${sql(user)} returning *`;
    } catch (err) {
        if (err.code === "23505")
            throw new CustomError({message: "Email already taken!", statusCode: 409});
        else throw err;
    }
    return savedUser;
};

exports.signin = async ({payload: {email, password}}) => {
    const user = await exports.getUserByEmail({email});
    if (!user?.email) {
        throw new CustomError({message: "User not found!", statusCode: 401});
    }
    const isPasswordValid = await compare(password, user.password); // Compare hashed password
    if (!isPasswordValid) {
        throw new CustomError({message: "Incorrect email/password!", statusCode: 401});
    }
    return generateAuthData(user);
};

exports.getUserByEmail = async ({email}) => {
    const [user] = await sql`
        select *
        from users
        where email = ${email}`;
    return user;
};

exports.getUserById = async ({id}) => {
    const [user] = await sql`
        select *
        from users
        where id = ${id}`;
    return user;
};

exports.requestResetPass = async ({payload: {resetEmail}}) => {
    const fetchedUser = await exports.getUserByEmail({email: resetEmail});
    if (!fetchedUser) throw new CustomError({message: "User doesn't exist!"});

    const reset = {
        userId: fetchedUser.id,
        email: resetEmail,
        token: uuidv4(),
        createdAt: new Date(),
    };
    const [savedReq] = await sql`
        insert into password_reset ${sql(reset)} on conflict(id) do
        update set ${sql(reset)}
            returning *`;

    sendPasswordResetEmail({
        to: fetchedUser.email,
        user: fetchedUser,
        token: savedReq.token,
    }).catch((err) => {
        // Optional: log but don’t crash
        console.error("Failed to send password reset email:", err);
    });
};

exports.submitResetPass = async ({payload: {token, newPass}}) => {
    const [reset] = await sql`
        select *
        from password_reset
        where token = ${token}`;
    if (!reset) throw new CustomError({message: "Invalid request!"});

    const expirationMillis = reset.createdAt.getTime() + 3600000; // 1 hour in milliseconds
    if (expirationMillis < Date.now())
        throw new CustomError({message: "Password reset link expired!"});

    const fetchedUser = await exports.getUserById({id: reset.userId});

    const savedUser = await exports.save({
        payload: {...fetchedUser, password: newPass},
    });
    return savedUser;
};

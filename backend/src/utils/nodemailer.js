import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const contactEmail = async (name, email, phone, userType, message) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: `${process.env.EMAIL_USER}`,
            subject: `New Contact Query`,
            html: `
                    <p>You have received a new query. Please reach out to them. Here are the details:</p>
                    <p><b>Full Name:</b> ${name}</p>
                    <p><b>Email:</b> ${email}</p>
                    <p><b>Phone No.:</b> ${phone}</p>
                    <p><b>User Type:</b> ${userType}</p>
                    
                    <p>
                        <b>Message:</b> <br />
                         ${message}
                    </p>
                    `,
        });

        if (info) return true;
    } catch (error) {
        throw new Error(error);
    }
}

const resetPasswordEmail = async (email, url) => {
    try {
        const info = await transporter.sendMail({
            from: `"PlaneVault" <${process.env.EMAIL_USER}>`,
            to: `${email}`,
            subject: `Reset Password Request`,
            html: `
                    <p>Forgot your password? Click on the following link to reset your password:</p>
                    <br />
                    <a href='${url}'>${url}</a>
                    <br />
                    `,
        });

        if (info) return true;
    } catch (error) {
        throw new Error(error);
    }
}

export { contactEmail, resetPasswordEmail }
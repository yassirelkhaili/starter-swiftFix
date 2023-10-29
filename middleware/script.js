import * as http from "http";
import "dotenv/config";
import { createTransport } from "nodemailer";
const sendMail = async (owner, data) => {
    const transporter = createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_HOST,
            pass: process.env.SMTP_PASS,
        },
    });
    try {
        await transporter.sendMail({
            from: process.env.SMTP_HOST,
            to: owner ? process.env.SMTP_HOST : data.email,
            subject: owner ? "Message from Swiftix" : "Thank you for contacting us!",
            text: owner ? data.message : "Message body",
        });
        console.log("Email sent successfully");
    }
    catch (error) {
        console.error("Error sending email:", error);
    }
};
const server = http.createServer((req, res) => {
    let data = "";
    let statusCode = res.statusCode;
    let responseData = "";
    if (req.method === "POST" && req.url === "/api/contact") {
        const origin = req.headers.origin;
        if (origin) {
            res.setHeader("Access-Control-Allow-Origin", origin);
        }
        res.setHeader("Access-Control-Allow-Methods", "POST");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        try {
            req.on("data", (chunk) => {
                data += chunk;
            });
            req.on("end", () => {
                const requestData = JSON.parse(data);
                sendMail(false, requestData);
                sendMail(true, requestData);
                responseData = JSON.stringify({ message: "Message has been received successfully", data: requestData });
                statusCode = 200;
                res.end(responseData);
            });
        }
        catch (err) {
            statusCode = 400;
            responseData = JSON.stringify({ error: "Invalid JSON Data" });
            res.end(responseData);
        }
    }
    else {
        statusCode = 404;
        responseData = JSON.stringify({ error: "Not Found" });
        res.end(responseData);
    }
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));

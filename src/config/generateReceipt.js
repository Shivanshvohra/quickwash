const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const Order = require("../models/index").Order;

async function generateAndSaveReceipt(receiptData) {

    return new Promise((resolve, reject) => {

        try {

            const itemCount = receiptData.items.length;

            const estimatedHeight =
                320 + (itemCount * 45);

            const doc = new PDFDocument({
                size: [226, estimatedHeight], // 80mm thermal width
                margin: 10
            });

            const fileName =
                `${Date.now()}-receipt_${receiptData.orderId}.pdf`;

            const uploadDir = path.join(
                __dirname,
                "..",
                "..",
                "uploads"
            );

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, {
                    recursive: true
                });
            }

            const filePath = path.join(
                uploadDir,
                fileName
            );

            const stream =
                fs.createWriteStream(filePath);

            doc.pipe(stream);

            const divider = () => {
                doc
                    .font("Courier")
                    .fontSize(8)
                    .text("--------------------------------");
            };

            // ==========================================
            // HEADER
            // ==========================================

            doc
                .font("Courier-Bold")
                .fontSize(18)
                .text("WASHEX", {
                    align: "center"
                });

            doc.moveDown(0.3);

            doc
                .font("Courier")
                .fontSize(8)
                .text(
                    `Generated: ${new Date().toLocaleString()}`,
                    {
                        align: "center"
                    }
                );

            doc.moveDown(0.5);

            divider();

            // ==========================================
            // ORDER DETAILS
            // ==========================================

            doc
                .font("Courier-Bold")
                .fontSize(10)
                .text("ORDER DETAILS");

            doc.moveDown(0.3);

            doc
                .font("Courier")
                .fontSize(9);

            doc.text(
                `Order ID : ${receiptData.orderId}`
            );

            doc.text(
                `Service  : ${receiptData.type}`
            );

            doc.text(
                `Date     : ${new Date(
                    receiptData.createdAt
                ).toLocaleString()}`
            );

            doc.moveDown(0.5);

            doc.text(
                `Customer : ${receiptData.user.name}`
            );

            doc.text(
                `Mobile   : ${receiptData.user.mobile}`
            );

            doc.moveDown(0.5);

            divider();

            // ==========================================
            // ITEMS
            // ==========================================

            doc
                .font("Courier-Bold")
                .fontSize(10)
                .text("ITEMS");

            doc.moveDown(0.3);

            receiptData.items.forEach((item) => {

                doc
                    .font("Courier-Bold")
                    .fontSize(9)
                    .text(item.name);

                doc
                    .font("Courier")
                    .fontSize(8);

                doc.text(
                    `Qty : ${item.qty}`
                );

                if (item.price !== "N/A") {

                    doc.text(
                        `Price : ₹${item.price}`
                    );

                    doc.text(
                        `Total : ₹${item.total}`
                    );
                }

                doc.moveDown(0.4);
            });

            divider();

            // ==========================================
            // SUMMARY
            // ==========================================

            doc
                .font("Courier-Bold")
                .fontSize(10)
                .text("SUMMARY");

            doc.moveDown(0.3);

            doc
                .font("Courier")
                .fontSize(9);

            doc.text(
                `Total Qty : ${receiptData.summary.totalQty}`
            );

            doc.text(
                `Amount    : ${receiptData.summary.totalAmount}`
            );

            doc.text(
                `Payment   : ${receiptData.summary.paymentMethod}`
            );

            doc.text(
                `Status    : ${receiptData.summary.paymentStatus}`
            );

            doc.moveDown(0.5);

            divider();

            // ==========================================
            // PAID / UNPAID
            // ==========================================

            const isPaid =
                String(
                    receiptData.summary.paymentStatus
                ).toUpperCase() === "SUCCESS";

            doc
                .font("Courier-Bold")
                .fontSize(14)
                .text(
                    isPaid
                        ? "PAID"
                        : "UNPAID",
                    {
                        align: "center"
                    }
                );

            doc.moveDown(0.5);

            divider();

            // ==========================================
            // FOOTER
            // ==========================================

            doc
                .font("Courier")
                .fontSize(8)
                .text(
                    "Thank you for choosing Washex",
                    {
                        align: "center"
                    }
                );

            doc.moveDown(0.3);

            doc
                .text(
                    "Visit Again",
                    {
                        align: "center"
                    }
                );

            doc.end();

            stream.on("error", reject);

            stream.on("finish", async () => {

                try {

                    const order =
                        await Order.findByPk(
                            receiptData.orderId
                        );

                    if (!order) {
                        return reject(
                            new Error(
                                "Order not found"
                            )
                        );
                    }

                    if (!order.receipt_url) {

                        await Order.update(
                            {
                                receipt_url:
                                    fileName
                            },
                            {
                                where: {
                                    id: receiptData.orderId
                                }
                            }
                        );
                    }

                    resolve({
                        fileName,
                        filePath
                    });

                } catch (err) {
                    reject(err);
                }
            });

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = generateAndSaveReceipt;
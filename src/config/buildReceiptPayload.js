const { User, OrderItem, Catalog, Payment } = require("../models");

const buildReceiptPayload = async (order) => {

    if (!order) {
        throw new Error("Order required");
    }

    const user = await User.findByPk(order.userId);

    if (!user) {
        throw new Error("User not found");
    }

    const items = await OrderItem.findAll({
        where: {
            orderId: order.id
        },
        include: [{
            model: Catalog,
            attributes: ["name"]
        }],
        order: [
            ["createdAt", "ASC"],
            ["id", "ASC"]
        ]
    });

    if (!items.length) {
        throw new Error("No items found");
    }

    const payment = await Payment.findOne({
        where: {
            orderId: order.id
        }
    });

    const paidServices = [
        "drycleaning",
        "paidLaundry",
        "ironing"
    ];

    const isPaidService =
        paidServices.includes(order.serviceType);

    const formattedItems = items.map((item, index) => {

        const qty = Number(item.quantity || 0);

        const price = isPaidService
            ? Number(item.priceAtTime || 0)
            : "N/A";

        const total = isPaidService
            ? qty * Number(item.priceAtTime || 0)
            : "N/A";

        return {
            srNo: index + 1,
            name: item.Catalog?.name || "Unknown Item",
            qty,
            price,
            total
        };
    });

    return {
        orderId: order.id,

        type: (order.serviceType || "N/A")
            .toUpperCase(),

        createdAt: order.createdAt,

        user: {
            name: user.name || "N/A",
            mobile: user.mobileNumber || "N/A"
        },

        items: formattedItems,

        summary: {
            totalQty: formattedItems.reduce(
                (sum, item) => sum + item.qty,
                0
            ),

            totalAmount: isPaidService
                ? Number(order.totalAmount || 0)
                : "N/A",

            paymentMethod:
                payment?.paymentMethod || "N/A",

            paymentStatus:
                payment?.status || "N/A"
        }
    };
};

module.exports = {
    buildReceiptPayload
};
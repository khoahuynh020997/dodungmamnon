import type { Customer, Order } from "@/lib/types";

const DAY = 86_400_000;

export function makeSeed(now: number): {
  customers: Customer[];
  orders: Order[];
  nextOrderNumber: number;
} {
  const customers: Customer[] = [
    {
      id: "c-lan",
      name: "Cô Nguyễn Thị Lan",
      phone: "0903123456",
      address: "12 Nguyễn Huệ, Quận 1, TP.HCM",
      createdAt: now - 80 * DAY,
      lastOrderAt: now - 1 * DAY,
      isSample: true,
    },
    {
      id: "c-hoasen",
      name: "Trường MN Hoa Sen",
      phone: "02838223344",
      address: "45 Lê Lợi, Quận 3, TP.HCM",
      createdAt: now - 70 * DAY,
      lastOrderAt: now - 3 * DAY,
      isSample: true,
    },
    {
      id: "c-huong",
      name: "Chị Trần Thị Hương",
      phone: "0918765432",
      address: "8 Pasteur, Quận 3, TP.HCM",
      createdAt: now - 55 * DAY,
      lastOrderAt: now - 6 * DAY,
      isSample: true,
    },
    {
      id: "c-tuan",
      name: "Anh Phạm Văn Tuấn",
      phone: "0934555666",
      address: "22 Võ Văn Tần, Quận 3, TP.HCM",
      createdAt: now - 40 * DAY,
      lastOrderAt: now - 2 * DAY,
      isSample: true,
    },
    {
      id: "c-bengoan",
      name: "Trường MN Bé Ngoan",
      phone: "02743881212",
      address: "15 Nguyễn Trãi, TP. Mỹ Tho",
      createdAt: now - 30 * DAY,
      lastOrderAt: now - 8 * DAY,
      isSample: true,
    },
    {
      id: "c-ha",
      name: "Cô Lê Thị Hà",
      phone: "0987000111",
      address: "36 Cách Mạng Tháng 8, Quận 10, TP.HCM",
      createdAt: now - 18 * DAY,
      lastOrderAt: now - 0.3 * DAY,
      isSample: true,
    },
  ];

  const byId = Object.fromEntries(customers.map((c) => [c.id, c]));

  const rows: Array<{
    id: string;
    number: number;
    customerId: string;
    amount: number;
    status: Order["status"];
    daysAgo: number;
  }> = [
    { id: "o-1", number: 1, customerId: "c-lan", amount: 450_000, status: "paid", daysAgo: 72 },
    { id: "o-2", number: 2, customerId: "c-hoasen", amount: 1_280_000, status: "paid", daysAgo: 61 },
    { id: "o-3", number: 3, customerId: "c-huong", amount: 185_000, status: "paid", daysAgo: 44 },
    { id: "o-4", number: 4, customerId: "c-lan", amount: 320_000, status: "paid", daysAgo: 28 },
    { id: "o-5", number: 5, customerId: "c-tuan", amount: 760_000, status: "paid", daysAgo: 21 },
    { id: "o-6", number: 6, customerId: "c-bengoan", amount: 2_150_000, status: "paid", daysAgo: 16 },
    { id: "o-7", number: 7, customerId: "c-hoasen", amount: 890_000, status: "paid", daysAgo: 11 },
    { id: "o-8", number: 8, customerId: "c-ha", amount: 145_000, status: "paid", daysAgo: 9 },
    { id: "o-9", number: 9, customerId: "c-huong", amount: 410_000, status: "delivered", daysAgo: 6 },
    { id: "o-10", number: 10, customerId: "c-bengoan", amount: 1_050_000, status: "delivered", daysAgo: 4 },
    { id: "o-11", number: 11, customerId: "c-tuan", amount: 275_000, status: "delivering", daysAgo: 2 },
    { id: "o-12", number: 12, customerId: "c-lan", amount: 560_000, status: "delivering", daysAgo: 1 },
    { id: "o-13", number: 13, customerId: "c-ha", amount: 198_000, status: "delivering", daysAgo: 0.3 },
  ];

  const orders: Order[] = rows.map((row) => {
    const customer = byId[row.customerId];
    const createdAt = now - row.daysAgo * DAY;
    const deliveredAt =
      row.status === "delivered" || row.status === "paid"
        ? createdAt + 8 * 3_600_000
        : undefined;
    const paidAt = row.status === "paid" ? createdAt + 20 * 3_600_000 : undefined;
    return {
      id: row.id,
      number: row.number,
      customerId: row.customerId,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      amount: row.amount,
      status: row.status,
      createdAt,
      updatedAt: paidAt ?? deliveredAt ?? createdAt,
      deliveredAt,
      paidAt,
      isSample: true,
    };
  });

  return { customers, orders, nextOrderNumber: 14 };
}

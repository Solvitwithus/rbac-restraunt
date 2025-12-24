import prisma from "@/lib/prisma";  
import { url } from "inspector";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderName, selectedItems } = body;

    if (!orderName || !selectedItems?.length) {
      return NextResponse.json(
        { status: "ERROR", message: "Invalid data" },
        { status: 400 }
      );
    }

    // Check if orderName already exists
    const existingOrder = await prisma.order.findUnique({
      where: { orderName },
    });

    if (existingOrder) {
      return NextResponse.json(
        { status: "ERROR", message: "Order name already exists" },
        { status: 409 } // 409 = Conflict
      );
    }

    // Create the order
    const newOrder = await prisma.order.create({
      data: {
        orderName,
        status: "Held-order",
        items: {
          create: selectedItems.map((item: any) => ({
            stock_id: item.stock_id,
            name: item.name,
            description: item.description,
            price: item.price,
            units: item.units,
            category_id: item.category_id,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ status: "SUCCESS", order: newOrder });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "ERROR", message: "Failed to hold order" },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ["New", "Held-order"] }, // shorter syntax
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ status: "SUCCESS", orders });
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { status: "ERROR", message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}



// DELETE – delete by orderName
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderName = searchParams.get("orderName");

    if (!orderName) {
      return NextResponse.json(
        { status: "ERROR", message: "Missing orderName" },
        { status: 400 }
      );
    }

    // Find the order first
    const existingOrder = await prisma.order.findUnique({
      where: { orderName },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { status: "ERROR", message: "Order not found" },
        { status: 404 }
      );
    }

    // Delete items first (if cascade not set)
    await prisma.orderItem.deleteMany({ where: { orderId: existingOrder.id } });

    // Delete order
    await prisma.order.delete({ where: { id: existingOrder.id } });

    return NextResponse.json({
      status: "SUCCESS",
      message: `Order "${orderName}" deleted successfully`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "ERROR", message: "Failed to delete order" },
      { status: 500 }
    );
  }
}



export async function PATCH(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const orderName = url.searchParams.get("orderName");

    if (!orderName) {
      return NextResponse.json(
        { status: "ERROR", message: "Missing orderName" },
        { status: 400 }
      );
    }

    // Find the order first
    const existingOrder = await prisma.order.findUnique({
      where: { orderName },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { status: "ERROR", message: "Order not found" },
        { status: 404 }
      );
    }

    // Update the status
    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: { status: "Processed" }, // or whatever status you want
    });

    return NextResponse.json({ status: 200, order: updatedOrder });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { status: "ERROR", message: "Failed to update order status" },
      { status: 500 }
    );
  }
}
// app/api/roles/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface CreateRoleBody {
  roleName: string;
  permissions: Record<string, boolean>; // e.g., { salesRegister: true, reports: false }
  staffId: string; // NEW: name of the new staff member to create
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateRoleBody = await req.json();

    // Validate inputs
    if (!body.roleName || !body.roleName.trim()) {
      return NextResponse.json(
        { error: "Role name is required" },
        { status: 400 }
      );
    }

    if (!body.staffId || !body.staffId.trim()) {
      return NextResponse.json(
        { error: "Staff member name is required" },
        { status: 400 }
      );
    }

    const roleName = body.roleName.trim();
    const staffName = body.staffId.trim();

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "A role with this name already exists" },
        { status: 409 }
      );
    }

    // 1. Create the role
    const role = await prisma.role.create({
      data: {
        name: roleName,
      },
    });

    // 2. Create permissions for this role
    if (body.permissions && Object.keys(body.permissions).length > 0) {
      const permissionData = Object.entries(body.permissions).map(
        ([name, value]) => ({
          name,
          value,
          roleId: role.id,
        })
      );

      await prisma.permission.createMany({
        data: permissionData,
      });
    }

    // 3. Create the new staff member (User) and assign the role
    const newUser = await prisma.user.create({
      data: {
        name: staffName,
        roleId: role.id, // directly assign the new role
        // cp defaults to "0_" as per schema
        // isActive defaults to true
      },
    });

    // Success response
    return NextResponse.json({
      message: "Role and staff member created successfully",
      role: {
        id: role.id,
        name: role.name,
      },
      user: {
        id: newUser.id,
        name: newUser.name,
      },
    });
  } catch (error: any) {
    console.error("Error creating role and user:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A role with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create role and staff member", details: error.message },
      { status: 500 }
    );
  }
}



export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // Fetch single role with its permissions
      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          permissions: {
            select: {
              name: true,
              value: true,
            },
          },
        },
      });

      if (!role) {
        return NextResponse.json(
          { error: "Role not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ role });
    }

    // Fetch all roles with their permissions
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          select: {
            name: true,
            value: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ roles });
  } catch (error: any) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}
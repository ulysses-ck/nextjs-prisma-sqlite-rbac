import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: session.user.role === "ADMIN" 
        ? {} 
        : { userId: session.user.id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, userId } = body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}
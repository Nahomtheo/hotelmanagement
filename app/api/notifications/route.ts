import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Notification from '@/lib/mongodb/models/Notification';
import { errorResponse, successResponse } from '@/lib/utils/errorHandler';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if ((!session?.user as any)?.id) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const unread = searchParams.get('unread') === 'true';

    await connectDB();

    let query: any = {
      userId: (session?.user as any).id,
      isDeleted: false,
    };

    if (unread) {
      query.read = false;
    }

    const skip = (page - 1) * limit;
    const notifications = await Notification.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(query);

    return NextResponse.json(
      successResponse({
        notifications,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch notifications'),
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if ((!session?.user as any)?.id) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const { notificationIds } = await req.json();

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json(
        errorResponse('Invalid request'),
        { status: 400 }
      );
    }

    await connectDB();

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId: (session?.user as any).id,
      },
      { read: true }
    );

    return NextResponse.json(
      successResponse(null, 'Notifications marked as read')
    );
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json(
      errorResponse('Failed to update notifications'),
      { status: 500 }
    );
  }
}

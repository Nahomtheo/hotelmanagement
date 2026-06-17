import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/mongodb/models/User';
import { userRegistrationSchema } from '@/lib/validations';
import { errorResponse, successResponse } from '@/lib/utils/errorHandler';
import { generateVerificationToken, sendVerificationEmail } from '@/lib/services/notificationService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validation = userRegistrationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors as any),
        { status: 400 }
      );
    }

    await connectDB();

    const { email, password, firstName, lastName, phone } = validation.data;

     const hashedPassword = await bcrypt.hash(password, 12);

    // Check if user exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });

    if (existingUser) {
      return NextResponse.json(
        errorResponse('Email already registered', 400),
        { status: 400 }
      );
    }

    // Generate verification token
    const { token, expiry } = generateVerificationToken();

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      emailVerificationToken: token,
      emailVerificationExpiry: expiry,
    });

    await user.save();

    // Send verification email
    const verificationEmailSent = await sendVerificationEmail(email, firstName, token);
    if (verificationEmailSent) {
      console.log(`Verification email sent to ${email}`);
    } else {
      console.error(`Failed to send verification email to ${email}`);
    }

    return NextResponse.json(
      successResponse(
        { id: user._id, email: user.email },
        'Registration successful. Please check your email to verify your account.',
        201
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      errorResponse('Registration failed'),
      { status: 500 }
    );
  }
}

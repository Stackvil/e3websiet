const { z } = require('zod');

// Auth Schemas
const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email(),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        role: z.enum(['admin', 'customer']).optional()
    })
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1)
    })
});

const sendOtpSchema = z.object({
    body: z.object({
        mobile: z.string().regex(/^\d{10}$/, 'Invalid mobile number')
    })
});

const verifyOtpSchema = z.object({
    body: z.object({
        mobile: z.string().regex(/^\d{10}$/, 'Invalid mobile number'),
        otp: z.string().length(6, 'OTP must be 6 digits'),
        name: z.string().optional()
    })
});

const bypassLoginSchema = z.object({
    body: z.object({
        mobile: z.string().regex(/^\d{10}$/, 'Invalid mobile number')
    })
});

// E3/E4 Schemas
const addRideSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        price: z.number().nonnegative(),
        ageGroup: z.string().optional(),
        category: z.literal('play').optional(),
        type: z.string().optional(),
        status: z.enum(['on', 'off']).optional(),
        image: z.string().url().optional(),
        desc: z.string().optional()
    })
});

const addDineSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        price: z.number().nonnegative(),
        category: z.literal('dine').optional(),
        cuisine: z.string().optional(),
        stall: z.string().optional(),
        image: z.string().url().optional(),
        status: z.enum(['on', 'off']).optional(),
        open: z.boolean().optional()
    })
});

// Event Schemas
const getEventsSchema = z.object({
    query: z.object({
        location: z.enum(['E3', 'E4']).optional()
    })
});

const addEventSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        start_time: z.string().optional(), // Could refine todatetime
        end_time: z.string().optional(),
        location: z.enum(['E3', 'E4']),
        price: z.number().nonnegative(),
        type: z.string().optional(),
        status: z.string().optional(),
        image: z.string().url().optional()
    })
});

// Order Schemas
const checkoutSchema = z.object({
    body: z.object({
        items: z.array(z.object({
            id: z.string(),
            name: z.string(),
            price: z.number().nonnegative(),
            quantity: z.number().int().positive(),
            details: z.object({
                date: z.string().optional(),
                startTime: z.string().optional(),
                endTime: z.string().optional(),
                guests: z.string().optional()
            }).optional()
        }))
    })
});

// Booking Schemas
const checkAvailabilitySchema = z.object({
    body: z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
        roomName: z.string().min(1)
    })
});

// Payment Schemas
const initiatePaymentSchema = z.object({
    body: z.object({
        amount: z.number().min(1),
        firstname: z.string(),
        email: z.string().email(),
        phone: z.string(),
        productinfo: z.string(),
        items: z.array(z.any()).optional()
    })
});

// Sponsor Schemas
const addSponsorSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        image: z.string().url(),
        website: z.string().url().optional(),
        tier: z.string().optional()
    })
});

module.exports = {
    registerSchema,
    loginSchema,
    sendOtpSchema,
    verifyOtpSchema,
    bypassLoginSchema,
    addRideSchema,
    addDineSchema,
    getEventsSchema,
    addEventSchema,
    checkoutSchema,
    checkAvailabilitySchema,
    initiatePaymentSchema,
    addSponsorSchema
};

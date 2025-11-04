
import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

const bookingSchema = z.object({
  documentId: z.string(),
  deliveryAddress: z.object({
    street: z.string(),
    city: z.string(),
    province: z.string(),
    postalCode: z.string(),
    country: z.string().default('South Africa')
  }),
  deliveryMethod: z.enum(['standard', 'express', 'collect_at_office']),
  officeLocation: z.string().optional(),
  paymentMethod: z.enum(['card', 'eft', 'cash_on_delivery']),
  contactNumber: z.string(),
  email: z.string().email()
});

// Book hardcopy delivery
router.post('/book-hardcopy', async (req: Request, res: Response) => {
  try {
    const bookingData = bookingSchema.parse(req.body);

    // Calculate delivery fee
    const deliveryFees = {
      standard: 50,
      express: 150,
      collect_at_office: 0
    };

    const fee = deliveryFees[bookingData.deliveryMethod];

    // Generate booking reference
    const bookingRef = `DHA-BK-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Store booking (in production, save to database)
    const booking = {
      bookingReference: bookingRef,
      documentId: bookingData.documentId,
      deliveryAddress: bookingData.deliveryAddress,
      deliveryMethod: bookingData.deliveryMethod,
      officeLocation: bookingData.officeLocation,
      deliveryFee: fee,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
      estimatedDelivery: calculateEstimatedDelivery(bookingData.deliveryMethod)
    };

    res.json({
      success: true,
      booking,
      paymentUrl: `/api/dha-booking/payment/${bookingRef}`
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Booking failed'
    });
  }
});

// Get available DHA offices for collection
router.get('/offices', async (req: Request, res: Response) => {
  const offices = [
    { id: 'jhb-civic', name: 'Johannesburg Civic Centre', address: 'Cnr Rissik & Market Streets, Johannesburg', province: 'Gauteng' },
    { id: 'pta-arcadia', name: 'Pretoria Arcadia', address: '270 Proes Street, Pretoria', province: 'Gauteng' },
    { id: 'cpt-civic', name: 'Cape Town Civic Centre', address: '12 Hertzog Boulevard, Cape Town', province: 'Western Cape' },
    { id: 'dbn-pixley', name: 'Durban Pixley ka Isaka Seme', address: '45 NMR Avenue, Durban', province: 'KwaZulu-Natal' },
    { id: 'pe-newton', name: 'Port Elizabeth Newton Park', address: '1st Avenue, Newton Park, Gqeberha', province: 'Eastern Cape' },
    { id: 'blm-civic', name: 'Bloemfontein Civic Centre', address: 'Cnr Nelson Mandela & Aliwal Streets, Bloemfontein', province: 'Free State' }
  ];

  res.json({ success: true, offices });
});

// Process payment
router.post('/payment/:bookingRef', async (req: Request, res: Response) => {
  try {
    const { bookingRef } = req.params;
    const { paymentMethod, cardDetails, eftDetails } = req.body;

    // In production, integrate with payment gateway
    const paymentRef = `DHA-PAY-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    res.json({
      success: true,
      paymentReference: paymentRef,
      status: 'completed',
      message: 'Payment processed successfully',
      trackingUrl: `/api/dha-booking/track/${bookingRef}`
    });

  } catch (error) {
    console.error('Payment error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed'
    });
  }
});

// Track booking
router.get('/track/:bookingRef', async (req: Request, res: Response) => {
  const { bookingRef } = req.params;

  // In production, retrieve from database
  const tracking = {
    bookingReference: bookingRef,
    status: 'in_transit',
    statusHistory: [
      { status: 'pending_payment', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
      { status: 'payment_confirmed', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
      { status: 'document_printed', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { status: 'in_transit', timestamp: new Date().toISOString() }
    ],
    estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString(),
    courierInfo: {
      company: 'DHA Express Courier',
      trackingNumber: `DHAx${Math.random().toString(36).substring(7).toUpperCase()}`
    }
  };

  res.json({ success: true, tracking });
});

function calculateEstimatedDelivery(method: string): string {
  const now = new Date();
  const daysToAdd = method === 'express' ? 2 : method === 'standard' ? 5 : 0;
  const deliveryDate = new Date(now.getTime() + daysToAdd * 86400000);
  return deliveryDate.toISOString();
}

export default router;

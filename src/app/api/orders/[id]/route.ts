import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const orderId = params.id;

    if (!orderId) {
        return NextResponse.json({ message: 'Order ID is required.' }, { status: 400 });
    }

    try {
        const db = await getDb();
        const result = await db.run("DELETE FROM orders WHERE id = ?", orderId);
        
        if (result.changes === 0) {
            return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Order deleted successfully.' }, { status: 200 });

    } catch (error: any) {
        console.error(`Failed to delete order ${orderId}:`, error);
        return NextResponse.json({ message: error.message || 'An unknown server error occurred.' }, { status: 500 });
    }
}

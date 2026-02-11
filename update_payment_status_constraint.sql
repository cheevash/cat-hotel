-- Drop the existing check constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

-- Add the new check constraint including 'PendingApproval'
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_check 
CHECK (payment_status IN ('Unpaid', 'Pending', 'PendingApproval', 'Paid', 'Failed', 'Cancelled'));

-- Comment to document the change
COMMENT ON COLUMN bookings.payment_status IS 'Status of the payment: Unpaid, Pending, PendingApproval, Paid, Failed, Cancelled';

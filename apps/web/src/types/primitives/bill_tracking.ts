export interface bill_tracking{
    id ?: Number;
    created_at?: string;
    bill_name?: string;
    event_id?: string;
    member_in_charge?: string;
    image_red_bill ?: string;
    image_white_bill ?: string;
    total_price ?: Number;
    paid_amount ?: Number;
    total_diff ?: Number;
    tnote ?: string;
    completed_at?: string;
    updated_at?: string;
}
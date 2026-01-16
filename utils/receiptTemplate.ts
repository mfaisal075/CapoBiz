export const generateReceiptHTML = (
  order: any,
  date: string,
  businessName: string,
  businessAddress: string,
  businessPhone: string,
) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
    .header p { margin: 5px 0; font-size: 14px; color: #666; }
    .meta-info { margin-bottom: 20px; font-size: 12px; line-height: 1.6; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
    .table th { background-color: #f9f9f9; font-weight: bold; }
    .footer-totals { width: 100%; margin-top: 20px; font-size: 12px; }
    .footer-totals td { padding: 5px; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .footer-note { margin-top: 40px; text-align: center; font-size: 10px; color: #999; }
  </style>
</head>
<body>
  <div class="header">
    <div style="display: flex; justify-content: space-between; font-size: 10px; color: #999; margin-bottom: 10px;">
      <span>${date}</span>
      <span>Point of Sale System</span>
    </div>
    <h1>${businessName || 'Business Name'}</h1>
    <p>${businessAddress || 'Business Address'}</p>
    <p>${businessPhone || 'Phone Number'}</p>
  </div>

  <div class="meta-info">
    <div><strong>Company:</strong> Technic Mentors</div>
    <div><strong>Supplier:</strong> ${order?.prch_sup_id || 'N/A'}</div>
    <div><strong>Transporter:</strong> ${order?.prch_trans_id || '--'}</div>
    <div><strong>Invoice#:</strong> ${order?.prch_invoice_no}</div>
    <div><strong>PO Ref#:</strong> --</div>
    <div><strong>Date:</strong> ${date}</div>
    <div><strong>Builty#:</strong> ${order?.prch_builty_no || '--'}</div>
    <div><strong>Vehicle#:</strong> ${order?.prch_vehicle_no || '--'}</div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Product</th>
        <th>Quantity</th>
        <th>Cost Price</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      <!-- Items would list here, but usually cart is cleared. Using total purchase as single line or placeholder if details unavailable in invcOrder context -->
       <tr>
        <td>Purchase Items</td>
        <td>--</td>
        <td>--</td>
        <td class="text-right">${order?.prch_total_purchase}</td>
      </tr>
    </tbody>
  </table>

  <table class="footer-totals" style="width: 50%; margin-left: auto;">
    <tr>
      <td>Order Total:</td>
      <td class="text-right">${order?.prch_order_total}</td>
    </tr>
    <tr>
      <td>Freight Charges:</td>
      <td class="text-right">${order?.prch_freight_charges}</td>
    </tr>
    <tr>
      <td class="bold">Total Purchase:</td>
      <td class="text-right bold">${order?.prch_total_purchase}</td>
    </tr>
    <tr>
      <td>Paid Amount:</td>
      <td class="text-right">${order?.prch_paid_amount}</td>
    </tr>
    <tr>
      <td class="bold">Balance:</td>
      <td class="text-right bold">${order?.prch_balance}</td>
    </tr>
  </table>

  <div class="footer-note">
    Software Developed with love by<br>
    Technic Mentors
  </div>
</body>
</html>
`;

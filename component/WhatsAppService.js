import axios from 'axios';

const ACCESS_TOKEN =
  'EAAdGJspwXKMBQeBho7e0izbWs5EIiwUaHWoDZBj8l4PLaB4uhATANNRfpHVXOAIJZBeUm5ZAtQI4OfHAkPc58BZBFBM9qpsV17WolqJM7PINIHreMcqqvaDcTJss2aFBrcAXZCagHn6Wd5Ug3v8VVs3wgjCWztJI5P2Yp4tNmZB9oreNsHNyad0M5rnacy6exMgL3MWLZBNjrYZAJqnSvR7aMLZAxjzoYkdF5iimG1GPR4ZAoceWo6TEGZAHZAxlrPPUzvYrMJuM2taQRfgkTwlIEWamETrj8vKkGWNrmcGNzQZDZD';
const PHONE_NUMBER_ID = '970902619437617';
const VERSION = 'v22.0';

export const sendReportToWhatsApp = async (customerPhone, pdfFilePath) => {
  try {
    const formData = new FormData();

    const fileObj = {
      uri: pdfFilePath, // e.g. 'file:///data/user/0/.../report.pdf'
      name: 'report.pdf',
      type: 'application/pdf',
    };

    formData.append('file', fileObj);
    formData.append('messaging_product', 'whatsapp');

    console.log('Uploading file...');

    const uploadUrl = `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/media`;

    const uploadRes = await axios.post(uploadUrl, formData, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'multipart/form-data', // React Native mein kabhi kabhi isko remove karna padta hai agar upload fail ho
      },
    });

    const mediaId = uploadRes.data.id;
    console.log('File Uploaded! Media ID:', mediaId);

    // 2. Ab is Media ID ko customer ke number par bhejein
    const messageData = {
      messaging_product: 'whatsapp',
      to: customerPhone,
      type: 'document',
      document: {
        id: mediaId,
        filename: 'Customer_Report.pdf',
        caption: 'Aapki report ready hai.',
      },
    };

    // URL Correction here too
    const messageUrl = `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`;

    const sendRes = await axios.post(messageUrl, messageData, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Success! Report Sent.', sendRes.data);
    alert('Report successfully sent to WhatsApp!');
  } catch (error) {
    // Error handling ko behtar banaya
    console.error(
      'Error details:',
      error.response ? error.response.data : error.message,
    );

    if (error.response?.data?.error?.message) {
      alert(`Failed: ${error.response.data.error.message}`);
    } else {
      alert('Sending failed. Check console.');
    }
  }
};

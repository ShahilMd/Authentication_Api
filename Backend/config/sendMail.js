

const sendMail = async ({email, subject, html}) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev", 
      to: [email],                     
      subject: subject,
      html: html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Resend API Error:", data);
    throw new Error(`Resend API Error: ${JSON.stringify(data)}`);
  }

  console.info("Email sent successfully:", data);
};

export default sendMail;

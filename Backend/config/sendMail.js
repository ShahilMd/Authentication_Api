

const sendMail = async (email,subject,html)=>{
  const response = await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':`Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: "Authenticator <noreply@authenticator.com>",
      to:[email],
      subject:subject,
      text:html
    })
  })

  if(!response.ok){
    const errorData = await response.json();
    throw new Error(
      `resend api error ${errorData.error?.message}`
    )
  }
  const emailResult = await response.json();

  console.info("sending email --- ",emailResult);
  

}

export default sendMail;
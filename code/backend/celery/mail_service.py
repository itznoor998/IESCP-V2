import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


SMTP_SERVICE = 'localhost'
SMTP_PORT = 1025
SENDER_EMAIL = 'myApp@gmail.com'
SENDER_PASSWORD = ''


def send_email(to,subject,content):
    msg = MIMEMultipart()
    msg['To'] = to
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL

    msg.attach(MIMEText(content,'html'))

    with smtplib.SMTP(host=SMTP_SERVICE,port=SMTP_PORT) as client:
        client.send_message(msg=msg)
        client.quit()


#send_email('admin@gmail.com',"Trial Email","<h1>Welcome to smtp mail hog</h1>")
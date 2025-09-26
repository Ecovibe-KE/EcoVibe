from .mail_config import send_email


def send_contact_email(to_email, email_type, data):
    """Send contact form email based on type (admin or user)"""
    # Admin email template
    admin_template = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .header {{
                    background-color: #37B137;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }}
                .content {{
                    padding: 20px;
                }}
                .field {{
                    margin-bottom: 15px;
                }}
                .field-label {{
                    font-weight: bold;
                    color: #1e62db;
                }}
                .footer {{
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #666;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
                <div class="field">
                    <span class="field-label">Full Name:</span> {data['name']}
                </div>
                <div class="field">
                    <span class="field-label">Phone:</span> {data['phone']}
                </div>
                <div class="field">
                    <span class="field-label">Industry:</span> {data['industry']}
                </div>
                <div class="field">
                    <span class="field-label">Email:</span> {data['email']}
                </div>
                <div class="field">
                    <span class="field-label">Message:</span><br>
                    {data['message']}
                </div>
            </div>
            <div class="footer">
                <p>This message was sent from the contact form on EcoVibe</p>
            </div>
        </body>
        </html>
        """

    # User email template
    user_template = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .header {{
                    background-color: #37B137;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }}
                .content {{
                    padding: 20px;
                }}
                .footer {{
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #666;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Thank You for Contacting Us</h1>
            </div>
            <div class="content">
                <p>Dear {data['name']},</p>
                <p>Thank you for reaching out to us. We have received your message
                and our team will get back to you within 24-48 hours.</p>
                <p>For your records, here's a copy of the information you submitted:
                </p>
                <p><strong>Phone:</strong> {data['phone']}<br>
                <strong>Industry:</strong> {data['industry']}<br>
                <strong>Message:</strong> {data['message']}</p>
                <p>Best regards,<br>ECOVIBE</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.
                </p>
            </div>
        </body>
        </html>
        """

    # Choose template based on email type
    if email_type == "admin":
        subject = f"New Contact Form Submission from {data['name']}"
        body = admin_template
    else:  # user confirmation
        subject = "Thank You for Contacting Us"
        body = user_template

    # Send email using HTML format
    return send_email(to_email, subject, body, is_html=True)


def send_verification_email(to_email, user_name, verify_link):
    """Send account verification email to a new user"""
    subject = "Verify Your EcoVibe Account"

    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .header {{
                background-color: #37B137;
                color: white;
                padding: 20px;
                text-align: center;
            }}
            .content {{
                padding: 20px;
            }}
            .button {{
                display: inline-block;
                padding: 12px 24px;
                font-size: 16px;
                background-color: #37B137;
                color: white !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
            }}
            .footer {{
                text-align: center;
                padding: 20px;
                font-size: 12px;
                color: #666;
            }}
            .link-box {{
                margin-top: 20px;
                padding: 10px;
                border: 1px solid #ddd;
                background-color: #f9f9f9;
                word-wrap: break-word;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Verify Your Account</h1>
        </div>
        <div class="content">
            <p>Dear {user_name},</p>
            <p>Thank you for registering with EcoVibe. Please verify your email
            by clicking the button below:</p>

            <p style="text-align:center;">
                <a href="{verify_link}" class="button">Verify Account</a>
            </p>

            <p>This link will expire in 24 hours.</p>

            <p>If the button above doesn’t work, copy and paste this link
            into your browser:</p>
            <div class="link-box">{verify_link}</div>

            <p>If you did not register, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply.</p>
        </div>
    </body>
    </html>
    """

    return send_email(to_email, subject, body, is_html=True)
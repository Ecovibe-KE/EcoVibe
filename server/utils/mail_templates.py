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
                <p>Thank you for reaching out to us. We have received your
                message and our team will get back to you within 24-48 hours.
                </p>
                <p>For your records, here's a copy of the information you
                submitted:</p>
                <p><strong>Phone:</strong> {data['phone']}<br>
                <strong>Industry:</strong> {data['industry']}<br>
                <strong>Message:</strong> {data['message']}</p>
                <p>Best regards,<br>ECOVIBE</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this
                email.</p>
            </div>
        </body>
        </html>
        """

    if email_type == "admin":
        subject = f"New Contact Form Submission from {data['name']}"
        body = admin_template
    else:  # user confirmation
        subject = "Thank You for Contacting Us"
        body = user_template

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


def send_invitation_email(
    recipient_email, recipient_name, invitation_link, invited_by, password
):
    """Send user invitation email"""
    subject = "You've been invited to join our platform"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .button-password {{
                background-color: #37B137;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 4px;
                display: inline-block;
                font-weight: bold;
            }}
            .password-box {{
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 10px;
                margin: 15px 0;
                font-family: monospace;
                font-size: 16px;
                text-align: center;
                font-weight: bold;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Welcome to Our Platform!</h2>
            <p>Hello {recipient_name},</p>
            <p>You have been invited by {invited_by} to join our platform.</p>

            <p>Your temporary password is:</p>
            <div class="password-box">{password}</div>
            <p>Please click the button below to set your password and
            activate your account:</p>
            <p>
                <a href="{invitation_link}" class="button-password">Set Your Password</a>
            </p>
            <p><small>This invitation link will expire in 24 hours.</small></p>
        </div>
    </body>
    </html>
    """
    return send_email(recipient_email, subject, html_content, is_html=True)


def send_reset_email(to_email, user_name, reset_link):
    """Send password reset email to a user"""
    subject = "Reset Your EcoVibe Account Password"

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
            <h1>Reset Your Password</h1>
        </div>
        <div class="content">
            <p>Dear {user_name},</p>
            <p>We received a request to reset your EcoVibe account password.
            You can reset it by clicking the button below:</p>

            <p style="text-align:center;">
                <a href="{reset_link}" class="button">Reset Password</a>
            </p>

            <p>This link will expire in 30 minutes.</p>

            <p>If the button above doesn’t work, copy and paste this link
            into your browser:</p>
            <div class="link-box">{reset_link}</div>

            <p>If you did not request a password reset, you can safely ignore
            this email.</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply.</p>
        </div>
    </body>
    </html>
    """

    return send_email(to_email, subject, body, is_html=True)


def send_newsletter_email(
    to_email,
    subject,
    content,
    call_to_action_link,
    unsubscribe_link,
    view_online_link,
    preheader_text,
    current_year,
    blog_thumbnail_url,
):
    """Send newsletter email to subscribers"""
    body = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{subject}</title>
            <style>
        @import url('https://fonts.googleapis.com/css2?
        family=Roboto:wght@400;700&display=swap');
              body {{
                    margin: 0;
                    padding: 0;
                    font-family: 'Roboto', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                }}
                .email-container {{
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    overflow: hidden;
                }}
                .header {{
                    background-color: #37B137;
                    padding: 40px 20px;
                    text-align: center;
                    color: #ffffff;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .content p {{
                    margin: 0 0 20px;
                    font-size: 16px;
                }}
                .button {{
                    display: inline-block;
                    background-color: #37B137;
                    color: #ffffff;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: 700;
                    text-align: center;
                }}
                .footer {{
                    text-align: center;
                    padding: 30px 20px;
                    font-size: 12px;
                    color: #999;
                    background-color: #f9f9f9;
                    border-top: 1px solid #eee;
                }}
                .footer a {{
                    color: #37B137;
                    text-decoration: underline;
                }}
                .footer p {{
                    margin: 0;
                    line-height: 1.5;
                }}
                .preheader {{
                    display: none !important;
                    visibility: hidden;
                    opacity: 0;
                    color: transparent;
                    height: 0;
                    width: 0;
                    font-size: 1px;
                    line-height: 1px;
                }}
            </style>
        </head>
        <body>
            <span class="preheader">{preheader_text}</span>
            <div class="email-container">
                <div class="header">
                    <h1>{subject}</h1>
                </div>
                <div class="content">
                    <img src="{blog_thumbnail_url}" alt="EcoVibe Logo"
                         style="display: block; margin: 0 auto;">
                    {content}
                    <p style="text-align: center; margin-top: 30px;">
                        <a href="{call_to_action_link}" class="button">Read More</a>
                    </p>
                </div>
                <div class="footer">
                    <p>
                        You are receiving this email because
                            you signed up for our newsletter.
                    </p>
                    <p>
                        <a href="{unsubscribe_link}">Unsubscribe</a> |
                        <a href="{view_online_link}">View this email in your browser</a>
                    </p>
                    <p>&copy; {current_year} Ecovibe Ke. All Rights Reserved.</p>
                    <p>The Mint Hub Offices Western Heights, Nairobi</p>
                </div>
            </div>
        </body>
        </html>
            """
    return send_email(to_email, subject, body, is_html=True)

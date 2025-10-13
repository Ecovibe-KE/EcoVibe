from datetime import datetime

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

            <p>Your password is:</p>
            <div class="password-box">{password}</div>
            <p>Please click the button below to activate
            activate your account:</p>
            <p>
                <a href="{invitation_link}" class="button-password">
                Activate Account</a>
            </p>
            <p>Reset password after login</p>
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


def send_quote_email(to_email, email_type, data):
    """Send quote request email based on type (admin or client)"""

    # Admin email template - Notification about new quote request
    admin_template = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                }}
                .header {{
                    background-color: #37B137;
                    color: white;
                    padding: 25px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 24px;
                }}
                .content {{
                    padding: 25px;
                    background-color: #f9f9f9;
                }}
                .quote-details {{
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .field {{
                    margin-bottom: 12px;
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                }}
                .field:last-child {{
                    border-bottom: none;
                }}
                .field-label {{
                    font-weight: bold;
                    color: #1e62db;
                    display: inline-block;
                    width: 140px;
                }}
                .field-value {{
                    color: #333;
                }}
                .project-details {{
                    background: #f8f9fa;
                    padding: 15px;
                    border-left: 4px solid #37B137;
                    margin: 15px 0;
                }}
                .priority {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 10px;
                    border-radius: 4px;
                    margin: 15px 0;
                    text-align: center;
                }}
                .footer {{
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #666;
                    background-color: #f1f1f1;
                }}
                .action-button {{
                    display: inline-block;
                    background-color: #37B137;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 4px;
                    margin: 15px 0;
                }}
                .timestamp {{
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    margin: 10px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📋 New Quote Request Received</h1>
                </div>
                <div class="content">
                    <div class="priority">
                        <strong>🚀 ACTION REQUIRED:
                        </strong>New quote request requires your attention
                    </div>

                    <div class="quote-details">
                        <h3 style="margin-top: 0; color: #37B137;">
                            Customer Information
                        </h3>
                        <div class="field">
                            <span class="field-label">Full Name:</span>
                            <span class="field-value">
                                {data.get('name', 'Not provided')}
                            </span>
                        </div>
                        <div class="field">
                            <span class="field-label">Email:</span>
                            <span class="field-value">
                                <a href="mailto:{data.get('email', '')}">
                                    {data.get('email', 'Not provided')}
                                </a>
                            </span>
                        </div>
                        <div class="field">
                            <span class="field-label">Phone:</span>
                            <span class="field-value">
                                <a href="tel:{data.get('phone', '')}">
                                    {data.get('phone', 'Not provided')}
                                </a>
                            </span>
                        </div>
                        <div class="field">
                            <span class="field-label">Company:</span>
                            <span class="field-value">
                                {data.get('company', 'Not provided')}
                            </span>
                        </div>
                    </div>

                    <div class="quote-details">
                        <h3 style="color: #37B137;">Service Details</h3>
                        <div class="field">
                            <span class="field-label">Service Requested:</span>
                            <span class="field-value"
                            style="font-weight: bold; color: #37B137;">
                                {data.get('service', 'Not specified')}
                            </span>
                        </div>
                    </div>

                    <div class="quote-details">
                        <h3 style="color: #37B137;">Project Information</h3>
                        <div class="project-details">
                            <strong>Project Details:</strong><br>
                            {data.get('projectDetails', 'No project details provided.')}
                        </div>
                    </div>

                    <div style="text-align: center; margin: 25px 0;">
                        <a href="mailto:{data.get('email', '')}
                        ?subject=Follow-up on your
                        {data.get('service', 'service')} quote request&body=Dear
                        {data.get('name', 'Valued Customer')},"
                        class="action-button">
                            ✉️ Reply to Customer
                        </a>
                    </div>

                    <div class="timestamp">
                        Quote request submitted on:
                        {format_timestamp(data.get('timestamp'))}
                    </div>
                </div>
                <div class="footer">
                    <p>This quote request was submitted through</p>
                    <p>EcoVibe website quote form.</p>
                    <p>Please respond within 24 hours as promised to the customer.</p>
                </div>
            </div>
        </body>
        </html>
        """

    client_template = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                }}
                .header {{
                    background-color: #37B137;
                    color: white;
                    padding: 25px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 24px;
                }}
                .content {{
                    padding: 25px;
                    background-color: #f9f9f9;
                }}
                .confirmation-box {{
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    text-align: center;
                }}
                .details {{
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }}
                .detail-item {{
                    margin-bottom: 10px;
                    padding: 8px 0;
                }}
                .detail-label {{
                    font-weight: bold;
                    color: #1e62db;
                }}
                .next-steps {{
                    background: #e8f5e8;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #37B137;
                }}
                .step {{
                    margin-bottom: 15px;
                    display: flex;
                    align-items: flex-start;
                }}
                .step-number {{
                    background-color: #37B137;
                    color: white;
                    border-radius: 50%;
                    width: 25px;
                    height: 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 15px;
                    flex-shrink: 0;
                }}
                .footer {{
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #666;
                    background-color: #f1f1f1;
                }}
                .contact-info {{
                    background: white;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 15px 0;
                    text-align: center;
                }}
                .thank-you {{
                    font-size: 18px;
                    color: #37B137;
                    text-align: center;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Your Quote Request is Confirmed!</h1>
                </div>
                <div class="content">
                    <div class="thank-you">
                        Thank You, {data.get('name', 'Valued Customer')}!
                    </div>

                    <div class="confirmation-box">
                        <p style="font-size: 16px; margin: 0;">
                            We've received your quote request for
                            <strong>{data.get('service', 'our services')}
                            </strong> and will get back to you within
                            <strong>24 hours</strong>.
                        </p>
                    </div>

                    <div class="details">
                        <h3 style="color: #37B137; margin-top: 0;">
                            Your Request Details
                        </h3>
                        <div class="detail-item">
                            <span class="detail-label">Service:</span>
                            {data.get('service', 'Not specified')}
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Name:</span>
                            {data.get('name', 'Not provided')}
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email:</span>
                            {data.get('email', 'Not provided')}
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Phone:</span>
                            {data.get('phone', 'Not provided')}
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Company:</span>
                            {data.get('company', 'Not provided')}
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Project Details:</span><br>
                            {data.get('projectDetails',
                                      'No additional details provided.')}
                        </div>
                    </div>

                    <div class="next-steps">
                        <h3 style="color: #37B137; margin-top: 0;">
                            What Happens Next?
                        </h3>
                        <div class="step">
                            <div class="step-number">1</div>
                            <div>
                                <strong>Initial Review</strong><br>
                                Our team will review your project
                                requirements within the next few hours.
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-number">2</div>
                            <div>
                                <strong>Expert Consultation</strong><br>
                                We'll contact you to discuss your project in
                                more detail and answer any questions.
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-number">3</div>
                            <div>
                                <strong>Custom Quote</strong><br>
                                You'll receive a detailed, no-obligation
                                quote tailored to your specific needs.
                            </div>
                        </div>
                    </div>

                    <div class="contact-info">
                        <h4 style="margin-top: 0; color: #37B137;">
                            Need Immediate Assistance?
                        </h4>
                        <p style="margin: 10px 0;">
                            ✉️ Email: info@ecovibe.co.ke
                        </p>
                        <p style="font-size: 12px; color: #666;">
                            Reference: Quote Request -
                            {data.get('service', 'General')}
                            - {format_timestamp(data.get('timestamp'))}
                        </p>
                    </div>
                </div>
                <div class="footer">
                    <p>This is an automated confirmation message.
                        Please do not reply to this email.</p>
                    <p>If you need to update your quote request,
                        please contact us directly.</p>
                    <p>Best regards,<br><strong>The EcoVibe Team</strong></p>
                </div>
            </div>
        </body>
        </html>
        """

    if email_type == "admin":
        subject = (
            f"📋 New Quote Request: "
            f"{data.get('service', 'General Service')} from "
            f"{data.get('name', 'New Customer')}"
        )
        body = admin_template
    else:  # client confirmation
        subject = (
            f"✅ Your Quote Request "
            f"for {data.get('service', 'Our Services')} is Confirmed"
        )
        body = client_template

    return send_email(to_email, subject, body, is_html=True)


def format_timestamp(timestamp_str):
    """Format timestamp for display in emails"""
    if not timestamp_str:
        return "Not available"

    try:
        # Parse ISO format timestamp
        if 'T' in timestamp_str:
            dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        else:
            dt = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')

        return dt.strftime('%B %d, %Y at %I:%M %p')
    except (ValueError, TypeError):
        return "Recently"

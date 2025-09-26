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

def send_invitation_email(recipient_email, recipient_name, invitation_link, invited_by):
    """Send user invitation email"""
    subject = "You've been invited to join our platform"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .button {{ background-color: #007bff; color: white; padding: 12px 24px; 
                     text-decoration: none; border-radius: 4px; display: inline-block; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Welcome to Our Platform!</h2>
            <p>Hello {recipient_name},</p>
            <p>You have been invited by {invited_by} to join our platform.</p>
            <p>Please click the button below to set your password and activate your account:</p>
            <p>
                <a href="{invitation_link}" class="button">Set Your Password</a>
            </p>
            <p><small>This invitation link will expire in 24 hours.</small></p>
        </div>
    </body>
    </html>
    """
    send_email(recipient_email, subject, html_content)


def send_mpesa_notification_email(recipient_email, recipient_name, transaction_data):
    """Send MPESA payment notification email"""
    subject = "MPESA Payment Notification"

    # Determine status and styling
    status = transaction_data.get('status', 'completed')
    status_color = "#28a745" if status == "completed" else "#dc3545" if status == "failed" else "#ffc107"
    status_text = status.upper()

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ 
                font-family: 'Arial', sans-serif; 
                line-height: 1.6; 
                color: #333;
                margin: 0;
                padding: 0;
            }}
            .container {{ 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 30px;
                background-color: #f9f9f9;
            }}
            .header {{ 
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }}
            .content {{ 
                background: white;
                padding: 30px;
                border-radius: 0 0 8px 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            .status-badge {{
                display: inline-block;
                padding: 8px 16px;
                background-color: {status_color};
                color: white;
                border-radius: 20px;
                font-weight: bold;
                font-size: 14px;
            }}
            .transaction-details {{
                background: #f8f9fa;
                padding: 20px;
                border-radius: 6px;
                margin: 20px 0;
            }}
            .detail-row {{
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e9ecef;
            }}
            .detail-label {{
                font-weight: bold;
                color: #6c757d;
            }}
            .detail-value {{
                color: #495057;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #6c757d;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>💰 MPESA Payment Notification</h1>
                <p>Your transaction has been processed</p>
            </div>

            <div class="content">
                <p>Hello <strong>{recipient_name}</strong>,</p>

                <p>Your MPESA payment has been <span class="status-badge">{status_text}</span></p>

                <div class="transaction-details">
                    <div class="detail-row">
                        <span class="detail-label">Transaction Code:</span>
                        <span class="detail-value">{transaction_data.get('transaction_code', 'N/A')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Amount:</span>
                        <span class="detail-value">KES {transaction_data.get('amount', 0):,}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone Number:</span>
                        <span class="detail-value">{transaction_data.get('phone_number', 'N/A')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date & Time:</span>
                        <span class="detail-value">{transaction_data.get('payment_date', 'N/A')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Description:</span>
                        <span class="detail-value">{transaction_data.get('description', 'Payment')}</span>
                    </div>
                </div>

                {f'<p><strong>Reason:</strong> {transaction_data.get("reason", "")}</p>' if status == "failed" else ''}

                <p>If you have any questions about this transaction, please contact our support team.</p>

                <div class="footer">
                    <p>This is an automated notification. Please do not reply to this email.</p>
                    <p>&copy; {datetime.now().year} Your Company Name. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    send_email(recipient_email, subject, html_content)


def send_mpesa_stk_push_initiated_email(recipient_email, recipient_name, transaction_data):
    """Send email when STK push is initiated"""
    subject = "MPESA Payment Request Sent"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #007bff; color: white; padding: 20px; text-align: center; }}
            .content {{ background: white; padding: 20px; }}
            .instruction-box {{ 
                background: #e7f3ff; 
                padding: 15px; 
                border-left: 4px solid #007bff;
                margin: 20px 0;
            }}
            .footer {{ text-align: center; margin-top: 20px; color: #6c757d; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>📱 MPESA Payment Request</h2>
            </div>
            <div class="content">
                <p>Hello <strong>{recipient_name}</strong>,</p>

                <p>A payment request of <strong>KES {transaction_data.get('amount', 0):,}</strong> has been sent to your phone.</p>

                <div class="instruction-box">
                    <h3>To complete your payment:</h3>
                    <ol>
                        <li>Check your phone for an MPESA prompt</li>
                        <li>Enter your MPESA PIN when prompted</li>
                        <li>Wait for confirmation message</li>
                    </ol>
                </div>

                <p><strong>Transaction Details:</strong></p>
                <ul>
                    <li>Amount: KES {transaction_data.get('amount', 0):,}</li>
                    <li>Phone: {transaction_data.get('phone_number', 'N/A')}</li>
                    <li>Reference: {transaction_data.get('description', 'Payment')}</li>
                </ul>

                <p>If you don't receive the prompt within 2 minutes, please try again.</p>

                <div class="footer">
                    <p>This is an automated message. Do not reply to this email.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    send_email(recipient_email, subject, html_content)


def send_mpesa_receipt_email(recipient_email, recipient_name, transaction_data):
    """Send detailed receipt for completed MPESA transaction"""
    subject = f"MPESA Payment Receipt - {transaction_data.get('transaction_code', '')}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .receipt-header {{ 
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }}
            .receipt-body {{ 
                background: white;
                padding: 30px;
                border: 2px dashed #28a745;
                border-top: none;
                border-radius: 0 0 8px 8px;
            }}
            .receipt-details {{ margin: 20px 0; }}
            .detail-item {{ 
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
            }}
            .success-icon {{ 
                font-size: 48px;
                color: #28a745;
                text-align: center;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="receipt-header">
                <h1>✅ Payment Successful</h1>
                <p>Thank you for your payment</p>
            </div>

            <div class="receipt-body">
                <div class="success-icon">✓</div>

                <p>Hello <strong>{recipient_name}</strong>,</p>
                <p>Your MPESA payment has been successfully processed. Below are your transaction details:</p>

                <div class="receipt-details">
                    <div class="detail-item">
                        <span>Transaction Code:</span>
                        <strong>{transaction_data.get('transaction_code', 'N/A')}</strong>
                    </div>
                    <div class="detail-item">
                        <span>Amount Paid:</span>
                        <strong>KES {transaction_data.get('amount', 0):,}</strong>
                    </div>
                    <div class="detail-item">
                        <span>Date & Time:</span>
                        <span>{transaction_data.get('payment_date', 'N/A')}</span>
                    </div>
                    <div class="detail-item">
                        <span>From Phone:</span>
                        <span>{transaction_data.get('phone_number', 'N/A')}</span>
                    </div>
                    <div class="detail-item">
                        <span>Description:</span>
                        <span>{transaction_data.get('description', 'Payment')}</span>
                    </div>
                    <div class="detail-item">
                        <span>Status:</span>
                        <span style="color: #28a745; font-weight: bold;">COMPLETED</span>
                    </div>
                </div>

                <p style="background: #d4edda; padding: 15px; border-radius: 4px;">
                    <strong>Note:</strong> This receipt serves as confirmation of your payment. 
                    Please keep it for your records.
                </p>

                <div style="text-align: center; margin-top: 30px; color: #6c757d;">
                    <p>Thank you for choosing our service! 🎉</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    send_email(recipient_email, subject, html_content)
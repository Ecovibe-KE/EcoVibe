import phonenumbers


def validate_phone_number(number, default_region="KE"):
    """Validate and format phone number (same logic as User model)"""
    try:
        parsed = (
            phonenumbers.parse(number, None)
            if number.startswith("+")
            else phonenumbers.parse(number, default_region)
        )
    except phonenumbers.NumberParseException as e:
        raise ValueError(str(e)) from e

    if not phonenumbers.is_valid_number(parsed):
        raise ValueError("Invalid phone number.")

    return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)


def is_valid_phone(number, default_region="KE"):
    """Check if phone is valid without raising exceptions"""
    try:
        validate_phone_number(number, default_region)
        return True
    except ValueError:
        return False
def string_to_boolean(s):
    if s.lower() == "true":
        return True
    elif s.lower() == "false":
        return False
    else:
        # Handle other cases, e.g., raise an error, return None, or a default boolean
        raise ValueError(f"Invalid boolean string: {s}")

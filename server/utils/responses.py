def restful_response(status, data=None, message=None, status_code=200):
    """Standardize RESTful API responses"""
    return {
        "data": data,
        "message": message,
        "status": status,
    }, status_code

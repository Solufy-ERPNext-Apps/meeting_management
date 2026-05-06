import frappe
from frappe.utils import get_url

@frappe.whitelist()
def get_simple_user_list():
    """Returns users who have an active availability record."""
    # Pluck the user field from User Appointment Availability records
    available_users = frappe.get_all(
        "User Appointment Availability",
        filters={"enable_scheduling": 1},
        pluck="user"
    )

    if not available_users:
        return []

    # Get the display details for these specific users
    return frappe.get_all(
        "User",
        filters={"name": ["in", available_users]},
        fields=["name", "full_name"]
    )

@frappe.whitelist()
def get_user_scheduler_url(user):
    """Generates the direct URL for a specific user's scheduler."""
    avail = frappe.get_all(
        "User Appointment Availability",
        filters={"user": user, "enable_scheduling": 1},
        fields=["name", "slug"]
    )[0]

    # Get the first duration type to create a valid link
    duration = frappe.get_all(
        "Appointment Slot Duration",
        filters={"parent": avail.name},
        fields=["name"]
    )[0]

    base_url = get_url(f"/schedule/in/{avail.slug}")
    return f"{base_url}?type={duration.name}"
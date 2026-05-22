# import frappe
# @frappe.whitelist()
# def get_my_assigned_count():
#     user = frappe.session.user
#     count = frappe.db.count("ToDo", filters={"reference_type":"SNM Task","allocated_to": user})
#     frappe.response['message'] = {
#         "value": count,
#         "fieldtype": "Int",
#         "route_options": {"assigned_to": user},
#         "route": ["List", "SNM Task"]
#     }
import frappe
import json

@frappe.whitelist()
def get_my_assigned_count(filters=None):

    user = frappe.session.user

    # ✅ GET FILTERS FROM NUMBER CARD
    task_filters = {}

    if filters:
        filters = json.loads(filters)

        for f in filters:
            field = f[1]
            value = f[3]

            task_filters[field] = value

    # ✅ GET FILTERED SNM TASKS
    task_names = frappe.get_all(
        "SNM Task",
        filters=task_filters,
        pluck="name"
    )

    # ✅ COUNT ONLY CURRENT USER TODO
    count = frappe.db.count(
        "ToDo",
        filters={
            "reference_type": "SNM Task",
            "reference_name": ["in", task_names],
            "allocated_to": user
        }
    )

    return {
        "value": count,
        "fieldtype": "Int",

        # ✅ OPEN FILTERED SNM TASK LIST
        "route_options": {
            "assigned_to": user,
            **task_filters
        },

        "route": ["List", "SNM Task"]
    }
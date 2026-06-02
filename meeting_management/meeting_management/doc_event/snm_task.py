
import frappe
import json
from typing import Optional, Dict, Any
@frappe.whitelist()
def get_my_assigned_count(filters= None):
	user = frappe.session.user

	task_filters = []

	if filters:
		filters = json.loads(filters) if isinstance(filters, str) else filters

		for f in filters:
			# Format: ["SNM Task", "status", "=", "Open"]
			if len(f) >= 4:
				field = f[1]
				operator = f[2]
				value = f[3]

			# Format: ["status", "=", "Open"]
			elif len(f) == 3:
				field = f[0]
				operator = f[1]
				value = f[2]
			else:
				continue

			task_filters.append([field, operator, value])

	task_names = frappe.get_all(
		"SNM Task",
		filters=task_filters,
		pluck="name"
	)

	if not task_names:
		count = 0
	else:
		count = frappe.db.count(
			"ToDo",
			filters={
				"reference_type": "SNM Task",
				"reference_name": ["in", task_names],
				"allocated_to": user,
				"status": "Open"
			}
		)

	return {
		"value": count,
		"fieldtype": "Int",
		"route": ["List", "SNM Task"],
		"route_options": {
			"_assign": ["like", f"%{user}%"]
		}
	}
# import frappe
# import json

# @frappe.whitelist()
# def get_my_assigned_count(filters=None):

#     user = frappe.session.user

#     # ✅ GET FILTERS FROM NUMBER CARD
#     task_filters = {}

#     if filters:
#         filters = json.loads(filters)

#         for f in filters:
#             field = f[1]
#             value = f[3]

#             task_filters[field] = value

#     # ✅ GET FILTERED SNM TASKS
#     task_names = frappe.get_all(
#         "SNM Task",
#         filters=task_filters,
#         pluck="name"
#     )

#     # ✅ COUNT ONLY CURRENT USER TODO
#     count = frappe.db.count(
#         "ToDo",
#         filters={
#             "reference_type": "SNM Task",
#             "reference_name": ["in", task_names],
#             "allocated_to": user
#         }
#     )

#     return {
#         "value": count,
#         "fieldtype": "Int",

#         # ✅ OPEN FILTERED SNM TASK LIST
#         "route_options": {
#             "assigned_to": user,
#             **task_filters
#         },

#         "route": ["List", "SNM Task"]
#     }
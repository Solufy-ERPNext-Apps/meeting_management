# meeting_management/meeting_management/page/meeting_generator/meeting_generator.py

import frappe
from frappe.utils import get_url


@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def get_available_users_query(doctype, txt, searchfield, start, page_len, filters):

	users = frappe.get_all(
		"User Appointment Availability",
		filters={"enable_scheduling": 1},
		pluck="user"
	)

	users = list(set(users))

	if not users:
		return []

	return frappe.db.sql("""
		SELECT
			name,
			full_name
		FROM `tabUser`
		WHERE name IN %(users)s
		AND (
			name LIKE %(txt)s
			OR full_name LIKE %(txt)s
		)
		LIMIT %(start)s, %(page_len)s
	""", {
		"users": tuple(users),
		"txt": f"%{txt}%",
		"start": start,
		"page_len": page_len
	})


@frappe.whitelist()
def get_user_slots(user):

	user_availability = frappe.get_all(
		"User Appointment Availability",
		filters={
			"user": user,
			"enable_scheduling": 1
		},
		fields=["name"]
	)

	if not user_availability:
		return []

	durations = frappe.get_all(
		"Appointment Slot Duration",
		filters={
			"parent": user_availability[0].name
		},
		fields=["name", "title", "duration"]
	)

	return durations


@frappe.whitelist()
def get_schedular_link(user):

	user_availability = frappe.get_all(
		"User Appointment Availability",
		filters={
			"user": user,
			"enable_scheduling": 1
		},
		fields=["*"]
	)

	if not user_availability:
		frappe.throw("No Appointment Availability Found")

	user_availability = user_availability[0]

	all_durations = frappe.get_all(
		"Appointment Slot Duration",
		filters={"parent": user_availability.get("name")},
		fields=["name", "title", "duration"],
	)

	url = get_url(
		"/schedule/in/{0}".format(user_availability.get("slug"))
	)

	return {
		"url": url,
		"slug": user_availability.get("slug"),
		"available_durations": [
			{
				"id": duration.name,
				"label": duration.title,
				"duration": duration.duration,
				"url": url + "?type=" + duration.name,
			}
			for duration in all_durations
		],
	}
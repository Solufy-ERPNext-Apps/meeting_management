# Copyright (c) 2026, Shivangi and contributors
# For license information, please see license.txt

import frappe
import json
from frappe.model.document import Document
from frappe import _, throw
from frappe.desk.form.assign_to import clear, close_all_assignments
from frappe.model.mapper import get_mapped_doc
from frappe.query_builder.functions import Max, Min, Sum
from frappe.utils import add_days, add_to_date, cstr, date_diff, flt, get_link_to_form, getdate, today
from frappe.utils.data import format_date
from frappe.utils.nestedset import NestedSet

class ParentIsGroupError(frappe.ValidationError):
	pass

class SNMTask(Document):

	def validate(self):
		self.update_depends_on()
		self.validate_parent_is_group()
		self.validate_dependencies_for_template_task()
	
	def before_insert(self):
		self.get_task_no()
		
	
	def on_update(self):
		self.populate_depends_on()
		self.unassign_todo()
		self.update_subject()

	def validate_parent_template_task(self):
		if self.parent_task:
			if not frappe.db.get_value("SNM Task", self.parent_task, "is_template"):
				frappe.throw(
					_("Parent Task {0} is not a Template Task").format(
						get_link_to_form("SNM Task", self.parent_task)
					)
				)

	def validate_parent_is_group(self):
		if self.parent_task:
			if not frappe.db.get_value("SNM Task", self.parent_task, "is_group"):
				frappe.throw(
					_("Parent Task {0} must be a Group Task").format(
						get_link_to_form("SNM Task", self.parent_task)
					),
					ParentIsGroupError,
				)

	def populate_depends_on(self):
		if self.parent_task:
			parent = frappe.get_doc("SNM Task", self.parent_task)
			if self.name not in [row.task for row in parent.depends_on]:
				parent.append(
					"depends_on", {"doctype": "Task Depends On", "task": self.name, "subject": self.subject}
				)
			parent.save()

	def unassign_todo(self):
		if self.status == "Completed":
			close_all_assignments(self.doctype, self.name)
		if self.status == "Cancelled":
			clear(self.doctype, self.name)

	def update_depends_on(self):
		depends_on_tasks = ""
		for d in self.depends_on:
			if d.task and d.task not in depends_on_tasks:
				depends_on_tasks += d.task + ","
		self.depends_on_tasks = depends_on_tasks

	def validate_depends_on_tasks(self):
		if self.depends_on:
			for task in self.depends_on:
				if not frappe.db.get_value("SNM Task", task.task, "is_template"):
					frappe.throw(
						_("Dependent Task {0} is not a Template Task").format(
							get_link_to_form("SNM Task", task.task)
						)
					)
	def validate_dependencies_for_template_task(self):
		if self.is_template:
			self.validate_parent_template_task()
			self.validate_depends_on_tasks()
	def on_trash(self):
		if check_if_child_exists(self.name):
			throw(_("Child Task exists for this Task. You can not delete this Task."))

	
	@frappe.whitelist()
	def get_task_no(self):
		if not self.parent_task:
			max_task = frappe.db.sql("""
				SELECT MAX(CAST(task_no AS UNSIGNED))
				FROM `tabSNM Task`
				WHERE parent_task IS NULL OR parent_task = ''
			""", as_list=True)[0][0]

			if max_task:
				self.task_no = str(max_task + 1)
			else:
				self.task_no = "1"

		else:
			parent_task_no = frappe.db.get_value("SNM Task", self.parent_task, "task_no")

			last_child = frappe.db.get_value(
			"SNM Task",
			{"parent_task": self.parent_task,
			"task_no": ["is", "set"]},
			"task_no",
			order_by="creation desc"
		)

			if last_child:
				new_index = int(last_child.split(".")[-1]) + 1
			else:
				new_index = 1
						
			self.task_no = f"{parent_task_no}.{new_index}"


	def update_subject(self):
		if not self.subject or not self.task_no:
			return

		subject = self.subject

		parts = subject.split(" - ", 1)

		if parts[0].replace(".", "").isdigit():
			subject = parts[1] if len(parts) > 1 else ""
		self.subject = f"{self.task_no} - {subject}"
# @frappe.whitelist()
# def get_task_assignees(task):
# 	assign = frappe.db.get_list("ToDo", filters={"reference_name":task}, fields=["allocated_to"])
# 	assign_by =[]
# 	users = []

# 	assigned = frappe.db.get_value("SNM Task",task,"username")
# 	if assigned:
# 		assign_by.append(assigned)
# 	if assign:
# 		for row in assign:
# 			users.append(frappe.db.get_value("User",row.get("allocated_to"),"full_name"))

# 	return users,assign_by

@frappe.whitelist()
def get_task_assignees(task):
	assign = frappe.db.get_list(
		"ToDo",
		filters={"reference_name": task},
		fields=["allocated_to"]
	)

	assign_by = []
	users = []

	assigned = frappe.db.get_value("SNM Task", task, "username")
	if assigned:
		assign_by.append(assigned)

	if assign:
		for row in assign:
			full_name = frappe.db.get_value("User", row.get("allocated_to"), "full_name")
			if full_name:
				users.append(full_name)

	# ✅ convert to string
	users_str = ", ".join(users)
	assign_by_str = ", ".join(assign_by)

	return users_str, assign_by_str

@frappe.whitelist()
def check_if_child_exists(name):
	child_tasks = frappe.get_all("Task", filters={"parent_task": name})
	child_tasks = [get_link_to_form("Task", task.name) for task in child_tasks]
	return child_tasks


@frappe.whitelist()
def get_children(doctype, parent, task=None, project=None, is_root=False):
	filters = [["docstatus", "<", "2"]]

	if task:
		filters.append(["parent_task", "=", task])
	elif parent and not is_root:
		# via expand child
		filters.append(["parent_task", "=", parent])
	else:
		from frappe.query_builder import Field, functions

		filters.append(functions.IfNull(Field("parent_task"), "") == "")

	if project:
		filters.append(["project", "=", project])

	tasks = frappe.get_list(
		doctype,
		fields=["name as value", "subject as title", "is_group as expandable"],
		filters=filters,
		order_by="name",
	)

	# return tasks
	return tasks


@frappe.whitelist()
def add_node():
	from frappe.desk.treeview import make_tree_args

	args = frappe.form_dict
	args.update({"name_field": "subject"})
	args = make_tree_args(**args)

	if args.parent_task == "All Tasks" or args.parent_task == args.project:
		args.parent_task = None

	frappe.get_doc(args).insert()


@frappe.whitelist()
def add_multiple_tasks(data, parent):
	data = json.loads(data)
	new_doc = {"doctype": "Task", "parent_task": parent if parent != "All Tasks" else ""}
	new_doc["project"] = frappe.db.get_value("Task", {"name": parent}, "project") or ""

	for d in data:
		if not d.get("subject"):
			continue
		new_doc["subject"] = d.get("subject")
		new_task = frappe.get_doc(new_doc)
		new_task.insert()


def on_doctype_update():
	frappe.db.add_index("Task", ["lft", "rgt"])
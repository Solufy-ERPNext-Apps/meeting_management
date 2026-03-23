// Copyright (c) 2026, Shivangi and contributors
// For license information, please see license.txt

frappe.treeview_settings["SNM Task"] = {
// };
		get_tree_nodes: "meeting_management.meeting_management.doctype.snm_task.snm_task.get_children",
		add_tree_node: "meeting_management.meeting_management.doctype.snm_task.snm_task.add_node",
		breadcrumb: "Meeting Management",
		get_tree_root: false,
		root_label: "SNM Tasks",
		ignore_fields: ["parent_task"],
		onload: function (me) {
			frappe.treeview_settings["SNM Task"].page = {};
			$.extend(frappe.treeview_settings["SNM Task"].page, me.page);

			me.make_tree();
			function inject_assignees(task_name) {
				if (!task_name) return;
				const $label2 = $(
					`.tree .tree-link[data-label="All Tasks"]`
				).append(`<span class="task-assignees"
				style="
					position: absolute;
					right: 12px;
					top: 50%;
					transform: translateY(-50%);
					font-size: 11px;
					color: #6c757d;
					white-space: nowrap;
				">
				</span>`);
				const $label = $(
					`.tree .tree-link[data-label="${task_name}"]`
				);
				if (!$label.length) return;
				const $li = $label.closest("li");
				if (!$li.length) return;
				$li.find(".task-assignees").remove();
				$li.css("position", "relative");
				frappe.call({
					method: "meeting_management.meeting_management.doctype.snm_task.snm_task.get_task_assignees",
					args: { task: task_name },
					callback: function (r) {
						console.log(r.message[0])

					const $assignees = $(`
						<span class="task-assignees"
							style="
								position: absolute;
								right: 12px;
								top: 50%;
								transform: translateY(-50%);
								font-size: 11px;
								color: #6c757d;
								white-space: nowrap;
							">
							${r.message[0]}${r.message[1] ? '/' + r.message[1] : ''}
						</span>
					`);

						$li.append($assignees);

					},
				});
			}
			setTimeout(() => {
				Object.values(me.tree.nodes || {}).forEach(node => {
					if (node?.data?.value) {
						inject_assignees(node.data.value);
					}
				});
			}, 800);
			me.page.main.on("click", ".tree-link", function () {
				setTimeout(() => {
					Object.values(me.tree.nodes || {}).forEach(node => {
						console.log(node);
						if (node?.data?.value) {
							inject_assignees(node.data.value);
						}
					});
				}, 400);
			});
		},
	};